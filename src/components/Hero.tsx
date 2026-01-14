import { ArrowUpRight, Apple, CheckCircle, ChevronLeft, MoreHorizontal, Car } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative">
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <Image
                    src="/hero-bg.png"
                    alt="Car background"
                    fill
                    className="object-cover object-bottom"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FDFDFD] via-[#FDFDFD]/80 to-transparent"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* Hero Text */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                        </span>
                        <span className="text-xs font-medium text-gray-600 tracking-wide uppercase">
                            Live in Benin, Abuja & Lagos
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-semibold text-gray-900 tracking-tight leading-[1.1]">
                        Effortless car repair,
                        <br />
                        <span className="text-gray-400">from your doorstep.</span>
                    </h1>

                    <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
                        On-demand mechanic drivers pick up your vehicle, handle the repairs,
                        and bring it back. Track everything in real-time.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link
                            href="/request"
                            className="bg-lime-300 hover:bg-lime-400 text-gray-900 px-8 py-4 rounded-full text-lg font-medium transition-all transform hover:-translate-y-1 flex items-center gap-2 cursor-pointer"
                        >
                            Get Started <ArrowUpRight className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-3">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                                className="w-10 h-10 rounded-full border-2 border-white bg-gray-100"
                                alt=""
                            />
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
                                className="w-10 h-10 rounded-full border-2 border-white bg-gray-100"
                                alt=""
                            />
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                                className="w-10 h-10 rounded-full border-2 border-white bg-gray-100"
                                alt=""
                            />
                        </div>
                        <div className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">4.9/5</span> rating
                            from 2k+ users
                        </div>
                    </div>
                </div>

                {/* Hero Visual / Mockup */}
                <div className="relative">
                    {/* Decorative background blob */}
                    <div className="absolute inset-0 bg-lime-300 rounded-[3rem] transform rotate-1 translate-x-4 translate-y-4 -z-10"></div>

                    {/* Main Container */}
                    <div className="bg-gray-50 rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-2xl relative overflow-hidden">
                        {/* Floating Badge */}
                        <div className="absolute top-8 left-8 bg-white p-4 rounded-2xl shadow-lg z-20 max-w-[200px] border border-gray-50 animate-bounce duration-[3000ms]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-green-100 p-2 rounded-full text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-semibold text-gray-900">
                                    Mechanic Driver Assigned
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Driver1"
                                    className="w-8 h-8 rounded-full bg-gray-200"
                                    alt="Driver"
                                />
                                <div>
                                    <p className="text-xs font-semibold text-gray-900">Mike R.</p>
                                    <p className="text-[10px] text-gray-500">Arriving in 15mn</p>
                                </div>
                            </div>
                        </div>

                        {/* Phone Mockup */}
                        <div className="mx-auto w-[300px] bg-white rounded-[2.5rem] border-[8px] border-gray-900 shadow-xl overflow-hidden relative z-10 h-[600px]">
                            {/* Dynamic Island */}
                            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-xl w-32 mx-auto z-20"></div>

                            {/* App Header */}
                            <div className="pt-10 px-6 pb-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-6">
                                    <ChevronLeft className="w-6 h-6 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-900">
                                        Request Details
                                    </span>
                                    <MoreHorizontal className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                                    Tell us about
                                    <br />
                                    your vehicle
                                </h3>
                            </div>

                            {/* App Form */}
                            <div className="px-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 ml-1">
                                        Vehicle
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Toyota Camry
                                            </p>
                                            <p className="text-xs text-gray-500">2008 Model</p>
                                        </div>
                                        <Car className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500 ml-1">
                                            Date
                                        </label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">
                                                Wed, 20-05
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500 ml-1">
                                            Time
                                        </label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">
                                                01:00 pm
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 ml-1">
                                        Issues
                                    </label>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100">
                                            Shaking
                                        </span>
                                        <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-200">
                                            + Add issue
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Action */}
                            <div className="absolute bottom-0 inset-x-0 p-6 bg-white border-t border-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs text-gray-500">Est. Price</span>
                                    <span className="text-lg font-semibold text-gray-900">₦45,000</span>
                                </div>
                                <button className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium shadow-lg shadow-gray-200 cursor-pointer">
                                    Get Mechanic Driver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
