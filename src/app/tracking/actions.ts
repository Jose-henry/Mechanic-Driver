'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

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

export async function rejectQuote(requestId: string, quoteId: string) {
    const supabase = await createClient()

    // 1. Update Quote Status
    const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'rejected' })
        .eq('id', quoteId)

    if (quoteError) return { success: false, error: quoteError.message }

    // 2. Cancellation
    const { error: requestError } = await supabase
        .from('requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)

    if (requestError) return { success: false, error: requestError.message }

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

    // 1. Update Request Payment Status
    const { error } = await supabase
        .from('requests')
        .update({ payment_status: 'verifying' })
        .eq('id', requestId)

    if (error) return { success: false, error: error.message }

    const emailPayload = {
        to: ['cherubhenry@gmail.com', 'josephhenry093@gmail.com'],
        subject: `Payment Verification - Request #${requestId.slice(0, 6)}`,
        body: `
            Payment Reported for Request: ${requestId}
            Customer: ${details.customerName}
            Vehicle: ${details.vehicle}
            Amount: ₦${details.amount}
            Time: ${new Date().toLocaleString()}
        `
    }

    console.log('--- MOCK EMAIL SENT ---', emailPayload)

    revalidatePath('/tracking')
    return { success: true }
}
