"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "../auth/actions";
import { AlertTriangle, Loader2 } from "lucide-react";

const REASONS = [
    "No longer need the service",
    "Found a better alternative",
    "Technical issues",
    "Too expensive",
    "Other"
];

export function DeleteAccountSection() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [description, setDescription] = useState("");
    const [isPending, startTransition] = useTransition();

    const isDeleteEnabled = () => {
        if (!selectedReason) return false;
        if (selectedReason === "Other" && !description.trim()) return false;
        return true;
    };

    const handleDelete = () => {
        if (!isDeleteEnabled()) return;

        startTransition(async () => {
            await deleteAccount(selectedReason, description);
        });
    };

    if (!showConfirm) {
        return (
            <div className="pt-6 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
                <p className="text-gray-500 text-sm mb-6">
                    Deleting an account is permanent and cannot be undone. All your requests and data will be removed.
                </p>

                <button
                    onClick={() => setShowConfirm(true)}
                    className="px-6 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                >
                    Delete my account
                </button>
            </div>
        );
    }

    return (
        <div className="pt-6 border-t border-gray-100 bg-red-50/50 rounded-xl p-6 mt-6 border-red-100">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-4 flex-1">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">We're sorry to see you go</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Please tell us why you are leaving. This action is permanent and cannot be undone.
                        </p>
                    </div>

                    <div className="space-y-3 py-2">
                        {REASONS.map((r) => (
                            <label key={r} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="radio"
                                        name="delete_reason"
                                        value={r}
                                        checked={selectedReason === r}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-red-600 peer-checked:border-[6px] transition-all bg-white" />
                                </div>
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">{r}</span>
                            </label>
                        ))}
                    </div>

                    {selectedReason === "Other" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-sm font-medium text-gray-700">
                                Please describe your reason <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell us more..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm min-h-[80px]"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleDelete}
                            disabled={!isDeleteEnabled() || isPending}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[170px]"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Permanently Delete"
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setShowConfirm(false);
                                setSelectedReason("");
                                setDescription("");
                            }}
                            disabled={isPending}
                            className="px-6 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
