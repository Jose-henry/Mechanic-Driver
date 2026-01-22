import Link from "next/link";
import { Wrench, LogOut, Settings } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/auth/actions";
import { NavLinks } from "./NavLinks";

const ADMIN_EMAILS = [
    "josephhenry093@gmail.com",
    "cherubhenry@gmail.com",
    "ellenhenry210@gmail.com",
    "support@mechanicdriver.com"
];

export async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

    return (
        <nav className="fixed top-0 w-full z-50 bg-[#FDFDFD]/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-gray-900 text-white p-1.5 rounded-lg">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-gray-900">
                        Mechanic Driver
                    </span>
                </Link>

                <NavLinks />

                <div className="flex items-center gap-4">
                    {!user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/signin" className="text-sm font-medium text-gray-900 hover:text-gray-700">
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            {isAdmin && (
                                <Link
                                    href="/md-admin"
                                    className="flex items-center gap-1.5 text-sm font-medium text-lime-600 hover:text-lime-700 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Admin
                                </Link>
                            )}
                            <Link
                                href="/profile"
                                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Profile
                            </Link>
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div >
        </nav >
    );
}

