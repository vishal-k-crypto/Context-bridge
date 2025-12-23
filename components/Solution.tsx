"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Search, Zap, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover",
    description:
      "We analyze your tools, APIs, and workflows to understand exactly what Claude needs to access.",
  },
  {
    icon: Zap,
    title: "Build",
    description:
      "Custom MCP server developed in 1-2 weeks using Python, with full authentication and error handling.",
  },
  {
    icon: Rocket,
    title: "Deploy",
    description:
      "Seamless integration with your existing systems. Full documentation and handoff. No vendor lock-in.",
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
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Solution() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="solution" className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden" ref={ref}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

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
            Our Process
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            We Build Custom MCP Servers
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Model Context Protocol (MCP) is Anthropic&apos;s open standard for
            connecting AI to external tools.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative"
        >
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="group relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all duration-300"
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-rose-500/25">
                {index + 1}
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-rose-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-8 w-8 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
