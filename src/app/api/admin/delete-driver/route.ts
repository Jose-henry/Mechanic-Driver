import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
    const supabase = await createClient()

    if (!await isAdmin(supabase)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { driverId } = await request.json()

    if (!driverId) {
        return NextResponse.json({ error: 'Driver ID required' }, { status: 400 })
    }

    const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
