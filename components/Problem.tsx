"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const problems = [
  { text: "Tools don't talk to each other", icon: "🔗" },
  { text: "Manual data entry eating your time", icon: "⏰" },
  { text: "AI can't access your business data", icon: "🤖" },
  { text: "Hiring multiple specialists is expensive", icon: "💸" },
  { text: "Agency quotes are $50K+", icon: "📈" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

export default function Problem() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white relative overflow-hidden" ref={ref}>
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 30% 70%, #ef4444 0%, transparent 50%)",
            "radial-gradient(circle at 70% 30%, #f97316 0%, transparent 50%)",
            "radial-gradient(circle at 30% 70%, #ef4444 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-sm font-medium backdrop-blur-sm mb-6"
            >
              The Problem
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold">
              Sound Familiar?
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="space-y-4"
          >
            {problems.map((problem) => (
              <motion.div
                key={problem.text}
                variants={itemVariants}
                className="group p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all duration-300 cursor-default"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">{problem.icon}</span>
                  <span className="text-lg sm:text-xl text-gray-200">{problem.text}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-xl sm:text-2xl font-semibold">
              <span className="text-gray-400">You need </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                one partner who can handle everything.
              </span>
            </p>
          </motion.div>

          {/* Visual separator */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
