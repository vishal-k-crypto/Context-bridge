"use client";

import { motion } from "framer-motion";
import { Database, Users, FolderKanban, Code, XCircle } from "lucide-react";

const disconnectedTools = [
  { name: "Internal Tools & Databases", icon: Database },
  { name: "CRM Systems", icon: Users },
  { name: "Project Management", icon: FolderKanban },
  { name: "Custom APIs", icon: Code },
];

export default function Problem() {
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
            Your AI Can&apos;t Access Your Data
          </h2>
        </motion.div>

        <motion.div
          className="mt-8 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-lg text-gray-600">
            Your team uses Claude AI. You have valuable data locked in:
          </p>
        </motion.div>

        {/* Disconnected Tools Visual */}
        <motion.div
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {disconnectedTools.map((tool, index) => (
            <div
              key={tool.name}
              className="relative flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <tool.icon className="h-10 w-10 text-gray-400" />
              <p className="mt-3 text-sm font-medium text-gray-700 text-center">
                {tool.name}
              </p>
              {/* X indicator */}
              <div className="absolute -top-2 -right-2">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Problem statement */}
        <motion.div
          className="mt-12 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-6 bg-white rounded-xl border border-red-100 shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              But Claude <span className="font-semibold">can&apos;t access any of it</span>.
              Your team copies data manually, loses context, and wastes time on
              repetitive tasks that AI could handle.
            </p>
          </div>
        </motion.div>

        {/* Frustrated workflow illustration */}
        <motion.div
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-center w-32 h-16 bg-primary-100 text-primary-800 rounded-lg font-medium text-sm">
            Claude AI
          </div>
          <div className="text-red-400 text-2xl font-bold">
            <XCircle className="h-8 w-8" />
          </div>
          <div className="flex items-center justify-center w-32 h-16 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm">
            Your Data
          </div>
        </motion.div>
      </div>
    </section>
  );
}
