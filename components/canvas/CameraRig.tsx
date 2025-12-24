'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import * as THREE from 'three'

export default function CameraRig() {
    const { camera } = useThree()
    const groupRef = useRef<THREE.Group>(null)

    // Camera path points - scroll drives position along this path
    const pathPoints = useMemo(() => {
        return [
            new THREE.Vector3(0, 0, 10),    // Hero - far back
            new THREE.Vector3(3, 0, 5),     // About - move right
            new THREE.Vector3(0, 2, 2),     // Services - up and forward
            new THREE.Vector3(-3, 0, 4),    // Work - left
            new THREE.Vector3(0, -1, 8),    // Contact - back up
        ]
    }, [])

    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3(pathPoints)
    }, [pathPoints])

    // Scroll-driven camera path
    useGSAP(() => {
        const scrollProgress = { value: 0 }

        gsap.to(scrollProgress, {
            value: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 2,
                onUpdate: (self) => {
                    const progress = self.progress
                    const point = curve.getPoint(progress)
                    const tangent = curve.getTangent(progress)

                    // Smooth camera position
                    camera.position.lerp(point, 0.1)

                    // Look slightly ahead on the path
                    const lookAhead = curve.getPoint(Math.min(progress + 0.05, 1))
                    camera.lookAt(lookAhead.x * 0.3, lookAhead.y * 0.3, 0)
                }
            }
        })
    }, [curve])

    return null
}
