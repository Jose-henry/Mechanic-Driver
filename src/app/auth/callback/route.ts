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
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${returnTo || next}?verified=true`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${returnTo || next}?verified=true`)
            } else {
                return NextResponse.redirect(`${origin}${returnTo || next}?verified=true`)
            }
        } else {
            // If exchange fails, check if we already have a session (race condition/pre-fetch)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                return NextResponse.redirect(`${origin}${returnTo || next}?verified=true`)
            }
            console.error('Auth verification error:', error.message)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/verify-error?error=Invalid Code`)
}
