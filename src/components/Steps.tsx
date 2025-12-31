import { Smartphone, UserCheck, MapPin, FileText } from "lucide-react";

export function Steps() {
    return (
        <section id="how-it-works" className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-sm font-medium text-lime-600 bg-lime-100 px-3 py-1 rounded-full border border-lime-200">
                        Workflow
                    </span>
                    <h2 className="mt-4 text-4xl font-semibold text-gray-900 tracking-tight">
                        From your driveway to the shop.
                    </h2>
                    <p className="mt-4 text-xl text-gray-500">
                        We handle the logistics so you can focus on your day. Transparent
                        quoting and real-time updates at every step.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {/* Step 1 */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-lime-100 rounded-2xl flex items-center justify-center mb-6 text-lime-700">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            1. Request
                        </h3>
                        <p className="text-gray-500 leading-relaxed">
                            Book a service request through the app. Input vehicle
                            details and issues.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-lime-100 rounded-2xl flex items-center justify-center mb-6 text-lime-700">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            2. Assignment
                        </h3>
                        <p className="text-gray-500 leading-relaxed">
                            A vetted mechanic driver is assigned instantly. View their profile, rating,
                            and ETA.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-lime-100 rounded-2xl flex items-center justify-center mb-6 text-lime-700">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            3. Pickup
                        </h3>
                        <p className="text-gray-500 leading-relaxed">
                            The driver picks up your car. Track the location live as it moves to
                            the mechanic.
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-lime-100 rounded-2xl flex items-center justify-center mb-6 text-lime-700">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            4. Quote & Fix
                        </h3>
                        <p className="text-gray-500 leading-relaxed">
                            Approve repair quotes digitally. Manage spare parts prices and
                            authorize work.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
