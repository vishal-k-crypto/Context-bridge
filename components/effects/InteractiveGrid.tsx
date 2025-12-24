'use client'

import { useEffect, useRef, useState } from 'react'

export default function InteractiveGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)

        const dotSpacing = 40
        const dotRadius = 1
        const maxDistance = 150

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            for (let x = dotSpacing; x < canvas.width; x += dotSpacing) {
                for (let y = dotSpacing; y < canvas.height; y += dotSpacing) {
                    const distance = Math.sqrt(
                        Math.pow(x - mousePos.x, 2) + Math.pow(y - mousePos.y, 2)
                    )

                    const intensity = Math.max(0, 1 - distance / maxDistance)
                    const radius = dotRadius + intensity * 3
                    const alpha = 0.1 + intensity * 0.5

                    // Color based on proximity
                    const hue = 200 + intensity * 60 // Blue to cyan
                    ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`

                    ctx.beginPath()
                    ctx.arc(x, y, radius, 0, Math.PI * 2)
                    ctx.fill()

                    // Draw connections to nearby dots when mouse is close
                    if (intensity > 0.3) {
                        // Connect to neighbors
                        const neighbors = [
                            { x: x + dotSpacing, y },
                            { x, y: y + dotSpacing },
                        ]

                        neighbors.forEach(neighbor => {
                            const neighborDist = Math.sqrt(
                                Math.pow(neighbor.x - mousePos.x, 2) + Math.pow(neighbor.y - mousePos.y, 2)
                            )
                            const neighborIntensity = Math.max(0, 1 - neighborDist / maxDistance)

                            if (neighborIntensity > 0.2) {
                                ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${intensity * neighborIntensity * 0.5})`
                                ctx.lineWidth = 0.5
                                ctx.beginPath()
                                ctx.moveTo(x, y)
                                ctx.lineTo(neighbor.x, neighbor.y)
                                ctx.stroke()
                            }
                        })
                    }
                }
            }

            requestAnimationFrame(draw)
        }

        draw()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [mousePos])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-50"
        />
    )
}
