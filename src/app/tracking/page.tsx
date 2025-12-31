import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { SuccessBanner } from "@/components/SuccessBanner";
import { PendingRequestManager } from "./PendingRequestManager";

export default async function TrackingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const isVerified = params?.verified === 'true'

    return (
        <main className="bg-[#FDFDFD] h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 pt-32 px-6 flex flex-col items-center justify-center max-w-7xl mx-auto w-full">

                {isVerified && (
                    <SuccessBanner message="Email Verified!" />
                )}

                <PendingRequestManager />

                <div className="text-center space-y-4 mb-8">
                    <div className="inline-flex items-center gap-2 border border-gray-200 bg-white rounded-full px-4 py-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300 animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-500">
                            No active requests
                        </span>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-900">Track your order</h1>
                    <p className="text-gray-500 max-w-md mx-auto">You don't have any active repairs. Once you book a mechanic driver, you'll see real-time updates here.</p>
                </div>

                {/* Map Placeholder */}
                <div className="w-full max-w-4xl h-[400px] bg-gray-100 rounded-[2.5rem] border border-gray-200 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-no-repeat bg-center"></div>
                    <div className="z-10 bg-white p-6 rounded-2xl shadow-sm text-center">
                        <Loader2 className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-500">Map view unavailable</p>
                    </div>
                </div>

            </div>
            <Footer />
        </main>
    );
}
