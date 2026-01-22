'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, User, AlertCircle, Calendar, Droplets, Truck, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';

interface RequestsTabProps {
    requests: any[];
    drivers: any[];
}

const STATUS_OPTIONS = [
    'pending',
    'accepted',
    'en_route',
    'arrived',
    'diagnosing',
    'quote_ready',
    'maintenance_in_progress',
    'vehicle_enroute_back',
    'completed'
];

const PAYMENT_STATUS_OPTIONS = ['pending', 'verifying', 'paid'];

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    accepted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    en_route: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    arrived: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    diagnosing: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    quote_ready: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    maintenance_in_progress: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    vehicle_enroute_back: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    completed: 'bg-lime-500/10 text-lime-500 border-lime-500/20',
};

const PAYMENT_COLORS: Record<string, string> = {
    pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    verifying: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    paid: 'bg-lime-500/10 text-lime-500 border-lime-500/20',
};

export default function RequestsTab({ requests, drivers }: RequestsTabProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const handleUpdate = async (requestId: string, field: string, value: any) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/update-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, field, value })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Request updated successfully', 'success');
                router.refresh();
            } else {
                showToast(data.error || 'Failed to update request', 'error');
            }
        } catch (error) {
            showToast('Failed to update request', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (requests.length === 0) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-gray-400 font-medium">No requests yet</h3>
                <p className="text-gray-600 text-sm mt-1">Requests will appear here when users submit them.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Auto-refresh indicator */}
            <div className="flex justify-end">
                <span className="text-gray-600 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
                    Auto-refreshes every 30s
                </span>
            </div>

            <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
                {/* Table Header - Hidden on mobile */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-[#0A0A0A] border-b border-[#222] text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-2">Vehicle</div>
                    <div className="col-span-2">Pickup Info</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Payment</div>
                    <div className="col-span-2">Driver</div>
                    <div className="col-span-2">Customer</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-[#1A1A1A]">
                    {requests.map((req) => (
                        <div key={req.id}>
                            {/* Desktop Grid / Mobile Stacked */}
                            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 px-4 sm:px-6 py-4 hover:bg-[#1A1A1A]/50 transition-colors">
                                {/* Vehicle */}
                                <div className="lg:col-span-2 flex justify-between lg:block">
                                    <div>
                                        <p className="text-white font-medium text-sm">
                                            {req.year} {req.brand}
                                        </p>
                                        <p className="text-gray-500 text-xs">{req.model}</p>
                                        <p className="text-gray-600 text-xs font-mono">{req.license_plate}</p>
                                    </div>
                                    {/* Mobile: Customer info in same row */}
                                    <div className="lg:hidden text-right">
                                        <p className="text-white text-sm">{req.profiles?.full_name || 'Unknown'}</p>
                                        <p className="text-gray-500 text-xs">{req.profiles?.phone || 'No phone'}</p>
                                    </div>
                                </div>

                                {/* Pickup Info */}
                                <div className="lg:col-span-2">
                                    <div className="space-y-1">
                                        <p className="text-gray-400 text-xs flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {req.pickup_date} @ {req.pickup_time}
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            {req.is_towing && (
                                                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded flex items-center gap-1">
                                                    <Truck className="w-3 h-3" /> Towing
                                                </span>
                                            )}
                                            {req.is_car_wash && (
                                                <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] rounded flex items-center gap-1">
                                                    <Droplets className="w-3 h-3" /> Wash
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                                            className="text-lime-500 text-xs hover:underline flex items-center gap-1"
                                        >
                                            <FileText className="w-3 h-3" />
                                            {expandedId === req.id ? 'Hide' : 'View'} Details
                                        </button>
                                    </div>
                                </div>

                                {/* Status & Payment - Inline on mobile */}
                                <div className="flex gap-2 lg:contents">
                                    {/* Status Dropdown */}
                                    <div className="flex-1 lg:col-span-2">
                                        <p className="text-gray-500 text-[10px] uppercase mb-1 lg:hidden">Status</p>
                                        <div className="relative">
                                            <select
                                                value={req.status}
                                                onChange={(e) => handleUpdate(req.id, 'status', e.target.value)}
                                                disabled={loading}
                                                className={`
                                                    w-full appearance-none px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer
                                                    ${STATUS_COLORS[req.status] || 'bg-gray-500/10 text-gray-400'}
                                                    focus:outline-none focus:ring-2 focus:ring-lime-500/50
                                                `}
                                            >
                                                {STATUS_OPTIONS.map(status => (
                                                    <option key={status} value={status} className="bg-[#111] text-white">
                                                        {status.replace(/_/g, ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                                        </div>
                                    </div>

                                    {/* Payment Status Dropdown */}
                                    <div className="flex-1 lg:col-span-2">
                                        <p className="text-gray-500 text-[10px] uppercase mb-1 lg:hidden">Payment</p>
                                        <div className="relative">
                                            <select
                                                value={req.payment_status || 'pending'}
                                                onChange={(e) => handleUpdate(req.id, 'payment_status', e.target.value)}
                                                disabled={loading}
                                                className={`
                                                    w-full appearance-none px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer
                                                    ${PAYMENT_COLORS[req.payment_status] || PAYMENT_COLORS.pending}
                                                    focus:outline-none focus:ring-2 focus:ring-lime-500/50
                                                `}
                                            >
                                                {PAYMENT_STATUS_OPTIONS.map(status => (
                                                    <option key={status} value={status} className="bg-[#111] text-white">
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                                        </div>
                                    </div>
                                </div>

                                {/* Driver Assignment */}
                                <div className="lg:col-span-2">
                                    <p className="text-gray-500 text-[10px] uppercase mb-1 lg:hidden">Driver</p>
                                    {drivers.length === 0 ? (
                                        <div className="text-xs">
                                            <p className="text-gray-500">No drivers</p>
                                            <button
                                                onClick={() => {/* Switch to drivers tab */ }}
                                                className="text-lime-500 hover:underline"
                                            >
                                                Create one →
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                value={req.mechanic_driver_id || ''}
                                                onChange={(e) => handleUpdate(req.id, 'mechanic_driver_id', e.target.value || null)}
                                                disabled={loading}
                                                className="w-full appearance-none px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1A1A1A] text-white border border-[#333] cursor-pointer focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                                            >
                                                <option value="" className="bg-[#111]">Unassigned</option>
                                                {drivers.map(driver => (
                                                    <option key={driver.id} value={driver.id} className="bg-[#111]">
                                                        {driver.full_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                                        </div>
                                    )}
                                    {req.drivers?.full_name && (
                                        <p className="text-lime-500 text-xs mt-1 flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {req.drivers.full_name}
                                        </p>
                                    )}
                                </div>

                                {/* Customer - Hidden on mobile (shown in vehicle row) */}
                                <div className="hidden lg:block lg:col-span-2">
                                    <p className="text-white text-sm">{req.profiles?.full_name || 'Unknown'}</p>
                                    <p className="text-gray-500 text-xs">{req.profiles?.phone || 'No phone'}</p>
                                    <p className="text-gray-600 text-xs">
                                        {new Date(req.created_at).toLocaleDateString('en-NG', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === req.id && (
                                <div className="px-4 sm:px-6 py-4 bg-[#0A0A0A] border-t border-[#1A1A1A] animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Service Type</p>
                                            <p className="text-white text-sm">{req.service_type || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Pickup Location</p>
                                            <p className="text-white text-sm">{req.pickup_location || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Issue Description</p>
                                            <p className="text-gray-300 text-sm whitespace-pre-wrap">
                                                {req.issue_description || 'No description provided'}
                                            </p>
                                        </div>
                                        {/* Amount Paid - beside Issue Description, only shows when paid */}
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Amount Paid</p>
                                            <p className="text-lime-500 font-bold text-lg">
                                                {req.payment_status === 'paid' && req.total_amount
                                                    ? `₦${Number(req.total_amount).toLocaleString()}`
                                                    : '-'}
                                            </p>
                                        </div>
                                        {req.pickup_notes && (
                                            <div className="md:col-span-2">
                                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Pickup Notes</p>
                                                <p className="text-gray-300 text-sm whitespace-pre-wrap">{req.pickup_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

