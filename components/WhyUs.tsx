"use client";

import { motion } from "framer-motion";
import { Award, Clock, Code2, Key } from "lucide-react";

const reasons = [
  {
    icon: Award,
    title: "Deep MCP Expertise",
    description: "We've built 10+ production MCP servers across industries",
  },
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "1-2 weeks, not months. We move at startup speed",
  },
  {
    icon: Code2,
    title: "Production-Grade Code",
    description: "Battle-tested, documented, maintainable from day one",
  },
  {
    icon: Key,
    title: "No Lock-In",
    description:
      "You own the code. Full documentation. Freedom to maintain or modify",
  },
];

export default function WhyUs() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Why Context Bridge?
          </h2>
        </motion.div>

        <div className="mt-12 grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              className="flex gap-4 p-6 bg-gray-50 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <reason.icon className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {reason.title}
                </h3>
                <p className="mt-2 text-gray-600">{reason.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
