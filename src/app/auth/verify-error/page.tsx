import Link from "next/link";
import { Wrench, AlertCircle } from "lucide-react";

export default function VerifyErrorPage() {
    return (
        <main className="bg-[#FDFDFD] min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-md space-y-8 text-center">
                <Link href="/" className="inline-flex items-center gap-2 mb-8">
                    <div className="bg-lime-400 text-gray-900 p-1.5 rounded-lg shadow-lime-200 shadow-md">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-gray-900">
                        Mechanic Driver
                    </span>
                </Link>

                <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex flex-col items-center">
                    <div className="bg-red-100 p-3 rounded-full mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verification Link Invalid / Expired</h1>
                    <p className="text-gray-500 mb-6">
                        The link you used is invalid or has already been used. Please try signing in, or request a new verification email.
                    </p>

                    <Link
                        href="/signin"
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl block"
                    >
                        Return to Sign In
                    </Link>
                </div>
            </div>
        </main>
    );
}
