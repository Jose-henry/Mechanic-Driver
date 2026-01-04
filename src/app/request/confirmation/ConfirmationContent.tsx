'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

export function ConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [timeLeft, setTimeLeft] = useState(5);

    const isTowing = searchParams.get('towing') === 'true';
    const isWash = searchParams.get('wash') === 'true';

    useEffect(() => {
        if (timeLeft === 0) {
            router.push('/tracking?success=true');
        }
    }, [timeLeft, router]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in duration-300">

                <div className="bg-lime-400 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-gray-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
                    <p className="text-gray-800 font-medium opacity-90 mt-1">Estimating costs...</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600 font-medium">Mechanic Driver</span>
                            <span className="text-gray-900 font-bold">₦10,000</span>
                        </div>

                        {isTowing && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 animate-in slide-in-from-left-4 fade-in">
                                <span className="text-gray-600 font-medium">Towing Service</span>
                                <span className="text-gray-900 font-bold">₦20,000</span>
                            </div>
                        )}

                        {isWash && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 animate-in slide-in-from-left-4 fade-in">
                                <span className="text-gray-600 font-medium">Car Wash</span>
                                <span className="text-gray-900 font-bold">₦1,500</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600 font-medium">Repair Costs</span>
                            <span className="text-amber-600 font-bold italic">Pending Diagnostic</span>
                        </div>
                    </div>

                    <div className="pt-4 text-center">
                        <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Redirecting to tracking in {timeLeft}s
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
