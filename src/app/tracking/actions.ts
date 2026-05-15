'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/utils/mail"
import { getEmailTemplate, generateKeyValue, generateSection, generateReceiptTable } from "@/utils/email-template"

export async function acceptQuote(requestId: string, quoteId: string) {
    const supabase = await createClient()

    // 1. Update Quote Status
    const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', quoteId)

    if (quoteError) return { success: false, error: quoteError.message }

    // 2. Update Request Status - REMOVED per user request
    // We want to keep the status as 'quote_ready' while payment is verifying.
    // The status should only move to 'maintenance_in_progress' after admin confirms payment.

    revalidatePath('/tracking')
    return { success: true }
}

export async function rejectQuote(requestId: string, quoteId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'unauthenticated' }

    // Fetch Request Details for Email
    const { data: req, error: reqFetchError } = await supabase.from('requests').select('*').eq('id', requestId).single()

    if (reqFetchError || !req) {
        console.error('[rejectQuote] Failed to fetch request:', reqFetchError?.message)
    }

    // 1. Update Quote Status
    const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'rejected' })
        .eq('id', quoteId)

    if (quoteError) return { success: false, error: quoteError.message }

    // 2. Pause Request (Revert to Diagnosing)
    const { error: requestError } = await supabase
        .from('requests')
        .update({ status: 'diagnosing' })
        .eq('id', requestId)

    if (requestError) return { success: false, error: requestError.message }

    // 3. Send Email — wrapped so SMTP failure doesn't surface as a user-facing error
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
            ${generateKeyValue('Vehicle', req ? `${req.year} ${req.brand} ${req.model}` : 'N/A')}
            ${generateKeyValue('Location', req?.pickup_location || 'N/A')}
        `
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
            subject: `Quote Declined - ${req?.brand || 'Unknown'} ${req?.model || 'Vehicle'}`,
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

    const { error } = await supabase
        .from('requests')
        .update({
            rating: rating,
            review: review
        })
        .eq('id', requestId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/tracking')
    return { success: true }
}

export async function markRequestPaid(requestId: string, details: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Request Details
    const { data: req } = await supabase.from('requests').select('*').eq('id', requestId).single()

    if (!req) return { success: false, error: 'Request not found' }

    // Fetch Accepted Quote for Breakdown (include amount)
    const { data: quote } = await supabase.from('quotes').select('breakdown, amount').eq('request_id', requestId).eq('status', 'accepted').single()

    // Fetch Service Prices
    const { data: servicePrices } = await supabase.from('service_prices').select('key, price, label')
    const getPriceObj = (key: string) => servicePrices?.find(p => p.key === key)

    // Construct Breakdown Items from quote.breakdown (object format: { "labour": 20000 })
    let breakdownItems: { description: string, amount: number }[] = []

    if (quote?.breakdown && typeof quote.breakdown === 'object' && !Array.isArray(quote.breakdown)) {
        // Object format: { "labour": 20000, "oil": 5000 }
        Object.entries(quote.breakdown).forEach(([key, val]) => {
            breakdownItems.push({ description: key, amount: Number(val) })
        })
    } else if (Array.isArray(quote?.breakdown)) {
        breakdownItems = [...quote.breakdown]
    }

    // Add Additional Services
    if (req.is_towing) {
        const towing = getPriceObj('towing_intracity')
        if (towing) {
            breakdownItems.push({ description: towing.label || 'Towing Service', amount: Number(towing.price) })
        }
    }

    if (req.is_car_wash) {
        const wash = getPriceObj('car_wash_premium')
        if (wash) {
            breakdownItems.push({ description: wash.label || 'Premium Car Wash', amount: Number(wash.price) })
        }
    }

    // Always add Pickup & Repair fee (Standard logistics)
    const pickupReturn = getPriceObj('pickup_return')
    if (pickupReturn) {
        breakdownItems.push({ description: pickupReturn.label || 'Pickup - Return & Management', amount: Number(pickupReturn.price) })
    }

    // Calculate Total Amount
    const totalAmount = breakdownItems.reduce((sum, item) => sum + item.amount, 0)

    // 1. Update Request Payment Status (total_amount is calculated when admin confirms payment)
    const { error } = await supabase
        .from('requests')
        .update({ payment_status: 'verifying' })
        .eq('id', requestId)

    if (error) return { success: false, error: error.message }

    // 2. Send Payment Verification Email to Admin (with full breakdown)
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
        ${generateKeyValue('Vehicle', `${req?.year} ${req?.brand} ${req?.model}`)}
        ${generateKeyValue('License Plate', req?.license_plate || 'N/A')}
    `

    // Wrapped so SMTP failure doesn't surface as a user-facing error after DB update already succeeded
    try {
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
            subject: `PAYMENT VERIFICATION: ₦${details.amount} - Request #${requestId.slice(0, 6)}`,
            html: getEmailTemplate('Payment Verification', emailContent)
        })
    } catch (emailError) {
        console.error('[markRequestPaid] Email failed:', emailError)
    }

    // NOTE: Receipt email is sent ONLY when admin confirms payment (in update-request route)

    revalidatePath('/tracking')
    return { success: true }
}

export async function addPickupNote(requestId: string, note: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch full request details
    const { data: request, error: fetchError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .single()

    if (fetchError) return { success: false, error: fetchError.message }

    const timestamp = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    const newDescription = request.issue_description
        ? `${request.issue_description}\n\n[${timestamp}]: ${note}`
        : `[${timestamp}]: ${note}`

    const { error } = await supabase
        .from('requests')
        .update({ issue_description: newDescription })
        .eq('id', requestId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/tracking')

    // Mock Email with Full Details
    // Real Email (Styled)
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
        ${generateKeyValue('Vehicle', `${request?.year} ${request?.brand} ${request?.model}`)}
        ${generateKeyValue('Location', request?.pickup_location || 'N/A')}
    `

    try {
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

    const { data: charge } = await supabase
        .from('outstanding_charges')
        .select('*, request_id')
        .eq('id', chargeId)
        .single()

    if (!charge) return { success: false, error: 'Charge not found' }
    if (charge.status !== 'pending') return { success: false, error: 'Charge is not pending payment' }

    const { data: req } = await supabase.from('requests').select('*').eq('id', charge.request_id).single()

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
            ${generateKeyValue('Vehicle', req ? `${req.year} ${req.brand} ${req.model}` : 'N/A')}
        `
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
            subject: `OUTSTANDING PAYMENT: ₦${Number(charge.total_amount).toLocaleString()} — ${req?.brand || ''} ${req?.model || ''}`,
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

    const { data: charge } = await supabase
        .from('outstanding_charges')
        .select('*, request_id')
        .eq('id', chargeId)
        .single()

    if (!charge) return { success: false, error: 'Charge not found' }
    if (charge.status !== 'pending') return { success: false, error: 'Can only decline a pending charge' }

    const { data: req } = await supabase.from('requests').select('*').eq('id', charge.request_id).single()

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
            ${generateKeyValue('Vehicle', req ? `${req.year} ${req.brand} ${req.model}` : 'N/A')}
        `
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
            subject: `Outstanding Charge Declined — ${req?.brand || ''} ${req?.model || ''}`,
            html: getEmailTemplate('Outstanding Charge Declined', emailContent),
        })
    } catch (e) {
        console.error('[rejectOutstanding] Email failed:', e)
    }

    revalidatePath('/tracking')
    return { success: true }
}

export async function generateMockRequest() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'unauthenticated' }

    // 1. Get a driver (or Create one if none exists)
    let driverId: string | null = null
    const { data: drivers } = await supabase.from('drivers').select('id').limit(1)

    if (drivers && drivers.length > 0) {
        driverId = drivers[0].id
    } else {
        // Create a mock driver if none exist
        const { data: newDriver } = await supabase.from('drivers').insert({
            name: 'Abdul Soludo',
            full_name: 'Abdul Soludo',
            is_verified: true,
            ratings: 5.0,
            phone: '08012345678',
            avatar_url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
            bio: 'Expert mechanic with over 10 years of experience specializing in Japanese and German cars.',
            jobs_completed: 142,
            location: 'Ikeja, Lagos'
        }).select().single()
        driverId = newDriver?.id
    }

    if (!driverId) return { error: 'Failed to assign driver' }

    // 1b. Mock Reviews (Check if exist, else create)
    const { data: existingReviews } = await supabase.from('reviews').select('id').eq('driver_id', driverId)
    if (!existingReviews || existingReviews.length === 0) {
        const reviews = [
            { driver_id: driverId, rating: 5, comment: 'Great service, very professional!', reviewer_name: 'Chinedu O.' },
            { driver_id: driverId, rating: 4, comment: 'Arrived a bit late but did good work.', reviewer_name: 'Sarah J.' },
            { driver_id: driverId, rating: 5, comment: 'Fixed my brakes perfectly.', reviewer_name: 'Tunde A.' }
        ]
        await supabase.from('reviews').insert(reviews)
    }

    // 2. Insert Request
    const { data: req, error: reqError } = await supabase.from('requests').insert({
        user_id: user.id,
        brand: 'Honda',
        model: 'Civic', // Matching user screenshot example
        year: 2017,
        pickup_date: '2026-01-10',
        pickup_time: '22:50', // Matching screenshot
        pickup_location: 'Lekki Phase one',
        issue_description: 'Mock Request for Testing',
        status: 'quote_ready',
        mechanic_driver_id: driverId,
        service_type: 'General Service',
        is_towing: true,
        is_car_wash: false // User screenshot has Towing visible, Car Wash check?
    }).select().single()

    if (reqError) return { error: reqError.message }

    // 3. Insert Quote
    const { error: quoteError } = await supabase.from('quotes').insert({
        request_id: req.id,
        amount: 150000,
        status: 'pending',
        breakdown: {
            "Brake Pads": 80000,
            "Labor Cost": 45000,
            "Oil Change": 25000
        }
    })

    if (quoteError) return { error: quoteError.message }

    revalidatePath('/tracking')
    return { success: true }
}
