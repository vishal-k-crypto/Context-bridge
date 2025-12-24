'use client'

import { useState, useEffect } from 'react'

export default function TimeGreeting() {
    const [greeting, setGreeting] = useState('')
    const [time, setTime] = useState('')

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

        updateTime()
        const interval = setInterval(updateTime, 60000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed bottom-8 left-8 z-50 pointer-events-none">
            <div className="text-xs text-white/20 uppercase tracking-widest mb-1">{greeting}</div>
            <div className="text-sm text-white/40 font-mono">{time}</div>
        </div>
    )
}
