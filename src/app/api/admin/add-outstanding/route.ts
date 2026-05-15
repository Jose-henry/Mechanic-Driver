import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    if (!await isAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { requestId, description } = await request.json()
    if (!requestId) return NextResponse.json({ error: 'Request ID required' }, { status: 400 })

    const { data, error } = await supabase
        .from('outstanding_charges')
        .insert({
            request_id: requestId,
            description: description || 'Additional charges',
            breakdown: {},
            total_amount: 0,
            status: 'draft',
            is_locked: false,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    revalidatePath('/md-admin')
    return NextResponse.json({ success: true, data })
}
