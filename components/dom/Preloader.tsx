'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(() => setIsLoading(false), 400)
                    return 100
                }
                return prev + Math.random() * 20
            })
        }, 80)

        return () => clearInterval(interval)
    }, [])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl font-bold tracking-tight mb-8"
                    >
                        <span className="text-white">Context</span>
                        <span className="text-white/40">Bridge</span>
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="w-48 h-[1px] bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-white"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 0.2 }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
