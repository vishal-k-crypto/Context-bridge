"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const problems = [
  "Tools don't talk to each other",
  "Manual data entry eating your time",
  "AI can't access your business data",
  "Hiring multiple specialists is expensive",
  "Agency quotes are $50K+",
];

export default function Problem() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-900 text-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="max-w-4xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-12 text-center"
          >
            Sound Familiar?
          </motion.h2>

          <div className="space-y-4">
            {problems.map((problem, index) => (
              <motion.div
                key={problem}
                initial={{ opacity: 0, x: -50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 cursor-default"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl sm:text-3xl">❌</span>
                  <span className="text-lg sm:text-xl">{problem}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-xl sm:text-2xl text-cyan-300 font-semibold">
              You need one partner who can handle everything.
            </p>
          </motion.div>

          {/* Visual separator */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
