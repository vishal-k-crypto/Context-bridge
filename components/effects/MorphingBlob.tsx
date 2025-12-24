'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function MorphingBlob() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Primary blob */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full opacity-30"
                style={{
                    background: 'radial-gradient(circle, rgba(0,168,255,0.4) 0%, rgba(124,58,237,0.2) 50%, transparent 70%)',
                    filter: 'blur(80px)',
                    left: '50%',
                    top: '50%',
                    x: '-50%',
                    y: '-50%',
                }}
                animate={{
                    scale: [1, 1.2, 1.1, 1.3, 1],
                    x: ['-50%', '-45%', '-55%', '-48%', '-50%'],
                    y: ['-50%', '-45%', '-52%', '-48%', '-50%'],
                    rotate: [0, 45, 90, 45, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Secondary blob */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(0,255,163,0.3) 0%, rgba(0,168,255,0.1) 50%, transparent 70%)',
                    filter: 'blur(60px)',
                    right: '20%',
                    bottom: '20%',
                }}
                animate={{
                    scale: [1, 1.3, 1, 1.2, 1],
                    x: [0, 50, -30, 20, 0],
                    y: [0, -40, 30, -20, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Tertiary accent blob */}
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full opacity-15"
                style={{
                    background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 60%)',
                    filter: 'blur(50px)',
                    left: '10%',
                    top: '30%',
                }}
                animate={{
                    scale: [1, 1.4, 1.1, 1.3, 1],
                    rotate: [0, -90, -180, -90, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        </div>
    )
}
