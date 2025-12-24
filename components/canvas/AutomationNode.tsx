'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Float } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import * as THREE from 'three'

export default function AutomationNode() {
    const groupRef = useRef<THREE.Group>(null)
    const outerRingRef = useRef<THREE.Mesh>(null)
    const innerCoreRef = useRef<THREE.Mesh>(null)
    const innerRing1Ref = useRef<THREE.Mesh>(null)
    const innerRing2Ref = useRef<THREE.Mesh>(null)

    // Create random particles for the "Data Cloud"
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < 30; i++) {
            temp.push({
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 5,
                z: (Math.random() - 0.5) * 5,
                scale: Math.random() * 0.03 + 0.01
            })
        }
        return temp
    }, [])

    const particlesRef = useRef<THREE.Group>(null)

    // Animation Loop: Constant idle motion
    useFrame((state, delta) => {
        if (outerRingRef.current) {
            outerRingRef.current.rotation.x += delta * 0.08
            outerRingRef.current.rotation.y += delta * 0.12
        }
        if (innerRing1Ref.current) {
            innerRing1Ref.current.rotation.z += delta * 0.15
            innerRing1Ref.current.rotation.x += delta * 0.05
        }
        if (innerRing2Ref.current) {
            innerRing2Ref.current.rotation.y -= delta * 0.1
        }
        if (innerCoreRef.current) {
            innerCoreRef.current.rotation.z -= delta * 0.05
            // Subtle pulsing scale
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03
            innerCoreRef.current.scale.setScalar(pulse)
        }
        if (particlesRef.current) {
            particlesRef.current.rotation.y += delta * 0.03
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

        // PHASE 2: About -> Services (Center & Explode)
        tl.to(groupRef.current.position, {
            x: 0,
            z: 0.5,
            y: 0,
            ease: 'power2.inOut',
            duration: 2
        })

        if (outerRingRef.current) {
            tl.to(outerRingRef.current.scale, {
                x: 1.8, y: 1.8, z: 1.8,
                ease: 'back.out(1.7)',
                duration: 1
            }, "<")
        }

        // PHASE 3: Services -> Work (Shrink & Drop)
        tl.to(groupRef.current.position, {
            y: -2,
            x: -2,
            ease: 'power2.inOut',
            duration: 2
        })

        if (outerRingRef.current) {
            tl.to(outerRingRef.current.scale, {
                x: 0.8, y: 0.8, z: 0.8,
                ease: 'power2.inOut',
                duration: 1
            }, "<")
        }

    }, [])

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>

                {/* Outer Ring - Primary */}
                <mesh ref={outerRingRef}>
                    <torusGeometry args={[1.8, 0.015, 16, 128]} />
                    <meshStandardMaterial
                        color="#00a8ff"
                        emissive="#00a8ff"
                        emissiveIntensity={3}
                        toneMapped={false}
                        roughness={0.1}
                        metalness={1}
                    />
                </mesh>

                {/* Inner Ring 1 */}
                <mesh ref={innerRing1Ref} rotation={[Math.PI / 3, 0, 0]}>
                    <torusGeometry args={[1.4, 0.008, 16, 100]} />
                    <meshStandardMaterial
                        color="#7c3aed"
                        emissive="#7c3aed"
                        emissiveIntensity={2}
                        toneMapped={false}
                    />
                </mesh>

                {/* Inner Ring 2 */}
                <mesh ref={innerRing2Ref} rotation={[Math.PI / 2, Math.PI / 4, 0]}>
                    <torusGeometry args={[1.1, 0.006, 16, 100]} />
                    <meshStandardMaterial
                        color="#00ffa3"
                        emissive="#00ffa3"
                        emissiveIntensity={1.5}
                        toneMapped={false}
                        transparent
                        opacity={0.6}
                    />
                </mesh>

                {/* Inner Core - Glass Brain */}
                <mesh ref={innerCoreRef}>
                    <icosahedronGeometry args={[0.7, 1]} />
                    <MeshTransmissionMaterial
                        backside
                        thickness={2}
                        roughness={0.05}
                        transmission={0.98}
                        ior={1.5}
                        chromaticAberration={1.5}
                        background={new THREE.Color('#000000')}
                        color="#88ccff"
                    />
                </mesh>

                {/* Data Particles Cloud */}
                <group ref={particlesRef}>
                    {particles.map((p, i) => (
                        <mesh key={i} position={[p.x, p.y, p.z]}>
                            <sphereGeometry args={[p.scale, 8, 8]} />
                            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
                        </mesh>
                    ))}
                </group>
            </Float>
        </group>
    )
}
