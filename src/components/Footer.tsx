import { Wrench } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="bg-lime-400 text-gray-900 p-1.5 rounded-lg">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight">
                        Mechanic Driver
                    </span>
                </div>

                <div className="flex gap-8 text-sm text-gray-400">
                    <Link href="#" className="hover:text-white transition-colors">
                        Privacy
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors">
                        Terms
                    </Link>
                    <a href="mailto:cherubhenry@gmail.com" className="hover:text-white transition-colors">
                        Contact
                    </a>
                </div>

                <div className="text-sm text-gray-500">
                    © {new Date().getFullYear()} Mechanic Driver. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
