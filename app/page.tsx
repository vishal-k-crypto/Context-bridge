import { ScrollManager } from '@/components/ScrollManager'
import Scene from '@/components/Scene'
import AutomationNode from '@/components/canvas/AutomationNode'
import ServerRack from '@/components/canvas/ServerRack'
import NeuralNetwork from '@/components/canvas/NeuralNetwork'
import DataFlow from '@/components/canvas/DataFlow'
import InfiniteTunnel from '@/components/canvas/InfiniteTunnel'
import CameraRig from '@/components/canvas/CameraRig'
import Navbar from '@/components/dom/Navbar'

import Preloader from '@/components/dom/Preloader'
import EasterEgg from '@/components/ui/EasterEgg'
import MorphingBlob from '@/components/effects/MorphingBlob'
import ScrollProgress from '@/components/effects/ScrollProgress'
import FloatingTags from '@/components/effects/FloatingTags'
import TimeGreeting from '@/components/effects/TimeGreeting'
import BackgroundController from '@/components/effects/BackgroundController'
import FragmentedParallax from '@/components/effects/FragmentedParallax'

// New Immersive Sections
import ImmersiveHero from '@/components/sections/ImmersiveHero'
import ParallaxAbout from '@/components/sections/ParallaxAbout'
import AutomationFlow from '@/components/sections/AutomationFlow'
import CTASection from '@/components/sections/CTASection'
import ImmersivePortfolio from '@/components/sections/ImmersivePortfolio'
import ImmersiveContact from '@/components/sections/ImmersiveContact'

export default function Home() {
  return (
    <ScrollManager>
      {/* System overlays */}
      <Preloader />
      <ScrollProgress />
      <Navbar />

      <EasterEgg />
      <TimeGreeting />

      {/* Background effects */}
      <MorphingBlob />
      <FloatingTags />
      <div className="noise-overlay" />

      {/* 3D Scene - Full viewport fixed background */}
      <Scene>
        <CameraRig />
        <InfiniteTunnel />
        <AutomationNode />
        <ServerRack position={[-6, -2, -8]} scale={0.6} />
        <ServerRack position={[7, 1, -10]} scale={0.5} />
        <NeuralNetwork position={[5, 3, -6]} scale={0.5} />
        <DataFlow position={[0, 0, -15]} />
      </Scene>

      {/* Fragmented Parallax - DISABLED for now */}
      {/* <FragmentedParallax enabled={true} /> */}

      {/* DOM Content with Background Controller */}
      <BackgroundController>
        <main className="relative z-10 w-full text-white">

          {/* Section 1: Hero - Immersive intro */}
          <ImmersiveHero />

          {/* Section 2: About - The Problem */}
          <ParallaxAbout />

          {/* Section 3: Live Demo - Interactive automation flow */}
          <AutomationFlow />

          {/* Section 3.5: CTA - Experience MCP Factory button */}
          <CTASection />

          {/* Section 4: Portfolio - Full-screen project takeovers */}
          <ImmersivePortfolio />


          {/* Section 7: Contact - Immersive CTA */}
          <ImmersiveContact />

        </main>
      </BackgroundController>
    </ScrollManager>
  )
}
