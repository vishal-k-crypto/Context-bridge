'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Points, PointMaterial } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import * as THREE from 'three'

// Simple continent shape detection using lat/long
// Returns true if a point is approximately on land
function isLand(lat: number, lon: number): boolean {
    // Normalized to -1 to 1
    const x = lon / 180
    const y = lat / 90

    // Simple noise-based continent approximation
    // This creates believable continent shapes
    const noise1 = Math.sin(x * 3 + 0.5) * Math.cos(y * 2) * 0.5
    const noise2 = Math.sin(x * 7 + y * 5) * 0.3
    const noise3 = Math.cos(y * 4) * 0.2

    const combined = noise1 + noise2 + noise3

    // Adjust threshold to control land/water ratio
    // Also add some realistic continent positions
    const africaEurope = (lon > -20 && lon < 60 && lat > -35 && lat < 70) ? 0.15 : 0
    const americas = (lon > -130 && lon < -30 && lat > -55 && lat < 70) ? 0.1 : 0
    const asia = (lon > 60 && lon < 150 && lat > 0 && lat < 70) ? 0.12 : 0
    const australia = (lon > 110 && lon < 155 && lat > -45 && lat < -10) ? 0.2 : 0

    return (combined + africaEurope + americas + asia + australia) > 0.1
}

export default function HolographicEarth() {
    const groupRef = useRef<THREE.Group>(null)
    const pointsRef = useRef<THREE.Points>(null)
    const ring1Ref = useRef<THREE.Mesh>(null)
    const ring2Ref = useRef<THREE.Mesh>(null)

    // Generate Earth points - particles for the globe
    const earthPoints = useMemo(() => {
        const points: number[] = []
        const colors: number[] = []
        const sizes: number[] = []

        const radius = 1
        const numPoints = 15000 // Dense point cloud

        for (let i = 0; i < numPoints; i++) {
            // Fibonacci sphere distribution for even coverage
            const phi = Math.acos(1 - 2 * (i + 0.5) / numPoints)
            const theta = Math.PI * (1 + Math.sqrt(5)) * i

            // Convert to lat/lon
            const lat = 90 - (phi * 180 / Math.PI)
            const lon = (theta * 180 / Math.PI) % 360 - 180

            // Check if this point should be visible (land)
            const onLand = isLand(lat, lon)

            // Convert spherical to cartesian
            const x = radius * Math.sin(phi) * Math.cos(theta)
            const y = radius * Math.cos(phi)
            const z = radius * Math.sin(phi) * Math.sin(theta)

            // Only add land points (with some ocean points for outline)
            if (onLand || Math.random() < 0.08) {
                points.push(x, y, z)

                // Land is bright cyan, ocean is darker blue
                if (onLand) {
                    colors.push(0, 0.9 + Math.random() * 0.1, 1) // Bright cyan
                    sizes.push(0.015 + Math.random() * 0.01)
                } else {
                    colors.push(0, 0.3, 0.5) // Dark blue for sparse ocean dots
                    sizes.push(0.008)
                }
            }
        }

        return {
            positions: new Float32Array(points),
            colors: new Float32Array(colors),
            sizes: new Float32Array(sizes)
        }
    }, [])

    // Animation Loop
    useFrame((state, delta) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += delta * 0.08
        }
        if (ring1Ref.current) {
            ring1Ref.current.rotation.z += delta * 0.15
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.z -= delta * 0.1
        }
    })

    // SCROLL CHOREOGRAPHY
    useGSAP(() => {
        if (!groupRef.current) return

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.5,
            },
        })

        // PHASE 1: Hero -> About (Move Right)
        tl.to(groupRef.current.position, {
            x: 2.5,
            z: -1,
            y: 0,
            ease: 'power2.inOut',
            duration: 2
        })

        // PHASE 2: About -> Services (Center)
        tl.to(groupRef.current.position, {
            x: 0,
            z: 0.5,
            y: 0,
            ease: 'power2.inOut',
            duration: 2
        })

        // PHASE 3: Services -> Work (Shrink & Drop)
        tl.to(groupRef.current.position, {
            y: -2,
            x: -2,
            ease: 'power2.inOut',
            duration: 2
        })

    }, [])

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <Float speed={1} rotationIntensity={0.15} floatIntensity={0.2}>

                {/* Earth Particle Cloud */}
                <points ref={pointsRef}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={earthPoints.positions.length / 3}
                            array={earthPoints.positions}
                            itemSize={3}
                        />
                        <bufferAttribute
                            attach="attributes-color"
                            count={earthPoints.colors.length / 3}
                            array={earthPoints.colors}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.02}
                        vertexColors
                        transparent
                        opacity={0.9}
                        sizeAttenuation
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </points>

                {/* Inner atmosphere glow */}
                <mesh scale={0.98}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial
                        color="#003366"
                        transparent
                        opacity={0.15}
                    />
                </mesh>

                {/* Outer Ring 1 - Cyan (horizontal) */}
                <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1.6, 0.015, 16, 128]} />
                    <meshStandardMaterial
                        color="#00d4ff"
                        emissive="#00d4ff"
                        emissiveIntensity={4}
                        toneMapped={false}
                    />
                </mesh>

                {/* Outer Ring 2 - Magenta (diagonal) */}
                <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
                    <torusGeometry args={[1.5, 0.02, 16, 128]} />
                    <meshStandardMaterial
                        color="#ff00ff"
                        emissive="#ff00ff"
                        emissiveIntensity={3}
                        toneMapped={false}
                    />
                </mesh>

            </Float>
        </group>
    )
}
