'use client'

import { useState } from 'react'
import {
    Loader2, Car, Phone, Star, CheckCircle,
    MessageSquare, AlertTriangle, ChevronRight, ChevronDown,
    CreditCard, Clock, MapPin, Wrench, MoreVertical,
    Share2, Flag, XCircle
} from 'lucide-react'
import { cancelRequest } from '../request/actions'
import { acceptQuote, rejectQuote, submitRating, markRequestPaid } from './actions'

import DriverProfileModal from './DriverProfileModal'
import BankDetailsModal from './BankDetailsModal'
import { useRouter } from 'next/navigation'

const STATUS_KEYS = [
    'pending', 'accepted', 'en_route', 'arrived',
    'diagnosing', 'quote_ready', 'maintenance_in_progress', 'completed'
]

const STATUS_LABELS: Record<string, string> = {
    pending: 'Finding Mechanic',
    accepted: 'Mechanic Assigned',
    en_route: 'Driver En Route',
    arrived: 'Driver Arrived',
    diagnosing: 'Diagnosing Vehicle',
    quote_ready: 'Quote Ready',
    maintenance_in_progress: 'Repairs in Progress',
    completed: 'Service Completed'
}

export default function TrackingCard({ req, cancelledIds, onCancelSuccess }: { req: any, cancelledIds?: Set<string>, onCancelSuccess?: (id: string) => void }) {
    const driver = req.driver
    const quote = req.quote
    const router = useRouter()

    // Derived State
    const currentStepIndex = STATUS_KEYS.indexOf(req.status)
    const activeStep = currentStepIndex === -1 ? 0 : currentStepIndex
    const isQuoteAccepted = quote?.status === 'accepted'
    const canCancel = activeStep <= STATUS_KEYS.indexOf('quote_ready') && !isQuoteAccepted

    // UI State
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isBankModalOpen, setIsBankModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const [isPaymentExpanded, setIsPaymentExpanded] = useState(true)

    if (cancelledIds?.has(req.id) || req.status === 'cancelled') return null

    // Handlers
    const handleCancel = async () => {
        if (!confirm('Are you sure? This will cancel your request.')) return
        setLoading(true)
        const res = await cancelRequest(req.id)
        setLoading(false)
        if (res.success) {
            if (onCancelSuccess) onCancelSuccess(req.id)
        } else {
            alert(res.error)
        }
    }

    const handleQuote = async (action: 'accept' | 'reject') => {
        if (!quote) return
        if (!confirm(`Confirm ${action} quote?`)) return

        setLoading(true)
        try {
            if (action === 'accept') {
                // Open Bank Modal instead of immediate accept
                setIsBankModalOpen(true)
            } else {
                const res = await rejectQuote(req.id, quote.id)
                if (!res.success) throw new Error(res.error)
            }
        } catch (error: any) {
            console.error(error)
            alert(error.message || 'Failed to update quote status')
        } finally {
            setLoading(false)
        }
    }

    const handlePaymentSuccess = async (requestId: string, details: any) => {
        // Combined Flow: 1. Accept Quote -> 2. Mark Paid
        try {
            // 1. Accept Quote
            if (quote?.id) {
                const acceptRes = await acceptQuote(requestId, quote.id)
                if (!acceptRes.success) throw new Error(acceptRes.error)
            }

            // 2. Mark Request Paid
            const paidRes = await markRequestPaid(requestId, details)
            if (!paidRes.success) throw new Error(paidRes.error)

            return { success: true }
        } catch (error: any) {
            console.error('Payment Flow Error:', error)
            throw error // Propagate to Modal for alert
        }
    }

    const handleCall = () => {
        if (!driver?.phone) return
        window.location.href = `tel:${driver.phone}`
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Mechanic Driver Job',
                text: `Tracking my car repair: ${req.brand} ${req.model}. Status: ${STATUS_LABELS[req.status]}`,
                url: window.location.href
            }).catch(console.error)
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied!')
        }
        setShowMoreMenu(false)
    }

    // Payment Flags
    const needsPayment = isQuoteAccepted && req.payment_status === 'pending'
    const isVerifyingPayment = req.payment_status === 'verifying'
    const isPaid = req.payment_status === 'paid'

    // Status Progress Calculation
    const progressPercent = ((activeStep + 1) / STATUS_KEYS.length) * 100
    const currentStatusLabel = STATUS_LABELS[req.status] || req.status.replace(/_/g, ' ')
    const nextStatusLabel = activeStep < STATUS_KEYS.length - 1 ? STATUS_LABELS[STATUS_KEYS[activeStep + 1]] : 'Completion'

    // Estimated Arrival (Mock calculation)
    const arrivalTime = req.pickup_time
        ? new Date(new Date(`2000-01-01 ${req.pickup_time}`).getTime() + 60000 * 30).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : 'Unknown'

    return (
        <div className="group relative bg-[#121212] rounded-[2rem] overflow-visible border border-[#2A2A2A] hover:border-lime-500/30 transition-all duration-300 shadow-xl font-sans">

            {/* Redesigned Top Status Section */}
            <div className="bg-[#181818] p-6 rounded-t-[2rem] border-b border-[#2A2A2A]">
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-lime-500 font-bold mb-1">Current Status</p>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-pulse shadow-[0_0_10px_rgba(132,204,22,0.8)]" />
                            {currentStatusLabel}
                        </h2>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-1">Next Step</p>
                        <p className="text-sm font-medium text-gray-500">{nextStatusLabel} <ChevronRight className="w-3 h-3 inline text-gray-600" /></p>
                    </div>
                </div>

                {/* Sleek Step Progress Bar */}
                <div className="relative mt-4 mx-1">
                    {/* Background Track */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-[#252525] -translate-y-1/2 rounded-full" />

                    {/* Active Progress Line */}
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-lime-500 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(132,204,22,0.4)]"
                        style={{ width: `${(activeStep / (STATUS_KEYS.length - 1)) * 100}%` }}
                    />

                    {/* Steps Dots */}
                    <div className="relative z-10 flex justify-between items-center w-full">
                        {STATUS_KEYS.map((key, index) => {
                            const isCompleted = index <= activeStep
                            const isCurrent = index === activeStep

                            return (
                                <div
                                    key={key}
                                    className={`
                                        relative rounded-full transition-all duration-500 flex items-center justify-center
                                        ${isCurrent ? 'w-4 h-4 scale-110' : 'w-2.5 h-2.5'}
                                        ${isCompleted ? 'bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.5)]' : 'bg-[#181818] border border-[#333]'}
                                    `}
                                >
                                    {isCurrent && (
                                        <div className="absolute inset-0 rounded-full bg-lime-500 animate-ping opacity-20" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="p-8 pt-6">
                {/* Header Section (Simplified) */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-mono text-gray-600">ID: {req.id.slice(0, 8)}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white tracking-tight mb-2">
                            {req.year || req.vehicle_year} {req.brand || req.vehicle_make} {req.model || req.vehicle_model}
                        </h3>

                        {/* Detailed Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400 mt-2">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                <span className="text-gray-500 min-w-16">Plate:</span>
                                <span className="text-gray-300 font-mono tracking-wide">{req.license_plate || req.vehicle_number || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                <span className="text-gray-500 min-w-16">Location:</span>
                                <span className="text-gray-300 truncate max-w-[200px]" title={req.pickup_location}>{req.pickup_location || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                <span className="text-gray-500 min-w-16">Schedule:</span>
                                <span className="text-gray-300" suppressHydrationWarning>
                                    {req.pickup_date ? new Date(req.pickup_date).toLocaleDateString() : 'ASAP'}
                                    {req.pickup_time && ` at ${req.pickup_time}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Driver Card & Arrival Info */}
                {driver ? (
                    <div className="mb-8">
                        {/* Arrival Time Badge */}
                        <div className="inline-block bg-[#1F1F1F] text-lime-400 text-xs font-bold px-4 py-2 rounded-t-2xl border-t border-x border-[#333]" suppressHydrationWarning>
                            Arriving by {arrivalTime}
                        </div>

                        <div className="bg-[#181818] p-5 rounded-b-2xl rounded-tr-2xl border border-[#2A2A2A] relative group/driver">
                            <div className="flex items-center gap-4">
                                {/* Profile Picture with Green Border & Checkmark */}
                                <div className="relative mr-2" onClick={() => setIsProfileOpen(true)}>
                                    <div className="w-16 h-16 rounded-full border-2 border-lime-500 p-1 cursor-pointer hover:scale-105 transition-transform">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-[#2A2A2A]">
                                            {driver.avatar_url ? (
                                                <img src={driver.avatar_url} alt={driver.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500"><Car className="w-6 h-6" /></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-0 -right-0 bg-lime-500 text-black rounded-full p-1 border-2 border-[#181818]">
                                        <CheckCircle className="w-3 h-3 fill-current" />
                                    </div>
                                </div>

                                <div className="flex-1 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                                    <h4 className="text-white font-bold text-lg mb-0.5">{driver.name}</h4>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-gray-400 flex items-center gap-1">
                                            {driver.rating?.toFixed(1) || '5.0'} <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                        <span className="text-lime-500 font-medium">Top Rated & Verified</span>
                                    </div>
                                    <button className="text-gray-500 text-xs mt-2 hover:text-white transition-colors flex items-center gap-1">
                                        View Profile <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Call Button */}
                                <button
                                    onClick={handleCall}
                                    className="w-12 h-12 rounded-full bg-lime-500 hover:bg-lime-400 text-black flex items-center justify-center shadow-lg shadow-lime-900/20 transition-all hover:scale-110"
                                >
                                    <Phone className="w-5 h-5 fill-current" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8 bg-[#181818] p-8 rounded-2xl border border-[#2A2A2A] border-dashed flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 text-lime-500 animate-spin mb-3" />
                        <p className="text-gray-400 text-sm font-medium">Matching you with a verified driver...</p>
                    </div>
                )}

                {/* Pickup Notes */}
                <div className="mb-6">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 block ml-1">Pickup Notes / Instructions</label>
                    <div className="relative">
                        <textarea
                            className="w-full bg-[#181818] border border-[#333] rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/50 transition-all resize-none h-24 placeholder-gray-600"
                            placeholder="Type any special instructions here (e.g., Gate code is 1234, call when outside)..."
                        ></textarea>
                    </div>
                </div>

                {/* Payment & Cost Breakdown Section (Collapsible) */}
                <div className="bg-[#181818] rounded-3xl border border-[#2A2A2A] overflow-hidden mb-6 transition-all duration-300">
                    <button
                        onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
                        className="w-full p-6 border-b border-[#2A2A2A] flex justify-between items-center hover:bg-[#202020] transition-colors"
                    >
                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-lime-500" />
                            Payment Summary
                        </h4>
                        <div className={`p-2 rounded-full bg-[#252525] text-gray-400 transition-transform duration-300 ${isPaymentExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </button>

                    {isPaymentExpanded && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="p-6 space-y-4">
                                {/* Repair Service Item */}
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${req.status === 'quote_ready' || quote ? 'bg-lime-500/10 text-lime-500' : 'bg-gray-800 text-gray-500'}`}>
                                            <Wrench className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className={`font-medium ${req.status === 'quote_ready' || quote ? 'text-gray-200' : 'text-gray-500'}`}>Vehicle Diagnosis & Repair</p>
                                            <p className="text-xs text-gray-600">{req.status === 'quote_ready' || quote ? 'Quote generated' : 'Pending diagnosis...'}</p>
                                        </div>
                                    </div>
                                    <span className={`font-mono font-medium ${req.status === 'quote_ready' || quote ? 'text-white' : 'text-gray-600'}`}>
                                        {quote ? `₦${Number(quote.amount).toLocaleString()}` : '---'}
                                    </span>
                                </div>

                                {/* Towing Service Item */}
                                {req.is_towing && (
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${req.status === 'quote_ready' || quote ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-800 text-gray-500'}`}>
                                                <Car className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className={`font-medium ${req.status === 'quote_ready' || quote ? 'text-gray-200' : 'text-gray-500'}`}>Towing Service</p>
                                                <p className="text-xs text-gray-600">Flat rate intracity</p>
                                            </div>
                                        </div>
                                        <span className={`font-mono font-medium ${req.status === 'quote_ready' || quote ? 'text-white' : 'text-gray-600'}`}>
                                            {quote ? '₦50,000' : '---'}
                                        </span>
                                    </div>
                                )}

                                {/* Car Wash Item */}
                                {req.is_car_wash && (
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${req.status === 'quote_ready' || quote ? 'bg-cyan-500/10 text-cyan-500' : 'bg-gray-800 text-gray-500'}`}>
                                                <div className="w-4 h-4">💧</div>
                                            </div>
                                            <div>
                                                <p className={`font-medium ${req.status === 'quote_ready' || quote ? 'text-gray-200' : 'text-gray-500'}`}>Premium Car Wash</p>
                                                <p className="text-xs text-gray-600">Detailed cleaning</p>
                                            </div>
                                        </div>
                                        <span className={`font-mono font-medium ${req.status === 'quote_ready' || quote ? 'text-white' : 'text-gray-600'}`}>
                                            {quote ? '₦3,000' : '---'}
                                        </span>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="h-px bg-[#2A2A2A] my-4"></div>

                                {/* Total Section */}
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-400 text-sm font-medium">Total Estimate</span>
                                    <div className="text-right">
                                        {quote ? (
                                            <>
                                                <span className="text-3xl font-bold text-white tracking-tight">
                                                    ₦{(Number(quote.amount) + (req.is_towing ? 50000 : 0) + (req.is_car_wash ? 3000 : 0)).toLocaleString()}
                                                </span>
                                                <p className="text-[10px] text-lime-500 mt-1">Ready for payment</p>
                                            </>
                                        ) : (
                                            <span className="text-xl font-bold text-gray-600 tracking-tight">Pending...</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="bg-[#1F1F1F] p-4 flex gap-3 border-t border-[#2A2A2A]">
                                {quote && quote.status === 'pending' && req.status !== 'cancelled' ? (
                                    <>
                                        <button
                                            onClick={() => handleQuote('reject')}
                                            disabled={loading}
                                            className="flex-1 py-3 bg-[#2A2A2A] hover:bg-[#333] text-gray-300 rounded-xl font-medium text-sm transition-colors"
                                        >
                                            Decline Quote
                                        </button>
                                        <button
                                            onClick={() => handleQuote('accept')}
                                            disabled={loading}
                                            className="flex-[2] py-3 bg-lime-500 hover:bg-lime-400 text-black rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(132,204,22,0.3)] transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Now'}
                                        </button>
                                    </>
                                ) : needsPayment ? (
                                    <button
                                        onClick={() => setIsBankModalOpen(true)}
                                        className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-black rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(132,204,22,0.3)] transition-all flex items-center justify-center gap-2"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Pay Outstanding Balance
                                    </button>
                                ) : (
                                    <button disabled className="w-full py-3 bg-[#252525] text-gray-600 rounded-xl font-medium text-sm cursor-not-allowed">
                                        Awaiting final bill...
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Alerts (Verifying / Paid) */}
                <div className="space-y-3">
                    {isVerifyingPayment && (
                        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 flex items-center gap-3 animate-in fade-in">
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            <div>
                                <h4 className="font-bold text-sm text-blue-400">Verifying Payment</h4>
                                <p className="text-xs text-blue-400/60">We are confirming your transaction...</p>
                            </div>
                        </div>
                    )}

                    {isPaid && (
                        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20 flex items-center gap-3 animate-in fade-in">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div>
                                <h4 className="font-bold text-sm text-green-400">Payment Confirmed</h4>
                                <p className="text-xs text-green-400/60">Technician has commenced repairs.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* More Actions Toggle */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-medium px-4 py-2 rounded-full border border-[#333] hover:border-gray-500"
                    >
                        More Options <MoreVertical className="w-3 h-3" />
                    </button>
                </div>

                {/* Expanded More Menu */}
                {showMoreMenu && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                        <button onClick={handleShare} className="bg-[#191919] hover:bg-[#222] text-gray-400 hover:text-white p-3 rounded-xl text-xs flex flex-col items-center gap-2 transition-colors border border-[#333]">
                            <Share2 className="w-4 h-4" />
                            Share Details
                        </button>
                        <button className="bg-[#191919] hover:bg-[#222] text-gray-400 hover:text-white p-3 rounded-xl text-xs flex flex-col items-center gap-2 transition-colors border border-[#333]">
                            <Flag className="w-4 h-4" />
                            Report Issue
                        </button>

                        {canCancel && (
                            <button onClick={handleCancel} disabled={loading} className="bg-[#1F1212] hover:bg-red-950/20 text-red-400 p-3 rounded-xl text-xs flex flex-col items-center gap-2 transition-colors border border-red-900/20">
                                <XCircle className="w-4 h-4" />
                                {loading ? 'Cancelling...' : 'Cancel Request'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {driver && (
                <DriverProfileModal
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    driver={driver}
                    onCancelRequest={canCancel ? handleCancel : undefined}
                />
            )}

            {quote && (
                <BankDetailsModal
                    isOpen={isBankModalOpen}
                    onClose={() => setIsBankModalOpen(false)}
                    requestId={req.id}
                    details={{
                        amount: quote.amount,
                        customerName: 'Customer',
                        vehicle: `${req.vehicle_make} ${req.vehicle_model}`
                    }}
                    onPaymentConfirmed={handlePaymentSuccess}
                />
            )}
        </div>
    )
}
