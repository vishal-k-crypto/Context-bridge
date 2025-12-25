'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CircuitBoardProps {
    position?: [number, number, number]
    scale?: number
    intensity?: number // 0-1, controls animation intensity
}

export default function CircuitBoard({
    position = [0, 0, 0],
    scale = 1,
    intensity = 0.5
}: CircuitBoardProps) {
    const groupRef = useRef<THREE.Group>(null)
    const nodesRef = useRef<THREE.InstancedMesh>(null)
    const traceGlowRef = useRef<THREE.LineSegments>(null)

    // Generate PCB-style circuit layout
    const circuitData = useMemo(() => {
        const nodeCount = 50
        const nodes: { pos: THREE.Vector3; connections: number[] }[] = []
        const traces: { start: THREE.Vector3; end: THREE.Vector3 }[] = []

        // Create nodes in a grid-like pattern with some randomness
        for (let i = 0; i < nodeCount; i++) {
            const gridX = (i % 10) - 5
            const gridY = Math.floor(i / 10) - 2.5

            const pos = new THREE.Vector3(
                gridX * 0.4 + (Math.random() - 0.5) * 0.2,
                gridY * 0.4 + (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.1
            )

            nodes.push({ pos, connections: [] })
        }

        // Create traces between nearby nodes
        nodes.forEach((node, i) => {
            nodes.forEach((other, j) => {
                if (i >= j) return
                const dist = node.pos.distanceTo(other.pos)
                if (dist < 0.6 && Math.random() > 0.5) {
                    node.connections.push(j)
                    traces.push({ start: node.pos.clone(), end: other.pos.clone() })
                }
            })
        })

        return { nodes, traces }
    }, [])

    // Instance matrices for nodes
    const nodeMatrices = useMemo(() => {
        const dummy = new THREE.Object3D()
        const matrices = new Float32Array(circuitData.nodes.length * 16)

        circuitData.nodes.forEach((node, i) => {
            dummy.position.copy(node.pos)
            dummy.scale.setScalar(0.03)
            dummy.updateMatrix()
            dummy.matrix.toArray(matrices, i * 16)
        })

        return matrices
    }, [circuitData])

    // Trace geometry
    const traceGeometry = useMemo(() => {
        const positions: number[] = []

        circuitData.traces.forEach(trace => {
            // Right-angle traces (PCB style)
            const mid = new THREE.Vector3(
                trace.end.x,
                trace.start.y,
                (trace.start.z + trace.end.z) / 2
            )

            positions.push(trace.start.x, trace.start.y, trace.start.z)
            positions.push(mid.x, mid.y, mid.z)
            positions.push(mid.x, mid.y, mid.z)
            positions.push(trace.end.x, trace.end.y, trace.end.z)
        })

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        return geometry
    }, [circuitData])

    // Animation
    useFrame((state) => {
        if (!groupRef.current) return

        const t = state.clock.elapsedTime

        // Gentle rotation
        groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1 * intensity
        groupRef.current.rotation.y = t * 0.1 * intensity

        // Pulse nodes
        if (nodesRef.current) {
            const material = nodesRef.current.material as THREE.MeshStandardMaterial
            material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3 * intensity
        }

        // Glow pulse
        if (traceGlowRef.current) {
            const material = traceGlowRef.current.material as THREE.ShaderMaterial
            if (material.uniforms) {
                material.uniforms.time.value = t
                material.uniforms.intensity.value = intensity
            }
        }
    })

    // Custom shader for glowing traces
    const traceShader = useMemo(() => ({
        uniforms: {
            time: { value: 0 },
            intensity: { value: intensity },
            color1: { value: new THREE.Color('#00ffa3') },
            color2: { value: new THREE.Color('#7c3aed') },
        },
        vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform float time;
      uniform float intensity;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec3 vPosition;
      
      void main() {
        float pulse = sin(vPosition.x * 10.0 + time * 3.0) * 0.5 + 0.5;
        vec3 color = mix(color1, color2, pulse);
        float alpha = 0.4 + pulse * 0.4 * intensity;
        gl_FragColor = vec4(color, alpha);
      }
    `,
        transparent: true,
    }), [intensity])

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* PCB Base */}
            <mesh rotation={[0, 0, 0]}>
                <planeGeometry args={[5, 3]} />
                <meshStandardMaterial
                    color="#0a1628"
                    metalness={0.8}
                    roughness={0.3}
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Circuit Traces */}
            <lineSegments geometry={traceGeometry}>
                <lineBasicMaterial color="#00ffa3" transparent opacity={0.25} linewidth={1} />
            </lineSegments>

            {/* Glowing Trace Overlay */}
            <lineSegments ref={traceGlowRef} geometry={traceGeometry}>
                <shaderMaterial
                    attach="material"
                    args={[traceShader]}
                    transparent
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>

            {/* Circuit Nodes */}
            <instancedMesh
                ref={nodesRef}
                args={[undefined, undefined, circuitData.nodes.length]}
            >
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial
                    color="#00ffa3"
                    emissive="#00ffa3"
                    emissiveIntensity={0.5}
                    metalness={0.9}
                    roughness={0.1}
                />
            </instancedMesh>

            {/* Update instance matrices */}
            {nodesRef.current && (() => {
                const mesh = nodesRef.current
                const dummy = new THREE.Object3D()
                circuitData.nodes.forEach((node, i) => {
                    dummy.position.copy(node.pos)
                    dummy.scale.setScalar(0.03)
                    dummy.updateMatrix()
                    mesh.setMatrixAt(i, dummy.matrix)
                })
                mesh.instanceMatrix.needsUpdate = true
                return null
            })()}

            {/* Central Data Core */}
            <mesh position={[0, 0, 0.1]}>
                <dodecahedronGeometry args={[0.15, 0]} />
                <meshStandardMaterial
                    color="#7c3aed"
                    emissive="#7c3aed"
                    emissiveIntensity={1}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Ambient glow */}
            <pointLight position={[0, 0, 0.5]} color="#00ffa3" intensity={2} distance={3} />
            <pointLight position={[0, 0, -0.5]} color="#7c3aed" intensity={1} distance={2} />
        </group>
    )
}
