'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/utils/mail"
import { getEmailTemplate, generateKeyValue, generateSection } from "@/utils/email-template"
import type { Tables } from "@/utils/supabase/database.types"

type Request = Tables<'requests'>
type Quote = Tables<'quotes'>
type OutstandingCharge = Tables<'outstanding_charges'>

export async function acceptQuote(requestId: string, quoteId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'unauthenticated' }

    const { data: owned } = await supabase
        .from('requests')
        .select('id')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single()

    if (!owned) return { success: false, error: 'Request not found' }

    const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', quoteId)
        .eq('request_id', requestId)

    if (quoteError) return { success: false, error: quoteError.message }

    revalidatePath('/tracking')
    return { success: true }
}

export async function rejectQuote(requestId: string, quoteId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'unauthenticated' }

    const { data: req, error: reqFetchError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single()

    if (reqFetchError || !req) return { success: false, error: 'Request not found' }

    const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'rejected' })
        .eq('id', quoteId)
        .eq('request_id', requestId)

    if (quoteError) return { success: false, error: quoteError.message }

    const { error: requestError } = await supabase
        .from('requests')
        .update({ status: 'diagnosing' })
        .eq('id', requestId)
        .eq('user_id', user.id)

    if (requestError) return { success: false, error: requestError.message }

    try {
        const emailContent = `
            <p style="color: #e5e5e5; font-size: 16px; margin-bottom: 24px;">
                A quote has been declined by the user. The request is now paused.
            </p>

            ${generateSection('Decline Reason')}
            <div style="background-color: #2a1515; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; color: #fca5a5; font-style: italic;">
                "${reason}"
            </div>

            ${generateSection('User Details')}
            ${generateKeyValue('Full Name', user?.user_metadata?.full_name || 'N/A')}
            ${generateKeyValue('Email', user?.email || 'N/A')}
            ${generateKeyValue('Phone', req?.contact_phone || 'N/A')}
            ${generateKeyValue('User ID', user?.id || 'N/A')}

            ${generateSection('Request Context')}
            ${generateKeyValue('Request ID', requestId)}
            ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
            ${generateKeyValue('Location', req?.pickup_location || 'N/A')}
        `
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
            subject: `Quote Declined - ${req.brand} ${req.model}`,
            html: getEmailTemplate('Quote Declined', emailContent)
        })
    } catch (emailError) {
        console.error('[rejectQuote] Email failed:', emailError)
    }

    revalidatePath('/tracking')
    return { success: true }
}

export async function submitRating(requestId: string, rating: number, review: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'unauthenticated' }

    const { data: req } = await supabase
        .from('requests')
        .select('mechanic_driver_id, rating')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single()

    if (!req) return { success: false, error: 'Request not found' }
    if (req.rating !== null) return { success: false, error: 'Already reviewed' }

    const { error } = await supabase
        .from('requests')
        .update({ rating, review })
        .eq('id', requestId)
        .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }

    if (req.mechanic_driver_id) {
        const reviewerName = user.user_metadata?.full_name || 'Verified Customer'
        await supabase.from('reviews').insert({
            driver_id: req.mechanic_driver_id,
            request_id: requestId,
            rating,
            comment: review,
            reviewer_name: reviewerName,
        })
    }

    revalidatePath('/tracking')
    return { success: true }
}

export async function markRequestPaid(requestId: string, details: { amount: number; customerName: string; vehicle: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'unauthenticated' }

    const { data: req } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single()

    if (!req) return { success: false, error: 'Request not found' }
    if (req.payment_status !== 'pending') return { success: false, error: 'Payment already submitted' }

    const { data: quote } = await supabase
        .from('quotes')
        .select('breakdown, amount')
        .eq('request_id', requestId)
        .eq('status', 'accepted')
        .single()

    const { data: servicePrices } = await supabase.from('service_prices').select('key, price, label')
    const getPriceObj = (key: string) => servicePrices?.find(p => p.key === key)

    let breakdownItems: { description: string; amount: number }[] = []

    if (quote?.breakdown && typeof quote.breakdown === 'object' && !Array.isArray(quote.breakdown)) {
        Object.entries(quote.breakdown as Record<string, number>).forEach(([key, val]) => {
            breakdownItems.push({ description: key, amount: Number(val) })
        })
    } else if (Array.isArray(quote?.breakdown)) {
        breakdownItems = (quote.breakdown as { description: string; amount: number }[])
    }

    if (req.is_towing) {
        const towing = getPriceObj('towing_intracity')
        if (towing) breakdownItems.push({ description: towing.label || 'Towing Service', amount: Number(towing.price) })
    }

    if (req.is_car_wash) {
        const wash = getPriceObj('car_wash_premium')
        if (wash) breakdownItems.push({ description: wash.label || 'Premium Car Wash', amount: Number(wash.price) })
    }

    const pickupReturn = getPriceObj('pickup_return')
    if (pickupReturn) {
        breakdownItems.push({ description: pickupReturn.label || 'Pickup - Return & Management', amount: Number(pickupReturn.price) })
    }

    const { error } = await supabase
        .from('requests')
        .update({ payment_status: 'verifying' })
        .eq('id', requestId)
        .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }

    try {
        const emailContent = `
        <p style="color: #e5e5e5; font-size: 16px; margin-bottom: 24px;">
            User has marked the request as <strong>PAID</strong>. Please verify the bank transaction.
        </p>

        <div style="background-color: #1a2e15; border: 1px solid #365314; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <span style="color: #4ade80; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</span>
            <div style="color: #ffffff; font-size: 32px; font-weight: bold; margin-top: 5px;">₦${Number(details.amount).toLocaleString()}</div>
        </div>

        ${generateSection('Breakdown')}
        ${breakdownItems.map(item => generateKeyValue(item.description, `₦${Number(item.amount).toLocaleString()}`)).join('')}

        ${generateSection('User Details')}
        ${generateKeyValue('Full Name', user?.user_metadata?.full_name || 'N/A')}
        ${generateKeyValue('Email', user?.email || 'N/A')}
        ${generateKeyValue('Phone', req?.contact_phone || 'N/A')}
        ${generateKeyValue('User ID', user?.id || 'N/A')}

        ${generateSection('Request Context')}
        ${generateKeyValue('Request ID', requestId)}
        ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
        ${generateKeyValue('License Plate', req?.license_plate || 'N/A')}
    `
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
            subject: `PAYMENT VERIFICATION: ₦${details.amount} - Request #${requestId.slice(0, 6)}`,
            html: getEmailTemplate('Payment Verification', emailContent)
        })
    } catch (emailError) {
        console.error('[markRequestPaid] Email failed:', emailError)
    }

    revalidatePath('/tracking')
    return { success: true }
}

export async function addPickupNote(requestId: string, note: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'unauthenticated' }

    const { data: request, error: fetchError } = await supabase
        .from('requests')
        .select('pickup_notes, contact_phone, year, brand, model, pickup_location')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !request) return { success: false, error: 'Request not found' }

    const timestamp = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    const newNotes = request.pickup_notes
        ? `${request.pickup_notes}\n\n[${timestamp}]: ${note}`
        : `[${timestamp}]: ${note}`

    const { error } = await supabase
        .from('requests')
        .update({ pickup_notes: newNotes })
        .eq('id', requestId)
        .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/tracking')

    try {
        const emailContent = `
        <p style="color: #e5e5e5; font-size: 16px; margin-bottom: 24px;">
            A new pickup note has been added to the request.
        </p>

        <div style="background-color: #262626; border-left: 4px solid #84cc16; padding: 15px; border-radius: 4px; color: #ffffff; font-style: italic;">
            "${note}"
        </div>

        ${generateSection('User Details')}
        ${generateKeyValue('Full Name', user?.user_metadata?.full_name || 'N/A')}
        ${generateKeyValue('Email', user?.email || 'N/A')}
        ${generateKeyValue('Phone', request?.contact_phone || 'N/A')}
        ${generateKeyValue('User ID', user?.id || 'N/A')}

        ${generateSection('Request Context')}
        ${generateKeyValue('Request ID', requestId)}
        ${generateKeyValue('Vehicle', `${request.year} ${request.brand} ${request.model}`)}
        ${generateKeyValue('Location', request?.pickup_location || 'N/A')}
    `
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
            subject: `NEW NOTE: Request #${requestId.slice(0, 6)}`,
            html: getEmailTemplate('New Pickup Note', emailContent)
        })
    } catch (emailError) {
        console.error('[addPickupNote] Email failed:', emailError)
    }

    return { success: true }
}

export async function markOutstandingPaid(chargeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'unauthenticated' }

    const { data: charge } = await supabase
        .from('outstanding_charges')
        .select('*')
        .eq('id', chargeId)
        .single()

    if (!charge) return { success: false, error: 'Charge not found' }
    if (charge.status !== 'pending') return { success: false, error: 'Charge is not pending payment' }

    const { data: req } = await supabase
        .from('requests')
        .select('*')
        .eq('id', charge.request_id)
        .eq('user_id', user.id)
        .single()

    if (!req) return { success: false, error: 'Request not found' }

    const { error } = await supabase
        .from('outstanding_charges')
        .update({ status: 'verifying' })
        .eq('id', chargeId)

    if (error) return { success: false, error: error.message }

    try {
        const emailContent = `
            <p style="color:#e5e5e5;font-size:16px;margin-bottom:24px;">
                User has marked an outstanding charge as <strong>PAID</strong>. Please verify the bank transaction.
            </p>
            <div style="background-color:#2a1800;border:1px solid #92400e;padding:20px;border-radius:8px;text-align:center;margin-bottom:20px;">
                <span style="color:#fcd34d;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Outstanding Amount</span>
                <div style="color:#fff;font-size:32px;font-weight:bold;margin-top:5px;">₦${Number(charge.total_amount).toLocaleString()}</div>
            </div>
            ${generateSection('Outstanding Details')}
            ${generateKeyValue('Description', charge.description || 'N/A')}
            ${generateKeyValue('Amount', `₦${Number(charge.total_amount).toLocaleString()}`)}
            ${generateSection('User Details')}
            ${generateKeyValue('Full Name', user?.user_metadata?.full_name || 'N/A')}
            ${generateKeyValue('Email', user?.email || 'N/A')}
            ${generateKeyValue('Phone', req?.contact_phone || 'N/A')}
            ${generateSection('Request Context')}
            ${generateKeyValue('Charge ID', chargeId.slice(0, 8))}
            ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
        `
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
            subject: `OUTSTANDING PAYMENT: ₦${Number(charge.total_amount).toLocaleString()} — ${req.brand} ${req.model}`,
            html: getEmailTemplate('Outstanding Payment Verification', emailContent),
        })
    } catch (e) {
        console.error('[markOutstandingPaid] Email failed:', e)
    }

    revalidatePath('/tracking')
    return { success: true }
}

export async function rejectOutstanding(chargeId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'unauthenticated' }

    const { data: charge } = await supabase
        .from('outstanding_charges')
        .select('*')
        .eq('id', chargeId)
        .single()

    if (!charge) return { success: false, error: 'Charge not found' }
    if (charge.status !== 'pending') return { success: false, error: 'Can only decline a pending charge' }

    const { data: req } = await supabase
        .from('requests')
        .select('*')
        .eq('id', charge.request_id)
        .eq('user_id', user.id)
        .single()

    if (!req) return { success: false, error: 'Request not found' }

    const { error } = await supabase
        .from('outstanding_charges')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', chargeId)

    if (error) return { success: false, error: error.message }

    try {
        const emailContent = `
            <p style="color:#e5e5e5;font-size:16px;margin-bottom:24px;">
                A user has declined an outstanding charge.
            </p>
            ${generateSection('Decline Reason')}
            <div style="background-color:#2a1515;border-left:4px solid #ef4444;padding:15px;border-radius:4px;color:#fca5a5;font-style:italic;">"${reason}"</div>
            ${generateSection('Charge Details')}
            ${generateKeyValue('Description', charge.description || 'N/A')}
            ${generateKeyValue('Amount', `₦${Number(charge.total_amount).toLocaleString()}`)}
            ${generateSection('User Details')}
            ${generateKeyValue('Full Name', user?.user_metadata?.full_name || 'N/A')}
            ${generateKeyValue('Email', user?.email || 'N/A')}
            ${generateKeyValue('Phone', req?.contact_phone || 'N/A')}
            ${generateSection('Request Context')}
            ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
        `
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
            subject: `Outstanding Charge Declined — ${req.brand} ${req.model}`,
            html: getEmailTemplate('Outstanding Charge Declined', emailContent),
        })
    } catch (e) {
        console.error('[rejectOutstanding] Email failed:', e)
    }

    revalidatePath('/tracking')
    return { success: true }
}
