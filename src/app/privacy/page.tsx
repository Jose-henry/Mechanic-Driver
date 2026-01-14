import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <main className="bg-[#FDFDFD] min-h-screen flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Privacy Policy</h1>

                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
                        <p>
                            Welcome to Mechanic Driver ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                            This Privacy Policy explains how we collect, use, and share your personal information when you use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
                        <p className="mb-2">We collect information that you provide directly to us, including:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Personal identification information (Name, email address, phone number).</li>
                            <li>Vehicle information (Brand, model, year, license plate).</li>
                            <li>Service details and location data for vehicle pickup and delivery.</li>
                            <li>Payment information (processed securely by our payment partners).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
                        <p className="mb-2">We use your information to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Provide, operate, and maintain our services.</li>
                            <li>Process your requests and transactions.</li>
                            <li>Communicate with you, including service updates and customer support.</li>
                            <li>Find and assign qualified mechanic drivers to your request.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Data Sharing</h2>
                        <p>
                            We do not sell your personal information. We may share your information with:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Service Providers:</strong> Mechanics and drivers strictly for the purpose of fulfilling your service request.</li>
                            <li><strong>Legal Requirements:</strong> If required by law or to protect our rights.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no electronic transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Contact Us</h2>
                        <p>
                            If you have questions about this policy, please contact us at: <a href="mailto:hello@mechanicdriver.com" className="text-lime-600 hover:text-lime-700 font-medium">hello@mechanicdriver.com</a>
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
