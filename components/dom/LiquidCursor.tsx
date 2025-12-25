'use client'

import { useEffect, useRef, useState } from 'react'

export default function LiquidCursor() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const trailRef = useRef<HTMLDivElement>(null)
    const ringRef = useRef<HTMLDivElement>(null)
    const glowRef = useRef<HTMLDivElement>(null)
    const [isHovering, setIsHovering] = useState(false)
    const [isClicking, setIsClicking] = useState(false)

    useEffect(() => {
        const cursor = cursorRef.current
        const trail = trailRef.current
        const ring = ringRef.current
        const glow = glowRef.current
        if (!cursor || !trail || !ring || !glow) return

        let mouseX = 0
        let mouseY = 0
        let cursorX = 0
        let cursorY = 0
        let trailX = 0
        let trailY = 0
        let ringX = 0
        let ringY = 0
        let glowX = 0
        let glowY = 0
        let velocity = 0
        let lastMouseX = 0
        let lastMouseY = 0

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX
            mouseY = e.clientY

            // Calculate velocity for dynamic effects
            const dx = mouseX - lastMouseX
            const dy = mouseY - lastMouseY
            velocity = Math.min(Math.sqrt(dx * dx + dy * dy), 50)
            lastMouseX = mouseX
            lastMouseY = mouseY
        }

        const handleMouseDown = () => {
            setIsClicking(true)
            cursor.style.transform = `translate(${cursorX - 3}px, ${cursorY - 3}px) scale(0.8)`
            ring.style.transform = `translate(${ringX - 24}px, ${ringY - 24}px) scale(0.9)`
        }

        const handleMouseUp = () => {
            setIsClicking(false)
        }

        const handleMouseEnterInteractive = (e: Event) => {
            setIsHovering(true)
            const target = e.target as HTMLElement
            const rect = target.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            // Magnetic effect - attract cursor towards element center
            ring.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.3s ease, box-shadow 0.3s ease'
            ring.style.transform = `translate(${centerX - 24}px, ${centerY - 24}px) scale(1.4)`
            ring.style.borderColor = 'rgba(0, 200, 255, 0.9)'
            ring.style.boxShadow = '0 0 30px rgba(0, 200, 255, 0.5), inset 0 0 20px rgba(0, 200, 255, 0.1)'

            cursor.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), background 0.3s ease, box-shadow 0.3s ease'
            cursor.style.background = 'linear-gradient(135deg, #00c8ff, #7c3aed)'
            cursor.style.boxShadow = '0 0 20px rgba(0, 200, 255, 0.8)'
        }

        const handleMouseLeaveInteractive = () => {
            setIsHovering(false)
            ring.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.4s ease, box-shadow 0.4s ease'
            ring.style.transform = `translate(${ringX - 24}px, ${ringY - 24}px) scale(1)`
            ring.style.borderColor = 'rgba(255, 255, 255, 0.4)'
            ring.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.1)'

            cursor.style.transition = 'transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease'
            cursor.style.background = '#ffffff'
            cursor.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)'
        }

        // Add listeners to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, [data-cursor-hover]')
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleMouseEnterInteractive)
            el.addEventListener('mouseleave', handleMouseLeaveInteractive)
        })

        const animate = () => {
            // Smooth follow for cursor dot with velocity-based easing
            const cursorEase = 0.15 + (velocity * 0.005)
            cursorX += (mouseX - cursorX) * Math.min(cursorEase, 0.35)
            cursorY += (mouseY - cursorY) * Math.min(cursorEase, 0.35)

            // Medium follow for ring
            const ringEase = 0.1 + (velocity * 0.003)
            ringX += (mouseX - ringX) * Math.min(ringEase, 0.25)
            ringY += (mouseY - ringY) * Math.min(ringEase, 0.25)

            // Slow follow for trail (creates the "liquid" lag)
            trailX += (mouseX - trailX) * 0.04
            trailY += (mouseY - trailY) * 0.04

            // Even slower for ambient glow
            glowX += (mouseX - glowX) * 0.02
            glowY += (mouseY - glowY) * 0.02

            // Apply transforms only when not hovering (magnetic effect handles it during hover)
            if (!isHovering) {
                cursor.style.transition = 'background 0.3s ease, box-shadow 0.3s ease'
                cursor.style.transform = `translate(${cursorX - 6}px, ${cursorY - 6}px)`
                ring.style.transition = 'border-color 0.3s ease, box-shadow 0.3s ease'
                ring.style.transform = `translate(${ringX - 24}px, ${ringY - 24}px)`
            }

            trail.style.transform = `translate(${trailX - 100}px, ${trailY - 100}px)`
            glow.style.transform = `translate(${glowX - 200}px, ${glowY - 200}px)`

            // Velocity decay
            velocity *= 0.95

            requestAnimationFrame(animate)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)
        animate()

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnterInteractive)
                el.removeEventListener('mouseleave', handleMouseLeaveInteractive)
            })
        }
    }, [isHovering])

    return (
        <>
            {/* Main cursor dot */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[99999]"
                style={{
                    willChange: 'transform',
                    background: '#ffffff',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                }}
            />

            {/* Cursor ring */}
            <div
                ref={ringRef}
                className="fixed top-0 left-0 w-12 h-12 rounded-full pointer-events-none z-[99998]"
                style={{
                    willChange: 'transform',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
                }}
            />

            {/* Inner trail glow */}
            <div
                ref={trailRef}
                className="fixed top-0 left-0 w-[200px] h-[200px] rounded-full pointer-events-none z-[99996]"
                style={{
                    willChange: 'transform',
                    background: 'radial-gradient(circle, rgba(0,200,255,0.12) 0%, rgba(124,58,237,0.08) 30%, transparent 60%)',
                    filter: 'blur(40px)',
                }}
            />

            {/* Ambient glow */}
            <div
                ref={glowRef}
                className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-[99995]"
                style={{
                    willChange: 'transform',
                    background: 'radial-gradient(circle, rgba(0,168,255,0.05) 0%, rgba(124,58,237,0.03) 40%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
            />
        </>
    )
}
