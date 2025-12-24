'use client'

import { useLenis } from 'lenis/react'

export default function Navbar() {
    const lenis = useLenis()

    const scrollTo = (target: string) => {
        lenis?.scrollTo(target, { duration: 2 })
    }

    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-8 flex justify-between items-center pointer-events-none">
            {/* Logo */}
            <div
                className="text-xl font-bold tracking-tight pointer-events-auto cursor-pointer"
                onClick={() => scrollTo('top')}
            >
                <span className="text-white">Context</span>
                <span className="text-white/40">Bridge</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex gap-10 pointer-events-auto">
                <button
                    onClick={() => scrollTo('#section-about')}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                >
                    About
                </button>
                <button
                    onClick={() => scrollTo('#section-services')}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                >
                    Services
                </button>
                <button
                    onClick={() => scrollTo('#section-work')}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                >
                    Work
                </button>
            </div>

            {/* Contact CTA */}
            <button
                onClick={() => scrollTo('#section-contact')}
                className="hidden md:block pointer-events-auto px-5 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm hover:bg-white hover:text-black transition-all"
            >
                Contact
            </button>
        </nav>
    )
}
