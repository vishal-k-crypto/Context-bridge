'use client'

import { useLenis } from 'lenis/react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navigation() {
    const lenis = useLenis()
    const [isOpen, setIsOpen] = useState(false)

    const scrollTo = (target: string) => {
        lenis?.scrollTo(target, { duration: 2 })
        setIsOpen(false)
    }

    const links = [
        { label: 'About', target: '#section-about' },
        { label: 'Services', target: '#section-services' },
        { label: 'Work', target: '#section-work' },
        { label: 'Contact', target: '#section-contact' },
    ]

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-8 flex justify-between items-center pointer-events-none">
                {/* Logo */}
                <motion.div
                    className="pointer-events-auto cursor-pointer"
                    onClick={() => scrollTo('top')}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-lg syne tracking-tight">
                        Context<span className="text-[var(--accent)]">Bridge</span>
                    </span>
                </motion.div>

                {/* Desktop Links */}
                <motion.div
                    className="hidden md:flex items-center gap-10 pointer-events-auto"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    {links.slice(0, -1).map((link) => (
                        <button
                            key={link.label}
                            onClick={() => scrollTo(link.target)}
                            className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors syne tracking-wide"
                        >
                            {link.label}
                        </button>
                    ))}

                    <button
                        onClick={() => scrollTo('#section-contact')}
                        className="px-5 py-2.5 bg-[var(--accent)] rounded-full text-sm syne tracking-wide hover:opacity-90 transition-opacity"
                    >
                        Contact
                    </button>
                </motion.div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden pointer-events-auto w-10 h-10 flex flex-col justify-center items-center gap-1.5"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <motion.span
                        className="w-6 h-[1px] bg-white block"
                        animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 4 : 0 }}
                    />
                    <motion.span
                        className="w-6 h-[1px] bg-white block"
                        animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -4 : 0 }}
                    />
                </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {links.map((link, i) => (
                            <motion.button
                                key={link.label}
                                onClick={() => scrollTo(link.target)}
                                className="text-4xl hover:text-[var(--accent)] transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                {link.label}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
