'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const projects = [
    {
        id: 1,
        title: 'FinTech Data Pipeline',
        category: 'Data Integration',
        description: 'Processed 50M+ records daily for a Series B startup',
        stats: { records: '50M+', uptime: '99.99%', latency: '<50ms' },
        color: '#00a8ff',
    },
    {
        id: 2,
        title: 'AI Customer Support',
        category: 'LLM Agents',
        description: 'Autonomous support handling 10k tickets daily',
        stats: { tickets: '10k/day', resolution: '94%', savings: '$2M/yr' },
        color: '#7c3aed',
    },
    {
        id: 3,
        title: 'E-Commerce Automation',
        category: 'Workflow',
        description: 'End-to-end order processing and fulfillment',
        stats: { orders: '100k+', time: '-80%', errors: '0.01%' },
        color: '#00ffa3',
    }
]

export default function ImmersivePortfolio() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'] // Track when section is in viewport
    })

    return (
        <section
            ref={containerRef}
            className="relative"
            style={{ height: `${projects.length * 70}vh` }} // Reduced to 70vh for tighter transitions
            data-section="portfolio"
        >
            {projects.map((project, index) => {
                const start = index / projects.length
                const end = (index + 1) / projects.length

                return (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        index={index}
                        progress={scrollYProgress}
                        start={start}
                        end={end}
                        total={projects.length}
                    />
                )
            })}
        </section>
    )
}

function ProjectCard({ project, index, progress, start, end, total }: any) {
    // Cards distributed across 0-0.9 of scroll range (leave 0.1 at end for transition)
    const rangeStart = 0
    const rangeEnd = 0.9
    const rangeSpan = rangeEnd - rangeStart

    const adjustedStart = rangeStart + (index * rangeSpan / total)
    const adjustedEnd = rangeStart + ((index + 1) * rangeSpan / total)

    // First card appears immediately, no fade-in
    const isFirst = index === 0

    const opacity = useTransform(
        progress,
        isFirst
            ? [0, 0.01, adjustedEnd - 0.02, adjustedEnd]
            : [adjustedStart, adjustedStart + 0.02, adjustedEnd - 0.02, adjustedEnd],
        [0, 1, 1, 0]
    )
    const scale = useTransform(
        progress,
        isFirst
            ? [0, 0.01, adjustedEnd - 0.02, adjustedEnd]
            : [adjustedStart, adjustedStart + 0.02, adjustedEnd - 0.02, adjustedEnd],
        [0.95, 1, 1, 0.95]
    )

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity }}
        >
            <motion.div
                className="w-full max-w-5xl mx-8 pointer-events-auto"
                style={{ scale }}
            >
                {/* Card with backdrop for readability */}
                <div
                    className="relative rounded-3xl overflow-hidden backdrop-blur-xl"
                    style={{
                        background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))`,
                        border: `1px solid ${project.color}20`
                    }}
                >
                    <div className="relative z-10 p-12 md:p-16">
                        <div className="flex flex-col md:flex-row gap-12">

                            {/* Left: Info */}
                            <div className="flex-1">
                                <span className="text-xs uppercase tracking-widest text-white/50 mb-4 block">
                                    {String(index + 1).padStart(2, '0')} / {project.category}
                                </span>

                                <h3
                                    className="text-4xl md:text-5xl font-bold mb-6"
                                    style={{ color: project.color }}
                                >
                                    {project.title}
                                </h3>

                                <p className="text-lg text-white/60 mb-10 max-w-md">
                                    {project.description}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-6">
                                    {Object.entries(project.stats).map(([key, value]) => (
                                        <div key={key}>
                                            <div className="text-2xl font-bold text-white">{value as string}</div>
                                            <div className="text-xs uppercase tracking-widest text-white/40">{key}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Visual accent */}
                            <div className="flex-1 flex items-center justify-center">
                                <div
                                    className="w-40 h-40 rounded-full opacity-60"
                                    style={{
                                        background: `radial-gradient(circle, ${project.color}60 0%, transparent 70%)`,
                                        filter: 'blur(40px)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
