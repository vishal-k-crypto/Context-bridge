'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import MagneticButton from '@/components/ui/MagneticButton'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">

            {/* Large 404 Background */}
            <motion.div
                className="absolute text-[40vw] font-bold text-white/[0.02] pointer-events-none select-none leading-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                404
            </motion.div>

            {/* Content */}
            <motion.div
                className="z-10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                    Page not found
                </h1>

                <p className="text-lg text-white/40 mb-12 max-w-md mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <MagneticButton className="btn-primary pointer-events-auto">
                    <Link href="/">
                        Back to Home
                    </Link>
                </MagneticButton>
            </motion.div>

            {/* Footer */}
            <div className="absolute bottom-8 text-xs text-white/20">
                Context Bridge
            </div>
        </div>
    )
}
