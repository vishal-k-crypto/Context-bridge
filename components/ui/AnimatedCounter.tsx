'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface AnimatedCounterProps {
    end: number
    duration?: number
    prefix?: string
    suffix?: string
    className?: string
}

export default function AnimatedCounter({
    end,
    duration = 2000,
    prefix = '',
    suffix = '',
    className = ''
}: AnimatedCounterProps) {
    const [count, setCount] = useState(0)
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
    const hasAnimated = useRef(false)

    useEffect(() => {
        if (!inView || hasAnimated.current) return
        hasAnimated.current = true

        const startTime = Date.now()
        const startValue = 0

        const animate = () => {
            const now = Date.now()
            const progress = Math.min((now - startTime) / duration, 1)

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = Math.floor(startValue + (end - startValue) * eased)

            setCount(current)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [inView, end, duration])

    return (
        <span ref={ref} className={className}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    )
}
