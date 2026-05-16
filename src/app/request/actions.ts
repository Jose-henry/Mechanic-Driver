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
        serviceType: formData.get('serviceType'),
        isTowing: formData.get('isTowing') === 'on',
        isCarWash: formData.get('isCarWash') === 'on',
        // null → undefined so Zod's optional() accepts it (field absent = not in FormData)
        phone: formData.get('phone') ?? undefined,
    }

    // Validate with Zod
    const result = requestSchema.safeParse(rawData);

    if (!result.success) {
        console.error('[submitRequest] Validation failed:', JSON.stringify(result.error.issues, null, 2))
        return {
            error: result.error.issues[0].message,
            formData: rawData
        }
    }

    const { brand, model, year, licensePlate, pickupLocation, pickupDate, pickupTime, description, serviceType, isTowing, isCarWash, phone } = result.data;

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
        service_type: serviceType,
        is_towing: isTowing,
        is_car_wash: isCarWash,
        contact_phone: phone || null,
        status: 'pending'
    }).select().single()

    if (error) {
        console.error('[submitRequest] Insert failed:', error.message)
        return { error: error.message }
    }

    // Update profile phone if it changed (only after confirmed insert)
    if (phone && phone.length > 5) {
        const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single()
        if (phone !== profile?.phone) {
            await supabase.from('profiles').update({ phone }).eq('id', user.id)
        }
    }

    // Send Email to Admins (Joseph & Cherub)
    const emailHtml = getEmailTemplate(
        `New Request from ${user.user_metadata?.full_name || 'User'}`,
        `
        ${generateSection('User Details')}
        ${generateKeyValue('Full Name', user?.user_metadata?.full_name || 'N/A')}
        ${generateKeyValue('Email', user?.email || 'N/A')}
        ${generateKeyValue('Phone', phone || 'N/A')}
        ${generateKeyValue('User ID', user?.id || 'N/A')}

        ${generateSection('Request Context')}
        ${generateKeyValue('Request ID', request.id)}
        ${generateKeyValue('Vehicle', `${request.year} ${request.brand} ${request.model}`)}
        ${generateKeyValue('Pickup Date', request.pickup_date || 'N/A')}
        ${generateKeyValue('Pickup Time', request.pickup_time || 'N/A')}
        ${generateKeyValue('Location', request.pickup_location || 'N/A')}
        ${generateKeyValue('Service Type', request.service_type || 'N/A')}
        `
    )

    // Fire and forget — does not block the redirect; errors are swallowed to avoid unhandled rejections
    sendEmail({
        to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
        subject: `New Request: ${request.year} ${request.brand} ${request.model}`,
        html: emailHtml
    }).catch(emailError => {
        console.error('[submitRequest] Admin email failed:', emailError)
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
        console.error('[submitRequestJson] Validation failed:', JSON.stringify(validation.error.issues, null, 2))
        return { error: validation.error.issues[0].message }
    }

    const { brand, model, year, licensePlate, pickupLocation, pickupDate, pickupTime, description, serviceType, isTowing, isCarWash, phone } = validation.data;

    const { data: request, error: insertError } = await supabase.from('requests').insert({
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
        contact_phone: phone || null,
        status: 'pending'
    }).select().single()

    if (insertError) {
        console.error('[submitRequestJson] Insert failed:', insertError.message)
        return { error: insertError.message }
    }

    // Update profile phone if it changed (only after confirmed insert)
    if (phone && phone.length > 5) {
        const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single()
        if (phone !== profile?.phone) {
            await supabase.from('profiles').upsert({ id: user.id, phone, full_name: user?.user_metadata?.full_name || '' })
        }
    }

    // Send Email to Admins — wrapped so a SMTP failure doesn't block { success: true }
    try {
        const emailHtml = getEmailTemplate(
            `New Request from ${user.user_metadata?.full_name || 'User'}`,
            `
            ${generateSection('User Details')}
            ${generateKeyValue('Full Name', user?.user_metadata?.full_name || 'N/A')}
            ${generateKeyValue('Email', user?.email || 'N/A')}
            ${generateKeyValue('Phone', phone || 'N/A')}
            ${generateKeyValue('User ID', user?.id || 'N/A')}

            ${generateSection('Request Context')}
            ${generateKeyValue('Request ID', request.id)}
            ${generateKeyValue('Vehicle', `${request.year} ${request.brand} ${request.model}`)}
            ${generateKeyValue('Pickup Date', request.pickup_date || 'N/A')}
            ${generateKeyValue('Pickup Time', request.pickup_time || 'N/A')}
            ${generateKeyValue('Location', request.pickup_location || 'N/A')}
            ${generateKeyValue('Service Type', request.service_type || 'N/A')}
            `
        )
        await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
            subject: `New Request: ${request.year} ${request.brand} ${request.model}`,
            html: emailHtml
        })
    } catch (emailError) {
        console.error('[submitRequestJson] Admin email failed:', emailError)
    }

    return { success: true }
}

export async function cancelRequest(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'unauthenticated' }
    }

    // Fetch full request details for email (before deletion)
    const { data: request, error: fetchError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !request) {
        return { error: 'Request not found' }
    }

    const nonCancellableStatuses = [
        'maintenance_in_progress',
        'vehicle_enroute_back',
        'completed'
    ]

    if (request.status && nonCancellableStatuses.includes(request.status)) {
        return { error: 'Cannot cancel request at this stage' }
    }

    // Clean up dependencies before deleting (FK constraints)
    await supabase.from('outstanding_charges').delete().eq('request_id', requestId)
    await supabase.from('quotes').delete().eq('request_id', requestId)

    // Hard Delete
    const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    // Send cancellation email to support
    const emailHtml = getEmailTemplate(
        `Request Cancelled`,
        `
        ${generateSection('Cancellation Details')}
        ${generateKeyValue('Request ID', request.id)}
        ${generateKeyValue('Status at Cancellation', request.status || 'N/A')}
        ${generateKeyValue('Cancelled At', new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }))}

        ${generateSection('Vehicle Information')}
        ${generateKeyValue('Vehicle', `${request.year} ${request.brand} ${request.model}`)}
        ${generateKeyValue('License Plate', request.license_plate || 'N/A')}
        ${generateKeyValue('Service Type', request.service_type || 'N/A')}

        ${generateSection('User Information')}
        ${generateKeyValue('User Name', user.user_metadata?.full_name || 'N/A')}
        ${generateKeyValue('User Email', user.email || 'N/A')}
        ${generateKeyValue('User ID', user.id)}

        ${generateSection('Original Request')}
        ${generateKeyValue('Pickup Location', request.pickup_location || 'N/A')}
        ${generateKeyValue('Scheduled Pickup', `${request.pickup_date} at ${request.pickup_time}`)}
        ${generateKeyValue('Issue Description', request.issue_description || 'N/A')}
        `
    )

    await sendEmail({
        to: process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com',
        subject: `Request Cancelled: ${request.year} ${request.brand} ${request.model}`,
        html: emailHtml
    })

    return { success: true }
}
