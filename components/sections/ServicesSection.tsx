'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const services = [
    {
        number: '01',
        title: 'Data Integration',
        description: 'Connect every tool in your stack. APIs, databases, spreadsheets - unified into one source of truth.',
        features: ['API Development', 'ETL Pipelines', 'Real-time Sync']
    },
    {
        number: '02',
        title: 'AI Automation',
        description: 'Deploy intelligent agents that handle customer support, data analysis, and decision making.',
        features: ['LLM Integration', 'Custom Agents', 'Voice AI']
    },
    {
        number: '03',
        title: 'Workflow Design',
        description: 'Build systems that run your operations while you focus on what matters.',
        features: ['Process Mapping', 'n8n/Make', 'Custom Logic']
    }
]

export default function ServicesSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    })

    return (
        <section
            ref={containerRef}
            className="relative py-40 overflow-hidden"
            id="section-services"
        >
            {/* Section header */}
            <div className="max-w-7xl mx-auto px-8 md:px-20 mb-24">
                <motion.p
                    className="text-sm tracking-[0.3em] text-[var(--accent)] uppercase mb-6 syne"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    What We Build
                </motion.p>
                <motion.h2
                    className="text-5xl md:text-7xl leading-[1.1]"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                >
                    The bridges we
                    <span className="italic text-[var(--accent)]"> construct</span>
                </motion.h2>
            </div>

            {/* Services grid */}
            <div className="max-w-7xl mx-auto px-8 md:px-20">
                <div className="space-y-1">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            className="group"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="border-t border-[var(--text-muted)]/20 py-12 md:py-16 flex flex-col md:flex-row md:items-start gap-8 cursor-pointer transition-all duration-500 hover:bg-[var(--accent-subtle)] hover:px-8 rounded-lg">

                                {/* Number */}
                                <div className="text-sm text-[var(--text-muted)] syne tracking-widest md:w-24">
                                    {service.number}
                                </div>

                                {/* Title */}
                                <div className="md:w-1/3">
                                    <h3 className="text-3xl md:text-4xl group-hover:text-[var(--accent)] transition-colors">
                                        {service.title}
                                    </h3>
                                </div>

                                {/* Description */}
                                <div className="md:w-1/3 text-[var(--text-secondary)] leading-relaxed">
                                    {service.description}
                                </div>

                                {/* Features */}
                                <div className="md:w-1/4 flex flex-wrap gap-2">
                                    {service.features.map((feature, i) => (
                                        <span
                                            key={i}
                                            className="text-xs px-3 py-1 rounded-full border border-[var(--text-muted)]/30 text-[var(--text-muted)] syne"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
