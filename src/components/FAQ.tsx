import { Plus, Minus } from "lucide-react";

export function FAQ() {
    return (
        <section className="py-24 max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
                <span className="text-sm font-medium text-gray-500 border border-gray-200 px-3 py-1 rounded-full">
                    Support
                </span>
                <h2 className="mt-4 text-3xl font-semibold text-gray-900 tracking-tight">
                    Frequently asked questions
                </h2>
            </div>

            <div className="space-y-4">
                <details className="group bg-gray-50 rounded-2xl p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-colors hover:bg-gray-100">
                    <summary className="flex items-center justify-between text-lg font-medium text-gray-900">
                        Is my vehicle insured during pickup?
                        <span className="bg-white rounded-full p-1 border border-gray-200 ml-4">
                            <Plus className="w-4 h-4 text-gray-500 group-open:hidden" />
                            <Minus className="w-4 h-4 text-gray-500 hidden group-open:block" />
                        </span>
                    </summary>
                    <p className="mt-4 text-gray-500 leading-relaxed">
                        Yes, all our mechanic drivers are fully insured, and your vehicle is
                        covered by our comprehensive policy from pickup until return.
                    </p>
                </details>

                <details className="group bg-gray-50 rounded-2xl p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-colors hover:bg-gray-100">
                    <summary className="flex items-center justify-between text-lg font-medium text-gray-900">
                        How is the repair quote calculated?
                        <span className="bg-white rounded-full p-1 border border-gray-200 ml-4">
                            <Plus className="w-4 h-4 text-gray-500 group-open:hidden" />
                            <Minus className="w-4 h-4 text-gray-500 hidden group-open:block" />
                        </span>
                    </summary>
                    <p className="mt-4 text-gray-500 leading-relaxed">
                        Once the mechanic diagnoses the issue, a quote is updated in the
                        app. You can see a breakdown of spare parts and labor costs before
                        approving.
                    </p>
                </details>

                <details className="group bg-gray-50 rounded-2xl p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-colors hover:bg-gray-100">
                    <summary className="flex items-center justify-between text-lg font-medium text-gray-900">
                        Can I track the driver in real-time?
                        <span className="bg-white rounded-full p-1 border border-gray-200 ml-4">
                            <Plus className="w-4 h-4 text-gray-500 group-open:hidden" />
                            <Minus className="w-4 h-4 text-gray-500 hidden group-open:block" />
                        </span>
                    </summary>
                    <p className="mt-4 text-gray-500 leading-relaxed">
                        Absolutely. The app provides a live map view showing the driver's
                        location, ETA, and status updates (Arriving, Driving to Garage, In
                        Repair).
                    </p>
                </details>
            </div>
        </section>
    );
}
