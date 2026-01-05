'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Plus } from 'lucide-react'
import TrackingCard from './TrackingCard'


export function TrackingList({ requests }: { requests: any[] }) {
    const router = useRouter()
    const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set())
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

    const handleCancelSuccess = (id: string) => {
        setCancelledIds(prev => new Set(prev).add(id))

        // Remove from UI after 1 minute (draining animation happens in Card)
        setTimeout(() => {
            // Trigger a hard refresh/re-fetch to actually remove it from the list
            router.refresh()
        }, 60000)
    }

    // Filter Logic
    const activeRequests = requests.filter(r =>
        r.status !== 'completed' && !cancelledIds.has(r.id)
    )

    const historyRequests = requests.filter(r =>
        r.status === 'completed'
    )

    const displayRequests = activeTab === 'active' ? activeRequests : historyRequests

    return (
        <div className="w-full max-w-5xl space-y-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                <h1 className="text-3xl font-semibold text-gray-900">Your Activities</h1>

                {/* Custom Tab Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active'
                                ? 'bg-[#84CC16] text-black shadow-lg'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history'
                                ? 'bg-gray-800 text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        History
                    </button>
                </div>

                <Link
                    href="/request"
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-lg shadow-gray-200"
                >
                    <Plus className="w-4 h-4" />
                    New Request
                </Link>
            </div>

            {displayRequests.length === 0 ? (
                // Empty State
                <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-gray-100">
                    <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Car className="w-10 h-10 text-lime-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {activeTab === 'active' ? 'No Active Jobs' : 'No History'}
                    </h2>
                    <p className="text-gray-500 mb-8">
                        {activeTab === 'active'
                            ? 'Ready to get your car fixed securely?'
                            : 'You haven\'t completed any jobs yet.'}
                    </p>
                    {activeTab === 'active' && (
                        <Link href="/request" className="text-lime-600 font-semibold hover:underline block mb-8">
                            Book a driver now
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-8">
                    {displayRequests.map((req, i) => {
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
