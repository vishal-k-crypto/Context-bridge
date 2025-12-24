'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const automationSteps = [
    {
        id: 1,
        title: 'Data Input',
        description: 'Raw data streams in from multiple sources',
        icon: '📥',
        color: '#00a8ff'
    },
    {
        id: 2,
        title: 'AI Processing',
        description: 'LLM agents analyze and categorize',
        icon: '🧠',
        color: '#7c3aed'
    },
    {
        id: 3,
        title: 'Decision Engine',
        description: 'Logic gates route data to actions',
        icon: '⚙️',
        color: '#00ffa3'
    },
    {
        id: 4,
        title: 'Execution',
        description: 'Automated actions fire across systems',
        icon: '⚡',
        color: '#ff6b6b'
    },
    {
        id: 5,
        title: 'Output',
        description: 'Results delivered in real-time',
        icon: '📤',
        color: '#00a8ff'
    }
]

export default function AutomationFlow() {
    const [activeStep, setActiveStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const playSequence = () => {
        if (isPlaying) return
        setIsPlaying(true)
        setActiveStep(0)

        automationSteps.forEach((_, index) => {
            setTimeout(() => {
                setActiveStep(index)
                if (index === automationSteps.length - 1) {
                    setTimeout(() => {
                        setIsPlaying(false)
                    }, 1000)
                }
            }, index * 800)
        })
    }

    return (
        <section className="min-h-screen flex flex-col items-center justify-center py-32 px-8">
            <div className="text-center mb-16">
                <span className="text-xs font-bold text-[#00ffa3] mb-4 uppercase tracking-[0.3em] block">
                    Live Demo
                </span>
                <h2 className="text-5xl md:text-7xl font-bold mb-4">See It In Action</h2>
                <p className="text-white/40 max-w-xl mx-auto">
                    Watch how data flows through our automation pipeline in real-time
                </p>
            </div>

            {/* Flow Visualization */}
            <div className="relative w-full max-w-5xl">
                {/* Connection Lines */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2 z-0">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#00a8ff] via-[#7c3aed] to-[#00ffa3]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(activeStep / (automationSteps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>

                {/* Steps */}
                <div className="flex justify-between relative z-10">
                    {automationSteps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            className="flex flex-col items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {/* Node */}
                            <motion.div
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl cursor-pointer transition-all duration-300 ${index <= activeStep ? 'bg-black' : 'bg-white/5'
                                    }`}
                                style={{
                                    border: index <= activeStep ? `2px solid ${step.color}` : '2px solid transparent',
                                    boxShadow: index === activeStep ? `0 0 40px ${step.color}40` : 'none'
                                }}
                                onClick={() => setActiveStep(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {step.icon}
                            </motion.div>

                            {/* Label */}
                            <div className="mt-4 text-center">
                                <div className={`font-bold transition-colors ${index <= activeStep ? 'text-white' : 'text-white/30'
                                    }`}>
                                    {step.title}
                                </div>
                                <AnimatePresence>
                                    {index === activeStep && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-sm text-white/50 mt-2 max-w-[150px]"
                                        >
                                            {step.description}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Play Button */}
            <motion.button
                onClick={playSequence}
                className="mt-16 px-8 py-4 bg-gradient-to-r from-[#00a8ff] to-[#7c3aed] rounded-full font-bold uppercase tracking-widest text-sm pointer-events-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isPlaying}
            >
                {isPlaying ? 'Processing...' : 'Run Automation'}
            </motion.button>

            {/* Data Particles Animation */}
            <AnimatePresence>
                {isPlaying && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    background: automationSteps[activeStep]?.color || '#00a8ff',
                                    left: `${10 + (activeStep / automationSteps.length) * 80}%`,
                                    top: '50%',
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                    x: (Math.random() - 0.5) * 200,
                                    y: (Math.random() - 0.5) * 200,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 1,
                                    delay: i * 0.05,
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </section>
    )
}
