"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitRequestJson } from "../request/actions";
import { Loader2, CheckCircle } from "lucide-react";

export function PendingRequestManager() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const checkPending = async () => {
            const stored = localStorage.getItem('pendingRequest');
            if (!stored) return;

            // Found pending request
            setSubmitting(true);
            try {
                const data = JSON.parse(stored);

                // Call server action
                // We use startTransition to wrap separate actions if needed, but submitRequestJson is simple
                const result = await submitRequestJson(data);

                if (result.success) {
                    setSuccess(true);
                    localStorage.removeItem('pendingRequest');

                    // Refresh current route to update specific UI if needed (like removing empty states)
                    router.refresh();

                    // Clear success message after delay
                    setTimeout(() => setSuccess(false), 5000);
                } else {
                    console.error("Failed to submit deferred request:", result.error);
                    // Standard: keep it in storage so they can try again? 
                    // Or alert user? For now just log.
                    // If error is unauthenticated, they shouldn't be here (or session expired).
                }
            } catch (e) {
                console.error("Error processing pending request", e);
            } finally {
                setSubmitting(false);
            }
        };

        checkPending();
    }, [router]);

    if (submitting) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center max-w-sm w-full border border-gray-100 animate-in fade-in zoom-in duration-300">
                    <Loader2 className="w-10 h-10 text-lime-600 animate-spin mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Finalizing your order...</h3>
                    <p className="text-gray-500 text-center mt-2 text-sm">Please wait while we secure your booking.</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-white/90 backdrop-blur-md border border-lime-200 text-lime-800 px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
                    <div className="bg-lime-100 p-1.5 rounded-full">
                        <CheckCircle className="w-5 h-5 text-lime-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Request Submitted!</p>
                        <p className="text-sm text-gray-600">Your mechanic driver has been notified.</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
