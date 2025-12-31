import Link from "next/link";
import { Wrench } from "lucide-react";
import { signup, loginWithGoogle } from "../auth/actions";
import { AuthButton } from "@/components/AuthButton";

export default async function SignUpPage({
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
                        <div className="bg-lime-400 text-gray-900 p-1.5 rounded-lg shadow-lime-200 shadow-md">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-gray-900">
                            Mechanic Driver
                        </span>
                    </Link>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Create an account</h1>
                    <p className="text-gray-500 mt-2">Join thousands of car owners in Nigeria.</p>
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
                    <form action={loginWithGoogle}>
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <AuthButton variant="google" className="hover:border-lime-200">
                            <div className="p-1 rounded-full bg-lime-100 mr-1">
                                <svg className="w-5 h-5 text-lime-700" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            Sign up with Google
                        </AuthButton>
                    </form>

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

                    <form action={signup} className="space-y-4">
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    name="firstName"
                                    type="text"
                                    placeholder="John"
                                    required
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all focus:border-lime-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    placeholder="Doe"
                                    required
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all focus:border-lime-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all focus:border-lime-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                required
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all focus:border-lime-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <input
                                name="phone"
                                type="tel"
                                placeholder="080 1234 5678"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all focus:border-lime-300"
                            />
                        </div>

                        <AuthButton variant="primary">Create Account</AuthButton>
                    </form>
                </div>

                <p className="text-center text-gray-500">
                    Already have an account? <Link href="/signin" className="font-semibold text-lime-600 hover:text-lime-700">Sign in</Link>
                </p>
            </div>
        </main>
    );
}
