'use client'

import { motion } from 'framer-motion'

export default function ContactSection() {
    return (
        <section
            className="relative py-40 overflow-hidden"
            id="section-contact"
        >
            {/* Background */}
            <div className="absolute inset-0">
                <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, var(--accent) 0%, transparent 60%)',
                        filter: 'blur(150px)',
                        opacity: 0.15
                    }}
                />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
                {/* Eyebrow */}
                <motion.p
                    className="text-sm tracking-[0.3em] text-[var(--accent)] uppercase mb-8 syne"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Start Your Project
                </motion.p>

                {/* Main heading */}
                <motion.h2
                    className="text-6xl md:text-[10vw] leading-[0.9] mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                >
                    Let&apos;s build your
                    <span className="block italic text-[var(--accent)]">bridge</span>
                </motion.h2>

                {/* Description */}
                <motion.p
                    className="text-xl text-[var(--text-secondary)] max-w-xl mx-auto mb-16 leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    Ready to automate what holds you back? Let&apos;s talk about
                    building systems that scale.
                </motion.p>

                {/* CTA */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <a
                        href="mailto:hello@contextbridge.io"
                        className="btn-primary pointer-events-auto"
                    >
                        <span>Get in Touch</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </a>

                    <a
                        href="mailto:hello@contextbridge.io"
                        className="text-lg text-[var(--text-secondary)] hover:text-white transition-colors pointer-events-auto"
                    >
                        hello@contextbridge.io
                    </a>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 right-0 px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-muted)] syne tracking-widest">
                    <span>© {new Date().getFullYear()} Context Bridge</span>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors pointer-events-auto">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors pointer-events-auto">LinkedIn</a>
                        <a href="#" className="hover:text-white transition-colors pointer-events-auto">GitHub</a>
                    </div>
                </div>
            </div>
        </section>
    )
}
