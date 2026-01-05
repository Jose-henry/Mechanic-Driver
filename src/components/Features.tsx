import { CreditCard, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Features() {
    return (
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-12 gap-6">
                {/* Large Card: Tracking */}
                <div className="md:col-span-7 bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 border border-gray-700 bg-gray-800/50 backdrop-blur rounded-full px-3 py-1 mb-6">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-300">
                                Live GPS
                            </span>
                        </div>
                        <h3 className="text-3xl font-semibold tracking-tight mb-4">
                            Real-time tracking for peace of mind.
                        </h3>
                        <p className="text-gray-400 text-lg max-w-md">
                            Know exactly where your car is. From pickup to the garage, and back
                            to you.
                        </p>

                        <div className="mt-8 flex gap-4">
                            <div className="bg-gray-800/80 p-4 rounded-2xl border border-gray-700 backdrop-blur w-64">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-400">Current Status</span>
                                    <span className="text-xs text-green-400 font-medium">
                                        Active
                                    </span>
                                </div>
                                <div className="text-sm font-medium mb-1">
                                    Heading to Garage
                                </div>
                                <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2">
                                    <div className="bg-lime-400 h-1.5 rounded-full w-2/3"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Abstract Visual */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-no-repeat bg-center mix-blend-overlay"></div>
                </div>

                {/* Small Card: Secure Payment */}
                <div className="md:col-span-5 bg-lime-300 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center mb-6">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">
                            Transparent Pricing.
                        </h3>
                        <p className="text-gray-800 text-lg">
                            Pay securely via the app. Cash (Gsh) and card options available.
                        </p>
                    </div>

                    <div className="mt-8 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50">
                        <div className="flex justify-between items-center border-b border-gray-900/10 pb-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                                Total Repair
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                                ₦124,500
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-6 w-10 bg-gray-900 rounded text-white flex items-center justify-center text-[10px]">
                                VISA
                            </div>
                            <div className="h-6 w-10 bg-gray-100 rounded text-gray-600 flex items-center justify-center text-[10px]">
                                Gsh
                            </div>
                        </div>
                    </div>
                </div>

                {/* Small Card: Verified Drivers */}
                <div className="md:col-span-4 bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 flex flex-col justify-between overflow-hidden relative">
                    {/* Image background for card */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/mechanic.png"
                            alt="Mechanic servicing car"
                            className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/90 to-transparent"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="mb-6">
                            <ShieldCheck className="w-8 h-8 text-lime-600" />
                        </div>
                        <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-3">
                            Vetted Mechanics
                        </h3>
                        <p className="text-gray-500 text-lg mb-6">
                            Every mechanic driver is verified with background checks and skill
                            assessments.
                        </p>
                    </div>

                    <div className="flex -space-x-2 relative z-10">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Driver1"
                            className="w-10 h-10 rounded-full border-2 border-white"
                            alt="Driver 1"
                        />
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Driver2"
                            className="w-10 h-10 rounded-full border-2 border-white"
                            alt="Driver 2"
                        />
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            +50
                        </div>
                    </div>
                </div>

                {/* Medium Card: Issue Reporting */}
                <div className="md:col-span-8 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-3">
                            Report Issues Instantly
                        </h3>
                        <p className="text-gray-500 text-lg mb-6">
                            Describe the problem or select from common issues like "Shaking",
                            "Noise", or "Fire".
                        </p>
                        <Link href="/request" className="text-lime-700 font-medium flex items-center gap-2 hover:gap-3 transition-all cursor-pointer">
                            View Reporting Flow <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="w-full md:w-64 bg-gray-50 rounded-2xl p-4 border border-gray-100 transform rotate-2">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                <span className="text-sm font-medium">Brake noise</span>
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="accent-lime-500 w-4 h-4"
                                />
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                <span className="text-sm font-medium">Engine heating</span>
                                <input type="checkbox" className="accent-lime-500 w-4 h-4" />
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                <span className="text-sm font-medium">Oil leak</span>
                                <input type="checkbox" className="accent-lime-500 w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
