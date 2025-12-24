'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ServerRackProps {
    position?: [number, number, number]
    scale?: number
}

export default function ServerRack({ position = [0, 0, 0], scale = 1 }: ServerRackProps) {
    const groupRef = useRef<THREE.Group>(null)
    const ledsRef = useRef<THREE.InstancedMesh>(null)

    // Create LED positions
    const ledCount = 24
    const ledData = useMemo(() => {
        const data = []
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 6; col++) {
                data.push({
                    position: new THREE.Vector3(
                        -0.35 + col * 0.14,
                        0.6 - row * 0.4,
                        0.26
                    ),
                    speed: Math.random() * 2 + 1,
                    offset: Math.random() * Math.PI * 2
                })
            }
        }
        return data
    }, [])

    // Server unit positions
    const serverUnits = useMemo(() => {
        return [0.6, 0.2, -0.2, -0.6]
    }, [])

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
        }

        // Animate LEDs
        if (ledsRef.current) {
            const time = state.clock.elapsedTime
            const dummy = new THREE.Object3D()
            const color = new THREE.Color()

            ledData.forEach((led, i) => {
                dummy.position.copy(led.position)
                dummy.scale.setScalar(0.02)
                dummy.updateMatrix()
                ledsRef.current!.setMatrixAt(i, dummy.matrix)

                // Blinking pattern
                const intensity = (Math.sin(time * led.speed + led.offset) + 1) / 2
                const isActive = intensity > 0.5
                color.setHSL(isActive ? 0.35 : 0, isActive ? 1 : 0, isActive ? 0.5 : 0.1)
                ledsRef.current!.setColorAt(i, color)
            })

            ledsRef.current.instanceMatrix.needsUpdate = true
            if (ledsRef.current.instanceColor) ledsRef.current.instanceColor.needsUpdate = true
        }
    })

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Main Rack Frame */}
            <mesh>
                <boxGeometry args={[1, 2, 0.5]} />
                <meshStandardMaterial
                    color="#0a0a0a"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Server Units */}
            {serverUnits.map((y, i) => (
                <group key={i} position={[0, y, 0]}>
                    {/* Server Box */}
                    <mesh position={[0, 0, 0.02]}>
                        <boxGeometry args={[0.9, 0.35, 0.45]} />
                        <meshStandardMaterial
                            color="#1a1a1a"
                            metalness={0.6}
                            roughness={0.3}
                        />
                    </mesh>

                    {/* Vents */}
                    <mesh position={[0.3, 0, 0.25]}>
                        <boxGeometry args={[0.15, 0.25, 0.02]} />
                        <meshStandardMaterial color="#0a0a0a" />
                    </mesh>
                </group>
            ))}

            {/* LED Lights */}
            <instancedMesh ref={ledsRef} args={[undefined, undefined, ledCount]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial toneMapped={false} />
            </instancedMesh>

            {/* Glow effect at top */}
            <pointLight position={[0, 1.2, 0.5]} intensity={0.5} color="#00ffa3" distance={2} />
        </group>
    )
}
