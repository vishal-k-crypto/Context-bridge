'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Individual floating shard that responds to mouse
function FloatingShard({
    position,
    size,
    depth,
    color,
    mouseTarget,
    rotationOffset
}: {
    position: [number, number, number]
    size: number
    depth: number
    color: string
    mouseTarget: React.MutableRefObject<{ x: number; y: number }>
    rotationOffset: number
}) {
    const meshRef = useRef<THREE.Mesh>(null)
    const currentRotation = useRef({ x: 0, y: 0 })
    const currentPosition = useRef({ x: position[0], y: position[1] })

    // Movement intensity varies by depth (closer = more movement)
    const intensity = 1 / (depth + 1)

    useFrame(() => {
        if (!meshRef.current) return

        // Target rotation based on mouse (smooth lerping)
        const targetRotationY = mouseTarget.current.x * 0.3 * intensity
        const targetRotationX = -mouseTarget.current.y * 0.2 * intensity

        // Lerp rotation smoothly
        currentRotation.current.x += (targetRotationX - currentRotation.current.x) * 0.05
        currentRotation.current.y += (targetRotationY - currentRotation.current.y) * 0.05

        // Target position offset based on mouse
        const targetPosX = position[0] + mouseTarget.current.x * 0.5 * intensity
        const targetPosY = position[1] + mouseTarget.current.y * 0.3 * intensity

        // Lerp position smoothly
        currentPosition.current.x += (targetPosX - currentPosition.current.x) * 0.08
        currentPosition.current.y += (targetPosY - currentPosition.current.y) * 0.08

        // Apply transforms
        meshRef.current.rotation.x = currentRotation.current.x + rotationOffset
        meshRef.current.rotation.y = currentRotation.current.y
        meshRef.current.rotation.z = Math.sin(Date.now() * 0.001 + rotationOffset) * 0.05

        meshRef.current.position.x = currentPosition.current.x
        meshRef.current.position.y = currentPosition.current.y
    })

    return (
        <mesh ref={meshRef} position={position}>
            <planeGeometry args={[size, size * 0.6]} />
            <meshPhysicalMaterial
                color={color}
                transparent
                opacity={0.15 + intensity * 0.2}
                roughness={0.1}
                metalness={0.8}
                clearcoat={1}
                clearcoatRoughness={0.1}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

// Glass-like reveal shard (the main visual pieces)
function GlassShard({
    position,
    size,
    mouseTarget,
    index
}: {
    position: [number, number, number]
    size: [number, number]
    mouseTarget: React.MutableRefObject<{ x: number; y: number }>
    index: number
}) {
    const meshRef = useRef<THREE.Mesh>(null)
    const currentState = useRef({
        rotX: 0, rotY: 0, rotZ: 0,
        posX: position[0], posY: position[1], posZ: position[2]
    })

    const depth = position[2]
    const intensity = (5 - depth) / 5 // Closer shards move more
    const lerpSpeed = 0.03 + index * 0.005

    useFrame(() => {
        if (!meshRef.current) return

        const mouse = mouseTarget.current

        // Target values based on mouse
        const targetRotY = mouse.x * 0.4 * intensity
        const targetRotX = -mouse.y * 0.3 * intensity
        const targetRotZ = mouse.x * 0.1 * intensity

        const targetPosX = position[0] + mouse.x * 1.2 * intensity
        const targetPosY = position[1] + mouse.y * 0.8 * intensity
        const targetPosZ = position[2] + Math.abs(mouse.x + mouse.y) * 0.3 * intensity

        // Smooth lerping for premium feel
        currentState.current.rotX += (targetRotX - currentState.current.rotX) * lerpSpeed
        currentState.current.rotY += (targetRotY - currentState.current.rotY) * lerpSpeed
        currentState.current.rotZ += (targetRotZ - currentState.current.rotZ) * lerpSpeed
        currentState.current.posX += (targetPosX - currentState.current.posX) * lerpSpeed
        currentState.current.posY += (targetPosY - currentState.current.posY) * lerpSpeed
        currentState.current.posZ += (targetPosZ - currentState.current.posZ) * lerpSpeed

        // Add subtle floating animation
        const floatOffset = Math.sin(Date.now() * 0.0008 + index * 0.5) * 0.1

        // Apply
        meshRef.current.rotation.set(
            currentState.current.rotX,
            currentState.current.rotY,
            currentState.current.rotZ
        )
        meshRef.current.position.set(
            currentState.current.posX,
            currentState.current.posY + floatOffset,
            currentState.current.posZ
        )
    })

    return (
        <mesh ref={meshRef} position={position}>
            <planeGeometry args={size} />
            <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.08}
                roughness={0}
                metalness={0.5}
                clearcoat={1}
                clearcoatRoughness={0}
                transmission={0.9}
                thickness={0.5}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

// Main scene with all shards
function ParallaxScene({ mouseTarget }: { mouseTarget: React.MutableRefObject<{ x: number; y: number }> }) {
    // Define shard configurations
    const shards = useMemo(() => [
        // Larger background pieces
        { position: [-2, 1, -3] as [number, number, number], size: [3, 2] as [number, number] },
        { position: [2.5, -0.5, -2.5] as [number, number, number], size: [2.5, 1.5] as [number, number] },
        { position: [0, 2, -4] as [number, number, number], size: [4, 2.5] as [number, number] },

        // Medium mid-ground pieces
        { position: [-3, -1, -1.5] as [number, number, number], size: [2, 1.2] as [number, number] },
        { position: [3, 1.5, -1] as [number, number, number], size: [1.8, 1] as [number, number] },
        { position: [-1, -2, -2] as [number, number, number], size: [2.2, 1.4] as [number, number] },

        // Small foreground pieces (move the most)
        { position: [1.5, 2.5, 0] as [number, number, number], size: [1.2, 0.8] as [number, number] },
        { position: [-2.5, 0.5, 0.5] as [number, number, number], size: [1, 0.6] as [number, number] },
        { position: [0.5, -1.5, 0] as [number, number, number], size: [1.5, 1] as [number, number] },
        { position: [-1, 1, 1] as [number, number, number], size: [0.8, 0.5] as [number, number] },
        { position: [2, -2, 0.5] as [number, number, number], size: [1.3, 0.7] as [number, number] },
    ], [])

    // Small floating particles
    const particles = useMemo(() =>
        Array.from({ length: 20 }, (_, i) => ({
            position: [
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4
            ] as [number, number, number],
            size: 0.1 + Math.random() * 0.2,
            depth: Math.random() * 3,
            color: ['#00ffa3', '#00a8ff', '#7c3aed'][Math.floor(Math.random() * 3)],
            rotationOffset: Math.random() * Math.PI
        }))
        , [])

    return (
        <>
            {/* Ambient lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} />
            <directionalLight position={[-5, -5, 5]} intensity={0.3} color="#7c3aed" />

            {/* Glass shards - the main parallax elements */}
            {shards.map((shard, index) => (
                <GlassShard
                    key={`shard-${index}`}
                    position={shard.position}
                    size={shard.size}
                    mouseTarget={mouseTarget}
                    index={index}
                />
            ))}

            {/* Small floating particles */}
            {particles.map((particle, index) => (
                <FloatingShard
                    key={`particle-${index}`}
                    position={particle.position}
                    size={particle.size}
                    depth={particle.depth}
                    color={particle.color}
                    mouseTarget={mouseTarget}
                    rotationOffset={particle.rotationOffset}
                />
            ))}
        </>
    )
}

// Camera that also responds to mouse
function ResponsiveCamera({ mouseTarget }: { mouseTarget: React.MutableRefObject<{ x: number; y: number }> }) {
    const { camera } = useThree()
    const currentLook = useRef({ x: 0, y: 0 })

    useFrame(() => {
        // Subtle camera movement following mouse
        const targetX = mouseTarget.current.x * 0.3
        const targetY = mouseTarget.current.y * 0.2

        currentLook.current.x += (targetX - currentLook.current.x) * 0.02
        currentLook.current.y += (targetY - currentLook.current.y) * 0.02

        camera.position.x = currentLook.current.x
        camera.position.y = currentLook.current.y
        camera.lookAt(0, 0, 0)
    })

    return null
}

export default function FragmentedParallax({ enabled = true }: { enabled?: boolean }) {
    const [mounted, setMounted] = useState(false)
    const mouseTarget = useRef({ x: 0, y: 0 })
    const currentMouse = useRef({ x: 0, y: 0 })

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!enabled) return

        const handleMouseMove = (e: MouseEvent) => {
            // Normalize to -1 to 1 range
            currentMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
            currentMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
        }

        // Smooth update loop for mouse target
        let animationId: number
        const updateMouse = () => {
            // Lerp the target toward current mouse position
            mouseTarget.current.x += (currentMouse.current.x - mouseTarget.current.x) * 0.1
            mouseTarget.current.y += (currentMouse.current.y - mouseTarget.current.y) * 0.1
            animationId = requestAnimationFrame(updateMouse)
        }

        window.addEventListener('mousemove', handleMouseMove)
        updateMouse()

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationId)
        }
    }, [enabled])

    if (!mounted || !enabled) return null

    return (
        <div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 2 }}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ResponsiveCamera mouseTarget={mouseTarget} />
                <ParallaxScene mouseTarget={mouseTarget} />
            </Canvas>
        </div>
    )
}
