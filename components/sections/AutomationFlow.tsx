'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const automationSteps = [
    {
        id: 1,
        title: 'Scout Agent',
        description: 'Discovers SDKs, scrapes docs, analyzes repositories',
        icon: '/icons/icon-scout.png',
        color: '#00a8ff'
    },
    {
        id: 2,
        title: 'Architect Agent',
        description: '3D scoring: LLM Utility × Determinism × Efficiency',
        icon: '/icons/icon-architect.png',
        color: '#7c3aed'
    },
    {
        id: 3,
        title: 'Coder Agent',
        description: 'Generates FastMCP-compliant Python code',
        icon: '/icons/icon-coder.png',
        color: '#00ffa3'
    },
    {
        id: 4,
        title: 'Sandbox',
        description: 'Docker verification with 3-strike certification',
        icon: '/icons/icon-sandbox.png',
        color: '#ff6b6b'
    },
    {
        id: 5,
        title: 'Registry',
        description: 'Certified tools deployed to semantic registry',
        icon: '/icons/icon-registry.png',
        color: '#ffd700'
    }
]

export default function AutomationFlow() {
    const containerRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)
    const [activeStep, setActiveStep] = useState(0)
    const [scrollProgress, setScrollProgress] = useState(0) // 0-1 overall progress
    const [particles, setParticles] = useState<{ id: number; x: number; color: string }[]>([])

    useEffect(() => {
        const container = containerRef.current
        const progress = progressRef.current
        if (!container || !progress) return

        // Create the scroll-driven animation
        const ctx = gsap.context(() => {
            // Pin the section and scrub the progress
            ScrollTrigger.create({
                trigger: container,
                start: 'center center',
                end: '+=120%', // Reduced from 200% for faster transitions
                pin: true,
                scrub: 0.5, // Near-instant response
                onUpdate: (self) => {
                    // Store raw progress for circular indicators
                    setScrollProgress(self.progress)

                    // Calculate which step we're on based on scroll progress
                    const stepProgress = self.progress * automationSteps.length
                    const currentStep = Math.min(Math.floor(stepProgress), automationSteps.length - 1)

                    // Update progress bar width - instant
                    const progressPercent = (stepProgress / automationSteps.length) * 100
                    progress.style.width = `${progressPercent}%`

                    // Update active step
                    setActiveStep(currentStep)

                    // Spawn particles at transition points
                    const stepFraction = stepProgress % 1
                    if (stepFraction > 0.4 && stepFraction < 0.6) {
                        const stepColor = automationSteps[currentStep]?.color || '#00a8ff'
                        const particleX = (currentStep / (automationSteps.length - 1)) * 100
                        setParticles(prev => {
                            if (prev.length > 15) return prev.slice(-10)
                            return [...prev, { id: Date.now() + Math.random(), x: particleX, color: stepColor }]
                        })
                    }
                }
            })
        }, container)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={containerRef}
            className="h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden"
            data-section="automation"
        >
            {/* Blur backdrop - focuses attention on the effect (behind everything) */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-[-1]"
                animate={{
                    backdropFilter: (scrollProgress > 0.05 && scrollProgress < 0.95) ? 'blur(8px)' : 'blur(0px)',
                    background: (scrollProgress > 0.05 && scrollProgress < 0.95)
                        ? 'rgba(0, 0, 0, 0.6)'
                        : 'rgba(0, 0, 0, 0)'
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Background glow based on active step */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                animate={{
                    background: `radial-gradient(ellipse at center, ${automationSteps[activeStep]?.color}20 0%, transparent 60%)`
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Header */}
            <div className="text-center mb-20 relative z-10">
                <span className="text-xs font-bold text-[#00ffa3] mb-4 uppercase tracking-[0.3em] block">
                    Live Demo
                </span>
                <h2 className="text-5xl md:text-7xl font-bold mb-4">
                    STEP {activeStep + 1} OF 5: <span style={{ color: automationSteps[activeStep]?.color }}>{automationSteps[activeStep]?.title}</span>
                </h2>
                <p className="text-white/40 max-w-xl mx-auto">
                    {automationSteps[activeStep]?.description}
                </p>
            </div>

            {/* Flow Visualization */}
            <div className="relative w-full max-w-5xl z-10">

                {/* Connection Line Background */}
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/10 -translate-y-1/2 z-0 rounded-full overflow-hidden">
                    {/* Animated Progress Bar - Neon tube effect */}
                    <div
                        ref={progressRef}
                        className="h-full rounded-full"
                        style={{
                            background: `linear-gradient(90deg, #00a8ff, #7c3aed, #00ffa3, #ff6b6b, #00a8ff)`,
                            boxShadow: `
                                0 0 10px ${automationSteps[activeStep]?.color},
                                0 0 20px ${automationSteps[activeStep]?.color},
                                0 0 40px ${automationSteps[activeStep]?.color}80,
                                inset 0 0 10px rgba(255,255,255,0.3)
                            `,
                            width: '0%'
                        }}
                    />
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {particles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                left: `${particle.x}%`,
                                top: '50%',
                                background: particle.color,
                                boxShadow: `0 0 10px ${particle.color}`
                            }}
                            initial={{ opacity: 1, scale: 1, y: 0 }}
                            animate={{
                                opacity: 0,
                                scale: 0,
                                y: (Math.random() - 0.5) * 100,
                                x: (Math.random() - 0.5) * 50
                            }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            onAnimationComplete={() => {
                                setParticles(prev => prev.filter(p => p.id !== particle.id))
                            }}
                        />
                    ))}
                </div>

                {/* Steps */}
                <div className="flex justify-between relative z-10">
                    {automationSteps.map((step, index) => (
                        <div
                            key={step.id}
                            className="flex flex-col items-center"
                        >
                            {/* Node - Premium layered design */}
                            <motion.div
                                className="relative"
                                animate={{
                                    scale: index === activeStep ? 1.1 : 1,
                                    y: index === activeStep ? -5 : 0
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {/* Outer glow ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: `radial-gradient(circle, ${step.color}30 0%, transparent 70%)`,
                                    }}
                                    animate={{
                                        scale: index === activeStep ? [1.5, 2, 1.5] : 1.5,
                                        opacity: index === activeStep ? [0.5, 1, 0.5] : 0,
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />

                                {/* Pulse ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        border: `2px solid ${step.color}`,
                                    }}
                                    animate={{
                                        scale: index === activeStep ? [1, 1.4] : 1,
                                        opacity: index === activeStep ? [0.8, 0] : 0,
                                    }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />

                                {/* Circular Progress Ring - SVG */}
                                <svg
                                    className="absolute inset-[-4px] w-[104px] h-[104px]"
                                    viewBox="0 0 104 104"
                                >
                                    {/* Background circle */}
                                    <circle
                                        cx="52"
                                        cy="52"
                                        r="48"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.05)"
                                        strokeWidth="3"
                                    />
                                    {/* Progress circle - synced with main progress bar */}
                                    <circle
                                        cx="52"
                                        cy="52"
                                        r="48"
                                        fill="none"
                                        stroke={step.color}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        style={{
                                            strokeDasharray: 2 * Math.PI * 48,
                                            strokeDashoffset: 2 * Math.PI * 48 * (1 - (() => {
                                                // Sync with main progress bar
                                                // Each step gets 1/5 of the total progress
                                                const stepThreshold = (index + 1) / automationSteps.length
                                                const stepStart = index / automationSteps.length

                                                // If scroll hasn't reached this step yet
                                                if (scrollProgress <= stepStart) return 0
                                                // If scroll is past this step
                                                if (scrollProgress >= stepThreshold) return 1
                                                // Currently filling this step
                                                return (scrollProgress - stepStart) / (stepThreshold - stepStart)
                                            })()),
                                            transform: 'rotate(-90deg)',
                                            transformOrigin: 'center',
                                            filter: `drop-shadow(0 0 8px ${step.color})`,
                                        }}
                                    />
                                </svg>

                                {/* Main container */}
                                <motion.div
                                    className="relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                                    style={{
                                        background: index <= activeStep
                                            ? `linear-gradient(135deg, ${step.color}20 0%, rgba(0,0,0,0.9) 100%)`
                                            : 'rgba(255,255,255,0.03)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: index === activeStep
                                            ? `0 0 60px ${step.color}50, inset 0 0 30px ${step.color}20`
                                            : index < activeStep
                                                ? `0 0 20px ${step.color}30`
                                                : 'none',
                                        border: `1px solid ${index <= activeStep ? `${step.color}50` : 'rgba(255,255,255,0.05)'}`,
                                    }}
                                >
                                    {/* Icon */}
                                    <motion.div
                                        className="relative w-20 h-20 z-10 rounded-full overflow-hidden"
                                        animate={{
                                            y: index === activeStep ? [0, -4, 0] : 0,
                                            rotate: index === activeStep ? [0, 5, -5, 0] : 0
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Image
                                            src={step.icon}
                                            alt={step.title}
                                            fill
                                            className="object-cover rounded-full"
                                            style={{
                                                filter: index <= activeStep
                                                    ? `drop-shadow(0 0 15px ${step.color}80)`
                                                    : 'grayscale(1) opacity(0.3)'
                                            }}
                                        />
                                    </motion.div>
                                </motion.div>
                            </motion.div>

                            {/* Label */}
                            <motion.div
                                className="mt-6 text-center"
                                animate={{
                                    opacity: index <= activeStep ? 1 : 0.3,
                                    y: index === activeStep ? 0 : 5
                                }}
                            >
                                <motion.div
                                    className="font-bold text-lg"
                                    animate={{
                                        color: index === activeStep ? step.color : index < activeStep ? '#ffffff' : 'rgba(255,255,255,0.3)'
                                    }}
                                >
                                    {step.title}
                                </motion.div>
                                <motion.div
                                    className="text-sm text-white/50 mt-2 max-w-[140px] h-12"
                                    animate={{
                                        opacity: index === activeStep ? 1 : 0,
                                        y: index === activeStep ? 0 : 10
                                    }}
                                >
                                    {step.description}
                                </motion.div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current step indicator */}
            <motion.div
                className="mt-20 text-center"
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="text-sm text-white/30 uppercase tracking-widest mb-2">
                    Step {activeStep + 1} of {automationSteps.length}
                </div>
                <div
                    className="text-2xl font-bold"
                    style={{ color: automationSteps[activeStep]?.color }}
                >
                    {automationSteps[activeStep]?.title}
                </div>
            </motion.div>


            {/* Scroll hint */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-sm flex flex-col items-center gap-2"
                animate={{ opacity: activeStep === 0 ? 1 : 0 }}
            >
                <span>Scroll to progress</span>
                <motion.div
                    className="w-[1px] h-8 bg-gradient-to-b from-white/20 to-transparent"
                    animate={{ scaleY: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            </motion.div>
        </section>
    )
}
