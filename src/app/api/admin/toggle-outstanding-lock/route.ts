import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    if (!await isAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { chargeId } = await request.json()
    if (!chargeId) return NextResponse.json({ error: 'Charge ID required' }, { status: 400 })

    const { data: charge } = await supabase
        .from('outstanding_charges')
        .select('is_locked, status, request_id')
        .eq('id', chargeId)
        .single()

    if (!charge) return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    if (charge.status === 'completed') return NextResponse.json({ error: 'Completed charges are permanently locked' }, { status: 400 })

    // Check if request is completed — permanent lock
    const { data: req } = await supabase.from('requests').select('status').eq('id', charge.request_id).single()
    if (req?.status === 'completed') return NextResponse.json({ error: 'Request is completed — charges are permanently locked' }, { status: 400 })

    const newLocked = !charge.is_locked
    const { error } = await supabase.from('outstanding_charges').update({ is_locked: newLocked }).eq('id', chargeId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    revalidatePath('/md-admin')
    return NextResponse.json({ success: true, is_locked: newLocked })
}
