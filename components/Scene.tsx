'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Preload, Environment } from '@react-three/drei'
import { Suspense, ReactNode } from 'react'

interface SceneProps {
    children?: ReactNode
    // Whether the background should respond to scroll blur/opacity
    useScrollEffects?: boolean
}

export default function Scene({ children, useScrollEffects = true }: SceneProps) {
    return (
        <div
            className="fixed top-0 left-0 w-full h-full pointer-events-none"
            style={{
                zIndex: -10,
                opacity: useScrollEffects ? 'var(--bg-opacity, 1)' : 1,
                filter: useScrollEffects ? 'blur(var(--bg-blur, 0px))' : 'none',
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            <Canvas
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#7c3aed" />

                {/* Environment for reflections */}
                <Environment preset="night" />

                <Suspense fallback={null}>
                    {children}
                    <Preload all />
                </Suspense>
            </Canvas>
        </div>
    )
}
