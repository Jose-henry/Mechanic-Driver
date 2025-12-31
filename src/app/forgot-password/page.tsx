import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import { AuthButton } from "@/components/AuthButton";
import { forgotPassword } from "../auth/actions";

export default async function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const success = params?.success;
    const error = params?.error;

    return (
        <main className="bg-[#FDFDFD] min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/signin" className="inline-flex items-center gap-2 mb-8 text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sign In
                    </Link>
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-900 text-white p-1.5 rounded-lg">
                            <Wrench className="w-5 h-5" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Forgot Password?</h1>
                    <p className="text-gray-500 mt-2">Enter your email to reset your password.</p>
                </div>

                {success && (
                    <div className="rounded-xl bg-green-50 p-4 border border-green-100">
                        <p className="text-sm text-green-600 font-medium text-center">Check your email for the reset link.</p>
                    </div>
                )}

                {error && (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                        <p className="text-sm text-red-600 font-medium text-center">{error}</p>
                    </div>
                )}

                <form className="space-y-6" action={forgotPassword}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all"
                        />
                    </div>
                    <AuthButton>Send Reset Link</AuthButton>
                </form>
            </div>
        </main>
    );
}
