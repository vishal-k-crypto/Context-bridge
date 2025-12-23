"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function HowItWorks() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden" ref={ref}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
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
            className="inline-block px-4 py-2 bg-rose-500/20 border border-rose-500/50 rounded-full text-rose-400 text-sm font-medium backdrop-blur-sm mb-6"
          >
            Technology
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Built on Industry Standards
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-rose-500/50 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Code snippet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-white/10">
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
