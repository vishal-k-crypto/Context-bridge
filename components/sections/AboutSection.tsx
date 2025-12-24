'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

export default function AboutSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: true, margin: "-20%" })

    return (
        <section
            ref={containerRef}
            className="relative py-40 overflow-hidden"
            id="section-about"
        >
            {/* Background accent */}
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
                style={{
                    background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
                    filter: 'blur(120px)'
                }}
            />

            <div className="max-w-7xl mx-auto px-8 md:px-20">
                <div className="grid md:grid-cols-2 gap-20 items-center">

                    {/* Left - The problem */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="text-sm tracking-[0.3em] text-[var(--accent)] uppercase mb-6 syne">
                            The Problem
                        </p>

                        <h2 className="text-5xl md:text-7xl leading-[1.1] mb-8">
                            Systems that don&apos;t
                            <span className="italic text-[var(--text-secondary)]"> talk </span>
                            to each other.
                        </h2>

                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                            Your tools are islands. Your data is scattered. Your team is stuck
                            doing work that machines should handle. Every disconnection costs
                            you time, money, and momentum.
                        </p>
                    </motion.div>

                    {/* Right - The solution (visual) */}
                    <motion.div
                        className="relative h-[400px] flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* The bridge visualization */}
                        <div className="relative w-full h-full">
                            {/* Left node */}
                            <motion.div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-[var(--text-muted)] flex items-center justify-center"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Data</span>
                            </motion.div>

                            {/* Right node */}
                            <motion.div
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-[var(--text-muted)] flex items-center justify-center"
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                            >
                                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Action</span>
                            </motion.div>

                            {/* The bridge - animated line */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                                <motion.path
                                    d="M 50 100 Q 200 50 350 100"
                                    fill="none"
                                    stroke="url(#bridge-gradient)"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    animate={isInView ? { pathLength: 1 } : {}}
                                    transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                />
                                <defs>
                                    <linearGradient id="bridge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
                                        <stop offset="50%" stopColor="var(--accent)" stopOpacity="1" />
                                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Flowing particles */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-[var(--accent)] rounded-full"
                                    style={{ left: '50px', top: '50%' }}
                                    animate={{
                                        x: [0, 300],
                                        y: [0, -50, 0],
                                        opacity: [0, 1, 1, 0],
                                        scale: [0, 1, 1, 0]
                                    }}
                                    transition={{
                                        duration: 3,
                                        delay: i * 0.4,
                                        repeat: Infinity,
                                        ease: 'easeInOut'
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Stats */}
                <motion.div
                    className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12"
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1, delay: 0.6 }}
                >
                    {[
                        { value: '500+', label: 'Automations Built' },
                        { value: '50M', label: 'Records Processed' },
                        { value: '99.9%', label: 'Uptime' },
                        { value: '24/7', label: 'Always Running' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center md:text-left">
                            <div className="text-4xl md:text-5xl font-light mb-2">{stat.value}</div>
                            <div className="text-sm text-[var(--text-muted)] uppercase tracking-widest syne">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
