'use client'

import { useRef, useEffect, useState, Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamic import for 3D components
const CircuitBoard = dynamic(() => import('@/components/canvas/CircuitBoard'), { ssr: false })

// Dynamic import for the UI component
const MCPBuilderUI = dynamic(() => import('@/components/demo/MCPBuilderUI'), { ssr: false })

export default function MCPBuilderPage() {
    const [intensity, setIntensity] = useState(0.5)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleIntensityChange = useCallback((newIntensity: number) => {
        setIntensity(newIntensity)
    }, [])

    return (
        <div className="min-h-screen bg-[#030712] relative overflow-hidden">
            {/* Background gradient */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: `
            radial-gradient(ellipse at 20% 30%, rgba(0, 255, 163, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(124, 58, 237, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 168, 255, 0.05) 0%, transparent 70%)
          `
                }}
            />

            {/* 3D Background */}
            {mounted && (
                <div className="fixed inset-0 pointer-events-none">
                    <Canvas
                        camera={{ position: [0, 0, 5], fov: 60 }}
                        gl={{ antialias: true, alpha: true }}
                    >
                        <ambientLight intensity={0.2} />
                        <Suspense fallback={null}>
                            <CircuitBoard
                                position={[0, 0, -2]}
                                scale={1.5}
                                intensity={intensity}
                            />
                        </Suspense>
                    </Canvas>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="px-8 py-6 flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-white/50 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <span>←</span>
                        <span>Back to Home</span>
                    </Link>

                    <motion.div
                        className="text-sm text-white/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Powered by HelperMCP
                    </motion.div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full"
                    >
                        {/* Title Section */}
                        <div className="text-center mb-12">
                            <motion.span
                                className="text-xs font-bold text-[#00ffa3] uppercase tracking-[0.3em] block mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Live Demo
                            </motion.span>

                            <motion.h1
                                className="text-4xl md:text-6xl font-bold mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                                    Meet Your
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-[#00ffa3] via-[#00a8ff] to-[#7c3aed] bg-clip-text text-transparent">
                                    AI Employee
                                </span>
                            </motion.h1>

                            <motion.p
                                className="text-white/40 max-w-lg mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Enter a service name or describe your goal, and watch as our AI agents
                                build a production-ready MCP server in real-time.
                            </motion.p>
                        </div>

                        {/* Builder UI */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            {mounted && (
                                <MCPBuilderUI onIntensityChange={handleIntensityChange} />
                            )}
                        </motion.div>

                        {/* Info Section */}
                        <motion.div
                            className="mt-12 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-6 text-white/30 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse" />
                                    <span>Scout Agent</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                                    <span>Architect Agent</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#00a8ff]" />
                                    <span>Coder Agent</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </main>

                {/* Footer */}
                <footer className="px-8 py-6 text-center text-white/20 text-sm">
                    <p>
                        Generated servers are FastMCP-compliant and ready for Claude, GPT, or any AI assistant.
                    </p>
                </footer>
            </div>

            {/* Floating particles effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {mounted && Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-[#00ffa3]/30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
