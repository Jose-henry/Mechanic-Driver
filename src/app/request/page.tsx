import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RequestForm } from "./RequestForm";
import { createClient } from "@/utils/supabase/server";

export default async function RequestPage() {
    const supabase = await createClient()
    const { data: servicePrices } = await supabase.from('service_prices').select('*')

    return (
        <main className="bg-[#FDFDFD]">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Tell us about your vehicle</h1>
                    <p className="text-gray-500 mt-2">We need a few details to assign the best mechanic driver.</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading form...</div>}>
                        <RequestForm servicePrices={servicePrices || []} />
                    </Suspense>
                </div>
            </div>
            <Footer />
        </main>
    );
}
