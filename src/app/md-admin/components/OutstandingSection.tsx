'use client'

import { useState, useEffect } from 'react'
import { Plus, Lock, Unlock, Trash2, CheckCircle, Loader2, Send, AlertTriangle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from './ToastProvider'

interface Charge {
    id: string
    description: string
    breakdown: Record<string, number>
    total_amount: number
    status: 'draft' | 'pending' | 'verifying' | 'paid' | 'rejected' | 'completed'
    is_locked: boolean
    rejection_reason?: string
    created_at: string
}

interface OutstandingSectionProps {
    requestId: string
    charges: Charge[]
    isRequestCompleted: boolean
}

type EditState = {
    description: string
    breakdown: Record<string, number>
    newKey: string
    newValue: string
}

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    pending: 'bg-amber-500/20 text-amber-400',
    verifying: 'bg-blue-500/20 text-blue-400',
    paid: 'bg-lime-500/20 text-lime-400',
    rejected: 'bg-red-500/20 text-red-400',
    completed: 'bg-teal-500/20 text-teal-400',
}

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    pending: 'Pending Payment',
    verifying: 'Verifying Payment',
    paid: '✓ Settled',
    rejected: 'Declined by User',
    completed: '🔒 Completed (Permanent)',
}

export default function OutstandingSection({ requestId, charges, isRequestCompleted }: OutstandingSectionProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const [chargeEdits, setChargeEdits] = useState<Record<string, EditState>>({})
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [creatingNew, setCreatingNew] = useState(false)

    // Initialise local edit state for unlocked/draft charges
    useEffect(() => {
        const edits: Record<string, EditState> = {}
        charges.forEach(c => {
            if (!c.is_locked) {
                edits[c.id] = {
                    description: c.description || '',
                    breakdown: { ...(c.breakdown || {}) },
                    newKey: '',
                    newValue: '',
                }
            }
        })
        setChargeEdits(prev => {
            // Merge: don't overwrite if admin is actively editing
            const merged = { ...edits }
            Object.keys(prev).forEach(id => {
                if (edits[id]) merged[id] = prev[id]
            })
            return merged
        })
    }, [charges])

    const post = async (url: string, body: object) => {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        return res.json()
    }

    const handleCreate = async () => {
        setCreatingNew(true)
        const data = await post('/api/admin/add-outstanding', { requestId })
        setCreatingNew(false)
        if (data.success) {
            const newId = data.data.id
            setChargeEdits(prev => ({ ...prev, [newId]: { description: 'Additional charges', breakdown: {}, newKey: '', newValue: '' } }))
            router.refresh()
        } else {
            showToast(data.error || 'Failed to create charge', 'error')
        }
    }

    const handleToggleLock = async (chargeId: string) => {
        setLoadingId(chargeId)
        const data = await post('/api/admin/toggle-outstanding-lock', { chargeId })
        setLoadingId(null)
        if (data.success) {
            if (data.is_locked) {
                // Just locked — remove local edit state
                setChargeEdits(prev => { const n = { ...prev }; delete n[chargeId]; return n })
            }
            router.refresh()
        } else {
            showToast(data.error || 'Failed to toggle lock', 'error')
        }
    }

    const handleDelete = async (chargeId: string) => {
        if (!confirm('Delete this draft charge? This cannot be undone.')) return
        setLoadingId(chargeId)
        const data = await post('/api/admin/delete-outstanding', { chargeId })
        setLoadingId(null)
        if (data.success) {
            setChargeEdits(prev => { const n = { ...prev }; delete n[chargeId]; return n })
            router.refresh()
        } else {
            showToast(data.error || 'Failed to delete', 'error')
        }
    }

    const handleSaveAndNotify = async (chargeId: string) => {
        const edit = chargeEdits[chargeId]
        if (!edit) return
        if (Object.keys(edit.breakdown).length === 0) {
            showToast('Add at least one line item before saving', 'error')
            return
        }
        setLoadingId(chargeId)
        const data = await post('/api/admin/publish-outstanding', {
            chargeId,
            description: edit.description,
            breakdown: edit.breakdown,
        })
        setLoadingId(null)
        if (data.success) {
            showToast('Charge published — user notified by email', 'success')
            router.refresh()
        } else {
            showToast(data.error || 'Failed to publish', 'error')
        }
    }

    const handleConfirmPayment = async (chargeId: string) => {
        setLoadingId(chargeId)
        const data = await post('/api/admin/confirm-outstanding-payment', { chargeId })
        setLoadingId(null)
        if (data.success) {
            showToast('Payment confirmed — user receipt sent', 'success')
            router.refresh()
        } else {
            showToast(data.error || 'Failed to confirm', 'error')
        }
    }

    const handleSetStatus = async (chargeId: string, status: string) => {
        setLoadingId(chargeId)
        const data = await post('/api/admin/set-outstanding-status', { chargeId, status })
        setLoadingId(null)
        if (data.success) {
            showToast(`Status updated to ${status}`, 'success')
            router.refresh()
        } else {
            showToast(data.error || 'Failed to update status', 'error')
        }
    }

    const addItem = (chargeId: string) => {
        const edit = chargeEdits[chargeId]
        if (!edit?.newKey.trim() || !edit?.newValue) return
        setChargeEdits(prev => ({
            ...prev,
            [chargeId]: {
                ...prev[chargeId],
                breakdown: { ...prev[chargeId].breakdown, [edit.newKey.trim()]: Number(edit.newValue) },
                newKey: '',
                newValue: '',
            }
        }))
    }

    const removeItem = (chargeId: string, key: string) => {
        setChargeEdits(prev => {
            const breakdown = { ...prev[chargeId].breakdown }
            delete breakdown[key]
            return { ...prev, [chargeId]: { ...prev[chargeId], breakdown } }
        })
    }

    const inputCls = 'w-full px-3 py-1.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none'

    return (
        <div className="border border-amber-500/20 rounded-xl p-4 bg-amber-500/5 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-amber-400 font-semibold text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Outstanding Charges
                    {charges.length > 0 && <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full">{charges.length}</span>}
                </h4>
                {!isRequestCompleted && (
                    <button
                        onClick={handleCreate}
                        disabled={creatingNew}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-xs font-medium disabled:opacity-50"
                    >
                        {creatingNew ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        New Charge
                    </button>
                )}
            </div>

            {charges.length === 0 && (
                <p className="text-gray-600 text-xs text-center py-3">No outstanding charges for this request.</p>
            )}

            {charges.map((charge, index) => {
                const edit = chargeEdits[charge.id]
                const isEditable = !!edit && !charge.is_locked
                const isLoading = loadingId === charge.id
                const localTotal = edit ? Object.values(edit.breakdown).reduce((s, v) => s + Number(v), 0) : charge.total_amount

                return (
                    <div key={charge.id} className={`bg-[#111] border rounded-xl overflow-hidden ${charge.status === 'completed' ? 'border-teal-500/20 opacity-75' : charge.status === 'paid' ? 'border-lime-500/20' : charge.status === 'rejected' ? 'border-red-500/20' : 'border-[#222]'}`}>
                        {/* Charge header */}
                        <div className="px-4 py-3 bg-[#0A0A0A] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-[10px] font-mono">#{index + 1}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[charge.status]}`}>
                                    {STATUS_LABELS[charge.status]}
                                </span>
                                {charge.is_locked && charge.status !== 'paid' && (
                                    <Lock className="w-3 h-3 text-gray-600" />
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {/* Lock/Unlock — blocked only for 'completed' or when request is completed */}
                                {charge.status !== 'completed' && !isRequestCompleted && (
                                    <button
                                        onClick={() => handleToggleLock(charge.id)}
                                        disabled={isLoading}
                                        title={charge.is_locked ? 'Unlock to edit' : 'Lock (prevent edits)'}
                                        className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : charge.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                    </button>
                                )}
                                {/* Delete — draft or rejected charges */}
                                {(charge.status === 'draft' || charge.status === 'rejected') && (
                                    <button
                                        onClick={() => handleDelete(charge.id)}
                                        disabled={isLoading}
                                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                        title={charge.status === 'rejected' ? 'Delete declined charge' : 'Delete draft'}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            {/* Description */}
                            {isEditable ? (
                                <input
                                    value={edit.description}
                                    onChange={e => setChargeEdits(prev => ({ ...prev, [charge.id]: { ...prev[charge.id], description: e.target.value } }))}
                                    placeholder="Charge description"
                                    className={inputCls}
                                />
                            ) : (
                                <p className="text-white text-sm font-medium">{charge.description}</p>
                            )}

                            {/* Rejection reason */}
                            {charge.status === 'rejected' && charge.rejection_reason && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                    <p className="text-[10px] text-red-400 uppercase font-bold mb-1">User declined — reason:</p>
                                    <p className="text-red-300 text-xs italic">"{charge.rejection_reason}"</p>
                                </div>
                            )}

                            {/* Breakdown items */}
                            <div className="space-y-1.5">
                                {isEditable ? (
                                    <>
                                        {Object.entries(edit.breakdown).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-2">
                                                <span className="flex-1 text-gray-300 text-xs bg-[#0A0A0A] px-3 py-1.5 rounded-lg border border-[#222]">{key}</span>
                                                <span className="w-28 text-gray-300 text-xs bg-[#0A0A0A] px-3 py-1.5 rounded-lg border border-[#222] text-right font-mono">₦{Number(value).toLocaleString()}</span>
                                                <button onClick={() => removeItem(charge.id, key)} className="p-1 text-red-500 hover:bg-red-500/10 rounded shrink-0">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {/* Add item row */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <input
                                                value={edit.newKey}
                                                onChange={e => setChargeEdits(prev => ({ ...prev, [charge.id]: { ...prev[charge.id], newKey: e.target.value } }))}
                                                placeholder="Item name"
                                                className="flex-1 px-3 py-1.5 bg-[#0A0A0A] border border-dashed border-[#333] rounded-lg text-white text-xs focus:border-amber-500 focus:outline-none"
                                                onKeyDown={e => e.key === 'Enter' && addItem(charge.id)}
                                            />
                                            <input
                                                type="number"
                                                value={edit.newValue}
                                                onChange={e => setChargeEdits(prev => ({ ...prev, [charge.id]: { ...prev[charge.id], newValue: e.target.value } }))}
                                                placeholder="Amount"
                                                className="w-28 px-3 py-1.5 bg-[#0A0A0A] border border-dashed border-[#333] rounded-lg text-white text-xs focus:border-amber-500 focus:outline-none"
                                                onKeyDown={e => e.key === 'Enter' && addItem(charge.id)}
                                            />
                                            <button
                                                onClick={() => addItem(charge.id)}
                                                className="p-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded shrink-0"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    Object.entries(charge.breakdown || {}).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-xs text-gray-500">
                                            <span>{key}</span>
                                            <span className="font-mono">₦{Number(value).toLocaleString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center pt-2 border-t border-[#1A1A1A]">
                                <span className="text-gray-500 text-xs">Total</span>
                                <span className="text-amber-400 font-bold text-sm">₦{localTotal.toLocaleString()}</span>
                            </div>

                            {/* Admin status override — shown for any non-draft, non-completed charge */}
                            {charge.status !== 'draft' && charge.status !== 'completed' && (
                                <div className="flex items-center gap-2 pt-2 border-t border-[#1A1A1A]">
                                    <span className="text-gray-600 text-[10px] uppercase tracking-wider shrink-0">Override Status</span>
                                    <select
                                        value={charge.status}
                                        disabled={loadingId === charge.id}
                                        onChange={e => handleSetStatus(charge.id, e.target.value)}
                                        className="flex-1 px-2 py-1 bg-[#0A0A0A] border border-[#333] rounded-lg text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="pending">Pending Payment</option>
                                        <option value="verifying">Verifying Payment</option>
                                        <option value="paid">Paid ✓</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            )}

                            {/* Action buttons */}
                            {isEditable && (
                                <button
                                    onClick={() => handleSaveAndNotify(charge.id)}
                                    disabled={isLoading}
                                    className="w-full py-2 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                    {charge.status === 'draft' ? 'Save & Notify User' : 'Update & Re-notify User'}
                                </button>
                            )}
                            {charge.status === 'verifying' && !isEditable && (
                                <button
                                    onClick={() => handleConfirmPayment(charge.id)}
                                    disabled={isLoading}
                                    className="w-full py-2 bg-lime-500 text-black text-xs font-bold rounded-lg hover:bg-lime-400 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                    Confirm Outstanding Payment
                                </button>
                            )}
                            {charge.status === 'pending' && !isEditable && (
                                <p className="text-center text-gray-600 text-[10px] py-1">Awaiting user payment — unlock to edit</p>
                            )}
                            {charge.status === 'rejected' && !isEditable && (
                                <p className="text-center text-amber-500/70 text-[10px] py-1">Unlock to revise and re-notify, or delete this charge</p>
                            )}
                            {charge.status === 'paid' && (
                                <p className="text-center text-lime-500/70 text-[10px] py-1">✓ Settled — will become permanently locked when request is completed</p>
                            )}
                            {charge.status === 'completed' && (
                                <p className="text-center text-teal-400/70 text-[10px] py-1">🔒 Permanently locked — request has been completed</p>
                            )}
                        </div>
                    </div>
                )
            })}

            {isRequestCompleted && charges.some(c => c.status !== 'paid') && (
                <p className="text-gray-600 text-[10px] text-center">Request completed — all charges permanently locked.</p>
            )}
        </div>
    )
}
