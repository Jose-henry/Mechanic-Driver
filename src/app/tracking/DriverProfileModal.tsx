'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Phone, MessageCircle, Star, MapPin, Share2, AlertTriangle, User, CheckCircle } from 'lucide-react'

interface Review {
    id: string
    rating: number
    comment: string
    reviewer_name: string
    created_at: string
}

interface Driver {
    id: string
    full_name: string
    avatar_url: string | null
    vehicle?: string
    ratings?: number
    is_verified?: boolean
    phone_number?: string
    location?: string
    jobs_completed?: number
    bio?: string
    reviews?: Review[]
    // Fallback for old UI prop 'name' if needed, but we should standardize on 'full_name'
    name?: string
}

interface DriverProfileModalProps {
    isOpen: boolean
    onClose: () => void
    driver: Driver
    onCancelRequest?: () => void
}

export default function DriverProfileModal({ isOpen, onClose, driver, onCancelRequest }: DriverProfileModalProps) {
    const [isCopied, setIsCopied] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Ensure we have a display name
    const displayName = driver.full_name || driver.name || 'Driver'

    useEffect(() => {
        setMounted(true)
        const checkDesktop = () => {
            const width = window.innerWidth
            setIsDesktop(width >= 1024)
        }
        checkDesktop()
        window.addEventListener('resize', checkDesktop)
        return () => window.removeEventListener('resize', checkDesktop)
    }, [])

    if (!isOpen || !mounted) return null

    const handleCopyPhone = () => {
        if (!driver.phone_number) return
        navigator.clipboard.writeText(driver.phone_number)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    const handleCall = (e: React.MouseEvent) => {
        if (window.innerWidth >= 768) {
            e.preventDefault()
            prompt("Copy driver phone:", driver.phone_number || '')
        }
    }

    const handleChat = (e: React.MouseEvent) => {
        if (isDesktop) {
            e.preventDefault()
            // Open WhatsApp Web
            window.open(`https://web.whatsapp.com/send?phone=${driver.phone_number}`, '_blank')
        }
        // Mobile/Tablet behavior: default 'wa.me' link opens App
    }

    const handleShare = () => {
        const text = `
🔧 *Mechanic Driver Profile*
*Name:* ${displayName}
*Rating:* ${driver.ratings ? driver.ratings.toFixed(1) : '5.0'} ⭐
*Jobs Completed:* ${driver.jobs_completed || '0'}
*Location:* ${driver.location || 'Lagos, Nigeria'}
*Verified:* ${driver.is_verified ? 'Yes' : 'No'}

*About:* ${driver.bio || 'Certified mechanic driver.'}

View Profile: ${window.location.href}
        `.trim()

        if (navigator.share) {
            navigator.share({
                title: `Mechanic Driver - ${displayName}`,
                text: text,
                url: window.location.href
            }).catch(console.error)
        } else {
            // Fallback for desktop share
            navigator.clipboard.writeText(text)
            alert('Driver details copied to clipboard!')
        }
    }

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Full Header Image */}
                <div className="h-64 relative bg-gray-100 flex-shrink-0">
                    {driver.avatar_url ? (
                        <img
                            src={driver.avatar_url}
                            alt={displayName}
                            className="w-full h-full object-cover object-top"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400">
                            <User className="w-20 h-20 mb-2 opacity-50" />
                            <span className="text-sm font-medium">No Profile Photo</span>
                        </div>
                    )}

                    {/* Floating Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Gradient Overlay for Text Visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent"></div>

                    {/* Name & Badge overlaid on bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-3xl font-bold">{displayName}</h2>
                            {driver.is_verified && (
                                <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-white" /> Verified
                                </span>
                            )}
                        </div>
                        <p className="text-gray-300 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {driver.location || 'Lagos, Nigeria'}
                        </p>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                            <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                                {driver.ratings ? driver.ratings.toFixed(1) : '5.0'} <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            </div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Rating</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {driver.jobs_completed || '0'}
                            </div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Jobs Done</p>
                        </div>
                    </div>

                    {/* Bio / About */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">About Driver</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {driver.bio || `No bio available for ${displayName}.`}
                        </p>
                    </div>

                    {/* Reviews Snippet */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Recent Reviews</h3>
                        </div>

                        <div className="space-y-3">
                            {driver.reviews && driver.reviews.length > 0 ? (
                                driver.reviews.slice(0, 3).map((review) => (
                                    <div key={review.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="flex gap-1 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-700 italic">"{review.comment}"</p>
                                        <p className="text-xs text-gray-400 mt-1 text-right">- {review.reviewer_name}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500 italic">No reviews yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <a
                            href={`tel:${driver.phone_number}`}
                            onClick={handleCall}
                            className="flex flex-col items-center justify-center gap-1 bg-gray-900 text-white py-3 rounded-2xl font-medium hover:bg-gray-800 transition-all relative group"
                        >
                            <span className="flex items-center gap-2 text-sm">
                                {isCopied && isDesktop ? <CheckCircle className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                                {isCopied && isDesktop ? 'Copied' : 'Call Driver'}
                            </span>
                            {isDesktop && (
                                <span className="absolute -top-10 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click to Copy Number
                                </span>
                            )}
                        </a>

                        <a
                            href={`https://wa.me/${driver.phone_number?.replace(/\D/g, '')}`}
                            onClick={handleChat}
                            className="flex flex-col items-center justify-center gap-1 bg-lime-500 text-white py-3 rounded-2xl font-medium hover:bg-lime-600 transition-all"
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <MessageCircle className="w-4 h-4 fill-current" />
                                Chat on WA
                            </span>
                        </a>
                    </div>

                    {/* More Actions */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={handleShare}
                            className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <Share2 className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-medium">Share</span>
                        </button>
                        <a
                            href={`mailto:${process.env.SUPPORT_EMAIL || 'support@mechanicdriver.com'}?subject=Report Driver ${displayName}&body=Reporting Driver ID: ${driver.id || 'N/A'}...`}
                            className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <AlertTriangle className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-medium">Report</span>
                        </a>
                        {/* Cancel Job Button Removed */}
                    </div>

                </div>
            </div>
        </div>
    )

    // Render into document.body to avoid z-index/overflow issues from parent containers
    return createPortal(modalContent, document.body)
}
