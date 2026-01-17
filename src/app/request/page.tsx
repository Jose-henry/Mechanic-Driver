import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RequestForm } from "./RequestForm";
import { createClient } from "@/utils/supabase/server";

export default async function RequestPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: servicePrices } = await supabase.from('service_prices').select('*')

    let needsPhone = false
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single()
        if (!profile?.phone) {
            needsPhone = true
        }
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
                <div className="mb-10 text-center animate-in slide-in-from-bottom-4 fade-in duration-700">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tell us about your vehicle</h1>
                    <p className="text-gray-500 mt-2 text-lg">We need a few details to assign the best mechanic driver.</p>
                </div>

                <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
                    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading form...</div>}>
                        <RequestForm servicePrices={servicePrices || []} needsPhone={needsPhone} />
                    </Suspense>
                </div>
            </div>
            <Footer />
        </main>
    );
}
