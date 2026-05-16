import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/utils/mail'
import { getEmailTemplate, generateKeyValue, generateSection, generateReceiptTable, generateCTAButton } from '@/utils/email-template'
import { isAdmin } from '@/lib/admin'

const ALLOWED_STATUSES = ['pending', 'verifying', 'paid', 'rejected']

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    if (!await isAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { chargeId, status } = await request.json()
    if (!chargeId || !status) return NextResponse.json({ error: 'Charge ID and status required' }, { status: 400 })
    if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 })
    }

    const { data: charge } = await supabase
        .from('outstanding_charges')
        .select('*')
        .eq('id', chargeId)
        .single()

    if (!charge) return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    if (charge.status === 'completed') return NextResponse.json({ error: 'Completed charges cannot be changed' }, { status: 400 })

    // Fetch request and user email up-front (mirrors update-request pattern)
    const { data: req } = await supabase.from('requests').select('*').eq('id', charge.request_id).single()
    const adminClient = createAdminClient()
    const { data: { user: owner }, error: userFetchError } = await adminClient.auth.admin.getUserById(req?.user_id ?? '')

    console.log('[set-outstanding-status] charge_id:', chargeId, 'status:', status)
    console.log('[set-outstanding-status] user_id:', req?.user_id)
    console.log('[set-outstanding-status] user_fetch_error:', userFetchError?.message)
    console.log('[set-outstanding-status] user_email:', owner?.email)

    const userEmail = owner?.email
    const userName = owner?.user_metadata?.full_name || 'Valued Customer'

    const previousStatus = charge.status
    const { error } = await supabase
        .from('outstanding_charges')
        .update({ status })
        .eq('id', chargeId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If setting to paid — recalculate total_amount from scratch and send receipt email
    if (status === 'paid' && previousStatus !== 'paid' && req) {
        // Recalculate total from scratch.
        // The charge is already 'paid' in the DB at this point, so querying all
        // settled charges gives us the complete final set — no separate addition needed.
        const [quoteRes, pricesRes, allSettledRes] = await Promise.all([
            supabase.from('quotes').select('amount').eq('request_id', req.id).eq('status', 'accepted').single(),
            supabase.from('service_prices').select('key, price'),
            supabase.from('outstanding_charges').select('total_amount').eq('request_id', req.id).in('status', ['paid', 'completed'])
        ])

        const getPrice = (key: string) => Number(pricesRes.data?.find(p => p.key === key)?.price || 0)
        const baseAmount = Number(quoteRes.data?.amount || 0)
            + getPrice('pickup_return')
            + (req.is_towing ? getPrice('towing_intracity') : 0)
            + (req.is_car_wash ? getPrice('car_wash_premium') : 0)

        const allSettledTotal = (allSettledRes.data || []).reduce((s, c) => s + Number(c.total_amount), 0)
        const totalPaidToDate = baseAmount + allSettledTotal
        // Previous total = everything except the current charge
        const previousTotal = totalPaidToDate - Number(charge.total_amount)

        await supabase.from('requests').update({ total_amount: totalPaidToDate }).eq('id', charge.request_id)

        if (userEmail) {
            const breakdownItems: { description: string; amount: number }[] = []
            if (charge.breakdown && typeof charge.breakdown === 'object') {
                Object.entries(charge.breakdown as Record<string, number>).forEach(([k, v]) => {
                    if (k) breakdownItems.push({ description: k, amount: Number(v) })
                })
            }

            const emailContent = `
                <p style="color:#e5e5e5;font-size:16px;margin-bottom:24px;">
                    Hello ${userName}, your outstanding balance payment has been confirmed — thank you!
                </p>

                <div style="background-color:#1a2e15;border:1px solid #365314;padding:20px;border-radius:8px;text-align:center;margin-bottom:20px;">
                    <p style="color:#4ade80;font-size:14px;margin:0;font-weight:bold;">✅ Outstanding Payment Confirmed</p>
                    <p style="color:#86efac;font-size:24px;font-weight:bold;margin:8px 0 0;">₦${Number(charge.total_amount).toLocaleString()}</p>
                </div>

                ${generateSection('This Payment')}
                ${generateKeyValue('Charge', charge.description || 'Additional charges')}
                ${breakdownItems.length > 0
                    ? generateReceiptTable(breakdownItems, Number(charge.total_amount))
                    : generateKeyValue('Amount', `₦${Number(charge.total_amount).toLocaleString()}`)}

                ${generateSection('Running Total')}
                ${generateKeyValue('Previous Payments', `₦${previousTotal.toLocaleString()}`)}
                ${generateKeyValue('This Outstanding Charge', `₦${Number(charge.total_amount).toLocaleString()}`)}
                <div style="background-color:#111;border:1px solid #365314;padding:16px;border-radius:8px;margin-top:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:#9ca3af;font-size:14px;font-weight:600;">Total Paid to Date</span>
                        <span style="color:#4ade80;font-size:20px;font-weight:bold;">₦${totalPaidToDate.toLocaleString()}</span>
                    </div>
                </div>

                ${generateSection('Vehicle Details')}
                ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
                ${generateKeyValue('License Plate', req.license_plate || 'N/A')}

                <div style="margin-top:30px;padding-top:20px;border-top:1px dashed #333;text-align:center;">
                    <p style="color:#666;font-size:12px;margin:0;">Reference</p>
                    <p style="color:#888;font-family:monospace;font-size:14px;margin:5px 0;">${chargeId.toUpperCase().slice(0, 12)}</p>
                </div>
                ${generateCTAButton('Track Your Request', 'https://mechanicdriver.com/tracking')}
            `

            try {
                const emailResult = await sendEmail({
                    to: userEmail,
                    subject: `Outstanding Payment Confirmed — ₦${Number(charge.total_amount).toLocaleString()} — ${req.brand} ${req.model}`,
                    html: getEmailTemplate('Outstanding Payment Confirmed', emailContent),
                })
                console.log('[set-outstanding-status] receipt email sent:', JSON.stringify(emailResult))
            } catch (e: any) {
                console.error('[set-outstanding-status] receipt email failed:', e?.message)
            }
        } else {
            console.error('[set-outstanding-status] Cannot send receipt — no user email. user_id:', req?.user_id, 'fetch_error:', userFetchError?.message)
        }
    }

    revalidatePath('/md-admin')
    revalidatePath('/tracking')
    return NextResponse.json({ success: true })
}
