'use client'

import { ChevronRight, ArrowLeft, CheckCircle, MoreHorizontal, Car, Calendar, MapPin, FileText, Smartphone, PenTool, Check } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { submitRequest } from "./actions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function RequestForm({ servicePrices, needsPhone }: { servicePrices?: any[], needsPhone?: boolean }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [state, formAction, isPending] = useActionState(submitRequest, null)
    const formRef = useRef<HTMLFormElement>(null)
    const [startTime, setStartTime] = useState<Date | null>(null);

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
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle Auth Redirect
    useEffect(() => {
        if (state?.error === 'unauthenticated' && state.formData) {
            localStorage.setItem('pendingRequest', JSON.stringify(state.formData))
            router.push('/signin?returnTo=/tracking')
        }
    }, [state, router])

    // Calculate minTime
    const getMinTime = () => {
        const now = new Date();
        const min = new Date();
        min.setHours(8, 0, 0, 0);

        // Check if selected date is today
        const todayStr = now.toLocaleDateString('en-CA');
        if (formData.pickupDate === todayStr) {
            // If now is later than 8am, use now.
            if (now > min) return now;
        }
        return min;
    };

    return (
        <form
            ref={formRef}
            action={formAction}
            className="space-y-8"
        >
            {/* Progress Stepper */}
            <div className="flex items-center justify-between mb-8 px-2 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 rounded-full"></div>
                <div className={`flex flex-col items-center gap-2 relative z-10 transition-all duration-300 ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${step >= 1 ? 'bg-lime-400 border-white shadow-lg scale-110' : 'bg-gray-100 border-white'}`}>
                        <Car className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider bg-white px-2">Vehicle</span>
                </div>
                <div className={`flex flex-col items-center gap-2 relative z-10 transition-all duration-300 ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${step >= 2 ? 'bg-lime-400 border-white shadow-lg scale-110' : 'bg-gray-100 border-white'}`}>
                        <Check className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider bg-white px-2">Review</span>
                </div>
            </div>

            {/* Step 1: Vehicle & Issue Details */}
            <div className={step === 1 ? 'block space-y-8 animate-in slide-in-from-left-8 fade-in duration-500 fill-mode-both' : 'hidden'}>

                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Car className="w-4 h-4 text-lime-600" /> Car Brand
                            </label>
                            <select name="brand" required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all group-hover:bg-white group-hover:shadow-sm">
                                <option value="">Select Brand</option>
                                <option value="Toyota">Toyota</option>
                                <option value="Honda">Honda</option>
                                <option value="Mercedes-Benz">Mercedes-Benz</option>
                                <option value="Ford">Ford</option>
                                <option value="Lexus">Lexus</option>
                                <option value="Hyundai">Hyundai</option>
                                <option value="Nissan">Nissan</option>
                                <option value="Kia">Kia</option>
                                <option value="BMW">BMW</option>
                                <option value="Volkswagen">Volkswagen</option>
                                <option value="Range Rover">Range Rover</option>
                                <option value="Peugeot">Peugeot</option>
                                <option value="Mitsubishi">Mitsubishi</option>
                                <option value="Suzuki">Suzuki</option>
                                <option value="Mazda">Mazda</option>
                                <option value="Chevrolet">Chevrolet</option>
                                <option value="Jeep">Jeep</option>
                                <option value="Audi">Audi</option>
                                <option value="Land Rover">Land Rover</option>
                                <option value="Subaru">Subaru</option>
                                <option value="Volvo">Volvo</option>
                                <option value="Infiniti">Infiniti</option>
                                <option value="Acura">Acura</option>
                                <option value="Pontiac">Pontiac</option>
                            </select>
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-sm font-semibold text-gray-700">Car Model</label>
                            <input name="model" required type="text" placeholder="e.g. Camry, Corolla" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all group-hover:bg-white group-hover:shadow-sm placeholder:text-gray-400" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2 group">
                            <label className="text-sm font-semibold text-gray-700">Year</label>
                            <input name="year" required type="number" placeholder="2015" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all group-hover:bg-white group-hover:shadow-sm placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-2 md:col-span-2 group">
                            <label className="text-sm font-semibold text-gray-700">License Plate</label>
                            <input name="licensePlate" required type="text" placeholder="ABC-123-DE" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all group-hover:bg-white group-hover:shadow-sm placeholder:text-gray-400" />
                        </div>
                    </div>

                    {needsPhone && (
                        <div className="space-y-2 group animate-in slide-in-from-top-4 fade-in duration-500">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-lime-600" /> Phone Number <span className="text-lime-600 text-xs font-normal bg-lime-50 px-2 py-0.5 rounded-full border border-lime-100">Required</span>
                            </label>
                            <input name="phone" required type="tel" placeholder="080 1234 5678" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all group-hover:bg-white group-hover:shadow-sm placeholder:text-gray-400" />
                        </div>
                    )}

                    <div className="space-y-2 group">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <PenTool className="w-4 h-4 text-lime-600" /> Service Type
                        </label>
                        <input name="serviceType" required type="text" placeholder="e.g. Oil Change, Diagnostics, Brake Repair" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all group-hover:bg-white group-hover:shadow-sm placeholder:text-gray-400" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-lime-600" /> Pickup Date
                            </label>
                            <input
                                name="pickupDate"
                                required
                                type="date"
                                value={formData.pickupDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all group-hover:bg-white group-hover:shadow-sm text-gray-600"
                            />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-sm font-semibold text-gray-700">Pickup Time</label>
                            <DatePicker
                                selected={startTime}
                                onChange={(date: Date | null) => {
                                    setStartTime(date);
                                    if (date) {
                                        const hours = date.getHours().toString().padStart(2, '0');
                                        const minutes = date.getMinutes().toString().padStart(2, '0');
                                        setFormData(prev => ({ ...prev, pickupTime: `${hours}:${minutes}` }));
                                    } else {
                                        setFormData(prev => ({ ...prev, pickupTime: '' }));
                                    }
                                }}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={30}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                minTime={getMinTime()}
                                maxTime={new Date(new Date().setHours(13, 0, 0, 0))}
                                placeholderText="Select Pickup Time (8am - 1pm)"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all group-hover:bg-white group-hover:shadow-sm text-gray-600"
                                required
                            />
                            <input type="hidden" name="pickupTime" value={formData.pickupTime} />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-lime-600" />  Pickup Location
                        </label>
                        <input name="pickupLocation" required type="text" placeholder="123 Main St, Lagos" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all group-hover:bg-white group-hover:shadow-sm placeholder:text-gray-400" />
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-lime-600" /> Detail the Issue
                        </label>
                        <textarea name="description" required rows={4} placeholder="Describe what's wrong (e.g. Engine making noise, Brakes skipping). The more details, the better we can prepare." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all group-hover:bg-white group-hover:shadow-sm resize-none placeholder:text-gray-400"></textarea>
                    </div>
                </div>

                {validationError && (
                    <div className="rounded-2xl bg-red-50 p-4 border border-red-100 text-red-600 text-sm flex items-start gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                        {validationError}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-2xl text-lg font-bold shadow-xl shadow-gray-200/50 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] group mt-4"
                >
                    Continue <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Step 2: Add-ons & Confirmation */}
            <div className={step === 2 ? 'block space-y-8 animate-in slide-in-from-right-8 fade-in duration-500 fill-mode-both' : 'hidden'}>
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2 transition-colors px-1"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to details
                </button>

                {/* Pickup & Repair Card */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_5px_30px_-5px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-[0_8px_40px_-5px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lime-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Pickup - Return & Management</h3>
                                <p className="text-gray-500 text-sm mt-1">Full service logistics and oversight</p>
                            </div>
                            <span className="font-bold text-gray-900 text-xl bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">₦{getPrice('pickup_return').toLocaleString()}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                            <span>* Charged only after you approve the diagnostic quote</span>
                        </div>
                    </div>
                </div>

                {/* What's Included */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200/50">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 text-xs font-bold text-gray-500">i</span>
                        What's Included:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            'Doorstep Pickup',
                            'Professional Diagnostics',
                            'Parts Sourcing (At Cost)',
                            'Real-time Repair Updates',
                            'Mechanic Coordination',
                            'Safe Return Delivery'
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100/50 shadow-sm">
                                <div className="w-5 h-5 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-3 h-3 text-lime-600 fill-lime-600/10" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </div>
                </div>

                {/* Extra Services card */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h4 className="font-bold text-gray-900">Add Extra Services</h4>
                            <p className="text-xs text-gray-500 mt-1">Optional additions for your convenience.</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <label className="flex items-center p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer group">
                            <input name="isTowing" type="checkbox" className="w-6 h-6 text-lime-600 rounded-lg focus:ring-lime-500 border-gray-300 transition-all mr-4 cursor-pointer" />
                            <div className="flex-1">
                                <span className="block font-bold text-gray-900 group-hover:text-lime-700 transition-colors">
                                    Towing Service
                                </span>
                                <span className="text-xs text-gray-500">For non-moving vehicles</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">+₦{getPrice('towing_intracity').toLocaleString()}</span>
                        </label>

                        <div className="h-px bg-gray-100 mx-4"></div>

                        <label className="flex items-center p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer group">
                            <input name="isCarWash" type="checkbox" className="w-6 h-6 text-lime-600 rounded-lg focus:ring-lime-500 border-gray-300 transition-all mr-4 cursor-pointer" />
                            <div className="flex-1">
                                <span className="block font-bold text-gray-900 group-hover:text-lime-700 transition-colors">
                                    Premium Car Wash
                                </span>
                                <span className="text-xs text-gray-500">Sparkling clean return</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">+₦{getPrice('car_wash_premium').toLocaleString()}</span>
                        </label>
                    </div>
                </div>

                {/* Overnight Storage Note */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Secure Overnight Storage</h4>
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-900">₦{getPrice('overnight_storage').toLocaleString()}/day</span>
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider ml-2">If needed</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Only charged if your car needs to stay with us overnight due to repair timelines. We'll always inform you first.
                    </p>
                </div>

                {/* Confirm Button */}
                <div className="pt-4">
                    {state?.error && state.error !== 'unauthenticated' && (
                        <div className="rounded-2xl bg-red-50 p-4 border border-red-100 mb-6 animate-in shake">
                            <p className="text-sm text-red-600 font-medium text-center">Error: {state.error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#111827] hover:bg-black text-white py-5 rounded-2xl text-lg font-bold shadow-xl shadow-gray-200/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {isPending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Confirm Request <ChevronRight className="w-5 h-5" /></>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        By confirming, you agree to our Terms of Service.
                    </p>
                </div>
            </div>
        </form >
    )
}
