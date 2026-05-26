import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/tracking'
    const returnTo = searchParams.get('returnTo')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            // Only show "Verified" banner if this was an actual email verification flow
            const type = searchParams.get('type')
            const showVerified = type === 'signup' || type === 'invite'
            const verifiedParam = showVerified ? '?verified=true' : ''

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${returnTo || next}${verifiedParam}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${returnTo || next}${verifiedParam}`)
            } else {
                return NextResponse.redirect(`${origin}${returnTo || next}${verifiedParam}`)
            }
        } else {
            // Already logged in (race condition — link clicked twice, or second tab)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                return NextResponse.redirect(`${origin}${returnTo || next}`)
            }
            console.error('Auth verification error:', error.message)

            // "flow state has expired" means Supabase already confirmed the email on its
            // server (OTP was valid) but the PKCE session token expired — the account IS
            // verified, the user just needs to sign in manually.
            if (error.message.includes('flow state')) {
                return NextResponse.redirect(
                    `${origin}/signin?message=${encodeURIComponent('Email verified! Please sign in to continue.')}`
                )
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/verify-error?error=Invalid Code`)
}
