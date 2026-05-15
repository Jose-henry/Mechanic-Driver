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
        .select('status')
        .eq('id', chargeId)
        .single()

    if (!charge) return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    if (!['draft', 'rejected'].includes(charge.status)) {
        return NextResponse.json({ error: 'Only draft or declined charges can be deleted' }, { status: 400 })
    }

    const { error } = await supabase.from('outstanding_charges').delete().eq('id', chargeId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Invalidate both admin and tracking page caches so UI reflects the deletion immediately
    revalidatePath('/md-admin')
    revalidatePath('/tracking')

    return NextResponse.json({ success: true })
}
