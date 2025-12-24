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
                className="text-xl font-bold tracking-tighter pointer-events-auto cursor-pointer mix-blend-difference"
                onClick={() => scrollTo('top')}
            >
                AGENCY<span className="opacity-30">.OS</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex gap-10 pointer-events-auto">
                <button
                    onClick={() => scrollTo('#section-about')}
                    className="text-sm text-white/50 hover:text-white transition-colors uppercase tracking-widest animated-underline"
                >
                    About
                </button>
                <button
                    onClick={() => scrollTo('#section-services')}
                    className="text-sm text-white/50 hover:text-white transition-colors uppercase tracking-widest animated-underline"
                >
                    Services
                </button>
                <button
                    onClick={() => scrollTo('#section-work')}
                    className="text-sm text-white/50 hover:text-white transition-colors uppercase tracking-widest animated-underline"
                >
                    Work
                </button>
            </div>

            {/* Contact CTA */}
            <button
                onClick={() => scrollTo('#section-contact')}
                className="hidden md:block pointer-events-auto px-6 py-3 border border-white/10 rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            >
                Contact
            </button>
        </nav>
    )
}
