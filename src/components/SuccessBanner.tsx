"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function SuccessBanner({ message, description }: { message: string, description?: string }) {
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Optional: Remove the query param from URL so it doesn't reappear on refresh
            // router.replace('/tracking'); 
        }, 5000); // Dissapear after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="mb-8 w-full max-w-md bg-lime-50 border border-lime-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <CheckCircle2 className="w-6 h-6 text-lime-600 shrink-0" />
            <div>
                <p className="font-semibold text-gray-900">{message}</p>
                {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
        </div>
    );
}
