import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AlertTriangle } from 'lucide-react';

export default function TermsPage() {
    return (
        <main className="bg-[#FDFDFD] min-h-screen flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Terms of Service</h1>

                <div className="space-y-8 text-gray-600 leading-relaxed">

                    {/* Refund Policy Alert */}
                    {/* Refund Policy Alert */}
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 mb-10 shadow-sm">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-red-700 font-bold text-lg mb-2 uppercase tracking-wide">Strict No Refund Policy</h3>
                            <p className="text-red-700/90 text-sm leading-relaxed font-medium">
                                <strong>Refund rules: No refunds after Maintenance service begins.</strong><br />
                                Once a mechanic has commenced work on your vehicle (status changed to "Repairs in Progress"), the service fee and any costs incurred for parts are strictly non-refundable. Please ensure you are satisfied with the quote before proceeding.
                            </p>
                        </div>
                    </div>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the Mechanic Driver platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Services</h2>
                        <p>
                            Mechanic Driver connects vehicle owners with independent mechanics and drivers ("Service Providers") for vehicle maintenance, repair, and logistics services. We act as an intermediary to facilitate these connections.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">3. User Responsibilities</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>You must provide accurate and complete information about your vehicle and service needs.</li>
                            <li>You are responsible for removing all personal valuables from your vehicle before pickup.</li>
                            <li>You agree to pay for all services requested and approved through the platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Payments and Cancellations</h2>
                        <p className="mb-2">
                            Quotes provided are estimates based on initial diagnosis. Final costs may vary if additional issues are discovered. You will be notified of any changes for approval.
                        </p>
                        <p className="mb-2 pb-2">
                            <strong>Cancellation Policy:</strong> You may cancel your request at any time before the service has commenced. A cancellation fee may apply if the driver is already en route.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Limitation of Liability</h2>
                        <p>
                            Mechanic Driver is not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or any conduct of any third-party service provider.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Contact</h2>
                        <p>
                            For support or inquiries, please contact us at: <a href="mailto:support@mechanicdriver.com" className="text-lime-600 hover:text-lime-700 font-medium">support@mechanicdriver.com</a>
                        </p>
                    </section>

                    <p className="text-sm text-gray-400 pt-8 border-t border-gray-100">
                        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
