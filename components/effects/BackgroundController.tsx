'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Easing functions for natural transitions
const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const easeOutQuart = (t: number): number =>
    1 - Math.pow(1 - t, 4)

const lerp = (start: number, end: number, t: number): number =>
    start + (end - start) * t

// Section configurations with enter/peak/exit values for smooth breathing
interface SectionConfig {
    id: string
    opacity: { enter: number; peak: number; exit: number }
    blur: { enter: number; peak: number; exit: number }
    contentDensity: 'minimal' | 'low' | 'medium' | 'high'
}

const sectionConfigs: SectionConfig[] = [
    {
        id: 'hero',
        opacity: { enter: 1, peak: 1, exit: 0.6 },
        blur: { enter: 8, peak: 6, exit: 10 }, // Subtle blur on hero for dreamy effect
        contentDensity: 'minimal',
    },
    {
        id: 'about',
        opacity: { enter: 0.5, peak: 0.2, exit: 0.15 },
        blur: { enter: 4, peak: 10, exit: 14 },
        contentDensity: 'medium',
    },
    {
        id: 'automation',
        opacity: { enter: 0.08, peak: 0.03, exit: 0.08 },
        blur: { enter: 16, peak: 24, exit: 16 },
        contentDensity: 'high',
    },
    {
        id: 'portfolio',
        opacity: { enter: 0.15, peak: 0.3, exit: 0.4 },
        blur: { enter: 12, peak: 6, exit: 4 },
        contentDensity: 'medium',
    },
    {
        id: 'trust',
        opacity: { enter: 0.4, peak: 0.5, exit: 0.45 },
        blur: { enter: 4, peak: 2, exit: 3 },
        contentDensity: 'low',
    },
    {
        id: 'stats',
        opacity: { enter: 0.45, peak: 0.5, exit: 0.55 },
        blur: { enter: 3, peak: 2, exit: 2 },
        contentDensity: 'low',
    },
    {
        id: 'contact',
        opacity: { enter: 0.55, peak: 0.7, exit: 0.8 },
        blur: { enter: 2, peak: 1, exit: 0 },
        contentDensity: 'minimal',
    },
]

// Fallback scroll-based calculation
function calculateScrollBasedValues(progress: number): { opacity: number; blur: number } {
    // Define keyframes for smooth scroll-based transition
    // Format: [scrollProgress, opacity, blur]
    const keyframes: [number, number, number][] = [
        [0.00, 1.0, 0],     // Hero start
        [0.10, 1.0, 0],     // Hero peak
        [0.15, 0.6, 3],     // Hero exit / About enter
        [0.20, 0.3, 8],     // About ramp
        [0.28, 0.15, 14],   // About peak
        [0.32, 0.08, 18],   // Automation enter
        [0.38, 0.03, 24],   // Automation peak (LIVE DEMO - max isolation)
        [0.50, 0.03, 24],   // Automation sustained
        [0.55, 0.08, 18],   // Automation exit
        [0.60, 0.2, 10],    // Portfolio enter
        [0.68, 0.35, 5],    // Portfolio peak
        [0.75, 0.45, 3],    // Trust/Stats
        [0.85, 0.55, 2],    // Stats peak
        [0.92, 0.7, 1],     // Contact enter
        [1.00, 0.85, 0],    // Contact exit
    ]

    // Find surrounding keyframes
    let lowerIdx = 0
    for (let i = 0; i < keyframes.length - 1; i++) {
        if (progress >= keyframes[i][0] && progress <= keyframes[i + 1][0]) {
            lowerIdx = i
            break
        }
    }

    const lower = keyframes[lowerIdx]
    const upper = keyframes[Math.min(lowerIdx + 1, keyframes.length - 1)]

    // Calculate interpolation factor with easing
    const range = upper[0] - lower[0]
    const t = range > 0 ? (progress - lower[0]) / range : 0
    const easedT = easeInOutCubic(t)

    return {
        opacity: lerp(lower[1], upper[1], easedT),
        blur: lerp(lower[2], upper[2], easedT),
    }
}

export default function BackgroundController({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const lastScrollY = useRef(0)
    const velocityBlur = useRef(0)

    useEffect(() => {
        if (!containerRef.current) return

        // Set initial values - start with blur for dreamy hero effect
        document.documentElement.style.setProperty('--bg-opacity', '1')
        document.documentElement.style.setProperty('--bg-blur', '6px')

        // Track scroll velocity for subtle motion blur effect
        let rafId: number
        const updateVelocity = () => {
            const currentY = window.scrollY
            const velocity = Math.abs(currentY - lastScrollY.current)
            lastScrollY.current = currentY

            // Add subtle extra blur when scrolling fast (caps at 4px extra)
            const targetVelocityBlur = Math.min(velocity * 0.02, 4)
            velocityBlur.current = lerp(velocityBlur.current, targetVelocityBlur, 0.1)

            rafId = requestAnimationFrame(updateVelocity)
        }
        rafId = requestAnimationFrame(updateVelocity)

        // Section-based triggers (primary method if data-section attributes exist)
        const sections = document.querySelectorAll('section[data-section]')

        if (sections.length > 0) {
            sections.forEach((section) => {
                const sectionId = section.getAttribute('data-section')
                const config = sectionConfigs.find(c => c.id === sectionId)

                if (!config) return

                ScrollTrigger.create({
                    trigger: section,
                    start: 'top 90%',
                    end: 'bottom 10%',
                    scrub: 0.3,
                    onUpdate: (self) => {
                        const progress = self.progress

                        // Calculate transition zones
                        // First 25% = enter transition, Middle 50% = peak, Last 25% = exit transition
                        let opacity: number
                        let blur: number

                        if (progress < 0.25) {
                            // Enter transition
                            const t = easeOutQuart(progress / 0.25)
                            opacity = lerp(config.opacity.enter, config.opacity.peak, t)
                            blur = lerp(config.blur.enter, config.blur.peak, t)
                        } else if (progress < 0.75) {
                            // Peak zone - stable
                            opacity = config.opacity.peak
                            blur = config.blur.peak
                        } else {
                            // Exit transition
                            const t = easeInOutCubic((progress - 0.75) / 0.25)
                            opacity = lerp(config.opacity.peak, config.opacity.exit, t)
                            blur = lerp(config.blur.peak, config.blur.exit, t)
                        }

                        // Apply with velocity blur
                        const totalBlur = blur + velocityBlur.current
                        document.documentElement.style.setProperty('--bg-opacity', String(opacity))
                        document.documentElement.style.setProperty('--bg-blur', `${totalBlur}px`)
                    }
                })
            })
        }

        // Fallback: Scroll position based (always active as a safety net)
        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.2,
            onUpdate: (self) => {
                // Only use fallback if no section triggers are active
                if (sections.length > 0) return

                const { opacity, blur } = calculateScrollBasedValues(self.progress)
                const totalBlur = blur + velocityBlur.current

                document.documentElement.style.setProperty('--bg-opacity', String(opacity))
                document.documentElement.style.setProperty('--bg-blur', `${totalBlur}px`)
            }
        })

        return () => {
            cancelAnimationFrame(rafId)
            ScrollTrigger.getAll().forEach(st => st.kill())
        }
    }, [])

    return (
        <div ref={containerRef}>
            {children}
        </div>
    )
}
