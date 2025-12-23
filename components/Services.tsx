"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Bot, Link, Monitor, Zap, RefreshCw } from "lucide-react";

const services = [
  {
    icon: Bot,
    title: "MCP Server Development",
    description: "Connect Claude AI to your business tools and databases",
    features: ["Real-time data access", "Natural language queries", "Secure authentication"],
    highlight: true,
  },
  {
    icon: Link,
    title: "Custom API Automation",
    description: "Integrate any tools, even without official APIs",
    features: ["Reverse engineering", "Webhook systems", "Multi-platform sync"],
    highlight: false,
  },
  {
    icon: Monitor,
    title: "Full-Stack Development",
    description: "Custom dashboards, portals, and web applications",
    features: ["Admin panels", "Client portals", "SaaS interfaces"],
    highlight: false,
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Replace manual processes with intelligent automation",
    features: ["Complex logic", "Data pipelines", "Document generation"],
    highlight: false,
  },
  {
    icon: RefreshCw,
    title: "Business Process Automation",
    description: "End-to-end operational systems",
    features: ["Client onboarding", "Support automation", "Pipeline management"],
    highlight: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Services() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden" ref={ref}>
      {/* Background effects matching hero */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
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
            Our Services
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What We Build
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From AI integrations to complete automation systems—all from one partner
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className={`group relative p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 cursor-default ${
                service.highlight
                  ? "bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/50 lg:col-span-2"
                  : "bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10"
              }`}
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                service.highlight ? "bg-cyan-500/5" : "bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
              }`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                  service.highlight ? "bg-cyan-500/30" : "bg-cyan-500/20"
                }`}>
                  <service.icon className="w-7 h-7 text-cyan-400" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="mb-4 text-gray-400">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-gray-300"
                    >
                      <span className="text-cyan-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Badge for featured service */}
                {service.highlight && (
                  <div className="mt-6">
                    <span className="px-3 py-1 bg-cyan-500/30 backdrop-blur-sm rounded-full text-sm font-medium text-cyan-300">
                      ⭐ Featured Service
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
