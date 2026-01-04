'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/utils/mail"

export async function acceptQuote(requestId: string, quoteId: string) {
    const supabase = await createClient()

    // 1. Update Quote Status
    const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', quoteId)

    if (quoteError) return { success: false, error: quoteError.message }

    // 2. Update Request Status to 'maintenance_in_progress'
    const { error: requestError } = await supabase
        .from('requests')
        .update({ status: 'maintenance_in_progress' })
        .eq('id', requestId)

    if (requestError) return { success: false, error: requestError.message }

    revalidatePath('/tracking')
    return { success: true }
}

export async function rejectQuote(requestId: string, quoteId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Request Details for Email
    const { data: req } = await supabase.from('requests').select('*').eq('id', requestId).single()

    // 1. Update Quote Status
    const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'rejected' })
        .eq('id', quoteId)

    if (quoteError) return { success: false, error: quoteError.message }

    // 2. Halt/Pause Request
    const { error: requestError } = await supabase
        .from('requests')
        .update({ status: 'vehicle_at_workshop' })
        .eq('id', requestId)

    if (requestError) return { success: false, error: requestError.message }

    // 3. Send Real Email
    await sendEmail({
        to: 'cherubhenry@gmail.com, josephhenry093@gmail.com',
        subject: `ACTION REQUIRED: Quote Declined - Request #${requestId.slice(0, 6)}`,
        html: `
            <h2>Quote Declined by User</h2>
            <p><strong>Reason:</strong> ${reason}</p>
            <hr/>
            <h3>User Details</h3>
            <p><strong>Name:</strong> ${user?.user_metadata?.full_name || 'N/A'}</p>
            <p><strong>Email:</strong> ${user?.email}</p>
            <h3>Request Details</h3>
            <p><strong>Vehicle:</strong> ${req?.year} ${req?.brand} ${req?.model}</p>
            <p><strong>Location:</strong> ${req?.pickup_location}</p>
        `
    })

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

    // 1. Update Request Payment Status
    const { error } = await supabase
        .from('requests')
        .update({ payment_status: 'verifying' })
        .eq('id', requestId)

    if (error) return { success: false, error: error.message }

    await sendEmail({
        to: 'cherubhenry@gmail.com, josephhenry093@gmail.com',
        subject: `PAYMENT VERIFICATION: Request #${requestId.slice(0, 6)}`,
        html: `
            <h2>Payment Verification Needed</h2>
            <p>User has marked request as PAID.</p>
            <p><strong>Amount:</strong> ₦${details.amount}</p>
            <hr/>
            <h3>User Details</h3>
            <p><strong>Name:</strong> ${user?.user_metadata?.full_name || 'N/A'}</p>
            <p><strong>Email:</strong> ${user?.email}</p>
            <h3>Request Context</h3>
            <p><strong>Vehicle:</strong> ${req?.year} ${req?.brand} ${req?.model}</p>
            <p><strong>Plate:</strong> ${req?.license_plate || 'N/A'}</p>
        `
    })

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
    // Real Email
    await sendEmail({
        to: 'cherubhenry@gmail.com, josephhenry093@gmail.com',
        subject: `NEW NOTE: Request #${requestId.slice(0, 6)}`,
        html: `
            <h2>New Pickup Note</h2>
            <p><strong>Note:</strong> "${note}"</p>
            <hr/>
            <h3>User Details</h3>
            <p><strong>Name:</strong> ${user?.user_metadata?.full_name || 'N/A'}</p>
            <p><strong>Email:</strong> ${user?.email}</p>
            <h3>Request Context</h3>
            <p><strong>Vehicle:</strong> ${request.year} ${request.brand} ${request.model}</p>
            <p><strong>Location:</strong> ${request.pickup_location}</p>
        `
    })

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
            is_verified: true,
            rating_label: 'Expert Mechanic',
            phone: '08012345678',
            avatar_url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop'
        }).select().single()
        driverId = newDriver?.id
    }

    if (!driverId) return { error: 'Failed to assign driver' }

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
