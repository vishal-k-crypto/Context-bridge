"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/contextbridge";

export default function FinalCTA() {
  return (
    <section className="section-padding bg-primary-800">
      <div className="container-max">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Connect Your Tools to Claude?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Book a free 30-minute consultation. No commitment. We&apos;ll assess
            your use case and show you exactly what&apos;s possible.
          </p>

          <div className="mt-10">
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
              <button className="btn-white text-lg px-8 py-4">
                <Calendar className="mr-2 h-5 w-5" />
                Book Discovery Call
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </a>
          </div>

          <p className="mt-6 text-sm text-primary-200">
            Free consultation. No strings attached.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
