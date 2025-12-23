"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What's an MCP server?",
    answer:
      "MCP (Model Context Protocol) is Anthropic's standard for connecting AI assistants like Claude to external tools and data sources. An MCP server acts as a secure bridge between Claude and your business systems.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Most integrations are completed in 1-2 weeks, depending on API complexity and number of endpoints.",
  },
  {
    question: "What if our API isn't documented?",
    answer:
      "We can reverse-engineer APIs using HAR file analysis and browser inspection tools. We've done this successfully for multiple clients.",
  },
  {
    question: "Do we own the code?",
    answer:
      "Yes, 100%. We provide full source code, documentation, and deployment guides. No vendor lock-in.",
  },
  {
    question: "What tools can you integrate?",
    answer:
      "Any system with an API—REST, GraphQL, SOAP, or custom protocols. If it has an API, we can connect it.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Projects start at $2,500 depending on scope. We provide fixed-price quotes after discovery call.",
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
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
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
            <p className="pb-5 text-gray-600 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          className="mt-12 max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
