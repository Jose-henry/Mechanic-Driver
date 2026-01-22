import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    try {
        const supabase = await createClient()

        if (!await isAdmin(supabase)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { quoteId } = await request.json()

        if (!quoteId) {
            return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
        }

        // Get the quote to find the request_id
        const { data: quote, error: fetchError } = await supabase
            .from('quotes')
            .select('request_id')
            .eq('id', quoteId)
            .single()

        if (fetchError || !quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
        }

        // Delete the quote
        const { error: deleteError } = await supabase
            .from('quotes')
            .delete()
            .eq('id', quoteId)

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        // Update the request: status back to diagnosing AND payment_status back to pending
        await supabase
            .from('requests')
            .update({
                status: 'diagnosing',
                payment_status: 'pending'
            })
            .eq('id', quote.request_id)

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Delete quote error:', err)
        return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
    }
}
