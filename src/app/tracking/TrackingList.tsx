'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Plus } from 'lucide-react'
import TrackingCard from './TrackingCard'

export function TrackingList({ requests }: { requests: any[] }) {
    const router = useRouter()
    const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set())

    const handleCancelSuccess = (id: string) => {
        setCancelledIds(prev => new Set(prev).add(id))

        // Remove from UI after 1 minute (draining animation happens in Card)
        setTimeout(() => {
            // Trigger a hard refresh/re-fetch to actually remove it from the list
            router.refresh()
        }, 60000)
    }

    return (
        <div className="w-full max-w-5xl space-y-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                <h1 className="text-3xl font-semibold text-gray-900">Your Activities</h1>
                <Link
                    href="/request"
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-lg shadow-gray-200"
                >
                    <Plus className="w-4 h-4" />
                    New Request
                </Link>
            </div>

            {requests.length === 0 ? (
                // Empty State
                <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-gray-100">
                    <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Car className="w-10 h-10 text-lime-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Jobs</h2>
                    <p className="text-gray-500 mb-8">Ready to get your car fixed securely?</p>
                    <Link href="/request" className="text-lime-600 font-semibold hover:underline">
                        Book a driver now
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8">
                    {requests.map((req, i) => {
                        if (!req) return null;
                        return (
                            <TrackingCard
                                key={i}
                                req={req}
                                cancelledIds={cancelledIds}
                                onCancelSuccess={handleCancelSuccess}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    )
}
