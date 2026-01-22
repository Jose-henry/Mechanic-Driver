import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/utils/mail'
import { getEmailTemplate, generateKeyValue, generateSection, generateReceiptTable, generateCTAButton } from '@/utils/email-template'

const ADMIN_EMAILS = [
    "josephhenry093@gmail.com",
    "cherubhenry@gmail.com",
    "ellenhenry210@gmail.com",
    "support@mechanicdriver.com"
]

async function isAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser()
    return user && ADMIN_EMAILS.includes(user.email || '')
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()

    if (!await isAdmin(supabase)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { request_id, amount, breakdown } = await request.json()

    if (!request_id || !amount) {
        return NextResponse.json({ error: 'Request ID and amount are required' }, { status: 400 })
    }

    // Fetch request with user details for email
    const { data: req } = await supabase
        .from('requests')
        .select('*')
        .eq('id', request_id)
        .single()

    if (!req) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Fetch user email from auth using admin client
    const adminClient = createAdminClient()
    const { data: { user: requestOwner } } = await adminClient.auth.admin.getUserById(req.user_id)
    const userEmail = requestOwner?.email
    const userName = requestOwner?.user_metadata?.full_name || 'Valued Customer'

    console.log('[CREATE-QUOTE] User email:', userEmail)

    // Get service prices for total calculation
    const { data: servicePrices } = await supabase.from('service_prices').select('key, price, label')
    const getPrice = (key: string) => servicePrices?.find((p: any) => p.key === key)?.price || 0

    // Create the quote
    const { error } = await supabase
        .from('quotes')
        .insert({
            request_id,
            amount,
            breakdown: breakdown || {},
            status: 'pending',
            payment_status: 'pending'
        })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update request status to quote_ready
    await supabase
        .from('requests')
        .update({ status: 'quote_ready' })
        .eq('id', request_id)

    // Send "Quote Ready" email to user
    if (userEmail) {
        // Build breakdown items for display
        const breakdownItems: { description: string; amount: number }[] = []
        if (breakdown && typeof breakdown === 'object') {
            Object.entries(breakdown).forEach(([key, value]) => {
                breakdownItems.push({ description: key, amount: Number(value) })
            })
        }

        // Add additional services
        const pickupReturnPrice = Number(getPrice('pickup_return'))
        const towingPrice = req.is_towing ? Number(getPrice('towing_intracity')) : 0
        const carWashPrice = req.is_car_wash ? Number(getPrice('car_wash_premium')) : 0

        if (pickupReturnPrice > 0) {
            breakdownItems.push({ description: 'Pickup & Return', amount: pickupReturnPrice })
        }
        if (towingPrice > 0) {
            breakdownItems.push({ description: 'Towing Service', amount: towingPrice })
        }
        if (carWashPrice > 0) {
            breakdownItems.push({ description: 'Premium Car Wash', amount: carWashPrice })
        }

        const totalAmount = Number(amount) + pickupReturnPrice + towingPrice + carWashPrice

        const emailContent = `
            <p style="color: #e5e5e5; font-size: 16px; margin-bottom: 24px;">
                Hello ${userName}, your vehicle diagnosis is complete and we've prepared a repair quote for your review.
            </p>

            ${generateSection('Vehicle Details')}
            ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
            ${generateKeyValue('License Plate', req.license_plate || 'N/A')}
            ${generateKeyValue('Service Type', req.service_type || 'General Service')}

            ${generateSection('Quote Breakdown')}
            ${generateReceiptTable(breakdownItems, totalAmount)}

            <div style="margin-top: 30px; padding: 20px; background-color: #1a2e15; border: 1px solid #365314; border-radius: 8px; text-align: center;">
                <p style="color: #4ade80; font-size: 14px; margin: 0; font-weight: bold;">Ready for Payment</p>
                <p style="color: #86efac; font-size: 12px; margin: 5px 0 0;">Log in to your account to accept and pay for this quote.</p>
            </div>

            ${generateCTAButton('View Quote & Pay', 'https://mechanicdriver.com/tracking')}

            <p style="color: #888; font-size: 13px; margin-top: 20px;">
                If you have questions about this quote, please contact our support team or reply to this email.
            </p>
        `

        await sendEmail({
            to: userEmail,
            subject: `Quote Ready: ₦${totalAmount.toLocaleString()} - ${req.brand} ${req.model}`,
            html: getEmailTemplate('Your Quote is Ready', emailContent)
        })
    }

    return NextResponse.json({ success: true })
}
