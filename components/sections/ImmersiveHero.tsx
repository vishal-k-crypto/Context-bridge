'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ImmersiveHero() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    })

    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
    const y = useTransform(scrollYProgress, [0, 0.5], [0, -50])

    return (
        <section
            ref={containerRef}
            className="relative h-[150vh]"
            id="section-hero"
        >
            <motion.div
                className="sticky top-0 h-screen flex flex-col items-center justify-center"
                style={{ opacity }}
            >
                {/* Minimal content */}
                <motion.div
                    className="relative z-10 text-center"
                    style={{ y }}
                >
                    {/* Eyebrow */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <span className="text-xs uppercase tracking-[0.4em] text-white/40">
                            Automation Agency
                        </span>
                    </motion.div>

                    {/* Main title - Clean, bold, minimal */}
                    <motion.h1
                        className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 1 }}
                    >
                        <span className="block text-white">Context</span>
                        <span className="block gradient-text">Bridge</span>
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        className="mt-8 text-lg md:text-xl text-white/50 max-w-md mx-auto font-light"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                    >
                        We build the systems that run while you sleep.
                    </motion.p>

                    {/* Single CTA */}
                    <motion.div
                        className="mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                    >
                        <button className="px-8 py-4 bg-white text-black font-medium rounded-full hover:scale-105 transition-transform pointer-events-auto">
                            Start a Project
                        </button>
                    </motion.div>
                </motion.div>

                {/* Minimal scroll indicator */}
                <motion.div
                    className="absolute bottom-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    <motion.div
                        className="w-[1px] h-16 bg-gradient-to-b from-white/20 to-transparent"
                        animate={{ scaleY: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>
        </section>
    )
}
