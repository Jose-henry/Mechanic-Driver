"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function MobileStickyCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past the main hero button (approx 500px)
            const show = window.scrollY > 500;
            setIsVisible(show);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-white border-t border-gray-200 md:hidden animate-in slide-in-from-bottom duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
            <Link
                href="/request"
                className="block w-full bg-gray-900 text-white text-center py-3.5 rounded-xl font-bold text-lg shadow-lg"
            >
                Book Pickup
            </Link>
        </div>
    );
}
