"use client";

import { motion } from "framer-motion";
import { Rocket, Briefcase, Building2 } from "lucide-react";

const audiences = [
  {
    icon: Rocket,
    title: "SaaS Startups",
    description:
      "You've raised funding, built your product, and now need AI to work seamlessly with your data.",
  },
  {
    icon: Briefcase,
    title: "Growing Agencies",
    description:
      "Your team uses multiple tools and wants AI-powered efficiency without switching platforms.",
  },
  {
    icon: Building2,
    title: "Enterprise Teams",
    description:
      "Legacy systems need modern AI interfaces without expensive re-platforming projects.",
  },
];

export default function WhoWeServe() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Who We Work With
          </h2>
        </motion.div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center">
                <audience.icon className="h-7 w-7 text-accent-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">
                {audience.title}
              </h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {audience.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
