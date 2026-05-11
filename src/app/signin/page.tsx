import Link from "next/link";
import { Wrench } from "lucide-react";
import { login } from '../auth/actions'
import { AuthButton } from "@/components/AuthButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default async function SignInPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const errorMessage = params?.error as string
    const successMessage = params?.message as string
    const returnTo = params?.returnTo as string

    return (
        <main className="bg-[#FDFDFD] min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <div className="bg-gray-900 text-white p-1.5 rounded-lg">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-gray-900">
                            Mechanic Driver
                        </span>
                    </Link>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Welcome back</h1>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>

                {errorMessage && (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                        <p className="text-sm text-red-600 font-medium text-center">{errorMessage}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="rounded-xl bg-green-50 p-4 border border-green-100">
                        <p className="text-sm text-green-600 font-medium text-center">{successMessage}</p>
                    </div>
                )}

                <div className="space-y-6">
                    <GoogleSignInButton returnTo={returnTo} />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-[#FDFDFD] px-4 text-gray-500">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    <form className="space-y-4">
                        <input type="hidden" name="returnTo" value={returnTo} />

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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <Link href="/forgot-password" className="text-sm text-lime-600 hover:text-lime-700 font-medium">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                required
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all"
                            />
                        </div>

                        <AuthButton
                            formAction={login}
                            className="shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all"
                        >
                            Sign In
                        </AuthButton>
                    </form>
                </div>

                <p className="text-center text-gray-500">
                    Don't have an account? <Link href="/signup" className="font-semibold text-lime-600 hover:text-lime-700">Sign up</Link>
                </p>
            </div>
        </main>
    );
}
