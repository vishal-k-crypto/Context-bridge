import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import CaseStudy from "@/components/CaseStudy";
import HowItWorks from "@/components/HowItWorks";
import WhoWeServe from "@/components/WhoWeServe";
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
      <Problem />
      <Solution />
      <CaseStudy />
      <HowItWorks />
      <WhoWeServe />
      <TechStack />
      <Pricing />
      <WhyUs />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
