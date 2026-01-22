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

    const { requestId, field, value } = await request.json()

    if (!requestId || !field) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch current request data
    const { data: req } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .single()

    if (!req) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Fetch user email from auth using admin client (requires service role)
    const adminClient = createAdminClient()
    const { data: { user: requestOwner }, error: userError } = await adminClient.auth.admin.getUserById(req.user_id)

    console.log('[UPDATE-REQUEST] User ID:', req.user_id)
    console.log('[UPDATE-REQUEST] User fetch error:', userError?.message)
    console.log('[UPDATE-REQUEST] Request owner email:', requestOwner?.email)

    const userEmail = requestOwner?.email
    const userName = requestOwner?.user_metadata?.full_name || 'Valued Customer'

    // Handle driver assignment: also set status to 'accepted'
    if (field === 'mechanic_driver_id' && value) {
        console.log('[DRIVER ASSIGN] Starting for request:', requestId)
        console.log('[DRIVER ASSIGN] Request data:', JSON.stringify(req, null, 2))
        console.log('[DRIVER ASSIGN] User email:', userEmail)

        // Get driver details for email
        const { data: driver } = await supabase
            .from('drivers')
            .select('full_name, phone_number, avatar_url')
            .eq('id', value)
            .single()

        console.log('[DRIVER ASSIGN] Driver data:', JSON.stringify(driver, null, 2))

        // Update both driver and status
        const { error } = await supabase
            .from('requests')
            .update({
                mechanic_driver_id: value,
                status: 'accepted'
            })
            .eq('id', requestId)

        if (error) {
            console.log('[DRIVER ASSIGN] Update error:', error.message)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log('[DRIVER ASSIGN] Update successful, checking email...')

        // Send "Driver Assigned" email to user
        if (userEmail) {
            console.log('[DRIVER ASSIGN] Sending email to:', userEmail)
            const emailContent = `
                <p style="color: #e5e5e5; font-size: 16px; margin-bottom: 24px;">
                    Great news, ${userName}! A verified mechanic driver has been assigned to your request and is on their way to you.
                </p>

                ${generateSection('Your Assigned Driver')}
                ${generateKeyValue('Driver Name', driver?.full_name || 'Mechanic Driver')}
                ${generateKeyValue('Contact', driver?.phone_number || 'Will be shared shortly')}

                ${generateSection('Vehicle Details')}
                ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
                ${generateKeyValue('License Plate', req.license_plate || 'N/A')}
                ${generateKeyValue('Pickup Location', req.pickup_location || 'N/A')}

                <div style="margin-top: 30px; padding: 20px; background-color: #1a2e15; border: 1px solid #365314; border-radius: 8px; text-align: center;">
                    <p style="color: #4ade80; font-size: 14px; margin: 0;">Your driver is en route and will arrive shortly!</p>
                </div>

                ${generateCTAButton('Track Your Request', 'https://mechanicdriver.com/tracking')}
            `

            const emailResult = await sendEmail({
                to: userEmail,
                subject: `Driver Assigned & On Their Way - ${req.brand} ${req.model}`,
                html: getEmailTemplate('Driver Assigned', emailContent)
            })
            console.log('[DRIVER ASSIGN] Email result:', JSON.stringify(emailResult, null, 2))
        } else {
            console.log('[DRIVER ASSIGN] No user email found, skipping email')
        }

        return NextResponse.json({ success: true })
    }

    // Handle status changes with email notifications
    if (field === 'status') {
        const { error } = await supabase
            .from('requests')
            .update({ status: value })
            .eq('id', requestId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Email: Status -> Arrived (at workshop)
        if (value === 'arrived' && userEmail) {
            const emailContent = `
                <p style="color: #e5e5e5; font-size: 16px; margin-bottom: 24px;">
                    Hello ${userName}, your vehicle has arrived at the workshop!
                </p>

                ${generateSection('Status Update')}
                <div style="background-color: #1e1e3f; border-left: 4px solid #6366f1; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="color: #a5b4fc; margin: 0; font-weight: bold;">🔧 Vehicle At Workshop</p>
                    <p style="color: #818cf8; margin: 5px 0 0; font-size: 14px;">Our technicians will begin diagnosing your vehicle shortly.</p>
                </div>

                ${generateSection('Vehicle Details')}
                ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
                ${generateKeyValue('Service Type', req.service_type || 'General Service')}

                <p style="color: #888; font-size: 13px; margin-top: 20px;">
                    You will receive a quote once the diagnosis is complete.
                </p>

                ${generateCTAButton('Track Your Request', 'https://mechanicdriver.com/tracking')}
            `

            await sendEmail({
                to: userEmail,
                subject: `Vehicle Arrived at Workshop - ${req.brand} ${req.model}`,
                html: getEmailTemplate('Vehicle at Workshop', emailContent)
            })
        }

        // Email: Status -> Vehicle En Route Back
        if (value === 'vehicle_enroute_back' && userEmail) {
            const emailContent = `
                <p style="color: #e5e5e5; font-size: 16px; margin-bottom: 24px;">
                    Great news, ${userName}! Your vehicle maintenance is complete and it's on its way back to you.
                </p>

                ${generateSection('Status Update')}
                <div style="background-color: #042f2e; border-left: 4px solid #14b8a6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="color: #5eead4; margin: 0; font-weight: bold;">✅ Maintenance Complete</p>
                    <p style="color: #2dd4bf; margin: 5px 0 0; font-size: 14px;">Your vehicle is en route back to you!</p>
                </div>

                ${generateSection('Vehicle Details')}
                ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
                ${generateKeyValue('License Plate', req.license_plate || 'N/A')}
                ${generateKeyValue('Delivery Location', req.pickup_location || 'Original pickup location')}

                <p style="color: #888; font-size: 13px; margin-top: 20px;">
                    Our driver will contact you shortly with an ETA. Thank you for choosing Mechanic Driver!
                </p>

                ${generateCTAButton('Track Your Request', 'https://mechanicdriver.com/tracking')}
            `

            await sendEmail({
                to: userEmail,
                subject: `Maintenance Complete - Vehicle Returning - ${req.brand} ${req.model}`,
                html: getEmailTemplate('Vehicle Returning', emailContent)
            })
        }

        return NextResponse.json({ success: true })
    }

    // Handle payment_status -> 'paid': Send receipt email
    if (field === 'payment_status' && value === 'paid') {
        // Update the payment status
        const { error } = await supabase
            .from('requests')
            .update({ payment_status: 'paid' })
            .eq('id', requestId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Check if quote is accepted, then send receipt
        const { data: quote } = await supabase
            .from('quotes')
            .select('*, breakdown, amount, status')
            .eq('request_id', requestId)
            .single()

        if (quote?.status === 'accepted' && userEmail) {
            // Get service prices
            const { data: servicePrices } = await supabase.from('service_prices').select('key, price, label')
            const getPrice = (key: string) => servicePrices?.find((p: any) => p.key === key)?.price || 0

            // Build breakdown items
            const breakdownItems: { description: string; amount: number }[] = []
            if (quote.breakdown && typeof quote.breakdown === 'object') {
                Object.entries(quote.breakdown).forEach(([key, val]) => {
                    breakdownItems.push({ description: key, amount: Number(val) })
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

            const totalAmount = Number(quote.amount) + pickupReturnPrice + towingPrice + carWashPrice

            const emailContent = `
                <p style="color: #e5e5e5; font-size: 16px; margin-bottom: 24px;">
                    Thank you for your payment, ${userName}! Your transaction has been confirmed and maintenance has begun.
                </p>

                <div style="background-color: #1a2e15; border: 1px solid #365314; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <p style="color: #4ade80; font-size: 14px; margin: 0; font-weight: bold;">🔧 Maintenance In Progress</p>
                    <p style="color: #86efac; font-size: 12px; margin: 5px 0 0;">Our technicians are now working on your vehicle.</p>
                </div>

                ${generateSection('Payment Receipt')}
                ${generateReceiptTable(breakdownItems, totalAmount)}

                ${generateSection('Vehicle Details')}
                ${generateKeyValue('Vehicle', `${req.year} ${req.brand} ${req.model}`)}
                ${generateKeyValue('License Plate', req.license_plate || 'N/A')}
                ${generateKeyValue('Service Type', req.service_type || 'General Service')}

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px dashed #333; text-align: center;">
                    <p style="color: #666; font-size: 12px; margin: 0;">Transaction Reference</p>
                    <p style="color: #888; font-family: monospace; font-size: 14px; margin: 5px 0;">${requestId.toUpperCase()}</p>
                </div>

                <p style="color: #888; font-size: 13px; margin-top: 20px;">
                    We'll notify you once the maintenance is complete and your vehicle is on its way back.
                </p>

                ${generateCTAButton('Track Your Request', 'https://mechanicdriver.com/tracking')}
            `

            await sendEmail({
                to: userEmail,
                subject: `Payment Confirmed - Maintenance Begun - ${req.brand} ${req.model}`,
                html: getEmailTemplate('Payment Receipt', emailContent)
            })
        }

        return NextResponse.json({ success: true })
    }

    // Default update for other fields
    const { error } = await supabase
        .from('requests')
        .update({ [field]: value })
        .eq('id', requestId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
