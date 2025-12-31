import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { deleteAccount } from "../auth/actions";
import { DeleteAccountSection } from "./DeleteAccountSection";

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

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                                    <p className="text-lg font-medium text-gray-900 border-b border-gray-100 py-2">
                                        {profile?.full_name || user.user_metadata.full_name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                                    <p className="text-lg font-medium text-gray-900 border-b border-gray-100 py-2">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-lg font-medium text-gray-900 border-b border-gray-100 py-2">
                                        {profile?.phone || user.user_metadata.phone || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">User ID</label>
                                    <p className="text-sm font-mono text-gray-400 border-b border-gray-100 py-3">
                                        {user.id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DeleteAccountSection />

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
