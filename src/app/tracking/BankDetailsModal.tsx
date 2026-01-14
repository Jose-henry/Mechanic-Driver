'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Copy, CheckCircle, Loader2, Building, CreditCard, User } from 'lucide-react'

interface BankDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    requestId: string
    details: {
        amount: number
        customerName: string
        vehicle: string
    }
    onPaymentConfirmed: (requestId: string, details: any) => Promise<any>
}

export default function BankDetailsModal({ isOpen, onClose, requestId, details, onPaymentConfirmed }: BankDetailsModalProps) {
    const [loading, setLoading] = useState(false)
    const [copiedAuth, setCopiedAuth] = useState<string | null>(null)

    // Mock Bank Details
    const bankDetails = {
        bankName: "Moniepoint MFB",
        accountNumber: "6557348342",
        accountName: "Mechanic Driver Ltd."
    }

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedAuth(field)
        setTimeout(() => setCopiedAuth(null), 2000)
    }

    const handlePayment = async () => {
        if (!confirm('Have you made the transfer? Clicking OK will notify our team to verify your payment.')) return

        setLoading(true)
        try {
            await onPaymentConfirmed(requestId, details)
            onClose()
        } catch (error) {
            console.error(error)
            alert('Failed to submit payment verification. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const content = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="bg-white rounded-[2rem] w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Make Payment</h3>
                        <p className="text-xs text-gray-500">Transfer exactly <span className="font-bold text-gray-900">₦{Number(details.amount).toLocaleString()}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-3">
                        {/* Bank Name */}
                        <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Building className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-medium">Bank Name</p>
                                    <p className="text-sm font-bold text-gray-900">{bankDetails.bankName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Account Number */}
                        <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-lime-50 flex items-center justify-center text-lime-600">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-medium">Account Number</p>
                                    <p className="text-lg font-mono font-bold text-gray-900">{bankDetails.accountNumber}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCopy(bankDetails.accountNumber, 'acc_num')}
                                className="text-gray-400 hover:text-lime-600 transition-colors"
                            >
                                {copiedAuth === 'acc_num' ? <CheckCircle className="w-5 h-5 text-lime-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Account Name */}
                        <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-medium">Account Name</p>
                                    <p className="text-sm font-bold text-gray-900">{bankDetails.accountName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                        <p className="text-xs text-blue-700 leading-relaxed text-center">
                            Please verify the account name before transferring. Transfers outside these details may result in service delays.
                        </p>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'I Have Paid'}
                    </button>
                </div>
            </div>
        </div>
    )

    return createPortal(content, document.body)
}
