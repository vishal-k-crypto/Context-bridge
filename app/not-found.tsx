'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative">
            {/* Background */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at center, var(--accent-subtle) 0%, transparent 50%)'
                }}
            />

            {/* Content */}
            <motion.div
                className="relative z-10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="text-[20vw] font-light text-white/5 leading-none select-none">
                    404
                </div>

                <div className="mt-[-5vw]">
                    <h1 className="text-4xl md:text-6xl mb-6">
                        Bridge not found
                    </h1>

                    <p className="text-[var(--text-secondary)] text-lg mb-12 max-w-md mx-auto">
                        The connection you&apos;re looking for doesn&apos;t exist.
                    </p>

                    <Link
                        href="/"
                        className="btn-primary inline-flex pointer-events-auto"
                    >
                        <span>Return Home</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </Link>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="absolute bottom-8 text-xs text-[var(--text-muted)] syne tracking-widest">
                Context Bridge
            </div>
        </div>
    )
}
