'use client';

import { useState, useEffect } from 'react';
import { Plus, DollarSign, Loader2, Pencil, Check, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';
import ConfirmationModal from './ConfirmationModal';

interface PricingTabProps {
    servicePrices: any[];
}

export default function PricingTab({ servicePrices }: PricingTabProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingKey, setDeletingKey] = useState<string | null>(null);
    const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [formData, setFormData] = useState({
        label: '',
        price: '',
        description: ''
    });

    const generatedKey = formData.label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');

    useEffect(() => {
        const interval = setInterval(() => router.refresh(), 30000);
        return () => clearInterval(interval);
    }, [router]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!generatedKey) {
            showToast('Please enter a service name', 'error');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/admin/create-service-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: generatedKey,
                    label: formData.label,
                    price: Number(formData.price),
                    description: formData.description
                })
            });
            const data = await response.json();
            if (response.ok) {
                showToast('Service price created successfully', 'success');
                setShowCreate(false);
                setFormData({ label: '', price: '', description: '' });
                router.refresh();
            } else {
                showToast(data.error || 'Failed to create service price', 'error');
            }
        } catch (error) {
            showToast('Failed to create service price', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePrice = async (key: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/update-service-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, price: Number(editValue) })
            });
            const data = await response.json();
            if (response.ok) {
                showToast('Price updated successfully', 'success');
                setEditingKey(null);
                router.refresh();
            } else {
                showToast(data.error || 'Failed to update price', 'error');
            }
        } catch (error) {
            showToast('Failed to update price', 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!confirmDeleteKey) return;

        setDeletingKey(confirmDeleteKey);
        setConfirmDeleteKey(null);

        try {
            const response = await fetch('/api/admin/delete-service-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: confirmDeleteKey })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Service price deleted successfully', 'success');
                router.refresh();
            } else {
                showToast(data.error || 'Failed to delete service price', 'error');
            }
        } catch (error) {
            showToast('Failed to delete service price', 'error');
        } finally {
            setDeletingKey(null);
        }
    };

    return (
        <div>
            <ConfirmationModal
                isOpen={!!confirmDeleteKey}
                onClose={() => setConfirmDeleteKey(null)}
                onConfirm={confirmDelete}
                title="Delete Service Price"
                message={`Are you sure you want to delete this service price? This cannot be undone.`}
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
                            <input
                                type="text"
                                required
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#222] rounded-xl text-white text-sm"
                                placeholder="Oil Change"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Key (auto-generated)</label>
                            <input
                                type="text"
                                readOnly
                                value={generatedKey}
                                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#222] rounded-xl text-gray-500 text-sm font-mono cursor-not-allowed"
                                placeholder="oil_change"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Price (₦) *</label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#222] rounded-xl text-white text-sm"
                                placeholder="5000"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#222] rounded-xl text-white text-sm"
                                placeholder="Service description"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-400 text-sm">Cancel</button>
                        <button type="submit" disabled={loading || !generatedKey} className="px-4 py-2 bg-lime-500 text-black rounded-lg font-medium text-sm disabled:opacity-50">
                            {loading && <Loader2 className="w-4 h-4 animate-spin inline mr-1" />}
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
                    {/* Table Header - Hidden on mobile */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-[#0A0A0A] border-b border-[#222] text-xs font-medium text-gray-500 uppercase">
                        <div className="col-span-3">Key</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-3">Label</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y divide-[#1A1A1A]">
                        {servicePrices.map((price) => (
                            <div key={price.key}>
                                {/* Responsive Grid/Stack */}
                                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 px-4 sm:px-6 py-4 hover:bg-[#1A1A1A]/50 items-start lg:items-center">
                                    {/* Key & Price Row on Mobile */}
                                    <div className="w-full flex justify-between items-center lg:contents">
                                        <div className="lg:col-span-3">
                                            <code className="text-lime-400 text-sm bg-lime-500/10 px-2 py-1 rounded">{price.key}</code>
                                        </div>

                                        <div className="lg:col-span-2 text-right lg:text-left">
                                            {editingKey === price.key ? (
                                                <div className="flex items-center gap-2 justify-end lg:justify-start">
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-20 px-2 py-1 bg-[#0A0A0A] border border-lime-500 rounded text-white text-sm"
                                                        autoFocus
                                                    />
                                                    <button type="button" onClick={() => handleUpdatePrice(price.key)} disabled={loading} className="p-1 text-lime-500 hover:bg-lime-500/10 rounded">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button type="button" onClick={() => setEditingKey(null)} className="p-1 text-gray-500 hover:bg-gray-500/10 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group justify-end lg:justify-start">
                                                    <span className="text-white font-bold">₦{Number(price.price).toLocaleString()}</span>
                                                    <button type="button" onClick={() => { setEditingKey(price.key); setEditValue(price.price.toString()); }} className="p-1 text-gray-600 hover:text-lime-500 opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 opacity-100">
                                                        <Pencil className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <div className="lg:col-span-3 w-full">
                                        <span className="text-gray-500 text-xs uppercase lg:hidden mr-2">Label:</span>
                                        <span className="text-gray-300 text-sm">{price.label || '-'}</span>
                                    </div>

                                    {/* Description */}
                                    <div className="lg:col-span-3 w-full overflow-hidden">
                                        <span className="text-gray-500 text-xs uppercase lg:hidden mr-2">Desc:</span>
                                        <span className="text-gray-500 text-sm block truncate max-w-[200px] lg:max-w-none" title={price.description || ''}>{price.description || '-'}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:col-span-1 w-full flex justify-end lg:block pt-2 lg:pt-0 border-t lg:border-none border-[#222] mt-2 lg:mt-0">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmDeleteKey(price.key);
                                            }}
                                            disabled={deletingKey === price.key}
                                            className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50 flex items-center gap-2 lg:inline-flex"
                                        >
                                            {deletingKey === price.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            <span className="lg:hidden text-xs">Delete Price</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
