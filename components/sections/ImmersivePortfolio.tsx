'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

const projects = [
    {
        id: 1,
        title: 'FinTech Data Pipeline',
        category: 'Data Integration',
        description: 'Processed 50M+ records daily for a Series B startup',
        stats: { records: '50M+', uptime: '99.99%', latency: '<50ms' },
        color: '#00a8ff',
        gradient: 'from-[#00a8ff] to-[#0066ff]'
    },
    {
        id: 2,
        title: 'AI Customer Support',
        category: 'LLM Agents',
        description: 'Autonomous support handling 10k tickets daily',
        stats: { tickets: '10k/day', resolution: '94%', savings: '$2M/yr' },
        color: '#7c3aed',
        gradient: 'from-[#7c3aed] to-[#5b21b6]'
    },
    {
        id: 3,
        title: 'E-Commerce Automation',
        category: 'Workflow',
        description: 'End-to-end order processing and fulfillment',
        stats: { orders: '100k+', time: '-80%', errors: '0.01%' },
        color: '#00ffa3',
        gradient: 'from-[#00ffa3] to-[#00cc82]'
    }
]

export default function ImmersivePortfolio() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    })

    return (
        <section
            ref={containerRef}
            className="relative"
            style={{ height: `${projects.length * 100}vh` }}
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
                    />
                )
            })}
        </section>
    )
}

function ProjectCard({ project, index, progress, start, end }: any) {
    const opacity = useTransform(progress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0])
    const scale = useTransform(progress, [start, start + 0.1, end - 0.1, end], [0.8, 1, 1, 0.8])
    const y = useTransform(progress, [start, end], ['20%', '-20%'])

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity }}
        >
            <motion.div
                className="w-full max-w-6xl mx-8 pointer-events-auto"
                style={{ scale, y }}
            >
                {/* Card */}
                <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${project.color}10, transparent)` }}
                >
                    {/* Border glow */}
                    <div
                        className="absolute inset-0 rounded-3xl"
                        style={{
                            border: `1px solid ${project.color}30`,
                            boxShadow: `0 0 100px ${project.color}20`
                        }}
                    />

                    <div className="relative z-10 p-12 md:p-20">
                        <div className="flex flex-col md:flex-row gap-12">

                            {/* Left: Info */}
                            <div className="flex-1">
                                <span className="text-xs uppercase tracking-widest text-white/40 mb-4 block">
                                    {String(index + 1).padStart(2, '0')} / {project.category}
                                </span>

                                <h3
                                    className="text-4xl md:text-6xl font-bold mb-6"
                                    style={{ color: project.color }}
                                >
                                    {project.title}
                                </h3>

                                <p className="text-xl text-white/60 mb-10 max-w-md">
                                    {project.description}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-8">
                                    {Object.entries(project.stats).map(([key, value]) => (
                                        <div key={key}>
                                            <div className="text-3xl font-bold text-white">{value as string}</div>
                                            <div className="text-xs uppercase tracking-widest text-white/30">{key}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Visual */}
                            <div className="flex-1 flex items-center justify-center">
                                <div
                                    className="w-64 h-64 rounded-full flex items-center justify-center"
                                    style={{
                                        background: `radial-gradient(circle, ${project.color}40 0%, transparent 70%)`,
                                    }}
                                >
                                    <div
                                        className="w-32 h-32 rounded-full animate-pulse"
                                        style={{
                                            background: project.color,
                                            boxShadow: `0 0 60px ${project.color}`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
