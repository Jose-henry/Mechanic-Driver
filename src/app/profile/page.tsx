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
        <main className="bg-[#FDFDFD] min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 pt-32 px-6 pb-12 flex flex-col items-center max-w-4xl mx-auto w-full">

                <div className="w-full space-y-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-semibold text-gray-900">My Profile</h1>
                        <p className="text-gray-500 mt-2">Manage your account settings</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">

                        <EditProfileForm user={user} profile={profile} />

                        <DeleteAccountSection />

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
