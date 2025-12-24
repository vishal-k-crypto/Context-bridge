'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DataFlowProps {
    position?: [number, number, number]
}

export default function DataFlow({ position = [0, 0, 0] }: DataFlowProps) {
    const particlesRef = useRef<THREE.Points>(null)

    const particleCount = 200

    const { positions, velocities, colors } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const velocities = new Float32Array(particleCount)
        const colors = new Float32Array(particleCount * 3)

        const color = new THREE.Color()

        for (let i = 0; i < particleCount; i++) {
            // Spread in a cylindrical pattern
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * 3 + 1
            const y = (Math.random() - 0.5) * 8

            positions[i * 3] = Math.cos(angle) * radius
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = Math.sin(angle) * radius

            velocities[i] = Math.random() * 0.5 + 0.5

            // Random color from palette
            const hue = Math.random() > 0.5 ? 0.55 : 0.75 // Blue or purple
            color.setHSL(hue, 1, 0.5 + Math.random() * 0.3)
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }

        return { positions, velocities, colors }
    }, [])

    useFrame((state, delta) => {
        if (!particlesRef.current) return

        const positionAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute
        const positions = positionAttr.array as Float32Array

        for (let i = 0; i < particleCount; i++) {
            // Move particles upward
            positions[i * 3 + 1] += velocities[i] * delta * 2

            // Spiral motion
            const angle = state.clock.elapsedTime * 0.5 + i * 0.1
            const currentRadius = Math.sqrt(
                positions[i * 3] * positions[i * 3] +
                positions[i * 3 + 2] * positions[i * 3 + 2]
            )

            positions[i * 3] += Math.cos(angle) * delta * 0.1
            positions[i * 3 + 2] += Math.sin(angle) * delta * 0.1

            // Reset particles that go too high
            if (positions[i * 3 + 1] > 4) {
                positions[i * 3 + 1] = -4
                const newAngle = Math.random() * Math.PI * 2
                const newRadius = Math.random() * 3 + 1
                positions[i * 3] = Math.cos(newAngle) * newRadius
                positions[i * 3 + 2] = Math.sin(newAngle) * newRadius
            }
        }

        positionAttr.needsUpdate = true
    })

    return (
        <group position={position}>
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleCount}
                        array={positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={particleCount}
                        array={colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.05}
                    vertexColors
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    )
}
