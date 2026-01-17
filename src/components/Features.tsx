import { ShieldCheck, UserCheck, MessageSquare, FileCheck } from "lucide-react";

export function Features() {
    return (
        <section id="trust" className="py-24 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <span className="text-sm font-bold text-lime-600 tracking-wide uppercase bg-lime-50 px-3 py-1 rounded-full border border-lime-100">
                    Trust & Safety
                </span>
                <h2 className="mt-4 text-4xl font-semibold text-gray-900 tracking-tight">
                    Your Car Is Safe With Us.
                </h2>
                <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                    We've built a system designed for trust, transparency, and safety from the ground up.
                </p>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
                {/* Card 1: Verified Drivers */}
                <div className="md:col-span-8 bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group min-h-[300px] flex flex-col justify-center animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both hover:scale-[1.01] transition-transform">
                    <div className="relative z-10 max-w-lg">
                        <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-lime-400 group-hover:scale-110 group-hover:bg-gray-700 transition-all duration-300">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-semibold tracking-tight mb-4 group-hover:text-lime-400 transition-colors">
                            Verified Drivers
                        </h3>
                        <p className="text-gray-400 text-lg">
                            Every Mechanic Driver undergoes rigorous background checks, driving tests, and technical assessments before joining our team.
                        </p>
                    </div>
                </div>

                {/* Card 2: Trusted Partners */}
                <div className="md:col-span-4 bg-lime-300 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-between min-h-[300px] animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both hover:scale-[1.01] transition-transform">
                    <div>
                        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4">
                            Trusted Workshop Partners
                        </h3>
                        <p className="text-gray-800 text-lg">
                            We only work with workshops that have a track record of quality and honesty.
                        </p>
                    </div>
                </div>

                {/* Card 3: Transparent Approval */}
                <div className="md:col-span-5 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both hover:shadow-xl transition-all hover:scale-[1.01]">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-lime-100 rounded-2xl flex items-center justify-center mb-6 text-lime-700 group-hover:scale-110 transition-transform duration-300">
                            <FileCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4">
                            Transparent Approval
                        </h3>
                        <p className="text-gray-500 text-lg">
                            You get a digital quote with every part listed. You approve or decline before we spend a dime.
                        </p>
                    </div>
                </div>

                {/* Card 4: Dispute Resolution */}
                <div className="md:col-span-7 bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-700 delay-400 fill-mode-both hover:shadow-lg transition-all hover:scale-[1.01]">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 text-gray-900 group-hover:scale-110 transition-transform duration-300">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">
                            Clear Dispute Resolution
                        </h3>
                        <p className="text-gray-500 text-lg max-w-xl">
                            If something isn't right, we step in. We hold payments until you are satisfied with the service delivered.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
