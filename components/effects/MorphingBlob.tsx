'use client'

import { motion } from 'framer-motion'

export default function MorphingBlob() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-500"
            style={{
                // Sync blob opacity with global background opacity
                opacity: 'calc(var(--bg-opacity, 1) * 0.8)',
                // Add subtle blur when background is blurred
                filter: 'blur(calc(var(--bg-blur, 0px) * 0.3))',
            }}
        >
            {/* Primary blob */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full"
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
                className="absolute w-[600px] h-[600px] rounded-full"
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
                className="absolute w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    left: '-5%',
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
