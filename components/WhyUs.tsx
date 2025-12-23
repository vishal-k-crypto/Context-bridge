"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Target, Unlock, Zap, Gift } from "lucide-react";

const advantages = [
  {
    icon: Target,
    title: "One Partner for Everything",
    description:
      "Most contractors specialize in ONE thing. You need APIs, web dev, AND automation? That's 3+ contractors. With us: one person handles it all.",
    stat: "3x faster delivery",
  },
  {
    icon: Unlock,
    title: "Reverse Engineering Superpower",
    description:
      "We can connect tools even without official APIs. HAR file analysis means we access undocumented endpoints others can't.",
    stat: "Any tool, any API",
  },
  {
    icon: Zap,
    title: "Startup Speed",
    description:
      "No agency bureaucracy. No project managers. No committees. Direct founder-to-founder communication.",
    stat: "1-2 week delivery",
  },
  {
    icon: Gift,
    title: "Free Pilots",
    description:
      "Not sure if we're a fit? We build a free pilot to prove it. Only pay if you want to expand.",
    stat: "Zero risk",
  },
];

export default function WhyUs() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-slate-900 text-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16"
        >
          Why Context Bridge?
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {advantages.map((adv, index) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 relative overflow-hidden group"
            >
              {/* Hover glow effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 transition-opacity"
              />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4"
                >
                  <adv.icon className="w-7 h-7 text-cyan-400" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-3">{adv.title}</h3>
                <p className="text-gray-300 mb-4">{adv.description}</p>

                <div className="pt-4 border-t border-white/20">
                  <span className="text-cyan-400 font-bold text-lg">
                    {adv.stat}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
