'use client'

import { ChevronRight, ArrowLeft, CheckCircle, MoreHorizontal } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { submitRequest } from "./actions";

export function RequestForm({ servicePrices, needsPhone }: { servicePrices?: any[], needsPhone?: boolean }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [state, formAction, isPending] = useActionState(submitRequest, null)
    const formRef = useRef<HTMLFormElement>(null)

    // Helper to get price
    const getPrice = (key: string) => {
        const service = servicePrices?.find(p => p.key === key)
        return service ? Number(service.price) : 0
    }

    // Step 1: Details, Step 2: Add-ons
    const [step, setStep] = useState(1);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Form Local State
    const [formData, setFormData] = useState({
        pickupDate: '',
        pickupTime: ''
    });

    const handleNext = () => {
        // ... existing validation logic ...
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

    // Handle Auth Redirect
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
                {/* ... existing Step 1 content (unchanged) ... */}
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
                        <label className="text-sm font-medium text-gray-700">License Plate</label>
                        <input name="licensePlate" required type="text" placeholder="ABC-123-DE" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                    </div>
                </div>

                {needsPhone && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-lime-600 text-xs font-normal">(Required for contact)</span></label>
                        <input name="phone" required type="tel" placeholder="080 1234 5678" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                    </div>
                )}

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

            {/* Step 2: Add-ons & Confirmation (Updated Design) */}
            <div className={step === 2 ? 'block space-y-6 animate-in slide-in-from-right-8 duration-300' : 'hidden'}>
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to details
                </button>

                {/* Pickup & Repair Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">Pickup & Repair Management</h3>
                        <span className="font-bold text-gray-900 text-lg">₦{getPrice('pickup_return').toLocaleString()}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">Car pickup & repair to your location</p>
                    <p className="text-xs text-gray-400">* Charged after diagnosis approval</p>
                </div>



                {/* What's Included */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">What's Included:</h4>
                    <ul className="space-y-3">
                        {[
                            'Pickup & Delivery',
                            'Parts Sourcing (if needed!)',
                            'Mechanic Coordination',
                            'Repair Updates'
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-3 h-3 text-white fill-white" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Extra Services */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h4 className="font-bold text-gray-900">Add Extra Services</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Select any additional services you might require.</p>
                        </div>
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="p-4 space-y-3">
                        <label className="flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                            <div className="mt-1 mr-4">
                                <input name="isTowing" type="checkbox" className="w-5 h-5 text-lime-600 rounded focus:ring-lime-500 border-gray-300 transition-all" />
                            </div>
                            <div className="flex-1">
                                <span className="block font-bold text-gray-900 group-hover:text-lime-700 transition-colors">
                                    Towing Service (+₦{getPrice('towing_intracity').toLocaleString()})
                                </span>
                                <span className="text-xs text-gray-500">For vehicles that cannot move</span>
                            </div>
                        </label>

                        <label className="flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                            <div className="mt-1 mr-4">
                                <input name="isCarWash" type="checkbox" className="w-5 h-5 text-lime-600 rounded focus:ring-lime-500 border-gray-300 transition-all" />
                            </div>
                            <div className="flex-1">
                                <span className="block font-bold text-gray-900 group-hover:text-lime-700 transition-colors">
                                    Car Wash (+₦{getPrice('car_wash_premium').toLocaleString()})
                                </span>
                                <span className="text-xs text-gray-500">Sparkling clean return</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Overnight Storage Note */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Secure Overnight Storage</h4>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-xs line-through"></span>
                            <span className="font-bold text-gray-900">₦{getPrice('overnight_storage').toLocaleString()}/day</span>
                            <div className="w-2 h-2 rounded-full bg-red-500 mb-2 ml-1"></div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Only charged if your car needs to stay with us overnight. We'll inform you first.
                    </p>
                </div>

                {/* Confirm Button & Summary */}
                <div className="bg-lime-50/50 p-6 rounded-2xl border border-lime-100/50 mt-6">
                    <h4 className="font-bold text-gray-900 mb-1 text-sm">Order Summary</h4>
                    <p className="text-xs text-gray-600 mb-0.5">Mechanic Driver Request initiated.</p>
                    <p className="text-[10px] text-gray-400">Note: Final repair costs depends on diagnostics.</p>
                </div>

                {state?.error && state.error !== 'unauthenticated' && (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                        <p className="text-sm text-red-600">Error: {state.error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[#111827] hover:bg-black text-white py-4 rounded-xl text-lg font-bold shadow-xl shadow-gray-200/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                    {isPending ? 'Processing...' : 'Confirm Order'} <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </form >
    )
}
