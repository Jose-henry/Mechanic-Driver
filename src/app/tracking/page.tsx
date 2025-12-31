import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SuccessBanner } from "@/components/SuccessBanner";
import { PendingRequestManager } from "./PendingRequestManager";
import { createClient } from "@/utils/supabase/server";
import { TrackingList } from "./TrackingList";

export default async function TrackingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const isVerified = params?.verified === 'true'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let requests: any[] = []

    if (user) {
        const { data } = await supabase
            .from('requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        requests = data || []
    }

    return (
        <main className="bg-[#FDFDFD] min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 pt-32 px-6 flex flex-col items-center max-w-7xl mx-auto w-full">

                {isVerified && (
                    <SuccessBanner message="Email Verified!" description="Your account is fully active." />
                )}

                {params?.success === 'true' && (
                    <SuccessBanner message="Request Submitted Successfully!" description="We'll notify you when a mechanic driver is assigned." />
                )}

                <PendingRequestManager />

                <TrackingList requests={requests} />

            </div>
            <Footer />
        </main>
    );
}
