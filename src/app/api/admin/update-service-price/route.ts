import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
    const supabase = await createClient()

    if (!await isAdmin(supabase)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, price, label, description } = await request.json()

    if (!key) {
        return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    const updateData: Record<string, any> = {}
    if (price !== undefined) updateData.price = Number(price)
    if (label !== undefined) updateData.label = label
    if (description !== undefined) updateData.description = description

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { error } = await supabase
        .from('service_prices')
        .update(updateData)
        .eq('key', key)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
