'use client'

import { motion } from 'framer-motion'
import MagneticButton from '@/components/ui/MagneticButton'

export default function ImmersiveContact() {
    return (
        <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
            id="section-contact"
            data-section="contact"
        >
            {/* Subtle gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00a8ff] rounded-full blur-[200px] opacity-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7c3aed] rounded-full blur-[200px] opacity-10" />

            {/* Content */}
            <div className="relative z-10 text-center max-w-3xl mx-auto px-8">
                <motion.span
                    className="text-xs uppercase tracking-[0.3em] text-white/30 mb-8 block"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Ready to automate?
                </motion.span>

                <motion.h2
                    className="text-5xl md:text-7xl font-bold mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    Let&apos;s talk.
                </motion.h2>

                <motion.p
                    className="text-lg text-white/40 mb-12 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    Ready to 10x your operations? Let&apos;s discuss what&apos;s possible.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                >
                    <MagneticButton className="pointer-events-auto">
                        <a
                            href="mailto:contact@contextbridge.systems"
                            className="block px-8 py-4 bg-white text-black font-medium rounded-full hover:scale-105 transition-transform"
                        >
                            Start a Project
                        </a>
                    </MagneticButton>

                    <a
                        href="mailto:contact@contextbridge.systems"
                        className="text-white/50 hover:text-white transition-colors pointer-events-auto"
                    >
                        contact@contextbridge.systems
                    </a>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 w-full px-8 flex justify-between text-xs text-white/20">
                <span>© {new Date().getFullYear()} Context Bridge</span>
                <span>All Systems Nominal</span>
            </div>
        </section>
    )
}
