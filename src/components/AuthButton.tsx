"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'google' | 'secondary';
}

export function AuthButton({ children, variant = 'primary', className, ...props }: AuthButtonProps) {
    const { pending } = useFormStatus();

    const variants = {
        primary: "w-full bg-gray-900 text-white py-4 rounded-xl text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed",
        google: "w-full bg-white text-gray-700 py-3.5 rounded-xl text-base font-medium border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
        secondary: "w-full bg-gray-100 text-gray-900 py-4 rounded-xl text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    };

    return (
        <button
            {...props}
            disabled={pending || props.disabled}
            className={cn(variants[variant], "relative", className)}
            onClick={(e) => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(50); // Light vibration
                }
                props.onClick?.(e);
            }}
        >
            {pending && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-current" />
                </div>
            )}
            <div className={cn(
                "flex items-center justify-center gap-3",
                pending && "invisible opacity-0"
            )}>
                {children}
            </div>
        </button>
    );
}
