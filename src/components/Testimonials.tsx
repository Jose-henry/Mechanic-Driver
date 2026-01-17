import { Quote } from "lucide-react";

export function Testimonials() {
    return (
        <section id="reviews" className="py-24 bg-gray-900 border-y border-gray-800">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-900 animate-in zoom-in duration-700 hover:scale-110 hover:rotate-6 transition-all cursor-pointer shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                    <Quote className="w-8 h-8 fill-current" />
                </div>

                <blockquote className="space-y-8">
                    <p className="text-3xl md:text-5xl font-medium text-white leading-tight tracking-tight animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150 fill-mode-both">
                        “They picked my car from Airport Road GRA, fixed the car issues and returned it same day.”
                    </p>
                    <footer className="text-lg animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-both">
                        <div className="font-semibold text-lime-400">Cherub</div>
                        <div className="text-gray-500">Benin City</div>
                    </footer>
                </blockquote>

                <div className="mt-16 flex justify-center gap-2 animate-in fade-in duration-1000 delay-500">
                    <span className="block w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse shadow-[0_0_10px_rgba(163,230,53,0.5)]"></span>
                    <span className="block w-2.5 h-2.5 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer"></span>
                    <span className="block w-2.5 h-2.5 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer"></span>
                </div>
            </div>
        </section>
    );
}
