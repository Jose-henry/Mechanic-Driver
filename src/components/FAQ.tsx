import { Plus, Minus } from "lucide-react";

export function FAQ() {
    return (
        <section className="py-24 max-w-3xl mx-auto px-6">
            <div className="text-center mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both">
                <span className="text-sm font-medium text-gray-500 border border-gray-200 px-3 py-1 rounded-full">
                    Support
                </span>
                <h2 className="mt-4 text-3xl font-semibold text-gray-900 tracking-tight">
                    Frequently asked questions
                </h2>
            </div>

            <div className="space-y-4">
                <details className="group bg-gray-50 rounded-2xl p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-colors hover:bg-gray-100 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100 fill-mode-both">
                    <summary className="flex items-center justify-between text-lg font-medium text-gray-900 leading-snug">
                        What if I decline the quote?
                        <span className="bg-white rounded-full p-1 border border-gray-200 ml-4 shrink-0 transition-transform group-open:rotate-180">
                            <Plus className="w-4 h-4 text-gray-500 group-open:hidden" />
                            <Minus className="w-4 h-4 text-gray-500 hidden group-open:block" />
                        </span>
                    </summary>
                    <p className="mt-4 text-gray-500 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                        You only pay the ₦6,000 Pickup & Return fee. We’ll bring your car back to you immediately.
                    </p>
                </details>

                <details className="group bg-gray-50 rounded-2xl p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-colors hover:bg-gray-100 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 fill-mode-both">
                    <summary className="flex items-center justify-between text-lg font-medium text-gray-900 leading-snug">
                        Is my car insured during pickup?
                        <span className="bg-white rounded-full p-1 border border-gray-200 ml-4 shrink-0 transition-transform group-open:rotate-180">
                            <Plus className="w-4 h-4 text-gray-500 group-open:hidden" />
                            <Minus className="w-4 h-4 text-gray-500 hidden group-open:block" />
                        </span>
                    </summary>
                    <p className="mt-4 text-gray-500 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                        Yes, all our mechanic drivers are fully insured for third-party liability and damage during transit. Your vehicle is safe with us.
                    </p>
                </details>

                <details className="group bg-gray-50 rounded-2xl p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-colors hover:bg-gray-100 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-both">
                    <summary className="flex items-center justify-between text-lg font-medium text-gray-900 leading-snug">
                        How long do repairs take?
                        <span className="bg-white rounded-full p-1 border border-gray-200 ml-4 shrink-0 transition-transform group-open:rotate-180">
                            <Plus className="w-4 h-4 text-gray-500 group-open:hidden" />
                            <Minus className="w-4 h-4 text-gray-500 hidden group-open:block" />
                        </span>
                    </summary>
                    <p className="mt-4 text-gray-500 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                        It depends on the issue. We give you an estimated timeline along with the diagnostic quote. Simple repairs are often done same-day.
                    </p>
                </details>

                <details className="group bg-gray-50 rounded-2xl p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-colors hover:bg-gray-100 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-400 fill-mode-both">
                    <summary className="flex items-center justify-between text-lg font-medium text-gray-900 leading-snug">
                        What areas do you cover?
                        <span className="bg-white rounded-full p-1 border border-gray-200 ml-4 shrink-0 transition-transform group-open:rotate-180">
                            <Plus className="w-4 h-4 text-gray-500 group-open:hidden" />
                            <Minus className="w-4 h-4 text-gray-500 hidden group-open:block" />
                        </span>
                    </summary>
                    <p className="mt-4 text-gray-500 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                        We currently serve Benin City (City Center). Expansion to Lagos and Abuja is in progress.
                    </p>
                </details>
            </div>
        </section>
    );
}
