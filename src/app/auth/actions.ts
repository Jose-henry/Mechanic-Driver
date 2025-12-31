'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

import { loginSchema, signupSchema } from '@/lib/schemas'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
    }

    const validation = loginSchema.safeParse(rawData)
    if (!validation.success) {
        redirect(`/signin?error=${encodeURIComponent(validation.error.issues[0].message)}`)
    }

    const { email, password } = validation.data
    const returnTo = formData.get('returnTo') as string | null

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect(`/signin?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect(returnTo || '/tracking')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
    }

    const validation = signupSchema.safeParse(rawData)
    if (!validation.success) {
        redirect(`/signup?error=${encodeURIComponent(validation.error.issues[0].message)}`)
    }

    const { email, password, firstName, lastName, phone } = validation.data
    const returnTo = formData.get('returnTo') as string | null

    const fullName = `${firstName} ${lastName}`.trim()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback?returnTo=${returnTo || '/tracking'}`,
        },
    })

    if (error) {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect(`/signup?message=Check email to continue sign in process`)
}

export async function loginWithGoogle(formData: FormData) {
    const supabase = await createClient()
    const returnTo = formData.get('returnTo') as string | null

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback${returnTo ? `?returnTo=${returnTo}` : ''}`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (data.url) {
        redirect(data.url)
    }

    if (error) {
        redirect(`/signin?error=${encodeURIComponent(error.message)}`)
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/signin')
}

export async function deleteAccount(reason: string, description: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/signin')
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js')

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
    }

    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    await supabaseAdmin
        .from('account_deletions')
        .insert({
            user_id: user.id,
            email: user.email,
            reason: reason,
            description: description
        })

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (error) {
        console.error("Delete failed:", error)
        redirect('/profile?error=Could not delete account')
    }

    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/signin?message=Account deleted successfully')
}

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    // In Supabase, resetPasswordForEmail sends a magic link (OTP)
    // We redirect to a page where they can enter a new password
    // The "redirectTo" is crucial. It must land on a page that handles the code/hash.
    // Our existing /auth/callback handles the code and redirects to 'next'.

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
        redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect(`/forgot-password?success=true`)
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        redirect(`/auth/reset-password?error=Passwords do not match`)
    }

    // updateUser relies on the active session. 
    // The link they clicked logged them in (via auth/callback exchange).
    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/signin?message=Password updated successfully. Please sign in.')
}

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

    // 1. Update Auth Metadata (User Identity)
    const { error: authError } = await supabase.auth.updateUser({
        data: {
            full_name: fullName,
            phone: phone
        }
    })

    if (authError) return { error: authError.message }

    // 2. Update Profiles Table (Application Data)
    // NOTE: This might fail if 'phone' column doesn't exist. We'll catch and ignore specific schema errors
    // or just rely on the Auth Metadata update above which is actually what we display mostly.

    // We try to upsert.
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: fullName,
            phone: phone,
            updated_at: new Date().toISOString()
        })

    if (profileError) return { error: profileError.message }

    revalidatePath('/profile')
    return { success: true }
}
