'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Car, ArrowRight, Plus } from 'lucide-react'
import { cancelRequest } from '../request/actions'

// Status Sequence Mapping
interface StatusStep {
    id: string
    label: string
    progress: number
    color?: string
    barColor?: string
}

const STATUS_STEPS: StatusStep[] = [
    { id: 'pending', label: 'Finding a Driver', progress: 5 },
    { id: 'mechanic_assigned', label: 'Mechanic Driver Assigned', progress: 10 },
    { id: 'driver_en_route', label: 'Driver on his way', progress: 20 },
    { id: 'driver_arrived', label: 'Driver arrived', progress: 30 },
    { id: 'vehicle_en_route_to_workshop', label: 'Vehicle on its way', progress: 40 },
    { id: 'vehicle_at_workshop', label: 'Vehicle at workshop', progress: 50 },
    { id: 'quote_accepted', label: 'Quote received and accepted', progress: 60 },
    { id: 'service_commenced', label: 'Service commenced', progress: 70 },
    { id: 'service_completed', label: 'Service finished', progress: 85 },
    { id: 'vehicle_en_route_to_owner', label: 'Vehicle back on its way', progress: 95 },
    { id: 'vehicle_delivered', label: 'Vehicle arrived', progress: 100 },
]

export function TrackingList({ requests }: { requests: any[] }) {
    const router = useRouter()
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set())

    const handleCancel = async (requestId: string) => {
        if (!confirm('Are you sure you want to cancel this request?')) return

        setCancellingId(requestId)
        const result = await cancelRequest(requestId)
        if (result.success) {
            // Mark as cancelled locally to show "Inactive" state
            setCancelledIds(prev => new Set(prev).add(requestId))

            // Wait 1 minute, then refresh to actually remove it from the list (since it's deleted in DB)
            setTimeout(() => {
                router.refresh()
            }, 60000)
        } else {
            alert(result.error || 'Failed to cancel')
        }
        setCancellingId(null)
    }

    // Helper to get current step info
    const getStatusInfo = (status: string, isCancelled: boolean): StatusStep => {
        if (isCancelled || status === 'cancelled') return { id: 'cancelled', label: 'Cancelled', progress: 0, color: 'text-red-400', barColor: 'bg-red-500' }

        const step = STATUS_STEPS.find(s => s.id === status)
        // Default to pending if unknown, or if user just created it (it defaults to pending)
        if (!step) return STATUS_STEPS[0]

        return {
            ...step,
            color: 'text-green-400',
            barColor: 'bg-lime-400'
        }
    }

    // Check if cancellable
    // Check if cancellable
    const isCancellable = (status: string, isCancelled: boolean) => {
        if (isCancelled) return false
        const index = STATUS_STEPS.findIndex(s => s.id === status)
        const thresholdIndex = STATUS_STEPS.findIndex(s => s.id === 'vehicle_en_route_to_workshop')
        return status !== 'cancelled' && (index === -1 || index < thresholdIndex)
    }

    // Get Next Status
    const getNextStatus = (currentStatus: string) => {
        const index = STATUS_STEPS.findIndex(s => s.id === currentStatus)
        if (index !== -1 && index < STATUS_STEPS.length - 1) {
            return STATUS_STEPS[index + 1].label
        }
        return null
    }

    // Filter out requests that are confirmed deleted after refresh (handled by parent re-render),
    // but keep showing them if they are in 'cancelledIds' until the refresh happens.
    // Actually, since we delete in DB immediately, a refresh would remove them. 
    // We want them to STAY visible for 1 minute.
    // The parent passes 'requests'. If we refresh, it disappears. 
    // So we should NOT refresh immediately. usage: setTimeout -> router.refresh() 

    // We render the list from props, but override status if in cancelledIds

    if (requests.length === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-8">
                <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-50/50 via-white to-white z-0"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Car className="w-10 h-10 text-lime-600" />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mb-3">No Active Requests</h2>
                        <p className="text-gray-500 mb-8 max-w-md leading-relaxed mx-auto">
                            You don't have any vehicle service requests in progress.
                            Ready to get your car fixed?
                        </p>

                        <Link
                            href="/request"
                            className="inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Book a Mechanic
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl space-y-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                <h1 className="text-3xl font-semibold text-gray-900">Your Requests</h1>
                <Link
                    href="/request"
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-lg shadow-gray-200"
                >
                    <Plus className="w-4 h-4" />
                    New Request
                </Link>
            </div>

            <div className="grid gap-8">
                {requests.map((request) => {
                    const isCancelled = cancelledIds.has(request.id) || request.status === 'cancelled'
                    const statusInfo = getStatusInfo(request.status, isCancelled)
                    const nextStatusLabel = getNextStatus(request.status)
                    const cancellable = isCancellable(request.status, isCancelled)

                    return (
                        <div key={request.id} className="bg-gray-900 rounded-[2rem] p-6 text-white relative overflow-hidden group shadow-xl grid md:grid-cols-12 gap-6">

                            {/* Left Column: Info & Tracking */}
                            <div className="md:col-span-7 flex flex-col gap-4 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="inline-flex items-center gap-2 border border-gray-700 bg-gray-800/50 backdrop-blur rounded-full px-3 py-1">
                                        <div className={`w-2 h-2 rounded-full ${isCancelled ? 'bg-red-500' : 'bg-green-400 animate-pulse'}`}></div>
                                        <span className="text-xs font-medium text-gray-300">
                                            {isCancelled ? 'Inactive' : 'Live Tracking'}
                                        </span>
                                    </div>
                                    <div className="text-right text-gray-500 text-xs font-mono">
                                        ID: {request.id.slice(0, 8)}
                                    </div>
                                </div>

                                <div className="mb-1">
                                    <h3 className="text-xl font-semibold tracking-tight">
                                        {request.brand} {request.model} ({request.year})
                                    </h3>
                                    <p className="text-gray-400 text-xs">
                                        {request.issue_description}
                                    </p>
                                </div>

                                <div className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700 backdrop-blur flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Current Status</span>
                                        <span className={`text-sm font-medium ${statusInfo.color || 'text-green-400'}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden mb-2">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${statusInfo.barColor || 'bg-lime-400'}`}
                                            style={{ width: `${statusInfo.progress}%` }}
                                        ></div>
                                    </div>

                                    {nextStatusLabel && !isCancelled && (
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500">Up Next:</span>
                                            <span className="text-xs text-gray-400">{nextStatusLabel} ...</span>
                                        </div>
                                    )}

                                    {!isCancelled && request.status !== 'vehicle_delivered' && (
                                        <p className="text-xs text-gray-600 mt-4 pt-4 border-t border-gray-700/50">
                                            Last Updated: {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <button
                                        onClick={() => handleCancel(request.id)}
                                        disabled={!cancellable || cancellingId === request.id}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border w-full md:w-auto ${cancellable
                                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                            : 'border-gray-800 text-gray-600 cursor-not-allowed hidden'
                                            }`}
                                    >
                                        {cancellingId === request.id ? (
                                            <span className="flex items-center justify-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Cancelling...</span>
                                        ) : (
                                            'Cancel Request'
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Map Placeholder */}
                            <div className="md:col-span-5 relative h-64 md:h-auto bg-gray-800 rounded-3xl overflow-hidden border border-gray-700/50 group-hover:border-gray-600 transition-colors">
                                <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-no-repeat bg-center"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                                    <div className="w-12 h-12 bg-gray-700/50 backdrop-blur rounded-full flex items-center justify-center mb-3">
                                        <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
                                    </div>
                                    <p className="text-white font-medium mb-1">Live Map View</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">Unavailable • Coming Soon</p>
                                </div>
                            </div>

                        </div>
                    )
                })}
            </div>
        </div>
    )
}
