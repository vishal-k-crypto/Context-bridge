'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true)
    const [count, setCount] = useState(0)

    useEffect(() => {
        // Count up animation
        const interval = setInterval(() => {
            setCount(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(() => setIsLoading(false), 300)
                    return 100
                }
                return prev + 2
            })
        }, 20)

        return () => clearInterval(interval)
    }, [])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
                    exit={{
                        clipPath: 'inset(0 0 100% 0)',
                        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                    }}
                >
                    {/* The bridge reveal */}
                    <div className="relative">
                        {/* Counter */}
                        <motion.div
                            className="text-8xl md:text-[12rem] font-light text-white/10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {String(count).padStart(3, '0')}
                        </motion.div>

                        {/* Brand */}
                        <motion.div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="text-sm tracking-[0.3em] text-[var(--text-muted)] syne uppercase">
                                Context Bridge
                            </span>
                        </motion.div>
                    </div>

                    {/* Progress line */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32">
                        <div className="h-[1px] bg-white/10 w-full">
                            <motion.div
                                className="h-full bg-[var(--accent)]"
                                style={{ width: `${count}%` }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
