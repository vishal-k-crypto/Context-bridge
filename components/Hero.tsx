"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/contextbridge";

export default function Hero() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative section-padding container-max w-full">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight text-balance"
            {...fadeInUp}
          >
            Connect Claude AI to Your Business Tools
          </motion.h1>

          <motion.p
            className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Custom MCP servers that bridge the gap between AI assistants and
            your existing systems—built in days, not months.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
              <button className="btn-primary w-full sm:w-auto">
                Book Discovery Call
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </a>
            <a href="#solution">
              <button className="btn-secondary w-full sm:w-auto">
                See How It Works
              </button>
            </a>
          </motion.div>

          {/* Animated Diagram */}
          <motion.div
            className="mt-16 sm:mt-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              {/* Claude AI Box */}
              <motion.div
                className="flex items-center justify-center w-40 sm:w-48 h-20 sm:h-24 bg-primary-800 text-white rounded-xl shadow-lg font-semibold text-sm sm:text-base"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Claude AI
              </motion.div>

              {/* Arrow 1 */}
              <div className="hidden sm:flex items-center">
                <svg
                  width="60"
                  height="24"
                  viewBox="0 0 60 24"
                  className="text-accent-500"
                >
                  <defs>
                    <marker
                      id="arrowhead1"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="currentColor"
                      />
                    </marker>
                  </defs>
                  <line
                    x1="0"
                    y1="12"
                    x2="50"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="6 3"
                    markerEnd="url(#arrowhead1)"
                    className="animate-flow"
                  />
                </svg>
              </div>

              {/* Mobile Arrow */}
              <div className="sm:hidden flex flex-col items-center py-2">
                <svg
                  width="24"
                  height="40"
                  viewBox="0 0 24 40"
                  className="text-accent-500"
                >
                  <defs>
                    <marker
                      id="arrowheadMobile1"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="currentColor"
                      />
                    </marker>
                  </defs>
                  <line
                    x1="12"
                    y1="0"
                    x2="12"
                    y2="30"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="6 3"
                    markerEnd="url(#arrowheadMobile1)"
                    className="animate-flow"
                  />
                </svg>
              </div>

              {/* MCP Server Box */}
              <motion.div
                className="flex items-center justify-center w-40 sm:w-48 h-20 sm:h-24 bg-accent-500 text-white rounded-xl shadow-lg font-semibold text-sm sm:text-base"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                MCP Server
              </motion.div>

              {/* Arrow 2 */}
              <div className="hidden sm:flex items-center">
                <svg
                  width="60"
                  height="24"
                  viewBox="0 0 60 24"
                  className="text-accent-500"
                >
                  <defs>
                    <marker
                      id="arrowhead2"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="currentColor"
                      />
                    </marker>
                  </defs>
                  <line
                    x1="0"
                    y1="12"
                    x2="50"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="6 3"
                    markerEnd="url(#arrowhead2)"
                    className="animate-flow"
                  />
                </svg>
              </div>

              {/* Mobile Arrow */}
              <div className="sm:hidden flex flex-col items-center py-2">
                <svg
                  width="24"
                  height="40"
                  viewBox="0 0 24 40"
                  className="text-accent-500"
                >
                  <defs>
                    <marker
                      id="arrowheadMobile2"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="currentColor"
                      />
                    </marker>
                  </defs>
                  <line
                    x1="12"
                    y1="0"
                    x2="12"
                    y2="30"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="6 3"
                    markerEnd="url(#arrowheadMobile2)"
                    className="animate-flow"
                  />
                </svg>
              </div>

              {/* Your Tools Box */}
              <motion.div
                className="flex items-center justify-center w-40 sm:w-48 h-20 sm:h-24 bg-gray-800 text-white rounded-xl shadow-lg font-semibold text-sm sm:text-base"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                Your Tools
              </motion.div>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              Seamless, secure data flow between AI and your systems
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
