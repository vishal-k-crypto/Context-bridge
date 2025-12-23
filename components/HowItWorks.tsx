"use client";

import { motion } from "framer-motion";
import { Network, Code2, Shield, FileText } from "lucide-react";

const features = [
  {
    icon: Network,
    title: "MCP Protocol",
    description: "Anthropic's open standard for AI-tool connections",
  },
  {
    icon: Code2,
    title: "Python-Based",
    description: "Reliable, production-grade server implementation",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    description: "OAuth, API keys, JWT—whatever your system requires",
  },
  {
    icon: FileText,
    title: "Full Documentation",
    description: "Complete handoff with setup guides and code comments",
  },
];

const codeSnippet = `@server.tool()
async def get_user_data(user_id: str) -> dict:
    """Fetch user profile from CRM"""
    return await crm_client.get_user(user_id)`;

export default function HowItWorks() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Built on Industry Standards
          </h2>
        </motion.div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-primary-800" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Code snippet */}
        <motion.div
          className="mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-sm text-gray-400">mcp_server.py</span>
            </div>
            <pre className="p-6 overflow-x-auto">
              <code className="text-sm text-gray-300 font-mono">
                {codeSnippet}
              </code>
            </pre>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            Example MCP tool definition connecting Claude to a CRM
          </p>
        </motion.div>
      </div>
    </section>
  );
}
