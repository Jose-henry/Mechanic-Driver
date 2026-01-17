import { Wrench, Phone, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-20 pb-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-lime-400 text-gray-900 p-1.5 rounded-lg">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">
                                Mechanic Driver
                            </span>
                        </div>
                        <p className="text-gray-400 max-w-xs leading-relaxed">
                            Effortless car repair from your doorstep. Currently serving Benin City.
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 max-w-md w-full">
                        <h4 className="font-semibold text-lg mb-2">Need help?</h4>
                        <p className="text-gray-400 mb-6 text-sm">Talk to a real person when you need help.</p>

                        <div className="space-y-4">
                            <a
                                href="https://wa.me/2348119355197"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700 group"
                            >
                                <div className="bg-lime-400/10 p-2 rounded-lg text-lime-400 group-hover:bg-lime-400 group-hover:text-gray-900 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium">WhatsApp Us</div>
                                    <div className="text-xs text-gray-400">Instant response</div>
                                </div>
                            </a>

                            <div className="grid grid-cols-2 gap-4">
                                <a href="tel:+2348119355197" className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium">Call</span>
                                </a>
                                <a href="mailto:hello@mechanicdriver.com" className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium">Email</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <div>
                        © {new Date().getFullYear()} Mechanic Driver. Built for Nigerian Car Owners.
                    </div>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
