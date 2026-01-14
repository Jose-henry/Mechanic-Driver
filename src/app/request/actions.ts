'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { requestSchema } from '@/lib/schemas'
import { sendEmail } from '@/utils/mail'
import { getEmailTemplate, generateKeyValue, generateSection } from '@/utils/email-template'

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
        status: 'pending' // Initial status: Finding Mechanic
    }).select().single()

    // Update Phone if provided (and user didn't have one)
    const phone = formData.get('phone') as string
    if (phone && phone.length > 5) {
        await supabase.from('profiles').update({ phone: phone }).eq('id', user.id)
    }

    if (error) {
        return { error: error.message }
    }

    // Send Email to Admins (Joseph & Cherub)
    const emailHtml = getEmailTemplate(
        `New Request from ${user.user_metadata?.full_name || 'User'}`,
        `
        ${generateSection('User Details')}
        ${generateKeyValue('Full Name', user?.user_metadata?.full_name || 'N/A')}
        ${generateKeyValue('Email', user?.email || 'N/A')}
        ${generateKeyValue('User ID', user?.id || 'N/A')}

        ${generateSection('Request Context')}
        ${generateKeyValue('Request ID', request.id)}
        ${generateKeyValue('Vehicle', `${request.year} ${request.brand} ${request.model}`)}
        ${generateKeyValue('Location', request.pickup_location || 'N/A')}
        `
    )

    // Fire and forget email (don't await to block redirect)
    sendEmail({
        to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com', // Notification to admins
        subject: `New Request: ${request.year} ${request.brand} ${request.model}`,
        html: emailHtml
    })

    // Redirect to tracking page directly
    redirect(`/tracking?success=true`)
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
        status: 'pending'
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
        'maintenance_in_progress',
        'completed'
    ]

    if (nonCancellableStatuses.includes(request.status)) {
        return { error: 'Cannot cancel request at this stage' }
    }

    // Hard Delete
    const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
