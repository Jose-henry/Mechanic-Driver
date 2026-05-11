import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
    const supabase = await createClient()

    if (!await isAdmin(supabase)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { driverId, full_name, phone_number, location, bio, avatar_url, is_verified } = await request.json()

    if (!driverId) {
        return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 })
    }

    if (!full_name || !phone_number) {
        return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    const { error } = await supabase
        .from('drivers')
        .update({ full_name, phone_number, location: location || null, bio: bio || null, avatar_url: avatar_url || null, is_verified })
        .eq('id', driverId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
