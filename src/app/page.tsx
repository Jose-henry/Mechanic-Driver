import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Steps } from "@/components/Steps";
import { Pricing } from "@/components/Pricing";
import { Features } from "@/components/Features";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { MobileStickyCTA } from "@/components/MobileStickyCTA";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
    const supabase = await createClient()

    const { data: reviews } = await supabase
        .from('reviews')
        .select('id, rating, comment, reviewer_name')
        .gte('rating', 4)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10)

    return (
        <main>
            <Navbar />
            <Hero />
            <Steps />
            <Pricing />
            <Features />
            <Testimonials reviews={reviews || []} />
            <FAQ />
            <Footer />
            <MobileStickyCTA />
        </main>
    );
}
