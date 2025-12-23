"use client";

import { motion } from "framer-motion";

export default function AnimatedFlowDiagram() {
  return (
    <div className="relative flex items-center justify-center gap-2 sm:gap-4 flex-wrap max-w-4xl mx-auto">
      {/* Particle effects */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
          className="absolute w-2 h-2 bg-rose-400 rounded-full blur-sm"
          style={{
            left: `${15 + i * 14}%`,
            top: `${40 + Math.sin(i) * 20}%`,
          }}
        />
      ))}

      {/* Box 1: Your Tools */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 min-w-[120px] sm:min-w-[150px] text-center"
      >
        <div className="text-2xl sm:text-3xl mb-2">🔧</div>
        <div className="font-semibold text-sm sm:text-base">Your Tools</div>
        <div className="text-xs sm:text-sm text-gray-300">CRM, DB, APIs</div>
      </motion.div>

      {/* Animated Arrow 1 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="hidden sm:block"
      >
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl sm:text-4xl text-rose-400"
        >
          →
        </motion.div>
      </motion.div>

      {/* Mobile Arrow */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8 }}
        className="sm:hidden text-2xl text-rose-400"
      >
        ↓
      </motion.div>

      {/* Box 2: Context Bridge (Center - Highlighted) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5, type: "spring" }}
        whileHover={{ scale: 1.08 }}
        className="relative p-4 sm:p-6 bg-gradient-to-br from-rose-500 to-orange-600 rounded-xl border-2 border-rose-300 min-w-[140px] sm:min-w-[160px] text-center shadow-2xl glow-rose"
      >
        {/* Glow ring */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-xl bg-rose-400/20 blur-xl -z-10"
        />
        <div className="text-2xl sm:text-3xl mb-2">🌉</div>
        <div className="font-bold text-sm sm:text-base">Context Bridge</div>
        <div className="text-xs sm:text-sm text-rose-100">APIs + MCP + Web</div>
      </motion.div>

      {/* Animated Arrow 2 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.3, type: "spring" }}
        className="hidden sm:block"
      >
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
          className="text-3xl sm:text-4xl text-rose-400"
        >
          →
        </motion.div>
      </motion.div>

      {/* Mobile Arrow */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.3 }}
        className="sm:hidden text-2xl text-rose-400"
      >
        ↓
      </motion.div>

      {/* Box 3: AI + Dashboard */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 min-w-[120px] sm:min-w-[150px] text-center"
      >
        <div className="text-2xl sm:text-3xl mb-2">🤖</div>
        <div className="font-semibold text-sm sm:text-base">AI + Dashboard</div>
        <div className="text-xs sm:text-sm text-gray-300">Claude, UI, Reports</div>
      </motion.div>
    </div>
  );
}
