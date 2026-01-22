'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, ChevronDown, Loader2, Trash2, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';
import ConfirmationModal from './ConfirmationModal';

interface QuotesTabProps {
    quotes: any[];
    requests: any[];
    drivers: any[];
}

// ... helper interfaces and constants ...
interface BreakdownItem {
    key: string;
    value: string;
}

const QUOTE_STATUS_OPTIONS = ['pending', 'accepted', 'rejected'];

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    accepted: 'bg-lime-500/10 text-lime-500 border-lime-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function QuotesTab({ quotes, requests, drivers }: QuotesTabProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ request_id: '' });
    const [breakdownItems, setBreakdownItems] = useState<BreakdownItem[]>([{ key: '', value: '' }]);
    const [editBreakdownItems, setEditBreakdownItems] = useState<BreakdownItem[]>([]);
    const [editRequestId, setEditRequestId] = useState<string>('');

    useEffect(() => {
        const interval = setInterval(() => router.refresh(), 30000);
        return () => clearInterval(interval);
    }, [router]);

    const quotedRequestIds = new Set(quotes.map(q => q.request_id));
    const availableRequests = requests.filter(r => !quotedRequestIds.has(r.id));

    const calculatedAmount = useMemo(() => {
        return breakdownItems.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    }, [breakdownItems]);

    const editCalculatedAmount = useMemo(() => {
        return editBreakdownItems.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    }, [editBreakdownItems]);

    // ... helper functions ...
    const breakdownToObject = (items: BreakdownItem[]) => {
        const obj: Record<string, number> = {};
        items.forEach(item => {
            if (item.key.trim()) obj[item.key.trim()] = Number(item.value) || 0;
        });
        return obj;
    };

    const objectToBreakdown = (obj: any): BreakdownItem[] => {
        if (!obj || typeof obj !== 'object') return [{ key: '', value: '' }];
        const entries = Object.entries(obj);
        if (entries.length === 0) return [{ key: '', value: '' }];
        return entries.map(([key, value]) => ({ key, value: String(value) }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const validItems = breakdownItems.filter(item => item.key.trim() && parseFloat(item.value) > 0);
        if (validItems.length === 0) {
            showToast('Please add at least one breakdown item', 'error');
            return;
        }
        if (calculatedAmount <= 0) {
            showToast('Total amount must be greater than zero', 'error');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/admin/create-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: formData.request_id,
                    amount: calculatedAmount,
                    breakdown: breakdownToObject(breakdownItems)
                })
            });
            const data = await response.json();
            if (response.ok) {
                showToast('Quote created successfully', 'success');
                setShowCreate(false);
                setFormData({ request_id: '' });
                setBreakdownItems([{ key: '', value: '' }]);
                router.refresh();
            } else {
                showToast(data.error || 'Failed to create quote', 'error');
            }
        } catch (error) {
            showToast('Failed to create quote', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (quoteId: string, field: string, value: any) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/update-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId, field, value })
            });
            const data = await response.json();
            if (response.ok) {
                showToast('Quote updated', 'success');
                router.refresh();
            } else {
                showToast(data.error || 'Failed to update', 'error');
            }
        } catch (error) {
            showToast('Failed to update', 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;

        setDeletingId(confirmDeleteId);
        setConfirmDeleteId(null);

        try {
            const response = await fetch('/api/admin/delete-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId: confirmDeleteId })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Quote deleted successfully', 'success');
                router.refresh();
            } else {
                showToast(data.error || 'Failed to delete quote', 'error');
            }
        } catch (error) {
            showToast('Failed to delete quote', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    // ... edit handlers ...
    const startEditQuote = (quote: any) => {
        setEditingQuoteId(quote.id);
        setEditBreakdownItems(objectToBreakdown(quote.breakdown));
        setEditRequestId(quote.request_id);
    };

    const cancelEditQuote = () => {
        setEditingQuoteId(null);
        setEditBreakdownItems([]);
        setEditRequestId('');
    };

    const saveQuoteChanges = async (quoteId: string, originalRequestId: string) => {
        setLoading(true);
        try {
            const breakdown = breakdownToObject(editBreakdownItems);
            await fetch('/api/admin/update-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId, field: 'breakdown', value: breakdown })
            });
            await fetch('/api/admin/update-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId, field: 'amount', value: editCalculatedAmount })
            });
            if (editRequestId !== originalRequestId) {
                await fetch('/api/admin/update-quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quoteId, field: 'request_id', value: editRequestId })
                });
                await fetch('/api/admin/update-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requestId: originalRequestId, field: 'status', value: 'diagnosing' })
                });
                await fetch('/api/admin/update-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requestId: editRequestId, field: 'status', value: 'quote_ready' })
                });
            }
            showToast('Quote updated successfully', 'success');
            cancelEditQuote();
            router.refresh();
        } catch (error) {
            showToast('Failed to update quote', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getAvailableRequestsForEdit = (currentRequestId: string) => {
        return requests.filter(r => !quotedRequestIds.has(r.id) || r.id === currentRequestId);
    };

    return (
        <div>
            <ConfirmationModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Quote"
                message="Are you sure you want to delete this quote? The request will generally be set back to status 'diagnosing' if applicable."
                confirmText="Delete Quote"
            />

            <div className="flex justify-end mb-2">
                <span className="text-gray-600 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
                    Auto-refreshes every 30s
                </span>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-white font-bold text-lg">Quotes</h2>
                    <p className="text-gray-500 text-sm">Manage repair quotes for requests</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    disabled={availableRequests.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black rounded-xl font-medium text-sm hover:bg-lime-400 transition-colors disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    Create Quote
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="bg-[#111] rounded-2xl border border-[#222] p-6 mb-6">
                    {/* ... form content identical ... */}
                    <h3 className="text-white font-medium mb-4">New Quote</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Select Request *</label>
                            <select
                                required
                                value={formData.request_id}
                                onChange={(e) => setFormData({ request_id: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#222] rounded-xl text-white text-sm"
                            >
                                <option value="">Choose a request...</option>
                                {availableRequests.map(req => (
                                    <option key={req.id} value={req.id}>
                                        {req.year} {req.brand} {req.model} - {req.service_type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-gray-400 text-xs font-medium">Breakdown Items *</label>
                                <button type="button" onClick={() => setBreakdownItems([...breakdownItems, { key: '', value: '' }])} className="text-lime-500 text-xs">
                                    <Plus className="w-3 h-3 inline" /> Add Item
                                </button>
                            </div>
                            {breakdownItems.map((item, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={item.key}
                                        onChange={(e) => {
                                            const updated = [...breakdownItems];
                                            updated[index].key = e.target.value;
                                            setBreakdownItems(updated);
                                        }}
                                        className="flex-1 px-3 py-2 bg-[#0A0A0A] border border-[#222] rounded-lg text-white text-sm"
                                        placeholder="Item name"
                                    />
                                    <input
                                        type="number"
                                        value={item.value}
                                        onChange={(e) => {
                                            const updated = [...breakdownItems];
                                            updated[index].value = e.target.value;
                                            setBreakdownItems(updated);
                                        }}
                                        className="w-32 px-3 py-2 bg-[#0A0A0A] border border-[#222] rounded-lg text-white text-sm"
                                        placeholder="Amount"
                                    />
                                    {breakdownItems.length > 1 && (
                                        <button type="button" onClick={() => setBreakdownItems(breakdownItems.filter((_, i) => i !== index))} className="p-2 text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <div className="mt-3 pt-3 border-t border-[#222] flex justify-between">
                                <span className="text-gray-400 text-sm">Total:</span>
                                <span className="text-lime-500 font-bold">₦{calculatedAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-400 text-sm">Cancel</button>
                        <button type="submit" disabled={loading || !formData.request_id || calculatedAmount <= 0} className="px-4 py-2 bg-lime-500 text-black rounded-lg font-medium text-sm disabled:opacity-50">
                            {loading && <Loader2 className="w-4 h-4 animate-spin inline mr-1" />}
                            Create Quote
                        </button>
                    </div>
                </form>
            )}

            {quotes.length === 0 ? (
                <div className="text-center py-16 bg-[#111] rounded-2xl border border-[#222]">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-gray-400 font-medium">No quotes yet</h3>
                </div>
            ) : (
                <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
                    {/* Table Header - Hidden on mobile */}
                    <div className="hidden lg:grid grid-cols-10 gap-4 px-6 py-4 bg-[#0A0A0A] border-b border-[#222] text-xs font-medium text-gray-500 uppercase">
                        <div className="col-span-3">Request</div>
                        <div className="col-span-2">Amount</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Created</div>
                        <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y divide-[#1A1A1A]">
                        {quotes.map((quote) => (
                            <div key={quote.id}>
                                {/* Responsive Grid/Stack */}
                                <div className="flex flex-col lg:grid lg:grid-cols-10 gap-3 lg:gap-4 px-4 sm:px-6 py-4 items-start lg:items-center hover:bg-[#1A1A1A]/50 transition-colors">
                                    {/* Request Info */}
                                    <div className="lg:col-span-3 w-full flex justify-between lg:block">
                                        <p className="text-white font-medium text-sm">
                                            {quote.requests?.year} {quote.requests?.brand} {quote.requests?.model}
                                        </p>
                                        <p className="text-gray-500 text-xs lg:hidden">{new Date(quote.created_at).toLocaleDateString()}</p>
                                    </div>

                                    {/* Amount - Full width on mobile/tablet intermediate */}
                                    <div className="lg:col-span-2 w-full lg:w-auto flex justify-between items-center lg:block">
                                        <span className="text-gray-500 text-xs uppercase lg:hidden">Amount</span>
                                        <p className="text-lime-500 font-bold">
                                            ₦{quote.breakdown ? Object.values(quote.breakdown).reduce((s: number, v: any) => s + (Number(v) || 0), 0).toLocaleString() : Number(quote.amount).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div className="lg:col-span-2 w-full lg:w-auto">
                                        <select
                                            value={quote.status || 'pending'}
                                            onChange={(e) => handleUpdate(quote.id, 'status', e.target.value)}
                                            className={`w-full appearance-none px-3 py-1.5 rounded-lg text-xs font-medium border ${STATUS_COLORS[quote.status] || STATUS_COLORS.pending}`}
                                        >
                                            {QUOTE_STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#111] text-white">{s}</option>)}
                                        </select>
                                    </div>

                                    {/* Created Date - Hidden on mobile (moved to top) */}
                                    <div className="hidden lg:block lg:col-span-2">
                                        <p className="text-gray-400 text-xs">{new Date(quote.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:col-span-1 flex items-center gap-2 w-full justify-end lg:justify-start pt-2 lg:pt-0 border-t lg:border-none border-[#222] mt-2 lg:mt-0">
                                        <button type="button" onClick={() => startEditQuote(quote)} className="text-lime-500 text-xs flex items-center gap-1 bg-[#1A1A1A] lg:bg-transparent px-3 py-1.5 lg:p-0 rounded-lg lg:rounded-none">
                                            <Edit2 className="w-3 h-3" /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmDeleteId(quote.id);
                                            }}
                                            disabled={deletingId === quote.id}
                                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-1 text-xs disabled:opacity-50"
                                        >
                                            {deletingId === quote.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            <span className="lg:hidden">Delete</span>
                                        </button>
                                    </div>
                                </div>
                                {editingQuoteId === quote.id && (
                                    <div className="px-6 py-4 bg-[#0A0A0A] border-t border-[#1A1A1A]">
                                        <div className="mb-4">
                                            <label className="text-gray-400 text-xs font-medium mb-2 block">Assigned Request</label>
                                            <select value={editRequestId} onChange={(e) => setEditRequestId(e.target.value)} className="w-full max-w-md px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-white text-sm">
                                                {getAvailableRequestsForEdit(quote.request_id).map(req => (
                                                    <option key={req.id} value={req.id}>{req.year} {req.brand} {req.model}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-gray-400 text-xs font-medium">Breakdown Items</span>
                                            <button type="button" onClick={() => setEditBreakdownItems([...editBreakdownItems, { key: '', value: '' }])} className="text-lime-500 text-xs">
                                                <Plus className="w-3 h-3 inline" /> Add
                                            </button>
                                        </div>
                                        {editBreakdownItems.map((item, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <input type="text" value={item.key} onChange={(e) => { const u = [...editBreakdownItems]; u[index].key = e.target.value; setEditBreakdownItems(u); }} className="flex-1 px-3 py-2 bg-[#111] border border-[#222] rounded-lg text-white text-sm" placeholder="Item" />
                                                <input type="number" value={item.value} onChange={(e) => { const u = [...editBreakdownItems]; u[index].value = e.target.value; setEditBreakdownItems(u); }} className="w-32 px-3 py-2 bg-[#111] border border-[#222] rounded-lg text-white text-sm" placeholder="Amount" />
                                                {editBreakdownItems.length > 1 && <button type="button" onClick={() => setEditBreakdownItems(editBreakdownItems.filter((_, i) => i !== index))} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>}
                                            </div>
                                        ))}
                                        <div className="mt-3 pt-3 border-t border-[#222] flex justify-between">
                                            <span className="text-gray-400 text-sm">Total:</span>
                                            <span className="text-lime-500 font-bold">₦{editCalculatedAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-3">
                                            <button type="button" onClick={cancelEditQuote} className="px-3 py-1.5 text-gray-400 text-sm">Cancel</button>
                                            <button type="button" onClick={() => saveQuoteChanges(quote.id, quote.request_id)} disabled={loading} className="px-3 py-1.5 bg-lime-500 text-black rounded-lg text-sm font-medium disabled:opacity-50">
                                                {loading && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}Save
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {editingQuoteId !== quote.id && quote.breakdown && Object.keys(quote.breakdown).length > 0 && (
                                    <div className="px-6 py-3 bg-[#0A0A0A] border-t border-[#1A1A1A]">
                                        <div className="flex flex-wrap gap-3">
                                            {Object.entries(quote.breakdown).map(([key, value]) => (
                                                <div key={key} className="px-3 py-1.5 bg-[#1A1A1A] rounded-lg">
                                                    <span className="text-gray-400 text-xs">{key}:</span>
                                                    <span className="text-white text-xs ml-1 font-medium">₦{Number(value).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
