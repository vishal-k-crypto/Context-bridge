'use client'

import { useEffect, useState } from 'react'

export default function EasterEgg() {
    const [activated, setActivated] = useState(false)
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

    useEffect(() => {
        let index = 0

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === konamiCode[index]) {
                index++
                if (index === konamiCode.length) {
                    setActivated(true)
                    index = 0
                    setTimeout(() => setActivated(false), 5000)
                }
            } else {
                index = 0
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    if (!activated) return null

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none">
            <div className="text-center animate-bounce">
                <div className="text-8xl mb-4">🤖</div>
                <div className="text-2xl font-bold gradient-text">
                    AUTOMATION MODE ACTIVATED
                </div>
                <div className="text-sm text-white/40 mt-2">
                    You found the secret! 🎮
                </div>
            </div>

            {/* Confetti-like particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: '-10px',
                            backgroundColor: ['#00a8ff', '#7c3aed', '#00ffa3'][Math.floor(Math.random() * 3)],
                            animation: `fall ${2 + Math.random() * 2}s linear forwards`,
                            animationDelay: `${Math.random() * 0.5}s`,
                        }}
                    />
                ))}
            </div>

            <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(110vh) rotate(720deg);
          }
        }
      `}</style>
        </div>
    )
}
