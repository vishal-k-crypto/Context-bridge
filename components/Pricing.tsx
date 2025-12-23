"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/contextbridge";

const features = [
  "Discovery & API analysis",
  "Custom MCP server development",
  "Authentication & security setup",
  "Full documentation & code handoff",
  "Deployment support",
  "30-day post-launch support",
];

export default function Pricing() {
  return (
    <section className="section-padding bg-gradient-to-b from-blue-50 to-white">
      <div className="container-max">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Transparent Pricing
          </h2>
        </motion.div>

        <motion.div
          className="mt-12 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-8 bg-primary-800 text-white text-center">
              <h3 className="text-xl font-semibold">
                Custom MCP Server Development
              </h3>
              <div className="mt-4">
                <span className="text-sm opacity-80">Starting at</span>
                <div className="text-5xl font-bold mt-1">$2,500</div>
              </div>
            </div>

            {/* Features */}
            <div className="p-8">
              <p className="text-sm text-gray-500 mb-6 text-center">
                Everything you need to connect Claude to your tools
              </p>
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700">
                    Typical delivery:
                  </span>{" "}
                  1-2 weeks
                </p>
              </div>

              <div className="mt-6">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <button className="btn-primary w-full">
                    Book Free Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="mt-8 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Fixed-price quotes provided after discovery call. No hidden fees.
        </motion.p>
      </div>
    </section>
  );
}
