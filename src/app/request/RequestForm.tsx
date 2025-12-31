'use client'

import { ChevronRight } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { submitRequest } from "./actions";

export function RequestForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [state, formAction, isPending] = useActionState(submitRequest, null)
    const formRef = useRef<HTMLFormElement>(null)

    // Handle Auth Redirect if Unauthenticated
    useEffect(() => {
        if (state?.error === 'unauthenticated' && state.formData) {
            // Save form data to localStorage
            localStorage.setItem('pendingRequest', JSON.stringify(state.formData))
            // Redirect to login with returnTo tracking ensures we land there after login
            router.push('/signin?returnTo=/tracking')
        }
    }, [state, router])

    return (
        <form
            ref={formRef}
            action={formAction}
            className="space-y-6"
        >
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Car Brand</label>
                    <select name="brand" required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300">
                        <option value="">Select Brand</option>
                        <option value="Toyota">Toyota</option>
                        <option value="Honda">Honda</option>
                        <option value="Mercedes-Benz">Mercedes-Benz</option>
                        <option value="Ford">Ford</option>
                        <option value="Lexus">Lexus</option>
                        <option value="Hyundai">Hyundai</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Car Model</label>
                    <input name="model" required type="text" placeholder="e.g. Camry, Corolla" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Year</label>
                    <input name="year" required type="number" placeholder="2015" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">License Plate (Optional)</label>
                    <input name="licensePlate" type="text" placeholder="ABC-123-DE" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pickup Date</label>
                    <input name="pickupDate" required type="date" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pickup Time</label>
                    <input name="pickupTime" required type="time" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description of Issue</label>
                <textarea name="description" required rows={4} placeholder="Describe what's wrong (e.g. Engine making noise, Brakes skipping)" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300"></textarea>
            </div>

            {state?.error && state.error !== 'unauthenticated' && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                    <p className="text-sm text-red-600">Error: {state.error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl text-lg font-medium shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isPending ? 'Processing...' : 'Confirm Order'} <ChevronRight className="w-5 h-5" />
            </button>
        </form>
    )
}
