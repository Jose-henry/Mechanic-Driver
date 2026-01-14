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
                    <Link href="/privacy" className="hover:text-white transition-colors">
                        Privacy
                    </Link>
                    <Link href="/terms" className="hover:text-white transition-colors">
                        Terms
                    </Link>
                    <div className="flex flex-col gap-3">
                        <div className="border-l-2 border-white pl-3 font-semibold text-white leading-tight">Contact Us</div>
                        <div className="flex flex-col gap-2 pl-3">
                            <a href={`mailto:${process.env.CONTACT_EMAIL || 'hello@mechanicdriver.com'}`} className="text-xs hover:text-white transition-colors">
                                Email Us
                            </a>
                            <a href={`tel:${process.env.CONTACT_NUMBER || '+2348119355197'}`} className="text-xs hover:text-white transition-colors">
                                Call Us
                            </a>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    © {new Date().getFullYear()} Mechanic Driver. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
