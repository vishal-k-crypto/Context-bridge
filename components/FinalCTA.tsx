"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/contextbridge";

export default function FinalCTA() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section
      className="py-32 relative overflow-hidden"
      ref={ref}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(135deg, #e11d48 0%, #f97316 50%, #dc2626 100%)",
            "linear-gradient(135deg, #f97316 0%, #dc2626 50%, #e11d48 100%)",
            "linear-gradient(135deg, #dc2626 0%, #e11d48 50%, #f97316 100%)",
            "linear-gradient(135deg, #e11d48 0%, #f97316 50%, #dc2626 100%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Ready to Get Started?
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Let&apos;s Connect Your Tools
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          >
            Book a free 30-minute consultation. No commitment. We&apos;ll assess
            your use case and show you exactly what&apos;s possible.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-rose-600 rounded-xl font-bold text-lg shadow-2xl shadow-black/20 hover:shadow-black/30 transition-shadow duration-300"
            >
              <Calendar className="w-6 h-6" />
              Book Discovery Call
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-white/60 text-sm"
          >
            Free consultation • No strings attached • Response within 24 hours
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
