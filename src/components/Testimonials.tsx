'use client'

import { useState } from 'react'
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface Review {
    id: string
    rating: number
    comment: string | null
    reviewer_name: string | null
}

interface TestimonialsProps {
    reviews: Review[]
}

const FALLBACK: Review[] = [
    {
        id: 'fallback-1',
        rating: 5,
        comment: 'They picked my car from Airport Road GRA, fixed the car issues and returned it same day.',
        reviewer_name: 'Cherub',
    }
]

export function Testimonials({ reviews }: TestimonialsProps) {
    const items = reviews.length > 0 ? reviews : FALLBACK
    const [index, setIndex] = useState(0)
    const current = items[index]

    const prev = () => setIndex(i => (i - 1 + items.length) % items.length)
    const next = () => setIndex(i => (i + 1) % items.length)

    return (
        <section id="reviews" className="py-24 bg-gray-900 border-y border-gray-800">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-900 animate-in zoom-in duration-700 hover:scale-110 hover:rotate-6 transition-all cursor-pointer shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                    <Quote className="w-8 h-8 fill-current" />
                </div>

                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map(s => (
                        <Star
                            key={s}
                            className={`w-5 h-5 ${s <= current.rating ? 'text-lime-400 fill-lime-400' : 'text-gray-700'}`}
                        />
                    ))}
                </div>

                <blockquote className="space-y-8">
                    <p className="text-3xl md:text-5xl font-medium text-white leading-tight tracking-tight animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150 fill-mode-both min-h-[6rem]">
                        "{current.comment || 'Great service!'}"
                    </p>
                    <footer className="text-lg animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-both">
                        <div className="font-semibold text-lime-400">{current.reviewer_name || 'Verified Customer'}</div>
                    </footer>
                </blockquote>

                {/* Navigation */}
                <div className="mt-12 flex items-center justify-center gap-6">
                    {items.length > 1 && (
                        <button
                            onClick={prev}
                            className="p-2 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}

                    <div className="flex gap-2">
                        {items.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`block rounded-full transition-all ${i === index ? 'w-6 h-2.5 bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]' : 'w-2.5 h-2.5 bg-gray-700 hover:bg-gray-600'}`}
                            />
                        ))}
                    </div>

                    {items.length > 1 && (
                        <button
                            onClick={next}
                            className="p-2 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}
