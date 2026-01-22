import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ToastProvider } from "./components/ToastProvider";

const ADMIN_EMAILS = [
    "josephhenry093@gmail.com",
    "cherubhenry@gmail.com",
    "ellenhenry210@gmail.com",
    "support@mechanicdriver.com"
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect if not authenticated
    if (!user) {
        return redirect("/signin?returnTo=/md-admin");
    }

    // Check if user email is in admin whitelist
    const isAdmin = ADMIN_EMAILS.includes(user.email || "");

    if (!isAdmin) {
        return redirect("/?error=unauthorized");
    }

    return (
        <ToastProvider>
            <div className="min-h-screen bg-[#0A0A0A]">
                {/* Admin Header */}
                <header className="bg-[#111111] border-b border-[#222] sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-black font-bold text-sm">MD</span>
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-base sm:text-lg">Admin Dashboard</h1>
                                <p className="text-gray-500 text-xs hidden sm:block">Mechanic Driver Management</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                            <span className="text-gray-400 truncate max-w-[150px] sm:max-w-none">{user.email}</span>
                            <a
                                href="/"
                                className="text-gray-500 hover:text-white transition-colors whitespace-nowrap"
                            >
                                ← Back
                            </a>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                    {children}
                </main>
            </div>
        </ToastProvider>
    );
}
