import Link from "next/link";
import { Wrench } from "lucide-react";
import { signup } from "../auth/actions";
import { AuthButton } from "@/components/AuthButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

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
                    <GoogleSignInButton returnTo={returnTo} label="Sign up with Google" />

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
