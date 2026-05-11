export const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)

export async function isAdmin(supabase: any): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    return !!(user && ADMIN_EMAILS.includes(user.email || ''))
}
