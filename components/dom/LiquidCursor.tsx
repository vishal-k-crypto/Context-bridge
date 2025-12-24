'use client'

import { useEffect, useRef } from 'react'

export default function LiquidCursor() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const trailRef = useRef<HTMLDivElement>(null)
    const ringRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const cursor = cursorRef.current
        const trail = trailRef.current
        const ring = ringRef.current
        if (!cursor || !trail || !ring) return

        let mouseX = 0
        let mouseY = 0
        let cursorX = 0
        let cursorY = 0
        let trailX = 0
        let trailY = 0
        let ringX = 0
        let ringY = 0

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX
            mouseY = e.clientY
        }

        const handleMouseEnterInteractive = () => {
            ring.style.transform = `translate(${ringX - 30}px, ${ringY - 30}px) scale(1.5)`
            ring.style.borderColor = 'rgba(0, 168, 255, 0.8)'
        }

        const handleMouseLeaveInteractive = () => {
            ring.style.transform = `translate(${ringX - 30}px, ${ringY - 30}px) scale(1)`
            ring.style.borderColor = 'rgba(255, 255, 255, 0.3)'
        }

        // Add listeners to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, [role="button"]')
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleMouseEnterInteractive)
            el.addEventListener('mouseleave', handleMouseLeaveInteractive)
        })

        const animate = () => {
            // Smooth follow for cursor dot
            cursorX += (mouseX - cursorX) * 0.2
            cursorY += (mouseY - cursorY) * 0.2

            // Medium follow for ring
            ringX += (mouseX - ringX) * 0.12
            ringY += (mouseY - ringY) * 0.12

            // Slow follow for trail (creates the "liquid" lag)
            trailX += (mouseX - trailX) * 0.06
            trailY += (mouseY - trailY) * 0.06

            cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`
            ring.style.transform = `translate(${ringX - 30}px, ${ringY - 30}px)`
            trail.style.transform = `translate(${trailX - 150}px, ${trailY - 150}px)`

            requestAnimationFrame(animate)
        }

        window.addEventListener('mousemove', handleMouseMove)
        animate()

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnterInteractive)
                el.removeEventListener('mouseleave', handleMouseLeaveInteractive)
            })
        }
    }, [])

    return (
        <>
            {/* Cursor dot */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none z-[99999] mix-blend-difference"
                style={{ willChange: 'transform' }}
            />

            {/* Cursor ring */}
            <div
                ref={ringRef}
                className="fixed top-0 left-0 w-[60px] h-[60px] rounded-full border border-white/30 pointer-events-none z-[99998] transition-all duration-300 ease-out"
                style={{ willChange: 'transform' }}
            />

            {/* Liquid trail blob */}
            <div
                ref={trailRef}
                className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-[99997]"
                style={{
                    willChange: 'transform',
                    background: 'radial-gradient(circle, rgba(0,168,255,0.08) 0%, rgba(124,58,237,0.04) 40%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />
        </>
    )
}
