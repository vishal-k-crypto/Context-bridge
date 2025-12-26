'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CTASection() {
    return (
        <section className="min-h-[70vh] flex flex-col items-center justify-center px-8 py-20 relative overflow-hidden">

            {/* Animated background orbs - using theme colors */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 212, 170, 0.08) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    left: '-15%',
                    top: '-40%',
                }}
                animate={{
                    x: [0, 30, 0],
                    y: [0, 20, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 60%)',
                    filter: 'blur(50px)',
                    right: '-10%',
                    bottom: '-20%',
                }}
                animate={{
                    x: [0, -20, 0],
                    y: [0, -30, 0],
                    scale: [1.1, 1, 1.1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Floating particles - theme colors */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                        left: `${20 + i * 12}%`,
                        top: `${30 + (i % 3) * 20}%`,
                        background: i % 2 === 0 ? '#00ffa3' : '#00a8ff',
                        opacity: 0.4,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                    }}
                />
            ))}

            {/* Decorative lines */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-1/2 left-0 w-full h-[1px]"
                    style={{
                        background: 'linear-gradient(90deg, transparent 10%, rgba(0, 212, 170, 0.1) 50%, transparent 90%)',
                    }}
                />
            </div>

            {/* CTA Content */}
            <motion.div
                className="text-center relative z-10"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1, ease: 'easeOut' }}
            >
                {/* Badge */}
                <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                    style={{
                        background: 'rgba(0, 255, 163, 0.1)',
                        border: '1px solid rgba(0, 255, 163, 0.3)',
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse" />
                    <span className="text-[#00ffa3] text-sm font-medium uppercase tracking-wider">
                        Live Demo
                    </span>
                </motion.div>

                {/* Main heading with gradient */}
                <motion.h2
                    className="text-5xl md:text-7xl font-bold mb-6"
                    style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #00a8ff 50%, #00ffa3 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    Ready to Automate?
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                    className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    Watch our AI agents build production-ready MCP tools in real-time.
                    <span className="text-[#00ffa3]"> No code required.</span>
                </motion.p>

                {/* Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                >
                    <Link href="/demo/mcp-builder">
                        <motion.button
                            className="relative px-14 py-6 rounded-2xl font-bold text-xl overflow-hidden group cursor-pointer"
                            style={{
                                background: 'linear-gradient(135deg, #00a8ff 0%, #00d4aa 50%, #7c3aed 100%)',
                                boxShadow: '0 0 40px rgba(0, 212, 170, 0.4), 0 0 80px rgba(124, 58, 237, 0.2)',
                                border: '1px solid rgba(0, 212, 170, 0.5)'
                            }}
                            whileHover={{
                                scale: 1.05,
                                boxShadow: '0 0 60px rgba(0, 212, 170, 0.6), 0 0 120px rgba(124, 58, 237, 0.4)'
                            }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                            <span className="relative z-10 text-white flex items-center gap-4">
                                <span>Experience MCP Factory</span>
                                <motion.span
                                    animate={{ x: [0, 8, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-2xl"
                                >
                                    →
                                </motion.span>
                            </span>

                            {/* Shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                initial={{ x: '-100%' }}
                                animate={{ x: ['−100%', '200%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                            />

                            {/* Inner glow */}
                            <div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                                style={{
                                    boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.2)'
                                }}
                            />
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                    className="mt-10 flex items-center justify-center gap-8 text-white/30 text-sm"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 }}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#00ffa3]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        No signup required
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#00ffa3]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Instant results
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#00ffa3]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Free to try
                    </span>
                </motion.div>
            </motion.div>
        </section>
    )
}
