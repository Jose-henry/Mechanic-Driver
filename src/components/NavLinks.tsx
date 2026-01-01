'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks() {
    const pathname = usePathname()

    const links = [
        { href: '/#how-it-works', label: 'How it works', isActive: (path: string) => path === '/' },
        { href: '/request', label: 'Request', isActive: (path: string) => path.startsWith('/request') },
        { href: '/tracking', label: 'Tracking', isActive: (path: string) => path.startsWith('/tracking') },
    ]

    return (
        <div className="hidden md:flex items-center gap-8">
            {links.map((link) => {
                const active = pathname ? link.isActive(pathname) : false
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`text-sm transition-colors ${active
                            ? 'font-bold text-gray-900'
                            : 'font-medium text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        {link.label}
                    </Link>
                )
            })}
        </div>
    )
}
