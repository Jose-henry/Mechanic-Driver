import Link from "next/link";
import { Wrench } from "lucide-react";
import { AuthButton } from "@/components/AuthButton";
import { resetPassword } from "../actions";

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const error = params?.error;

    return (
        <main className="bg-[#FDFDFD] min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-900 text-white p-1.5 rounded-lg">
                            <Wrench className="w-5 h-5" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Reset Password</h1>
                    <p className="text-gray-500 mt-2">Enter your new password below.</p>
                </div>

                {error && (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                        <p className="text-sm text-red-600 font-medium text-center">{error}</p>
                    </div>
                )}

                <form className="space-y-6" action={resetPassword}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Min 6 characters"
                            required
                            minLength={6}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            required
                            minLength={6}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all"
                        />
                    </div>
                    <AuthButton>Update Password</AuthButton>
                </form>
            </div>
        </main>
    );
}
