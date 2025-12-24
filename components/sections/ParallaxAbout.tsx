'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ParallaxAbout() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    })

    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100])
    const y2 = useTransform(scrollYProgress, [0, 1], [50, -150])
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen py-32 overflow-hidden"
            id="section-about"
        >
            {/* Background elements */}
            <motion.div
                className="absolute right-0 top-0 w-1/2 h-full opacity-10"
                style={{ y: y1 }}
            >
                <div className="absolute right-20 top-20 text-[40vw] font-bold text-white/5 leading-none">
                    01
                </div>
            </motion.div>

            <motion.div
                className="relative z-10 max-w-7xl mx-auto px-8 md:px-20"
                style={{ opacity, y: y2 }}
            >
                <div className="grid md:grid-cols-2 gap-20 items-center">

                    {/* Left: Problem Statement */}
                    <div>
                        <motion.span
                            className="text-xs font-bold text-[#00a8ff] mb-6 uppercase tracking-[0.3em] block"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            The Problem
                        </motion.span>

                        <motion.h2
                            className="text-5xl md:text-7xl font-bold leading-tight mb-8"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            Manual work
                            <br />
                            <span className="text-white/20">doesn&apos;t scale.</span>
                        </motion.h2>

                        <motion.p
                            className="text-xl text-white/50 leading-relaxed mb-10"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            Every hour spent on repetitive tasks is capital burned.
                            Every manual handoff is a point of failure.
                            Every human keystroke is a chance for error.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                        >
                            <button className="btn-primary pointer-events-auto">
                                See The Solution
                            </button>
                        </motion.div>
                    </div>

                    {/* Right: Stats */}
                    <div className="space-y-8">
                        {[
                            { value: '40%', label: 'of work time spent on repetitive tasks', color: '#00a8ff' },
                            { value: '$5T', label: 'lost annually to manual inefficiency', color: '#7c3aed' },
                            { value: '89%', label: 'of tasks can be automated today', color: '#00ffa3' },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <div
                                    className="text-5xl font-bold"
                                    style={{ color: stat.color }}
                                >
                                    {stat.value}
                                </div>
                                <div className="text-white/40">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
