'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    })

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
    const y = useTransform(scrollYProgress, [0, 0.5], [0, -50])

    return (
        <section
            ref={containerRef}
            className="relative h-[200vh]"
        >
            <motion.div
                className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden"
                style={{ opacity, scale }}
            >
                {/* Background grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '100px 100px'
                }} />

                {/* The Bridge - center line */}
                <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] bridge-line"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Content */}
                <motion.div
                    className="relative z-10 text-center max-w-5xl mx-auto px-8"
                    style={{ y }}
                >
                    {/* Eyebrow */}
                    <motion.p
                        className="text-sm tracking-[0.3em] text-[var(--text-secondary)] uppercase mb-8 syne reveal-up"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        Automation Agency
                    </motion.p>

                    {/* Main Title - The reveal moment */}
                    <motion.h1
                        className="text-[15vw] md:text-[12vw] leading-[0.85] tracking-tight"
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="block text-white">Context</span>
                        <span className="block italic text-[var(--accent)]">Bridge</span>
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        className="mt-12 text-xl md:text-2xl text-[var(--text-secondary)] max-w-xl mx-auto font-light leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                    >
                        We architect the invisible systems that make your business run flawlessly.
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        className="mt-16 flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1.3 }}
                    >
                        <button className="btn-primary pointer-events-auto">
                            <span>Start a Project</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </button>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                >
                    <motion.div
                        className="w-[1px] h-20 bg-gradient-to-b from-[var(--accent)] to-transparent"
                        animate={{ scaleY: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>

                {/* Corner accents */}
                <div className="absolute top-8 left-8 text-xs text-[var(--text-muted)] tracking-widest syne">
                    EST. 2024
                </div>
                <div className="absolute top-8 right-8 text-xs text-[var(--text-muted)] tracking-widest syne">
                    AUTOMATION
                </div>
            </motion.div>
        </section>
    )
}
