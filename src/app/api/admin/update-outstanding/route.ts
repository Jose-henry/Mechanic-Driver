import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    if (!await isAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { chargeId, description, breakdown } = await request.json()
    if (!chargeId) return NextResponse.json({ error: 'Charge ID required' }, { status: 400 })

    const { data: charge } = await supabase
        .from('outstanding_charges')
        .select('status, is_locked')
        .eq('id', chargeId)
        .single()

    if (!charge) return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    if (charge.status === 'paid') return NextResponse.json({ error: 'Cannot edit a settled charge' }, { status: 400 })
    if (charge.is_locked) return NextResponse.json({ error: 'Charge is locked — unlock it first' }, { status: 400 })

    const total = breakdown && typeof breakdown === 'object'
        ? Object.values(breakdown as Record<string, number>).reduce((s, v) => s + Number(v), 0)
        : 0

    const { error } = await supabase
        .from('outstanding_charges')
        .update({ description, breakdown: breakdown || {}, total_amount: total })
        .eq('id', chargeId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
