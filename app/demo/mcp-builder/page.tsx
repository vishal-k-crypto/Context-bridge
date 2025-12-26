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
            {/* Enhanced background gradient */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse at 20% 20%, rgba(0, 255, 163, 0.12) 0%, transparent 40%),
                        radial-gradient(ellipse at 80% 80%, rgba(124, 58, 237, 0.1) 0%, transparent 40%),
                        radial-gradient(ellipse at 50% 50%, rgba(0, 168, 255, 0.06) 0%, transparent 50%)
                    `
                }}
            />

            {/* Animated grid overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 255, 163, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 163, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
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
                {/* Premium Header */}
                <header className="px-8 py-6 flex items-center justify-between">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 text-white/50 hover:text-white transition-all duration-300"
                    >
                        <motion.span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                            style={{
                                background: 'rgba(0, 255, 163, 0.1)',
                                border: '1px solid rgba(0, 255, 163, 0.2)',
                            }}
                            whileHover={{ scale: 1.1, x: -5 }}
                        >
                            ←
                        </motion.span>
                        <span className="group-hover:text-[#00ffa3] transition-colors">Back to Home</span>
                    </Link>

                    <motion.div
                        className="flex items-center gap-3 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse" />
                        <span className="text-white/50">Powered by</span>
                        <span className="text-[#00ffa3] font-medium">HelperMCP</span>
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
                            {/* Badge */}
                            <motion.div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                                style={{
                                    background: 'rgba(0, 255, 163, 0.1)',
                                    border: '1px solid rgba(0, 255, 163, 0.3)',
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse" />
                                <span className="text-[#00ffa3] text-sm font-medium uppercase tracking-wider">
                                    Live Demo
                                </span>
                            </motion.div>

                            <motion.h1
                                className="text-5xl md:text-7xl font-bold mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="text-white">
                                    Meet Your
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-[#00ffa3] via-[#00a8ff] to-[#7c3aed] bg-clip-text text-transparent">
                                    AI Employee
                                </span>
                            </motion.h1>

                            <motion.p
                                className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Enter a service name or describe your goal, and watch as our AI agents
                                build a <span className="text-[#00ffa3]">production-ready MCP server</span> in real-time.
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

                        {/* Agent Status Indicators */}
                        <motion.div
                            className="mt-12 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-8">
                                {[
                                    { name: 'Scout Agent', color: '#00ffa3', icon: '🔍' },
                                    { name: 'Architect Agent', color: '#7c3aed', icon: '🏗️' },
                                    { name: 'Coder Agent', color: '#00a8ff', icon: '⚡' },
                                ].map((agent, i) => (
                                    <motion.div
                                        key={agent.name}
                                        className="flex items-center gap-3 px-4 py-2 rounded-full"
                                        style={{
                                            background: `${agent.color}10`,
                                            border: `1px solid ${agent.color}30`,
                                        }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 + i * 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <span className="text-lg">{agent.icon}</span>
                                        <span className="text-white/60 text-sm">{agent.name}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </main>

                {/* Enhanced Footer */}
                <footer className="px-8 py-6">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        <p className="text-white/30 text-sm mb-4">
                            Generated servers are FastMCP-compliant and ready for Claude, GPT, or any AI assistant.
                        </p>
                        <div className="flex items-center justify-center gap-6 text-white/20 text-xs">
                            <span className="flex items-center gap-2">
                                <svg className="w-3 h-3 text-[#00ffa3]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Type-safe
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-3 h-3 text-[#00ffa3]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Production-ready
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-3 h-3 text-[#00ffa3]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                MCP 1.0 spec
                            </span>
                        </div>
                    </motion.div>
                </footer>
            </div>

            {/* Floating particles effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {mounted && Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: Math.random() * 3 + 1,
                            height: Math.random() * 3 + 1,
                            background: i % 3 === 0 ? '#00ffa3' : i % 3 === 1 ? '#00a8ff' : '#7c3aed',
                            opacity: 0.3,
                        }}
                        animate={{
                            y: [0, -80, 0],
                            opacity: [0.2, 0.6, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 6 + Math.random() * 6,
                            repeat: Infinity,
                            delay: Math.random() * 6,
                        }}
                    />
                ))}
            </div>

            {/* Subtle vignette */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)'
                }}
            />
        </div>
    )
}
