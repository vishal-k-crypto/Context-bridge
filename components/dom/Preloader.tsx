'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(() => setIsLoading(false), 500)
                    return 100
                }
                return prev + Math.random() * 15
            })
        }, 100)

        return () => clearInterval(interval)
    }, [])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-bold tracking-tighter mb-12"
                    >
                        AGENCY<span className="opacity-30">.OS</span>
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#00a8ff] via-[#7c3aed] to-[#00ffa3]"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Percentage */}
                    <motion.div
                        className="mt-4 text-sm text-white/40 font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {Math.floor(Math.min(progress, 100))}%
                    </motion.div>

                    {/* Status Text */}
                    <motion.div
                        className="absolute bottom-12 text-xs text-white/20 uppercase tracking-[0.3em]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Initializing Systems
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
