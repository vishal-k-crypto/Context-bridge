'use client'

import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface HorizontalScrollProps {
    children: React.ReactNode
}

export default function HorizontalScroll({ children }: HorizontalScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    })

    const x = useTransform(scrollYProgress, [0, 1], ['0%', '-66.666%'])

    return (
        <section
            ref={containerRef}
            className="relative h-[300vh]" // 3x viewport height for scroll space
        >
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <motion.div
                    className="flex gap-8 pl-20"
                    style={{ x }}
                >
                    {children}
                </motion.div>
            </div>
        </section>
    )
}
