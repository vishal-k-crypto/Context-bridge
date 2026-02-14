'use client'

import { useRef, useEffect } from 'react'

export default function BridgeCursor() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const followerRef = useRef<HTMLDivElement>(null)
    const trailsRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        const cursor = cursorRef.current
        const follower = followerRef.current
        if (!cursor || !follower) return

        let mouseX = 0
        let mouseY = 0
        let cursorX = 0
        let cursorY = 0
        let followerX = 0
        let followerY = 0

        // Trail particles
        const trails: { x: number; y: number; life: number }[] = []
        const maxTrails = 8

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX
            mouseY = e.clientY

            // Add trail particle
            if (trails.length < maxTrails) {
                trails.push({ x: mouseX, y: mouseY, life: 1 })
            }
        }

        const animate = () => {
            // Cursor follows precisely
            cursorX += (mouseX - cursorX) * 0.25
            cursorY += (mouseY - cursorY) * 0.25

            // Follower has more lag
            followerX += (mouseX - followerX) * 0.08
            followerY += (mouseY - followerY) * 0.08

            cursor.style.transform = `translate(${cursorX - 6}px, ${cursorY - 6}px)`
            follower.style.transform = `translate(${followerX - 40}px, ${followerY - 40}px)`

            // Update trail particles
            trails.forEach((trail, i) => {
                trail.life -= 0.02
                if (trail.life <= 0) {
                    trails.splice(i, 1)
                }
            })

            requestAnimationFrame(animate)
        }

        window.addEventListener('mousemove', handleMouseMove)
        animate()

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <>
            {/* Main cursor - small dot */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[99999] mix-blend-difference"
                style={{ willChange: 'transform' }}
            />

            {/* Follower - electric ring */}
            <div
                ref={followerRef}
                className="fixed top-0 left-0 w-20 h-20 rounded-full pointer-events-none z-[99998] border border-[#4f46e5]/30"
                style={{
                    willChange: 'transform',
                    background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)',
                }}
            />
        </>
    )
}
