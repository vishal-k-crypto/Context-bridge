'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface GlitchTextProps {
    text: string
    className?: string
}

export default function GlitchText({ text, className = '' }: GlitchTextProps) {
    const [isGlitching, setIsGlitching] = useState(false)

    useEffect(() => {
        // Random glitch intervals
        const glitchInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                setIsGlitching(true)
                setTimeout(() => setIsGlitching(false), 200)
            }
        }, 3000)

        return () => clearInterval(glitchInterval)
    }, [])

    return (
        <span className={`relative inline-block ${className}`}>
            {/* Main text */}
            <span className="relative z-10">{text}</span>

            {/* Glitch layers */}
            {isGlitching && (
                <>
                    <motion.span
                        className="absolute top-0 left-0 text-[#00a8ff] z-20"
                        style={{ clipPath: 'inset(0 0 50% 0)' }}
                        animate={{ x: [-2, 2, -2], opacity: [1, 0.8, 1] }}
                        transition={{ duration: 0.1, repeat: 2 }}
                    >
                        {text}
                    </motion.span>
                    <motion.span
                        className="absolute top-0 left-0 text-[#ff0080] z-20"
                        style={{ clipPath: 'inset(50% 0 0 0)' }}
                        animate={{ x: [2, -2, 2], opacity: [1, 0.8, 1] }}
                        transition={{ duration: 0.1, repeat: 2 }}
                    >
                        {text}
                    </motion.span>
                </>
            )}
        </span>
    )
}
