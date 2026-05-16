import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
    const supabase = await createClient()

    if (!await isAdmin(supabase)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId } = await request.json()

    if (!requestId) {
        return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    const { data: req } = await supabase
        .from('requests')
        .select('id')
        .eq('id', requestId)
        .single()

    if (!req) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Delete in FK-safe order: dependants first, then the request
    await supabase.from('outstanding_charges').delete().eq('request_id', requestId)
    await supabase.from('quotes').delete().eq('request_id', requestId)
    await supabase.from('reviews').delete().eq('request_id', requestId)

    const { error } = await supabase.from('requests').delete().eq('id', requestId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
