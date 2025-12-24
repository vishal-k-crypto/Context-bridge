import { ScrollManager } from '@/components/ScrollManager'
import Navigation from '@/components/Navigation'
import Preloader from '@/components/dom/Preloader'
import BridgeCursor from '@/components/dom/BridgeCursor'

// Sections
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import ServicesSection from '@/components/sections/ServicesSection'
import WorkSection from '@/components/sections/WorkSection'
import ContactSection from '@/components/sections/ContactSection'

export default function Home() {
  return (
    <ScrollManager>
      {/* Preloader */}
      <Preloader />

      {/* Cursor */}
      <BridgeCursor />

      {/* Navigation */}
      <Navigation />

      {/* Noise texture overlay */}
      <div className="noise" />

      {/* Main content */}
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <WorkSection />
        <ContactSection />
      </main>
    </ScrollManager>
  )
}
