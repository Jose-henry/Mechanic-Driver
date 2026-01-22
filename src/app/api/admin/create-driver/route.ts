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

        const body = await request.json()
        console.log('Creating driver with body:', body)

        const { full_name, phone_number, location, bio, avatar_url, is_verified } = body

        if (!full_name || !phone_number) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
        }

        const insertData = {
            full_name,
            phone_number,
            location: location || null,
            bio: bio || null,
            avatar_url: avatar_url || null,
            is_verified: is_verified ?? true,
            jobs_completed: 0,
            ratings: 5.0
        }

        console.log('Insert data:', insertData)

        const { data, error } = await supabase
            .from('drivers')
            .insert(insertData)
            .select()

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log('Driver created:', data)
        return NextResponse.json({ success: true, data })
    } catch (err: any) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
    }
}

