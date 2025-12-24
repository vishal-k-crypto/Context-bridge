'use client'

import AnimatedCounter from '@/components/ui/AnimatedCounter'

export default function StatsSection() {
    const stats = [
        { value: 500, suffix: '+', label: 'Automations Deployed' },
        { value: 50, suffix: 'M', label: 'Records Processed', prefix: '' },
        { value: 99.9, suffix: '%', label: 'Uptime Guarantee' },
        { value: 24, suffix: '/7', label: 'Support Available' },
    ]

    return (
        <section className="py-32 px-8 md:px-20 border-y border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-5xl md:text-6xl font-bold gradient-text mb-2">
                                <AnimatedCounter
                                    end={stat.value}
                                    prefix={stat.prefix}
                                    suffix={stat.suffix}
                                    duration={2500}
                                />
                            </div>
                            <div className="text-sm text-white/40 uppercase tracking-widest">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
