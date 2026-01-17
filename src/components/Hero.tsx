import { ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <section className="pt-32 pb-16 px-6 max-w-7xl mx-auto relative overflow-hidden">
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

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
                {/* Hero Text */}
                <div className="space-y-8 text-center lg:text-left">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 tracking-tight leading-[1.1] animate-in slide-in-from-bottom-8 fade-in duration-1000 fill-mode-both">
                        We Pick Up Your Car, Fix It, and Return It —
                        <span className="text-lime-600 block mt-2">Stress-Free.</span>
                    </h1>

                    <div className="space-y-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 fill-mode-both">
                        <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                            Trusted mechanic drivers • Transparent pricing • Pay only after diagnosis
                        </p>
                        <p className="text-sm md:text-base text-gray-500 bg-gray-100 inline-block px-4 py-2 rounded-full border border-gray-200">
                            Currently serving <span className="font-semibold text-gray-900">Benin City</span>. Lagos and Abuja Coming Soon.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300 fill-mode-both">
                        <Link
                            href="/request"
                            className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl shadow-gray-200/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                        >
                            Book Car Pickup <span className="text-xs font-normal opacity-70 ml-1">(2 minutes)</span>
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-xl text-lg font-medium transition-all flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-95"
                        >
                            See How It Works
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="pt-6 border-t border-gray-100 mt-8 animate-in fade-in duration-1000 delay-500 fill-mode-both">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center justify-center lg:justify-start gap-2 group cursor-default">
                                <ShieldCheck className="w-5 h-5 text-lime-600 shrink-0 group-hover:scale-110 transition-transform" />
                                <span>Insured vehicle handling</span>
                            </div>
                            <div className="flex items-center justify-center lg:justify-start gap-2 group cursor-default">
                                <CheckCircle className="w-5 h-5 text-lime-600 shrink-0 group-hover:scale-110 transition-transform" />
                                <span>No repairs without approval</span>
                            </div>
                            <div className="flex items-center justify-center lg:justify-start gap-2 group cursor-default">
                                <CheckCircle className="w-5 h-5 text-lime-600 shrink-0 group-hover:scale-110 transition-transform" />
                                <span>Verified mechanic partners</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="relative mt-8 lg:mt-0 animate-in zoom-in-95 fade-in duration-1000 delay-300 fill-mode-both hover:scale-[1.02] transition-transform">
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                        <img
                            src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2070&auto=format&fit=crop"
                            alt="Mechanic driver shaking hands with customer"
                            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                            <div className="text-white">
                                <p className="font-medium text-lg">"Peace of mind for your car."</p>
                                <p className="text-sm opacity-80 mt-1">Professional handling from pickup to return.</p>
                            </div>
                        </div>
                    </div>

                    {/* Floating Trust Badge */}
                    <div className="absolute -bottom-6 -left-6 sm:bottom-8 sm:-left-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 max-w-xs animate-bounce duration-[3000ms]">
                        <div className="bg-lime-100 p-3 rounded-full text-lime-700">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">100% Secure Service</p>
                            <p className="text-xs text-gray-500">Your vehicle is insured during transit.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky CTA Placeholder - Logic handled in layouts or global css usually, but visual here helps context if needed */}
        </section>
    );
}
