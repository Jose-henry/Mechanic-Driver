import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/utils/mail'
import { getEmailTemplate, generateKeyValue, generateSection, generateCTAButton } from '@/utils/email-template'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    if (!await isAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { chargeId, description, breakdown } = await request.json()
    if (!chargeId) return NextResponse.json({ error: 'Charge ID required' }, { status: 400 })

    const { data: charge } = await supabase
        .from('outstanding_charges')
        .select('*, request_id')
        .eq('id', chargeId)
        .single()

    if (!charge) return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    if (charge.status === 'paid') return NextResponse.json({ error: 'Cannot re-publish a settled charge' }, { status: 400 })

    const wasNew = charge.status === 'draft'

    const total = breakdown && typeof breakdown === 'object'
        ? Object.values(breakdown as Record<string, number>).reduce((s, v) => s + Number(v), 0)
        : charge.total_amount

    // Save + publish atomically
    const { error } = await supabase
        .from('outstanding_charges')
        .update({ description, breakdown: breakdown || charge.breakdown, total_amount: total, status: 'pending', is_locked: false })
        .eq('id', chargeId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Fetch request for context + user email
    const { data: req } = await supabase.from('requests').select('*').eq('id', charge.request_id).single()
    if (!req) return NextResponse.json({ success: true }) // charge saved, email optional

    const adminClient = createAdminClient()
    const { data: { user: owner } } = await adminClient.auth.admin.getUserById(req.user_id)
    const userEmail = owner?.email
    const userName = owner?.user_metadata?.full_name || 'Valued Customer'

    if (userEmail) {
        const breakdownLines = breakdown && typeof breakdown === 'object'
            ? Object.entries(breakdown as Record<string, number>)
                .map(([k, v]) => generateKeyValue(k, `₦${Number(v).toLocaleString()}`)).join('')
            : ''

        const subjectPrefix = wasNew ? 'Outstanding Balance' : 'Updated Outstanding Balance'
        const headingPrefix = wasNew ? 'A new outstanding charge' : 'An outstanding charge has been updated'

        const emailContent = `
            <p style="color:#e5e5e5;font-size:16px;margin-bottom:24px;">
                Hello ${userName}! ${headingPrefix} has been added to your repair request. Please log in to review and pay.
            </p>

            <div style="background-color:#2a1800;border-left:4px solid #f59e0b;padding:15px;border-radius:4px;margin-bottom:16px;">
                <p style="color:#fcd34d;font-size:13px;margin:0 0 4px;font-weight:bold;">${description}</p>
                <p style="color:#fff;font-size:24px;font-weight:bold;margin:0;">₦${Number(total).toLocaleString()}</p>
            </div>

            ${breakdownLines ? `${generateSection('Breakdown')}${breakdownLines}` : ''}

            ${generateSection('Vehicle')}
            ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
            ${generateKeyValue('License Plate', req.license_plate || 'N/A')}

            ${generateCTAButton('View & Pay Outstanding', 'https://mechanicdriver.com/tracking')}
            <p style="color:#888;font-size:13px;margin-top:20px;">If you have questions about these charges, please contact support.</p>
        `
        try {
            await sendEmail({
                to: userEmail,
                subject: `${subjectPrefix}: ₦${Number(total).toLocaleString()} — ${req.brand} ${req.model}`,
                html: getEmailTemplate(subjectPrefix, emailContent),
            })
        } catch (e) { console.error('[publish-outstanding] Email failed:', e) }
    }

    revalidatePath('/md-admin')
    revalidatePath('/tracking')
    return NextResponse.json({ success: true })
}
