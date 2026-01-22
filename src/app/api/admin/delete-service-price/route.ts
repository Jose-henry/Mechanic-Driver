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

        const { key } = await request.json()

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('service_prices')
            .delete()
            .eq('key', key)

        if (error) {
            console.error('Delete service price error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Delete service price error:', err)
        return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
    }
}
