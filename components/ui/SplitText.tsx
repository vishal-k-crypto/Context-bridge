'use client'

import { motion } from 'framer-motion'

interface SplitTextProps {
    text: string
    className?: string
    delay?: number
}

export default function SplitText({ text, className = '', delay = 0 }: SplitTextProps) {
    const words = text.split(' ')

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: delay },
        }),
    }

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 50,
        },
    }

    return (
        <motion.span
            className={className}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
        >
            {words.map((word, index) => (
                <motion.span
                    variants={child}
                    key={index}
                    className="inline-block mr-[0.25em]"
                >
                    {word}
                </motion.span>
            ))}
        </motion.span>
    )
}
