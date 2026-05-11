'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Settings, LogOut, User } from 'lucide-react'
import { logout } from '@/app/auth/actions'

const NAV_LINKS = [
    { href: '/#how-it-works', label: 'How it works', isActive: (p: string) => p === '/' },
    { href: '/request', label: 'Request', isActive: (p: string) => p.startsWith('/request') },
    { href: '/tracking', label: 'Tracking', isActive: (p: string) => p.startsWith('/tracking') },
]

interface NavLinksProps {
    isLoggedIn: boolean
    isAdmin: boolean
}

export function NavLinks({ isLoggedIn, isAdmin }: NavLinksProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const close = () => setIsOpen(false)

    return (
        <>
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
                {NAV_LINKS.map((link) => {
                    const active = pathname ? link.isActive(pathname) : false
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm transition-colors ${active ? 'font-bold text-gray-900' : 'font-medium text-gray-500 hover:text-gray-900'}`}
                        >
                            {link.label}
                        </Link>
                    )
                })}
            </div>

            {/* Mobile hamburger button */}
            <button
                className="md:hidden p-2 -mr-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(o => !o)}
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile full-screen drawer */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="md:hidden fixed inset-0 top-20 bg-black/20 z-40"
                        onClick={close}
                    />
                    {/* Menu panel */}
                    <div className="md:hidden fixed left-0 right-0 top-20 bg-[#FDFDFD] border-b border-gray-100 z-50 px-4 py-4 shadow-lg">
                        {/* Nav links */}
                        <div className="flex flex-col gap-1">
                            {NAV_LINKS.map((link) => {
                                const active = pathname ? link.isActive(pathname) : false
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={close}
                                        className={`px-4 py-3 rounded-xl text-base transition-colors ${active
                                            ? 'font-bold text-gray-900 bg-gray-50'
                                            : 'font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-3" />

                        {/* Auth links */}
                        <div className="flex flex-col gap-1">
                            {!isLoggedIn ? (
                                <>
                                    <Link
                                        href="/signin"
                                        onClick={close}
                                        className="px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        onClick={close}
                                        className="px-4 py-3 rounded-xl text-base font-bold bg-gray-900 text-white text-center hover:bg-black transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {isAdmin && (
                                        <Link
                                            href="/md-admin"
                                            onClick={close}
                                            className="px-4 py-3 rounded-xl text-base font-medium text-lime-700 hover:bg-lime-50 flex items-center gap-3 transition-colors"
                                        >
                                            <Settings className="w-4 h-4" /> Admin Dashboard
                                        </Link>
                                    )}
                                    <Link
                                        href="/profile"
                                        onClick={close}
                                        className="px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                        <User className="w-4 h-4" /> Profile
                                    </Link>
                                    <form action={logout}>
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors text-left"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
