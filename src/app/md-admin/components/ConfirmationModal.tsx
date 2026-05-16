'use client';

import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning' | 'info';
    requireReason?: boolean;
    reasonPlaceholder?: string;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    variant = 'danger',
    requireReason = false,
    reasonPlaceholder = 'Enter your reason...',
}: ConfirmationModalProps) {
    const [reason, setReason] = useState('')

    // Reset reason when modal opens/closes
    useEffect(() => {
        if (!isOpen) setReason('')
    }, [isOpen])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, isLoading]);

    if (!isOpen) return null;

    const colors = {
        danger: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
        info: 'bg-blue-500 hover:bg-blue-600'
    };

    const canConfirm = !requireReason || reason.trim().length >= 10;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden"
                role="dialog"
                aria-modal="true"
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {requireReason && (
                        <div className="mt-5">
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                                Reason <span className="text-red-500">*</span>
                                <span className="text-gray-600 normal-case ml-1">(min. 10 characters)</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder={reasonPlaceholder}
                                rows={3}
                                disabled={isLoading}
                                autoFocus
                                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/50 resize-none transition-colors"
                            />
                            {reason.trim().length > 0 && reason.trim().length < 10 && (
                                <p className="text-xs text-red-400 mt-1">{10 - reason.trim().length} more characters needed</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-[#0A0A0A] border-t border-[#222] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#222]"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => onConfirm(requireReason ? reason.trim() : undefined)}
                        disabled={isLoading || !canConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${colors[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
