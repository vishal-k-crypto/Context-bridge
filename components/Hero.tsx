"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AnimatedFlowDiagram from "./AnimatedFlowDiagram";

const CALENDLY_URL = "https://calendly.com/contextbridge";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, #f43f5e 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, #f97316 0%, transparent 50%)",
            "radial-gradient(circle at 50% 80%, #f43f5e 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, #f43f5e 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-20 z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 bg-rose-500/20 border border-rose-500/50 rounded-full text-rose-400 text-sm font-medium backdrop-blur-sm">
              Full-Stack Automation Agency
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-rose-200 to-orange-200 leading-tight"
          >
            Your Business Tools,
            <br />
            Finally Connected
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4"
          >
            APIs • AI Integrations • Dashboards • Automation
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg sm:text-xl text-rose-400 font-medium mb-10"
          >
            One developer. Complete systems. Built in weeks.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <motion.a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(244, 63, 94, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-500 rounded-lg font-semibold text-lg shadow-xl inline-flex items-center gap-2"
            >
              Book Discovery Call
              <ArrowRight className="w-5 h-5" />
            </motion.a>

            <motion.a
              href="#services"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-rose-500/50 rounded-lg font-semibold text-lg backdrop-blur-sm hover:bg-rose-500/10 transition-colors inline-flex items-center"
            >
              See What We Build
            </motion.a>
          </motion.div>

          {/* Animated Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-16 sm:mt-20"
          >
            <AnimatedFlowDiagram />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-rose-400/50 rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-rose-400 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
