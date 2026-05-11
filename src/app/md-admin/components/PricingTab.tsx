'use client';

import { useState, useEffect } from 'react';
import { Plus, DollarSign, Loader2, Pencil, Check, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';
import ConfirmationModal from './ConfirmationModal';

interface PricingTabProps {
    servicePrices: any[];
}

interface EditRow { price: string; label: string; description: string; }

export default function PricingTab({ servicePrices }: PricingTabProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingKey, setDeletingKey] = useState<string | null>(null);
    const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editRow, setEditRow] = useState<EditRow>({ price: '', label: '', description: '' });
    const [formData, setFormData] = useState({ label: '', price: '', description: '' });

    const generatedKey = formData.label.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');

    useEffect(() => {
        const interval = setInterval(() => router.refresh(), 30000);
        return () => clearInterval(interval);
    }, [router]);

    const startEdit = (price: any) => {
        setEditingKey(price.key);
        setEditRow({ price: price.price?.toString() || '0', label: price.label || '', description: price.description || '' });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!generatedKey) { showToast('Please enter a service name', 'error'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/admin/create-service-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: generatedKey, label: formData.label, price: Number(formData.price), description: formData.description }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Service price created', 'success');
                setShowCreate(false);
                setFormData({ label: '', price: '', description: '' });
                router.refresh();
            } else {
                showToast(data.error || 'Failed to create', 'error');
            }
        } catch {
            showToast('Failed to create', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/update-service-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, price: Number(editRow.price), label: editRow.label, description: editRow.description }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Service price updated', 'success');
                setEditingKey(null);
                router.refresh();
            } else {
                showToast(data.error || 'Failed to update', 'error');
            }
        } catch {
            showToast('Failed to update', 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!confirmDeleteKey) return;
        setDeletingKey(confirmDeleteKey);
        setConfirmDeleteKey(null);
        try {
            const res = await fetch('/api/admin/delete-service-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: confirmDeleteKey }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Service price deleted', 'success');
                router.refresh();
            } else {
                showToast(data.error || 'Failed to delete', 'error');
            }
        } catch {
            showToast('Failed to delete', 'error');
        } finally {
            setDeletingKey(null);
        }
    };

    const inputCls = 'w-full px-3 py-1.5 bg-[#0A0A0A] border border-lime-500/50 rounded-lg text-white text-sm focus:border-lime-500 focus:outline-none';

    return (
        <div>
            <ConfirmationModal
                isOpen={!!confirmDeleteKey}
                onClose={() => setConfirmDeleteKey(null)}
                onConfirm={confirmDelete}
                title="Delete Service Price"
                message="Are you sure you want to delete this service price? This cannot be undone."
                confirmText="Delete Price"
            />

            <div className="flex justify-end mb-2">
                <span className="text-gray-600 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
                    Auto-refreshes every 30s
                </span>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-white font-bold text-lg">Service Prices</h2>
                    <p className="text-gray-500 text-sm">Manage pricing for all services</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black rounded-xl font-medium text-sm hover:bg-lime-400"
                >
                    <Plus className="w-4 h-4" />
                    Add Price
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="bg-[#111] rounded-2xl border border-[#222] p-6 mb-6">
                    <h3 className="text-white font-medium mb-4">New Service Price</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Service Name *</label>
                            <input type="text" required value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#222] rounded-xl text-white text-sm focus:border-lime-500 focus:outline-none" placeholder="Oil Change" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Key (auto-generated)</label>
                            <input type="text" readOnly value={generatedKey} className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#222] rounded-xl text-gray-500 text-sm font-mono cursor-not-allowed" placeholder="oil_change" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Price (₦) *</label>
                            <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#222] rounded-xl text-white text-sm focus:border-lime-500 focus:outline-none" placeholder="5000" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Description</label>
                            <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#222] rounded-xl text-white text-sm focus:border-lime-500 focus:outline-none" placeholder="Service description" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-400 text-sm hover:text-white">Cancel</button>
                        <button type="submit" disabled={loading || !generatedKey} className="px-4 py-2 bg-lime-500 text-black rounded-lg font-medium text-sm disabled:opacity-50 flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Price
                        </button>
                    </div>
                </form>
            )}

            {servicePrices.length === 0 ? (
                <div className="text-center py-16 bg-[#111] rounded-2xl border border-[#222]">
                    <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-gray-400 font-medium">No prices configured</h3>
                </div>
            ) : (
                <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
                    {/* Desktop header */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-[#0A0A0A] border-b border-[#222] text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-2">Key</div>
                        <div className="col-span-2">Price (₦)</div>
                        <div className="col-span-3">Label</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-1">Actions</div>
                    </div>

                    <div className="divide-y divide-[#1A1A1A]">
                        {servicePrices.map((price) => (
                            <div key={price.key} className={`px-4 lg:px-6 py-4 transition-colors ${editingKey === price.key ? 'bg-[#1a1a0a]' : 'hover:bg-[#1A1A1A]/50'}`}>
                                {editingKey === price.key ? (
                                    /* Edit mode — stacked on mobile, grid on desktop */
                                    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center gap-3">
                                        {/* Key (read-only) */}
                                        <div className="lg:col-span-2 flex items-center gap-2">
                                            <span className="text-gray-500 text-xs lg:hidden">Key:</span>
                                            <code className="text-lime-400 text-sm bg-lime-500/10 px-2 py-1 rounded">{price.key}</code>
                                        </div>
                                        {/* Price */}
                                        <div className="lg:col-span-2">
                                            <label className="text-gray-500 text-xs mb-1 block lg:hidden">Price (₦)</label>
                                            <input type="number" value={editRow.price} onChange={e => setEditRow({ ...editRow, price: e.target.value })} className={inputCls} autoFocus />
                                        </div>
                                        {/* Label */}
                                        <div className="lg:col-span-3">
                                            <label className="text-gray-500 text-xs mb-1 block lg:hidden">Label</label>
                                            <input type="text" value={editRow.label} onChange={e => setEditRow({ ...editRow, label: e.target.value })} className={inputCls} placeholder="Display label" />
                                        </div>
                                        {/* Description */}
                                        <div className="lg:col-span-4">
                                            <label className="text-gray-500 text-xs mb-1 block lg:hidden">Description</label>
                                            <input type="text" value={editRow.description} onChange={e => setEditRow({ ...editRow, description: e.target.value })} className={inputCls} placeholder="Service description" />
                                        </div>
                                        {/* Save/Cancel */}
                                        <div className="lg:col-span-1 flex items-center gap-2 pt-2 lg:pt-0">
                                            <button type="button" onClick={() => handleUpdate(price.key)} disabled={loading} className="p-1.5 bg-lime-500/20 text-lime-400 hover:bg-lime-500/30 rounded-lg disabled:opacity-50">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            </button>
                                            <button type="button" onClick={() => setEditingKey(null)} className="p-1.5 bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 rounded-lg">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Display mode */
                                    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center gap-2">
                                        <div className="lg:col-span-2 flex items-center justify-between lg:block">
                                            <code className="text-lime-400 text-sm bg-lime-500/10 px-2 py-1 rounded">{price.key}</code>
                                            {/* Mobile action buttons inline with key */}
                                            <div className="flex items-center gap-1 lg:hidden">
                                                <button type="button" onClick={() => startEdit(price)} className="p-1.5 text-gray-400 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button type="button" onClick={() => setConfirmDeleteKey(price.key)} disabled={deletingKey === price.key} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg disabled:opacity-50">
                                                    {deletingKey === price.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-2 flex items-center gap-2">
                                            <span className="text-gray-500 text-xs lg:hidden">Price:</span>
                                            <span className="text-white font-bold">₦{Number(price.price).toLocaleString()}</span>
                                        </div>
                                        <div className="lg:col-span-3 flex items-center gap-2">
                                            <span className="text-gray-500 text-xs lg:hidden">Label:</span>
                                            <span className="text-gray-300 text-sm">{price.label || <span className="text-gray-600 italic">—</span>}</span>
                                        </div>
                                        <div className="lg:col-span-4 flex items-center gap-2 overflow-hidden">
                                            <span className="text-gray-500 text-xs shrink-0 lg:hidden">Desc:</span>
                                            <span className="text-gray-500 text-sm truncate" title={price.description || ''}>{price.description || <span className="text-gray-600 italic">—</span>}</span>
                                        </div>
                                        {/* Desktop actions */}
                                        <div className="hidden lg:flex lg:col-span-1 items-center gap-1">
                                            <button type="button" onClick={() => startEdit(price)} className="p-1.5 text-gray-500 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => setConfirmDeleteKey(price.key)} disabled={deletingKey === price.key} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg disabled:opacity-50">
                                                {deletingKey === price.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
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
