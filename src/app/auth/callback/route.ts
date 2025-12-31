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

            // Determine if we should show the "Verified" banner
            // We only want to show it for Email OTP/MagicLink flows, not Google.
            // When Supabase redirects back, we can sometimes deduce this, but easier is to check the session?
            // Or easier: Google auth flow doesn't usually use a 'code' in the same way with a magic link? 
            // Actually, OAuth *does* use a code ('exchangeCodeForSession').

            // To differentiate:
            // We can check user.app_metadata.provider?
            const { data: { session } } = await supabase.auth.getSession()
            const provider = session?.user?.app_metadata?.provider
            const showVerified = provider === 'email'

            const verifiedParam = showVerified ? '?verified=true' : ''

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${returnTo || next}${verifiedParam}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${returnTo || next}${verifiedParam}`)
            } else {
                return NextResponse.redirect(`${origin}${returnTo || next}${verifiedParam}`)
            }
        } else {
            // Race condition handling
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // If we are here, we likely can't differentiate easily without session, 
                // but if they are already logged in, it's safer not to show 'verified' unless we know?
                // Let's assume if it was a race condition on a link, it was email.
                // But could be re-used OAuth code? Unlikely.
                return NextResponse.redirect(`${origin}${returnTo || next}?verified=true`)
            }
            console.error('Auth verification error:', error.message)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/verify-error?error=Invalid Code`)
}
