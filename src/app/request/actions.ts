'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { requestSchema } from '@/lib/schemas'

export async function submitRequest(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const rawData = {
        brand: formData.get('brand'),
        model: formData.get('model'),
        year: formData.get('year'),
        licensePlate: formData.get('licensePlate'),
        pickupDate: formData.get('pickupDate'),
        pickupTime: formData.get('pickupTime'),
        description: formData.get('description'),
    }

    // Validate with Zod
    const result = requestSchema.safeParse(rawData);

    if (!result.success) {
        // Return first error message for simplicity, or structure field errors if UI supports it
        // RequestForm uses `state.error` for a global message currently.
        return {
            error: result.error.issues[0].message,
            formData: rawData
        }
    }

    const { brand, model, year, licensePlate, pickupDate, pickupTime, description } = result.data;

    // Use the already fetched user variable

    // If no user, return special status to let client handle redirect & storage
    // NOTE: We check user AFTER validation so we don't redirect for invalid forms.
    if (!user) {
        return {
            error: 'unauthenticated',
            formData: rawData
        }
    }

    const { data, error } = await supabase.from('requests').insert({
        user_id: user.id,
        brand,
        model,
        year: year, // Zod coerced it to number
        license_plate: licensePlate,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        issue_description: description,
        status: 'pending'
    }).select().single()

    if (error) {
        return { error: error.message }
    }

    redirect('/tracking')
}

export async function submitRequestJson(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'unauthenticated' }
    }

    const validation = requestSchema.safeParse(data);

    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    const { brand, model, year, licensePlate, pickupDate, pickupTime, description } = validation.data;

    const { error: insertError } = await supabase.from('requests').insert({
        user_id: user.id,
        brand,
        model,
        year,
        license_plate: licensePlate,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        issue_description: description,
        status: 'pending'
    })

    if (insertError) {
        return { error: insertError.message }
    }

    return { success: true }
}
