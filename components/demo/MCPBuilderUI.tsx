'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    validateCoupon,
    submitMCPRequest,
    pollRequestStatus,
    getMCPResult,
    subscribeToRequest,
    type MCPResult
} from '@/lib/supabase'

type Stage = 'input' | 'validating' | 'processing' | 'completed' | 'failed'

const STAGES = [
    { id: 'scout', name: 'Scout', icon: '🔍', color: '#00a8ff' },
    { id: 'architect', name: 'Architect', icon: '🏗️', color: '#7c3aed' },
    { id: 'coder', name: 'Coder', icon: '⚡', color: '#00ffa3' },
    { id: 'sandbox', name: 'Sandbox', icon: '🧪', color: '#ff6b6b' },
    { id: 'complete', name: 'Complete', icon: '✅', color: '#ffd700' },
]

interface MCPBuilderUIProps {
    onIntensityChange?: (intensity: number) => void
}

export default function MCPBuilderUI({ onIntensityChange }: MCPBuilderUIProps) {
    const [stage, setStage] = useState<Stage>('input')
    const [couponCode, setCouponCode] = useState('')
    const [goal, setGoal] = useState('')
    const [couponValid, setCouponValid] = useState<boolean | null>(null)
    const [couponRemaining, setCouponRemaining] = useState<number>(0)
    const [requestId, setRequestId] = useState<string | null>(null)
    const [logs, setLogs] = useState<string[]>([])
    const [currentStageIndex, setCurrentStageIndex] = useState(0)
    const [result, setResult] = useState<MCPResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Update 3D intensity based on stage
    useEffect(() => {
        if (onIntensityChange) {
            if (stage === 'processing') {
                onIntensityChange(1)
            } else if (stage === 'completed') {
                onIntensityChange(0.3)
            } else {
                onIntensityChange(0.5)
            }
        }
    }, [stage, onIntensityChange])

    // Parse logs to determine current stage
    useEffect(() => {
        const lastLog = logs[logs.length - 1] || ''
        if (lastLog.includes('Scout')) setCurrentStageIndex(0)
        else if (lastLog.includes('Architect')) setCurrentStageIndex(1)
        else if (lastLog.includes('Coder')) setCurrentStageIndex(2)
        else if (lastLog.includes('Sandbox')) setCurrentStageIndex(3)
        else if (lastLog.includes('success') || lastLog.includes('Complete')) setCurrentStageIndex(4)
    }, [logs])

    // Validate coupon on input
    const handleCouponChange = useCallback(async (code: string) => {
        setCouponCode(code)
        setCouponValid(null)

        if (code.length >= 4) {
            const result = await validateCoupon(code)
            setCouponValid(result.valid)
            if (result.valid) {
                setCouponRemaining(result.remaining || 0)
            }
        }
    }, [])

    // Submit request
    const handleSubmit = async () => {
        if (!couponValid || !goal.trim()) return

        setStage('validating')
        setError(null)

        const result = await submitMCPRequest(couponCode, goal)

        if (!result.success) {
            setError(result.error || 'Failed to submit request')
            setStage('failed')
            return
        }

        setRequestId(result.requestId!)
        setStage('processing')
        setLogs(['Starting MCP generation...'])

        // Subscribe to real-time updates
        const unsubscribe = subscribeToRequest(result.requestId!, (status, newLogs) => {
            setLogs(newLogs)

            if (status === 'completed') {
                setStage('completed')
                unsubscribe()
                // Fetch result
                getMCPResult(result.requestId!).then(res => {
                    if (res.success) setResult(res.result!)
                })
            } else if (status === 'failed') {
                setStage('failed')
                setError('Generation failed. Please try again.')
                unsubscribe()
            }
        })

        // Fallback polling (in case realtime fails)
        const pollInterval = setInterval(async () => {
            const status = await pollRequestStatus(result.requestId!)
            setLogs(status.logs)

            if (status.status === 'completed' || status.status === 'failed') {
                clearInterval(pollInterval)
                setStage(status.status)

                if (status.status === 'completed') {
                    const res = await getMCPResult(result.requestId!)
                    if (res.success) setResult(res.result!)
                }
            }
        }, 2000)

        // Cleanup on unmount
        return () => {
            unsubscribe()
            clearInterval(pollInterval)
        }
    }

    // Download result
    const handleDownload = () => {
        if (!result?.server_code) return

        const blob = new Blob([result.server_code], { type: 'text/python' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${goal.toLowerCase().replace(/\s+/g, '_')}_mcp_server.py`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Copy to clipboard
    const handleCopy = () => {
        if (!result?.server_code) return
        navigator.clipboard.writeText(result.server_code)
    }

    // Reset
    const handleReset = () => {
        setStage('input')
        setCouponCode('')
        setGoal('')
        setCouponValid(null)
        setRequestId(null)
        setLogs([])
        setResult(null)
        setError(null)
        setCurrentStageIndex(0)
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Glassmorphism Container */}
            <motion.div
                className="relative rounded-3xl overflow-hidden"
                style={{
                    background: 'rgba(10, 22, 40, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            inset 0 0 60px rgba(0, 255, 163, 0.05)
          `
                }}
                layout
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00ffa3] to-[#7c3aed] bg-clip-text text-transparent">
                        AI Employee
                    </h2>
                    <p className="text-white/50 text-sm mt-1">
                        Generate custom MCP servers instantly
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {/* INPUT STAGE */}
                        {stage === 'input' && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Coupon Input */}
                                <div className="space-y-2">
                                    <label className="text-white/70 text-sm font-medium">Access Code</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => handleCouponChange(e.target.value.toUpperCase())}
                                            placeholder="Enter your coupon code"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                               text-white placeholder-white/30 focus:outline-none focus:border-[#00ffa3]/50
                               transition-all duration-300 uppercase tracking-wider"
                                            maxLength={20}
                                        />
                                        {/* Validation indicator */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {couponValid === true && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="text-[#00ffa3]"
                                                >
                                                    ✓ {couponRemaining} uses left
                                                </motion.span>
                                            )}
                                            {couponValid === false && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="text-red-400"
                                                >
                                                    ✗ Invalid
                                                </motion.span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Goal Input */}
                                <div className="space-y-2">
                                    <label className="text-white/70 text-sm font-medium">What do you want to build?</label>
                                    <textarea
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        placeholder="e.g., 'GitHub API tools' or 'Analyze my repo health'"
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                             text-white placeholder-white/30 focus:outline-none focus:border-[#7c3aed]/50
                             transition-all duration-300 resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    onClick={handleSubmit}
                                    disabled={!couponValid || !goal.trim()}
                                    className="w-full py-4 rounded-xl font-bold text-lg relative overflow-hidden
                           disabled:opacity-30 disabled:cursor-not-allowed"
                                    style={{
                                        background: 'linear-gradient(135deg, #00ffa3 0%, #7c3aed 100%)',
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="relative z-10 text-black">Generate MCP Server</span>
                                    {/* Shine effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* PROCESSING STAGE */}
                        {(stage === 'validating' || stage === 'processing') && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Stage Progress */}
                                <div className="flex justify-between items-center">
                                    {STAGES.map((s, i) => (
                                        <div key={s.id} className="flex flex-col items-center">
                                            <motion.div
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                                                style={{
                                                    background: i <= currentStageIndex
                                                        ? `linear-gradient(135deg, ${s.color}40, ${s.color}20)`
                                                        : 'rgba(255,255,255,0.05)',
                                                    border: `2px solid ${i <= currentStageIndex ? s.color : 'rgba(255,255,255,0.1)'}`,
                                                    boxShadow: i === currentStageIndex ? `0 0 20px ${s.color}80` : 'none'
                                                }}
                                                animate={i === currentStageIndex ? {
                                                    scale: [1, 1.1, 1],
                                                } : {}}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            >
                                                {s.icon}
                                            </motion.div>
                                            <span className="text-xs mt-2 text-white/50">{s.name}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Terminal */}
                                <div
                                    className="rounded-xl p-4 font-mono text-sm h-48 overflow-y-auto"
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(0, 255, 163, 0.2)'
                                    }}
                                >
                                    {logs.map((log, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-[#00ffa3]/80"
                                        >
                                            {log}
                                        </motion.div>
                                    ))}
                                    <motion.span
                                        className="inline-block w-2 h-4 bg-[#00ffa3] ml-1"
                                        animate={{ opacity: [1, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                    />
                                </div>

                                {/* Loading indicator */}
                                <div className="text-center text-white/50">
                                    <motion.div
                                        className="inline-block w-6 h-6 border-2 border-[#00ffa3]/30 border-t-[#00ffa3] rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                    <p className="mt-2">Processing on local server...</p>
                                </div>
                            </motion.div>
                        )}

                        {/* COMPLETED STAGE */}
                        {stage === 'completed' && result && (
                            <motion.div
                                key="completed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <motion.div
                                        className="text-6xl mb-4"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', bounce: 0.5 }}
                                    >
                                        🎉
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-[#00ffa3]">MCP Server Generated!</h3>
                                    <p className="text-white/50 mt-2">
                                        {(result.tools_json as any)?.count || 0} tools created
                                    </p>
                                </div>

                                {/* Code Preview */}
                                <div
                                    className="rounded-xl p-4 font-mono text-xs h-64 overflow-auto"
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(124, 58, 237, 0.3)'
                                    }}
                                >
                                    <pre className="text-white/70 whitespace-pre-wrap">
                                        {result.server_code?.slice(0, 1500)}
                                        {result.server_code && result.server_code.length > 1500 && '\n\n... (truncated)'}
                                    </pre>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <motion.button
                                        onClick={handleDownload}
                                        className="flex-1 py-3 rounded-xl font-bold"
                                        style={{
                                            background: 'linear-gradient(135deg, #00ffa3 0%, #00a8ff 100%)',
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="text-black">⬇ Download</span>
                                    </motion.button>

                                    <motion.button
                                        onClick={handleCopy}
                                        className="flex-1 py-3 rounded-xl font-bold border border-white/20"
                                        style={{ background: 'rgba(255,255,255,0.05)' }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="text-white">📋 Copy</span>
                                    </motion.button>
                                </div>

                                <button
                                    onClick={handleReset}
                                    className="w-full text-center text-white/50 hover:text-white/70 transition-colors"
                                >
                                    Generate another →
                                </button>
                            </motion.div>
                        )}

                        {/* FAILED STAGE */}
                        {stage === 'failed' && (
                            <motion.div
                                key="failed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-6"
                            >
                                <div className="text-6xl">😵</div>
                                <h3 className="text-2xl font-bold text-red-400">Generation Failed</h3>
                                <p className="text-white/50">{error || 'Something went wrong'}</p>

                                <motion.button
                                    onClick={handleReset}
                                    className="px-8 py-3 rounded-xl font-bold border border-white/20"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Try Again
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
