'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import GlitchText from '@/components/ui/GlitchText'

export default function ImmersiveHero() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    })

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
    const y = useTransform(scrollYProgress, [0, 0.5], [0, -100])
    const textY = useTransform(scrollYProgress, [0, 0.3], [0, 50])

    return (
        <section
            ref={containerRef}
            className="relative h-[200vh]"
            id="section-hero"
        >
            <motion.div
                className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden"
                style={{ opacity }}
            >
                {/* Radial gradient background */}
                <div className="absolute inset-0 bg-gradient-radial from-[#00a8ff10] via-transparent to-transparent" />

                {/* Concentric circles */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border border-white/5"
                        style={{
                            width: `${(i + 1) * 20}vw`,
                            height: `${(i + 1) * 20}vw`,
                        }}
                        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                        transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }}
                    />
                ))}

                {/* Main content */}
                <motion.div
                    className="relative z-10 text-center"
                    style={{ scale, y: textY }}
                >
                    {/* Eyebrow */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse" />
                            <span className="text-xs uppercase tracking-[0.3em] text-white/60">
                                Systems Online
                            </span>
                        </div>
                    </motion.div>

                    {/* Main title */}
                    <motion.h1
                        className="text-[12vw] md:text-[10vw] font-bold leading-[0.85] tracking-tighter"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 1 }}
                    >
                        <span className="block text-white">
                            <GlitchText text="AUTOMATION" />
                        </span>
                        <span className="block text-stroke">
                            SYSTEMS
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        className="mt-8 text-xl md:text-2xl text-white/40 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        We architect intelligent systems that run your business
                        <span className="text-white"> while you sleep</span>
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        className="mt-12 flex gap-6 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                    >
                        <button className="btn-primary pointer-events-auto">
                            Explore Systems
                        </button>
                        <button className="px-8 py-4 border border-white/20 rounded-full text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all pointer-events-auto">
                            Watch Demo
                        </button>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-12 flex flex-col items-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                >
                    <span className="text-xs uppercase tracking-[0.3em] text-white/30">Scroll to explore</span>
                    <motion.div
                        className="w-6 h-10 rounded-full border border-white/20 flex justify-center pt-2"
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <motion.div
                            className="w-1 h-3 bg-white/50 rounded-full"
                            animate={{ opacity: [1, 0, 1], y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.div>
                </motion.div>

                {/* Corner decorations */}
                <div className="absolute top-8 left-8 text-xs text-white/20 font-mono">
                    v2.0.0
                </div>
                <div className="absolute top-8 right-8 text-xs text-white/20 font-mono">
                    {new Date().getFullYear()}
                </div>
            </motion.div>
        </section>
    )
}
