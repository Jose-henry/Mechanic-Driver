import { Check, Info } from "lucide-react";

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-gray-50 border-y border-gray-200">
            <div className="text-center mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both">
                <span className="text-sm font-bold text-lime-600 tracking-wide uppercase bg-lime-50 px-3 py-1 rounded-full border border-lime-100">
                    Transparent Pricing
                </span>
                <h2 className="mt-4 text-4xl font-semibold text-gray-900 tracking-tight">
                    No Hidden Charges. Ever.
                </h2>
                <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                    Know exactly what you're paying for. We believe in complete transparency.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Service Fees */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-200 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both hover:shadow-lg transition-shadow">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.38 0 2.22-.84 2.22-1.85 0-1.21-1.07-1.66-2.51-2.07l-.27-.08c-2-.59-4.14-1.21-4.14-3.61 0-2.3 1.84-3.59 3.48-3.9V3h2.67v1.93c1.71.36 3.15 1.46 3.27 3.4h-1.96c-.1-1.05-1.18-1.91-2.53-1.91-1.38 0-2.22.84-2.22 1.85 0 1.21 1.07 1.66 2.51 2.07l.27.08c2 .59 4.14 1.21 4.14 3.61 0 2.3-1.84 3.59-3.48 3.9z" />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Service Fees</h3>
                    <p className="text-gray-500 mb-8 border-b border-gray-100 pb-8">
                        Fixed costs for our premium convenience services.
                    </p>

                    <div className="space-y-6">
                        <div className="flex justify-between items-start group">
                            <div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-lime-600 transition-colors">Pickup & Return (City Center)</h4>
                                <p className="text-sm text-gray-400 mt-1">We pick up and return your car.</p>
                            </div>
                            <div className="text-xl font-bold text-gray-900">₦6,000</div>
                        </div>

                        <div className="flex justify-between items-start group">
                            <div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-lime-600 transition-colors">Managed Repair Service</h4>
                                <p className="text-sm text-gray-400 mt-1">Diagnosis coordination & oversight.</p>
                            </div>
                            <div className="text-xl font-bold text-gray-900">₦6,000</div>
                        </div>

                        <div className="flex justify-between items-start opacity-75 group">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-700 group-hover:text-lime-600 transition-colors">Secure Overnight Storage</h4>
                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">If needed</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">Safe facility fee per night.</p>
                            </div>
                            <div className="text-lg font-semibold text-gray-600">₦3,000<span className="text-sm font-normal text-gray-400">/night</span></div>
                        </div>
                    </div>
                </div>

                {/* Repair Costs */}
                <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both hover:shadow-xl transition-shadow">
                    {/* Abstract background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500 rounded-full blur-[100px] opacity-10 -mr-16 -mt-16 animate-pulse duration-[4000ms]"></div>

                    <h3 className="text-2xl font-bold text-white mb-2">Repair Costs</h3>
                    <p className="text-gray-400 mb-8 border-b border-gray-800 pb-8">
                        Variable costs based on your car's specific needs.
                    </p>

                    <div className="space-y-8">
                        <div className="relative z-10">
                            <div className="flex justify-between items-baseline mb-2">
                                <h4 className="font-semibold text-xl text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                                    Spare Parts
                                </h4>
                                <span className="text-lime-400 font-bold bg-lime-400/10 px-3 py-1 rounded-full text-sm">At Cost</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                You pay exactly the market price. We share the receipt with you directly. No markup added.
                            </p>
                        </div>

                        <div className="relative z-10 transition-transform hover:translate-x-1 duration-300">
                            <div className="flex justify-between items-baseline mb-2">
                                <h4 className="font-semibold text-xl text-white">Mechanic Labour</h4>
                                <span className="text-gray-400 text-sm">per Job</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                The mechanic charges for their work. We negotiate fair market rates for you.
                            </p>
                            <div className="bg-gray-800 rounded-xl p-3 flex items-start gap-3 border border-gray-700">
                                <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-300">
                                    Quoted after diagnosis. You must approve this cost before work begins.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-800 flex items-center gap-3 text-sm text-gray-400">
                        <div className="p-1 rounded-full bg-lime-400/10 text-lime-400">
                            <Check className="w-4 h-4" />
                        </div>
                        No hidden charges. No repairs without your approval.
                    </div>
                </div>
            </div>
        </section>
    );
}
