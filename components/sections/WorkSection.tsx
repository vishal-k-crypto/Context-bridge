'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

const projects = [
    {
        id: 1,
        title: 'FinTech Pipeline',
        client: 'Series B Startup',
        description: 'Real-time data processing handling 50M+ records daily with 99.99% uptime.',
        category: 'Data Integration',
        year: '2024',
        color: '#4f46e5'
    },
    {
        id: 2,
        title: 'AI Support Agent',
        client: 'E-commerce Platform',
        description: 'Autonomous customer support handling 10,000 tickets daily with 94% resolution rate.',
        category: 'AI Automation',
        year: '2024',
        color: '#06b6d4'
    },
    {
        id: 3,
        title: 'Operations Hub',
        client: 'SaaS Company',
        description: 'End-to-end workflow automation reducing manual work by 80%.',
        category: 'Workflow',
        year: '2023',
        color: '#8b5cf6'
    }
]

export default function WorkSection() {
    const [hoveredId, setHoveredId] = useState<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    return (
        <section
            ref={containerRef}
            className="relative py-40"
            id="section-work"
        >
            {/* Header */}
            <div className="max-w-7xl mx-auto px-8 md:px-20 mb-24">
                <motion.p
                    className="text-sm tracking-[0.3em] text-[var(--accent)] uppercase mb-6 syne"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Selected Work
                </motion.p>
                <motion.h2
                    className="text-5xl md:text-7xl leading-[1.1]"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                >
                    Bridges we&apos;ve
                    <span className="italic text-[var(--accent)]"> built</span>
                </motion.h2>
            </div>

            {/* Projects list */}
            <div className="max-w-7xl mx-auto px-8 md:px-20">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        className="border-t border-[var(--text-muted)]/20 last:border-b"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ delay: index * 0.1 }}
                        onMouseEnter={() => setHoveredId(project.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <div className="py-12 md:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer group relative overflow-hidden">

                            {/* Background glow on hover */}
                            <AnimatePresence>
                                {hoveredId === project.id && (
                                    <motion.div
                                        className="absolute inset-0 pointer-events-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            background: `radial-gradient(ellipse at center, ${project.color}10 0%, transparent 70%)`
                                        }}
                                    />
                                )}
                            </AnimatePresence>

                            {/* Left: Title & Client */}
                            <div className="relative z-10">
                                <div className="text-sm text-[var(--text-muted)] syne tracking-widest mb-2">
                                    {project.client}
                                </div>
                                <h3 className="text-4xl md:text-6xl group-hover:translate-x-4 transition-transform duration-500">
                                    {project.title}
                                </h3>
                            </div>

                            {/* Right: Meta */}
                            <div className="relative z-10 flex items-center gap-12">
                                <div className="hidden md:block text-[var(--text-secondary)] max-w-xs">
                                    {project.description}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-xs px-3 py-1 rounded-full border border-[var(--text-muted)]/30 text-[var(--text-muted)] syne">
                                        {project.category}
                                    </span>
                                    <span className="text-sm text-[var(--text-muted)] syne">
                                        {project.year}
                                    </span>
                                </div>

                                {/* Arrow */}
                                <motion.div
                                    className="w-12 h-12 rounded-full border border-[var(--text-muted)]/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 15L15 5M15 5H8M15 5V12" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
