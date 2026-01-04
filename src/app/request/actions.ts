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
        pickupLocation: formData.get('pickupLocation'),
        // New fields
        serviceType: formData.get('serviceType'),
        isTowing: formData.get('isTowing') === 'on',
        isCarWash: formData.get('isCarWash') === 'on',
    }

    // Validate with Zod
    const result = requestSchema.safeParse(rawData);

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
            formData: rawData
        }
    }

    const { brand, model, year, licensePlate, pickupLocation, pickupDate, pickupTime, description, serviceType, isTowing, isCarWash } = result.data;

    if (!user) {
        return {
            error: 'unauthenticated',
            formData: rawData
        }
    }

    const { data: request, error } = await supabase.from('requests').insert({
        user_id: user.id,
        brand,
        model,
        year,
        license_plate: licensePlate,
        pickup_location: pickupLocation,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        issue_description: description,
        // New columns
        service_type: serviceType,
        is_towing: isTowing,
        is_car_wash: isCarWash,
        status: 'pickup_scheduled' // Initial status as per new flow
    }).select().single()

    if (error) {
        return { error: error.message }
    }

    // Redirect to confirmation page (Price List) instead of direct tracking
    // Pass flags to show correct prices
    const params = new URLSearchParams();
    if (isTowing) params.append('towing', 'true');
    if (isCarWash) params.append('wash', 'true');

    redirect(`/request/confirmation?${params.toString()}`)
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

    const { brand, model, year, licensePlate, pickupLocation, pickupDate, pickupTime, description, serviceType, isTowing, isCarWash } = validation.data;

    const { error: insertError } = await supabase.from('requests').insert({
        user_id: user.id,
        brand,
        model,
        year,
        license_plate: licensePlate,
        pickup_location: pickupLocation,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        issue_description: description,
        service_type: serviceType,
        is_towing: isTowing,
        is_car_wash: isCarWash,
        status: 'pickup_scheduled'
    })

    if (insertError) {
        return { error: insertError.message }
    }

    return { success: true }
}

export async function cancelRequest(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'unauthenticated' }
    }

    // Check current status
    const { data: request, error: fetchError } = await supabase
        .from('requests')
        .select('status')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !request) {
        return { error: 'Request not found' }
    }

    const nonCancellableStatuses = [
        'vehicle_en_route_to_workshop',
        'vehicle_at_workshop',
        'quote_accepted',
        'service_commenced',
        'service_completed',
        'vehicle_en_route_to_owner',
        'vehicle_delivered',
        'cancelled'
    ]

    if (nonCancellableStatuses.includes(request.status)) {
        return { error: 'Cannot cancel request at this stage' }
    }

    const { count, error } = await supabase
        .from('requests')
        .delete({ count: 'exact' })
        .eq('id', requestId)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    if (count === 0) {
        return { error: 'Failed to delete request. Check RLS policies.' }
    }

    return { success: true }
}
