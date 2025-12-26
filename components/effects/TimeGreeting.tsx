'use client'

import { useState, useEffect } from 'react'

export default function TimeGreeting() {
    const [greeting, setGreeting] = useState('')
    const [time, setTime] = useState('')
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const hour = now.getHours()

            if (hour >= 5 && hour < 12) {
                setGreeting('Good Morning')
            } else if (hour >= 12 && hour < 17) {
                setGreeting('Good Afternoon')
            } else if (hour >= 17 && hour < 21) {
                setGreeting('Good Evening')
            } else {
                setGreeting('Working Late?')
            }

            setTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }))
        }

        const handleScroll = () => {
            // Hide only when very close to the bottom of the page (last 10%)
            const scrollPosition = window.scrollY + window.innerHeight
            const pageHeight = document.documentElement.scrollHeight
            const threshold = pageHeight * 0.9

            setIsVisible(scrollPosition < threshold)
        }

        updateTime()
        handleScroll()

        const interval = setInterval(updateTime, 60000)
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            clearInterval(interval)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div
            className="fixed bottom-8 left-8 z-50 pointer-events-none transition-opacity duration-500"
            style={{ opacity: isVisible ? 1 : 0 }}
        >
            <div className="text-xs text-white/20 uppercase tracking-widest mb-1">{greeting}</div>
            <div className="text-sm text-white/40 font-mono">{time}</div>
        </div>
    )
}
