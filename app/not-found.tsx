'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import TextScramble from '@/components/ui/TextScramble'
import MagneticButton from '@/components/ui/MagneticButton'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">

            {/* Large 404 Background */}
            <motion.div
                className="absolute text-[50vw] font-bold text-white/[0.02] pointer-events-none select-none leading-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
            >
                404
            </motion.div>

            {/* Glitch lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[#00a8ff] to-transparent"
                        style={{ top: `${20 + i * 15}%` }}
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{
                            x: ['100%', '-100%'],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 3,
                            delay: i * 0.5,
                            repeat: Infinity,
                            repeatDelay: 2
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <motion.div
                className="z-10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                <div className="text-xs text-[#00a8ff] uppercase tracking-[0.3em] mb-4">
                    System Error
                </div>

                <h1 className="text-6xl md:text-8xl font-bold mb-6">
                    <TextScramble text="LOST IN THE MATRIX" className="gradient-text" scrambleOnHover={false} />
                </h1>

                <p className="text-xl text-white/40 mb-12 max-w-md mx-auto">
                    The automation you&apos;re looking for has been relocated or doesn&apos;t exist in this dimension.
                </p>

                <MagneticButton className="btn-primary pointer-events-auto">
                    <Link href="/">
                        Return to Base
                    </Link>
                </MagneticButton>
            </motion.div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-xs text-white/20 uppercase tracking-widest">
                Error Code: AUTOMATION_NOT_FOUND
            </div>
        </div>
    )
}
