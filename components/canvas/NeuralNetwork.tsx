'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface NeuralNetworkProps {
    position?: [number, number, number]
    scale?: number
}

export default function NeuralNetwork({ position = [0, 0, 0], scale = 1 }: NeuralNetworkProps) {
    const groupRef = useRef<THREE.Group>(null)
    const nodesRef = useRef<THREE.InstancedMesh>(null)
    const linesRef = useRef<THREE.LineSegments>(null)

    // Create neural network structure
    const layers = [4, 6, 8, 6, 4] // Nodes per layer
    const layerSpacing = 0.8

    const { nodePositions, connections } = useMemo(() => {
        const positions: THREE.Vector3[] = []
        const connections: number[] = []

        let nodeIndex = 0
        const layerStartIndices: number[] = []

        // Create nodes for each layer
        layers.forEach((nodeCount, layerIndex) => {
            layerStartIndices.push(positions.length)
            const x = (layerIndex - (layers.length - 1) / 2) * layerSpacing

            for (let i = 0; i < nodeCount; i++) {
                const y = (i - (nodeCount - 1) / 2) * 0.3
                const z = (Math.random() - 0.5) * 0.2
                positions.push(new THREE.Vector3(x, y, z))
            }
        })

        // Create connections between adjacent layers
        for (let l = 0; l < layers.length - 1; l++) {
            const currentLayerStart = layerStartIndices[l]
            const nextLayerStart = layerStartIndices[l + 1]

            for (let i = 0; i < layers[l]; i++) {
                // Connect to random nodes in next layer (not all, for visual clarity)
                const connectionsCount = Math.min(3, layers[l + 1])
                const indices = Array.from({ length: layers[l + 1] }, (_, i) => i)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, connectionsCount)

                indices.forEach(j => {
                    const from = positions[currentLayerStart + i]
                    const to = positions[nextLayerStart + j]
                    connections.push(from.x, from.y, from.z, to.x, to.y, to.z)
                })
            }
        }

        return { nodePositions: positions, connections: new Float32Array(connections) }
    }, [])

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
        }

        // Animate nodes
        if (nodesRef.current) {
            const time = state.clock.elapsedTime
            const dummy = new THREE.Object3D()
            const color = new THREE.Color()

            nodePositions.forEach((pos, i) => {
                // Subtle floating
                dummy.position.set(
                    pos.x,
                    pos.y + Math.sin(time * 2 + i) * 0.02,
                    pos.z
                )

                // Pulsing scale
                const pulse = 1 + Math.sin(time * 3 + i * 0.5) * 0.2
                dummy.scale.setScalar(0.04 * pulse)
                dummy.updateMatrix()
                nodesRef.current!.setMatrixAt(i, dummy.matrix)

                // Color based on "activity"
                const activity = (Math.sin(time * 2 + i * 0.3) + 1) / 2
                color.setHSL(0.55 + activity * 0.1, 1, 0.4 + activity * 0.3)
                nodesRef.current!.setColorAt(i, color)
            })

            nodesRef.current.instanceMatrix.needsUpdate = true
            if (nodesRef.current.instanceColor) nodesRef.current.instanceColor.needsUpdate = true
        }
    })

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Nodes */}
            <instancedMesh ref={nodesRef} args={[undefined, undefined, nodePositions.length]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial toneMapped={false} />
            </instancedMesh>

            {/* Connections */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={connections.length / 3}
                        array={connections}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#00a8ff" transparent opacity={0.3} />
            </lineSegments>

            {/* Ambient glow */}
            <pointLight position={[0, 0, 0.5]} intensity={0.8} color="#7c3aed" distance={3} />
        </group>
    )
}
