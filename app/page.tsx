import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Problem from "@/components/Problem";
import CaseStudy from "@/components/CaseStudy";
import TechStack from "@/components/TechStack";
import Pricing from "@/components/Pricing";
import WhyUs from "@/components/WhyUs";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Services />
      <Problem />
      <CaseStudy />
      <TechStack />
      <Pricing />
      <WhyUs />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
