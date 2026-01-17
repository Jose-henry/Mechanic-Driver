import { Car, Wrench, CheckCircle, ShieldCheck } from "lucide-react";

export function Steps() {
    return (
        <section id="how-it-works" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-sm font-bold text-lime-600 tracking-wide uppercase">
                        How It Works
                    </span>
                    <h2 className="mt-3 text-4xl font-semibold text-gray-900 tracking-tight">
                        What is a Mechanic Driver?
                    </h2>
                    <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                        A Mechanic Driver is a <span className="font-semibold text-gray-900">trained professional</span> who safely drives your car to a trusted workshop, manages the repair process, and returns the car to you.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-lime-400 group-hover:scale-110 transition-transform duration-500">01</div>
                        <div className="w-14 h-14 bg-lime-100 rounded-2xl flex items-center justify-center mb-6 text-lime-700 group-hover:bg-lime-400 group-hover:text-gray-900 transition-colors duration-300">
                            <Car className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            We Pickup Your Car
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            A verified mechanic driver arrives at your location (home or office) to pick up your vehicle safely.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-lime-400 group-hover:scale-110 transition-transform duration-500">02</div>
                        <div className="w-14 h-14 bg-lime-100 rounded-2xl flex items-center justify-center mb-6 text-lime-700 group-hover:bg-lime-400 group-hover:text-gray-900 transition-colors duration-300">
                            <Wrench className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Repair Coordination
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            We take it to a trusted workshop for diagnosis. <span className="font-semibold text-gray-900">You must approve the quote</span> before any repair work starts.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-lime-400 group-hover:scale-110 transition-transform duration-500">03</div>
                        <div className="w-14 h-14 bg-lime-100 rounded-2xl flex items-center justify-center mb-6 text-lime-700 group-hover:bg-lime-400 group-hover:text-gray-900 transition-colors duration-300">
                            <CheckCircle className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Safe Return
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            After repairs are completed and tested, we drive your car back to you. You verify everything is working perfectly.
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center bg-white p-6 rounded-2xl border border-dashed border-gray-300 inline-flex flex-col items-center mx-auto w-full md:w-auto">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold mb-1">
                        <ShieldCheck className="w-5 h-5 text-lime-600" />
                        <span>You are in control</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        You approve or decline repairs before work starts. No surprises.
                    </p>
                </div>
            </div>
        </section>
    );
}
