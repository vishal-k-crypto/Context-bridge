'use client'

import { ReactLenis, useLenis } from 'lenis/react'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollManagerProps {
    children: React.ReactNode
}

export function ScrollManager({ children }: ScrollManagerProps) {
    // useLenis hook provides access to the Lenis instance directly, 
    // but since we are using the component wrapper, we access it via ref.
    // We need to type the ref as any to bypass the specific library typing issue or import the correct type.
    const lenisRef = useRef<any>(null)

    // Configure Lenis for the "Luxury" feel (High duration, custom easing)
    // as specified in the lando.md technical report.
    const lenisOptions = {
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical' as 'vertical', // Type assertion
        gestureOrientation: 'vertical' as 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    }

    // Synchronize Lenis with GSAP ScrollTrigger
    useEffect(() => {
        const lenis = lenisRef.current?.lenis
        if (!lenis) return

        // Update ScrollTrigger on Lenis scroll
        lenis.on('scroll', ScrollTrigger.update)

        // Connect GSAP's ticker to Lenis for frame-perfect sync
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000)
        })

        // Disable GSAP's native lag smoothing to prevent stuttering
        gsap.ticker.lagSmoothing(0)

        return () => {
            gsap.ticker.remove((time) => lenis.raf(time * 1000))
        }
    }, [])

    return (
        <ReactLenis root ref={lenisRef} options={lenisOptions} className="lenis-scroller">
            {children}
        </ReactLenis>
    )
}
