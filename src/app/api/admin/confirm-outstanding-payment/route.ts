import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/utils/mail'
import { getEmailTemplate, generateKeyValue, generateSection, generateReceiptTable, generateCTAButton } from '@/utils/email-template'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    if (!await isAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { chargeId } = await request.json()
    if (!chargeId) return NextResponse.json({ error: 'Charge ID required' }, { status: 400 })

    const { data: charge } = await supabase
        .from('outstanding_charges')
        .select('*')
        .eq('id', chargeId)
        .single()

    if (!charge) return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    if (charge.status !== 'verifying') return NextResponse.json({ error: 'Charge is not in verifying state' }, { status: 400 })

    // Fetch request and user email up-front (mirrors update-request pattern that is known to work)
    const { data: req } = await supabase.from('requests').select('*').eq('id', charge.request_id).single()
    const adminClient = createAdminClient()
    const { data: { user: owner }, error: userFetchError } = await adminClient.auth.admin.getUserById(req?.user_id ?? '')

    console.log('[confirm-outstanding-payment] charge_id:', chargeId)
    console.log('[confirm-outstanding-payment] user_id:', req?.user_id)
    console.log('[confirm-outstanding-payment] user_fetch_error:', userFetchError?.message)
    console.log('[confirm-outstanding-payment] user_email:', owner?.email)

    const userEmail = owner?.email
    const userName = owner?.user_metadata?.full_name || 'Valued Customer'

    // Set charge to paid
    const { error } = await supabase
        .from('outstanding_charges')
        .update({ status: 'paid' })
        .eq('id', chargeId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update running total on request
    if (req) {
        const newTotal = (Number(req.total_amount) || 0) + Number(charge.total_amount)
        await supabase.from('requests').update({ total_amount: newTotal }).eq('id', charge.request_id)
    }

    // Send receipt to user
    if (userEmail && req) {
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

            ${generateSection('Receipt Breakdown')}
            ${generateKeyValue('Charge', charge.description || 'Additional charges')}
            ${breakdownItems.length > 0
                ? generateReceiptTable(breakdownItems, Number(charge.total_amount))
                : generateKeyValue('Total Amount', `₦${Number(charge.total_amount).toLocaleString()}`)}

            ${generateSection('Vehicle Details')}
            ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
            ${generateKeyValue('License Plate', req.license_plate || 'N/A')}

            <div style="margin-top:30px;padding-top:20px;border-top:1px dashed #333;text-align:center;">
                <p style="color:#666;font-size:12px;margin:0;">Reference</p>
                <p style="color:#888;font-family:monospace;font-size:14px;margin:5px 0;">${chargeId.toUpperCase().slice(0, 12)}</p>
            </div>
            ${generateCTAButton('Track Your Request', 'https://mechanicdriver.com/tracking')}
        `

        const emailResult = await sendEmail({
            to: userEmail,
            subject: `Outstanding Payment Confirmed — ₦${Number(charge.total_amount).toLocaleString()} — ${req.brand} ${req.model}`,
            html: getEmailTemplate('Outstanding Payment Confirmed', emailContent),
        })
        console.log('[confirm-outstanding-payment] email result:', JSON.stringify(emailResult))
    } else {
        console.error('[confirm-outstanding-payment] Cannot send receipt — user_email:', userEmail, 'req:', !!req, 'user_fetch_error:', userFetchError?.message)
    }

    revalidatePath('/md-admin')
    return NextResponse.json({ success: true })
}
