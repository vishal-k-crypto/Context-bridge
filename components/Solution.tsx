"use client";

import { motion } from "framer-motion";
import { Search, Zap, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover",
    emoji: "",
    description:
      "We analyze your tools, APIs, and workflows to understand exactly what Claude needs to access.",
  },
  {
    icon: Zap,
    title: "Build",
    emoji: "",
    description:
      "Custom MCP server developed in 1-2 weeks using Python, with full authentication and error handling.",
  },
  {
    icon: Rocket,
    title: "Deploy",
    emoji: "",
    description:
      "Seamless integration with your existing systems. Full documentation and handoff. No vendor lock-in.",
  },
];

export default function Solution() {
  return (
    <section id="solution" className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            We Build Custom MCP Servers
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Model Context Protocol (MCP) is Anthropic&apos;s open standard for
            connecting AI to external tools.
          </p>
        </motion.div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary-800" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connection line on desktop */}
        <div className="hidden md:block relative mt-[-180px] mb-[100px]">
          <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-accent-300 to-primary-200" />
        </div>
      </div>
    </section>
  );
}
