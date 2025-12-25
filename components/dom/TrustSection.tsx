'use client'

import { motion } from 'framer-motion'

export default function TrustSection() {
    // Placeholder logos - Replace with actual client logos
    const logos = [
        { name: 'TechCorp', placeholder: 'TECHCORP' },
        { name: 'DataFlow', placeholder: 'DATAFLOW' },
        { name: 'AIVentures', placeholder: 'AIVENTURES' },
        { name: 'CloudScale', placeholder: 'CLOUDSCALE' },
        { name: 'AutomateX', placeholder: 'AUTOMATEX' },
        { name: 'SyncLabs', placeholder: 'SYNCLABS' },
    ]

    return (
        <section className="py-40 border-b border-white/5 overflow-hidden" data-section="trust">
            <div className="text-center mb-12">
                <span className="text-xs text-white/30 uppercase tracking-[0.3em]">
                    Trusted By Industry Leaders
                </span>
            </div>

            {/* Infinite scrolling logos */}
            <div className="relative">
                <motion.div
                    className="flex gap-16 items-center"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: 'loop',
                            duration: 20,
                            ease: 'linear',
                        },
                    }}
                >
                    {/* Duplicate logos for seamless loop */}
                    {[...logos, ...logos, ...logos].map((logo, index) => (
                        <div
                            key={index}
                            className="text-2xl font-bold text-white/10 hover:text-white/30 transition-colors whitespace-nowrap"
                        >
                            {logo.placeholder}
                        </div>
                    ))}
                </motion.div>

                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none" />
            </div>

            {/* Badges */}
            <div className="flex justify-center gap-8 mt-16">
                <div className="px-4 py-2 border border-white/10 rounded-full text-xs text-white/30 uppercase tracking-widest">
                    SOC 2 Compliant
                </div>
                <div className="px-4 py-2 border border-white/10 rounded-full text-xs text-white/30 uppercase tracking-widest">
                    GDPR Ready
                </div>
                <div className="px-4 py-2 border border-white/10 rounded-full text-xs text-white/30 uppercase tracking-widest">
                    ISO 27001
                </div>
            </div>
        </section>
    )
}
