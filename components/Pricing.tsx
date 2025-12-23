"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";

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

export default function Pricing() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600">
            Choose the package that fits your needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className={`p-8 rounded-2xl relative overflow-hidden ${
                pkg.highlighted
                  ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-2xl ring-4 ring-cyan-400 ring-offset-4"
                  : "bg-white border-2 border-slate-200"
              }`}
            >
              {pkg.highlighted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute top-4 right-4"
                >
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                    POPULAR
                  </span>
                </motion.div>
              )}

              <h3
                className={`text-2xl font-bold mb-2 ${
                  pkg.highlighted ? "text-white" : "text-slate-900"
                }`}
              >
                {pkg.name}
              </h3>

              <div
                className={`text-4xl font-bold mb-4 ${
                  pkg.highlighted ? "text-cyan-200" : "text-blue-600"
                }`}
              >
                {pkg.price}
              </div>

              <p
                className={`mb-6 ${
                  pkg.highlighted ? "text-cyan-50" : "text-slate-600"
                }`}
              >
                {pkg.description}
              </p>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, i) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: index * 0.1 + i * 0.05 }}
                    className={`flex items-start gap-2 ${
                      pkg.highlighted ? "text-white" : "text-slate-700"
                    }`}
                  >
                    <span
                      className={`mt-1 ${
                        pkg.highlighted ? "text-cyan-300" : "text-cyan-600"
                      }`}
                    >
                      ✓
                    </span>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  pkg.highlighted
                    ? "bg-white text-blue-600 hover:bg-cyan-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-slate-600"
        >
          All packages include: Source code ownership • 30-day support • Full
          documentation
        </motion.p>
      </div>
    </section>
  );
}
