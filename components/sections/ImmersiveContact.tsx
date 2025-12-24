'use client'

import { motion } from 'framer-motion'
import MagneticButton from '@/components/ui/MagneticButton'

export default function ImmersiveContact() {
    return (
        <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
            id="section-contact"
        >
            {/* Background text */}
            <motion.div
                className="absolute text-[25vw] font-bold text-white/[0.02] leading-none whitespace-nowrap"
                animate={{ x: [0, -500] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
                LET&apos;S BUILD • LET&apos;S BUILD • LET&apos;S BUILD •
            </motion.div>

            {/* Gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00a8ff] rounded-full blur-[150px] opacity-20" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7c3aed] rounded-full blur-[150px] opacity-20" />

            {/* Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
                <motion.span
                    className="text-xs uppercase tracking-[0.3em] text-white/30 mb-8 block"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Ready to automate?
                </motion.span>

                <motion.h2
                    className="text-6xl md:text-9xl font-bold mb-8"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    Let&apos;s <span className="gradient-text">Build</span>
                </motion.h2>

                <motion.p
                    className="text-xl text-white/40 mb-12 max-w-xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    Ready to 10x your operations? Let&apos;s have a conversation about
                    what&apos;s possible.
                </motion.p>

                <motion.div
                    className="flex flex-col md:flex-row gap-6 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                >
                    <MagneticButton className="pointer-events-auto">
                        <a
                            href="mailto:hello@agency.os"
                            className="block px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-transform"
                        >
                            Start a Project
                        </a>
                    </MagneticButton>

                    <a
                        href="mailto:hello@agency.os"
                        className="text-2xl text-white/50 hover:text-white transition-colors animated-underline pointer-events-auto"
                    >
                        hello@agency.os
                    </a>
                </motion.div>

                {/* Social links */}
                <motion.div
                    className="mt-20 flex justify-center gap-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                >
                    {['Twitter', 'LinkedIn', 'GitHub'].map((platform) => (
                        <a
                            key={platform}
                            href="#"
                            className="text-xs uppercase tracking-widest text-white/30 hover:text-white transition-colors pointer-events-auto"
                        >
                            {platform}
                        </a>
                    ))}
                </motion.div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 w-full px-8 flex justify-between text-xs text-white/20 uppercase tracking-widest">
                <span>© {new Date().getFullYear()} Agency OS</span>
                <span>All Systems Nominal</span>
            </div>
        </section>
    )
}
