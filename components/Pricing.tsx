"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/contextbridge";

const packages = [
  {
    name: "AI Integration",
    price: "$2-5K",
    description: "Perfect for solo founders and consultants",
    features: [
      "MCP server for 1-3 tools",
      "Claude AI integration",
      "Basic automation workflows",
      "Full documentation",
    ],
    highlighted: false,
  },
  {
    name: "Operations Automation",
    price: "$5-10K",
    description: "For growing agencies and small teams",
    features: [
      "3-5 API integrations",
      "Custom dashboard",
      "MCP integration",
      "Workflow automation",
      "30 days support",
    ],
    highlighted: true,
  },
  {
    name: "Complete Platform",
    price: "$10-25K",
    description: "Full-scale systems for funded startups",
    features: [
      "Full-stack web application",
      "Multiple API integrations",
      "MCP infrastructure",
      "Complete automation",
      "Ongoing support",
    ],
    highlighted: false,
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
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Pricing() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden" ref={ref}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-3xl" />
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
            Pricing
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Transparent Pricing
          </h2>
          <p className="text-xl text-gray-400">
            Choose the package that fits your needs
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.name}
              variants={itemVariants}
              className={`group relative p-8 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                pkg.highlighted
                  ? "bg-gradient-to-br from-rose-500/30 to-orange-600/30 border-2 border-rose-400 scale-105"
                  : "bg-white/5 border border-white/10 hover:border-rose-500/50 hover:bg-white/10"
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    MOST POPULAR
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">
                {pkg.name}
              </h3>

              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 mb-2">
                {pkg.price}
              </div>

              <p className="text-gray-400 mb-6">
                {pkg.description}
              </p>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-gray-300"
                  >
                    <Check className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  pkg.highlighted
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40"
                    : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                }`}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-gray-500"
        >
          All packages include: Source code ownership • 30-day support • Full documentation
        </motion.p>
      </div>
    </section>
  );
}
