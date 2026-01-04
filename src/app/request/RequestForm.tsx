'use client'

import { ChevronRight, ArrowLeft } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { submitRequest } from "./actions";

export function RequestForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [state, formAction, isPending] = useActionState(submitRequest, null)
    const formRef = useRef<HTMLFormElement>(null)

    // Step 1: Details, Step 2: Add-ons
    const [step, setStep] = useState(1);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Form Local State for validation before submission
    const [formData, setFormData] = useState({
        pickupDate: '',
        pickupTime: ''
    });

    const handleNext = () => {
        setValidationError(null);

        // Validate Inputs exist (Basics)
        const form = formRef.current;
        if (!form?.checkValidity()) {
            form?.reportValidity();
            return;
        }

        // 30-Minute Rule Validation
        const pickupDate = form['pickupDate'].value;
        const pickupTime = form['pickupTime'].value;

        if (pickupDate && pickupTime) {
            const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
            const now = new Date();
            const minTime = new Date(now.getTime() + 30 * 60000); // Now + 30 mins

            if (pickupDateTime < minTime) {
                setValidationError("Pickup time must be at least 30 minutes from now.");
                return;
            }
        }

        // Description Length Validation
        const description = form['description'].value;
        if (description.length < 10) {
            setValidationError("Please provide more detail about the issue (at least 10 characters).");
            return;
        }

        setStep(2);
    };

    // Handle Auth Redirect if Unauthenticated
    useEffect(() => {
        if (state?.error === 'unauthenticated' && state.formData) {
            localStorage.setItem('pendingRequest', JSON.stringify(state.formData))
            router.push('/signin?returnTo=/tracking')
        }
    }, [state, router])

    return (
        <form
            ref={formRef}
            action={formAction}
            className="space-y-6"
        >
            {/* Step 1: Vehicle & Issue Details */}
            <div className={step === 1 ? 'block space-y-6' : 'hidden'}>
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

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Year</label>
                        <input name="year" required type="number" placeholder="2015" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">License Plate (Optional)</label>
                        <input name="licensePlate" type="text" placeholder="ABC-123-DE" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Service Type</label>
                    <input name="serviceType" required type="text" placeholder="e.g. Oil Change, Diagnostics, Brake Repair" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
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
                    <label className="text-sm font-medium text-gray-700">Pickup Location</label>
                    <input name="pickupLocation" required type="text" placeholder="123 Main St, Lagos" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description of Issue</label>
                    <textarea name="description" required rows={4} placeholder="Describe what's wrong (e.g. Engine making noise, Brakes skipping)" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 resize-none"></textarea>
                </div>

                {validationError && (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-red-600 text-sm">
                        {validationError}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl text-lg font-medium shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    Confirm Pickup <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Step 2: Add-ons & Confirmation */}
            <div className={step === 2 ? 'block space-y-8 animate-in slide-in-from-right-8 duration-300' : 'hidden'}>
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to details
                </button>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Add Extra Services?</h3>
                    <p className="text-gray-500 text-sm">Select any additional services you might require.</p>

                    <div className="grid gap-4">
                        <label className="flex items-center p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-lime-400 hover:bg-lime-50 transition-all">
                            <input name="isTowing" type="checkbox" className="w-5 h-5 text-lime-600 rounded focus:ring-lime-500 border-gray-300 mr-4" />
                            <div className="flex-1">
                                <span className="block font-medium text-gray-900">Towing Service (+₦20,000)</span>
                                <span className="text-xs text-gray-500">For vehicles that cannot move</span>
                            </div>
                        </label>

                        <label className="flex items-center p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-lime-400 hover:bg-lime-50 transition-all">
                            <input name="isCarWash" type="checkbox" className="w-5 h-5 text-lime-600 rounded focus:ring-lime-500 border-gray-300 mr-4" />
                            <div className="flex-1">
                                <span className="block font-medium text-gray-900">Car Wash (+₦1,500)</span>
                                <span className="text-xs text-gray-500">Sparkling clean return</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="bg-lime-50 p-6 rounded-2xl border border-lime-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
                    <p className="text-sm text-gray-600 mb-1">Mechanic Driver Request initiated.</p>
                    <p className="text-xs text-gray-500">Note: Final repair costs depends on diagnostics.</p>
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
            </div>
        </form >
    )
}
