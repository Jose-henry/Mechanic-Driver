import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Steps } from "@/components/Steps";
import { Pricing } from "@/components/Pricing";
import { Features } from "@/components/Features";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { MobileStickyCTA } from "@/components/MobileStickyCTA";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Steps />
      <Pricing />
      <Features />
      <Testimonials />
      <FAQ />
      <Footer />
      <MobileStickyCTA />
    </main>
  );
}
