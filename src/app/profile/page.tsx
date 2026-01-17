import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { deleteAccount } from "../auth/actions";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { EditProfileForm } from "./EditProfileForm";

export default async function ProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/signin");
    }

    // Fetch profile data if needed, but we have user metadata from auth
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const params = await searchParams;
    const error = params?.error as string;

    return (
        <main className="bg-gray-50 min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 pt-32 px-6 pb-12 flex flex-col items-center max-w-4xl mx-auto w-full">

                <div className="w-full space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both">
                    <div className="text-center md:text-left border-b border-gray-200 pb-6">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
                        <p className="text-gray-500 mt-2 text-lg">Manage your personal information and account settings.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 md:p-10 space-y-12 shadow-xl shadow-gray-200/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

                        <div className="relative z-10">
                            <EditProfileForm user={user} profile={profile} />
                        </div>

                        <div className="relative z-10 pt-10 border-t border-gray-100">
                            <DeleteAccountSection />
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
