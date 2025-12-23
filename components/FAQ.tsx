"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronDown, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "What services do you offer?",
    answer:
      "We offer five core services: MCP server development (connecting Claude AI to your tools), custom API automation, full-stack web development (dashboards and portals), workflow automation, and end-to-end business process automation.",
  },
  {
    question: "What's an MCP server?",
    answer:
      "MCP (Model Context Protocol) is Anthropic's standard for connecting AI assistants like Claude to external tools and data sources. An MCP server acts as a secure bridge between Claude and your business systems, allowing natural language queries of your data.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Most projects are completed in 1-2 weeks. Simple integrations may take just a few days, while complex full-stack platforms with multiple integrations typically take 2-3 weeks.",
  },
  {
    question: "What if our tool doesn't have an official API?",
    answer:
      "We can reverse-engineer APIs using HAR file analysis and browser inspection tools. If a tool works in a browser, we can likely automate it. We've done this successfully for multiple clients.",
  },
  {
    question: "Do we own the code?",
    answer:
      "Yes, 100%. We provide full source code, documentation, and deployment guides. No vendor lock-in—you can maintain or modify the code yourself.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Projects range from $2K-25K depending on scope. AI integrations start at $2-5K, operations automation runs $5-10K, and complete platforms are $10-25K. We provide fixed-price quotes after our discovery call.",
  },
  {
    question: "Do you offer a pilot or trial?",
    answer:
      "Yes! We offer free pilots for qualified projects. We'll build a small proof-of-concept to demonstrate value before you commit to a larger engagement.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors duration-200">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-4"
        >
          <ChevronDown className={`h-5 w-5 transition-colors duration-200 ${isOpen ? 'text-cyan-400' : 'text-gray-500'}`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden" ref={ref}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 text-sm font-medium backdrop-blur-sm mb-6"
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            FAQ
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="px-6 sm:px-8">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
