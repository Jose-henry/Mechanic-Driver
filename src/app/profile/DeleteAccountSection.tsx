"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "../auth/actions";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

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
            <div className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Delete Account</h2>
                        <p className="text-gray-500 text-sm">
                            Permanently remove your account and all data.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-red-50/50 rounded-2xl p-6 md:p-8 border border-red-100">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-red-100 rounded-xl text-red-600 shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">We're sorry to see you go</h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            Please help us improve by telling us why you are leaving. <br />
                            <span className="font-semibold text-red-600">Warning: This action is permanent and cannot be undone.</span>
                        </p>
                    </div>
                </div>

                <div className="space-y-3 py-4">
                    {REASONS.map((r) => (
                        <label key={r} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white border border-transparent hover:border-red-100 transition-all">
                            <div className="relative flex items-center justify-center">
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
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{r}</span>
                        </label>
                    ))}
                </div>

                {selectedReason === "Other" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 px-3">
                        <label className="text-sm font-bold text-gray-700">
                            Please describe your reason <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell us what happened..."
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none text-sm min-h-[100px] transition-all placeholder:text-gray-400"
                        />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 mt-2">
                    <button
                        onClick={handleDelete}
                        disabled={!isDeleteEnabled() || isPending}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-red-200 hover:-translate-y-0.5"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Permanently Delete Account"
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setShowConfirm(false);
                            setSelectedReason("");
                            setDescription("");
                        }}
                        disabled={isPending}
                        className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
