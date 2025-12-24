'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function InfiniteGrid() {
    const gridRef = useRef<THREE.Points>(null)
    const particleCount = 2000

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)
        const color = new THREE.Color()

        for (let i = 0; i < particleCount; i++) {
            // Spread in a wide tunnel shape
            const angle = Math.random() * Math.PI * 2
            const radius = 5 + Math.random() * 15
            const z = (Math.random() - 0.5) * 100

            positions[i * 3] = Math.cos(angle) * radius
            positions[i * 3 + 1] = Math.sin(angle) * radius
            positions[i * 3 + 2] = z

            // Color based on depth
            const depth = (z + 50) / 100
            color.setHSL(0.55 + depth * 0.15, 0.8, 0.3 + depth * 0.3)
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }

        return { positions, colors }
    }, [])

    useFrame((state, delta) => {
        if (!gridRef.current) return

        const positions = gridRef.current.geometry.attributes.position.array as Float32Array

        // Move particles toward camera, loop when they pass
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 2] += delta * 5

            // Reset particles that pass the camera
            if (positions[i * 3 + 2] > 50) {
                positions[i * 3 + 2] = -50
            }
        }

        gridRef.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={gridRef}>
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
                size={0.1}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}
