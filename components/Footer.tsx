"use client";

import { motion } from "framer-motion";
import { Mail, Linkedin, ArrowUpRight } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/contextbridge";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-gray-400 relative overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">CB</span>
              </div>
              <span className="text-white font-bold text-xl">Context Bridge</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Full-stack automation agency. APIs, AI integrations, dashboards,
              and automation—all from one partner. We connect your business tools
              so you can focus on what matters.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="mailto:vishal@contextbridge.systems"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#services"
                  className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Services
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Book a Call
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:vishal@contextbridge.systems"
                  className="hover:text-cyan-400 transition-colors duration-200"
                >
                  vishal@contextbridge.systems
                </a>
              </li>
              <li className="text-gray-500">
                contextbridge.systems
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Context Bridge. Built for the AI-first era.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>All systems operational</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
