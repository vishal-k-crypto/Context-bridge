'use client'

import { motion } from 'framer-motion'

export default function FloatingTags() {
    const tags = [
        { text: 'AI', x: '10%', y: '20%', delay: 0 },
        { text: 'AUTOMATION', x: '85%', y: '15%', delay: 0.5 },
        { text: 'API', x: '75%', y: '75%', delay: 1 },
        { text: 'WORKFLOWS', x: '15%', y: '70%', delay: 1.5 },
        { text: 'LLM', x: '90%', y: '45%', delay: 2 },
        { text: 'SCALE', x: '5%', y: '45%', delay: 2.5 },
    ]

    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
            {tags.map((tag, index) => (
                <motion.div
                    key={index}
                    className="absolute text-xs text-white/10 font-mono uppercase tracking-widest"
                    style={{ left: tag.x, top: tag.y }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: [0, 0.3, 0.1, 0.3, 0],
                        y: [20, 0, -10, 0, 20],
                    }}
                    transition={{
                        duration: 8,
                        delay: tag.delay,
                        repeat: Infinity,
                        repeatDelay: 4,
                    }}
                >
                    {tag.text}
                </motion.div>
            ))}
        </div>
    )
}
