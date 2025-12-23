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
    stat: "3x faster",
    statLabel: "delivery",
    color: "rose",
  },
  {
    icon: Unlock,
    title: "Reverse Engineering Superpower",
    description:
      "We can connect tools even without official APIs. HAR file analysis means we access undocumented endpoints others can't.",
    stat: "Any tool",
    statLabel: "any API",
    color: "purple",
  },
  {
    icon: Zap,
    title: "Startup Speed",
    description:
      "No agency bureaucracy. No project managers. No committees. Direct founder-to-founder communication.",
    stat: "1-2 weeks",
    statLabel: "delivery",
    color: "yellow",
  },
  {
    icon: Gift,
    title: "Free Pilots",
    description:
      "Not sure if we're a fit? We build a free pilot to prove it. Only pay if you want to expand.",
    stat: "Zero",
    statLabel: "risk",
    color: "green",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function WhyUs() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white relative overflow-hidden" ref={ref}>
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, #f43f5e 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, #f97316 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, #f43f5e 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block px-4 py-2 bg-rose-500/20 border border-rose-500/50 rounded-full text-rose-400 text-sm font-medium backdrop-blur-sm mb-6"
          >
            Why Choose Us
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold">
            Why Context Bridge?
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {advantages.map((adv) => (
            <motion.div
              key={adv.title}
              variants={itemVariants}
              className="group relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all duration-300 overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-orange-500/0 group-hover:from-rose-500/10 group-hover:to-orange-500/10 transition-all duration-500" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 bg-rose-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <adv.icon className="w-7 h-7 text-rose-400" />
                </div>

                <h3 className="text-2xl font-bold mb-3">{adv.title}</h3>
                <p className="text-gray-400 mb-6">{adv.description}</p>

                {/* Stat */}
                <div className="flex items-baseline gap-2 pt-4 border-t border-white/10">
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                    {adv.stat}
                  </span>
                  <span className="text-gray-500">{adv.statLabel}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
