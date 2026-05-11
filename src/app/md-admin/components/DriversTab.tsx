'use client';

import { useState, useEffect } from 'react';
import { Plus, User, Phone, MapPin, Star, Briefcase, Check, Loader2, Trash2, Pencil, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';
import ConfirmationModal from './ConfirmationModal';

interface DriversTabProps {
    drivers: any[];
}

const EMPTY_FORM = { full_name: '', phone_number: '', location: '', bio: '', avatar_url: '', is_verified: true };

export default function DriversTab({ drivers }: DriversTabProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => {
        const interval = setInterval(() => router.refresh(), 30000);
        return () => clearInterval(interval);
    }, [router]);

    const startEdit = (driver: any) => {
        setEditingId(driver.id);
        setEditForm({
            full_name: driver.full_name || '',
            phone_number: driver.phone_number || '',
            location: driver.location || '',
            bio: driver.bio || '',
            avatar_url: driver.avatar_url || '',
            is_verified: driver.is_verified ?? true,
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/create-driver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Driver created successfully', 'success');
                setShowCreate(false);
                setFormData(EMPTY_FORM);
                router.refresh();
            } else {
                showToast(data.error || 'Failed to create driver', 'error');
            }
        } catch {
            showToast('Failed to create driver', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (driverId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/update-driver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverId, ...editForm }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Driver updated successfully', 'success');
                setEditingId(null);
                router.refresh();
            } else {
                showToast(data.error || 'Failed to update driver', 'error');
            }
        } catch {
            showToast('Failed to update driver', 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeletingId(confirmDeleteId);
        setConfirmDeleteId(null);
        try {
            const res = await fetch('/api/admin/delete-driver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverId: confirmDeleteId }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Driver deleted successfully', 'success');
                router.refresh();
            } else {
                showToast(data.error || 'Failed to delete driver', 'error');
            }
        } catch {
            showToast('Failed to delete driver', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const inputCls = 'w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-white text-sm focus:border-lime-500 focus:outline-none';

    return (
        <div>
            <ConfirmationModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Driver"
                message="Are you sure you want to delete this driver? This action cannot be undone."
                confirmText="Delete Driver"
            />

            <div className="flex justify-end mb-2">
                <span className="text-gray-600 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
                    Auto-refreshes every 30s
                </span>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-white font-bold text-lg">Mechanic Drivers</h2>
                    <p className="text-gray-500 text-sm">Manage your fleet of mechanic drivers</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black rounded-xl font-medium text-sm hover:bg-lime-400"
                >
                    <Plus className="w-4 h-4" />
                    Add Driver
                </button>
            </div>

            {/* Create form */}
            {showCreate && (
                <form onSubmit={handleCreate} className="bg-[#111] rounded-2xl border border-[#222] p-6 mb-6">
                    <h3 className="text-white font-medium mb-4">New Driver</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Full Name *</label>
                            <input type="text" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className={inputCls} placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Phone Number *</label>
                            <input type="text" required value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} className={inputCls} placeholder="08012345678" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Location</label>
                            <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className={inputCls} placeholder="Ikeja, Lagos" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Verified</label>
                            <select value={formData.is_verified ? 'true' : 'false'} onChange={e => setFormData({ ...formData, is_verified: e.target.value === 'true' })} className={inputCls}>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Avatar URL</label>
                            <input type="url" value={formData.avatar_url} onChange={e => setFormData({ ...formData, avatar_url: e.target.value })} className={inputCls} placeholder="https://example.com/avatar.png" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Bio</label>
                            <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className={`${inputCls} min-h-[80px] resize-none`} placeholder="Brief description of the driver..." />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-400 text-sm hover:text-white">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-lime-500 text-black rounded-lg font-medium text-sm disabled:opacity-50 flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Driver
                        </button>
                    </div>
                </form>
            )}

            {drivers.length === 0 ? (
                <div className="text-center py-16 bg-[#111] rounded-2xl border border-[#222]">
                    <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-gray-400 font-medium">No drivers yet</h3>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {drivers.map((driver) => (
                        <div key={driver.id} className="bg-[#111] rounded-2xl border border-[#222] p-5 hover:border-[#333] transition-colors">
                            {editingId === driver.id ? (
                                /* Edit mode */
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-white font-medium text-sm">Edit Driver</h4>
                                        <button type="button" onClick={() => setEditingId(null)} className="p-1 text-gray-500 hover:text-white rounded-lg">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-gray-500 text-xs mb-1 block">Full Name *</label>
                                            <input type="text" required value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="text-gray-500 text-xs mb-1 block">Phone Number *</label>
                                            <input type="text" required value={editForm.phone_number} onChange={e => setEditForm({ ...editForm, phone_number: e.target.value })} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="text-gray-500 text-xs mb-1 block">Location</label>
                                            <input type="text" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="text-gray-500 text-xs mb-1 block">Avatar URL</label>
                                            <input type="url" value={editForm.avatar_url} onChange={e => setEditForm({ ...editForm, avatar_url: e.target.value })} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="text-gray-500 text-xs mb-1 block">Bio</label>
                                            <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className={`${inputCls} min-h-[64px] resize-none`} />
                                        </div>
                                        <div>
                                            <label className="text-gray-500 text-xs mb-1 block">Verified</label>
                                            <select value={editForm.is_verified ? 'true' : 'false'} onChange={e => setEditForm({ ...editForm, is_verified: e.target.value === 'true' })} className={inputCls}>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 text-gray-400 text-sm hover:text-white">Cancel</button>
                                        <button type="button" onClick={() => handleUpdate(driver.id)} disabled={loading} className="px-3 py-1.5 bg-lime-500 text-black rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5">
                                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Display mode */
                                <>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {driver.avatar_url ? (
                                                <img src={driver.avatar_url} alt={driver.full_name} className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center">
                                                    <User className="w-6 h-6 text-gray-500" />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-white font-medium">{driver.full_name}</h4>
                                                <p className="text-gray-500 text-sm flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />{driver.phone_number}
                                                </p>
                                            </div>
                                        </div>
                                        {driver.is_verified && (
                                            <span className="px-2 py-1 bg-lime-500/10 text-lime-500 text-xs rounded-full flex items-center gap-1 shrink-0">
                                                <Check className="w-3 h-3" /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        {driver.location && (
                                            <p className="text-gray-400 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-600" />{driver.location}
                                            </p>
                                        )}
                                        {driver.bio && (
                                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{driver.bio}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-gray-500">
                                            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" />{driver.ratings || '5.0'}</span>
                                            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{driver.jobs_completed || 0} jobs</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-[#222] flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(driver)}
                                            className="p-2 text-gray-400 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg flex items-center gap-1 text-xs"
                                        >
                                            <Pencil className="w-4 h-4" /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDeleteId(driver.id)}
                                            disabled={deletingId === driver.id}
                                            className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-1 text-xs disabled:opacity-50"
                                        >
                                            {deletingId === driver.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
