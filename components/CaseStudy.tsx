"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/contextbridge";

const results = [
  "Students query course data conversationally",
  "Real-time access to grades, deadlines, lectures",
  "100% API coverage of critical student workflows",
  "Deployed in 2 weeks",
];

const stats = [
  { value: "62", label: "API endpoints integrated" },
  { value: "16", label: "MCP tools created" },
  { value: "2-week", label: "delivery time" },
  { value: "100%", label: "test coverage" },
];

export default function CaseStudy() {
  return (
    <section className="section-padding bg-blue-50">
      <div className="container-max">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-4">
            Case Study
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Built for an EdTech Platform
          </h2>
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-2 gap-12 items-start">
          {/* Left column - Story */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div>
              <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wider">
                The Challenge
              </h3>
              <p className="mt-3 text-gray-700 leading-relaxed">
                An education technology platform needed students to access 62+
                data points across courses, assignments, lectures, and
                performance metrics through natural conversation.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wider">
                The Solution
              </h3>
              <p className="mt-3 text-gray-700 leading-relaxed">
                We built a custom MCP server with 16 integrated tools connecting
                Claude to their learning management system&apos;s API.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wider">
                The Result
              </h3>
              <ul className="mt-3 space-y-3">
                {results.map((result) => (
                  <li key={result} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right column - Stats */}
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg border border-primary-100"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Project Stats
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 bg-gray-50 rounded-xl text-center"
                >
                  <div className="text-3xl font-bold text-primary-800">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
            <button className="btn-primary">
              Book a Call to Discuss Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
