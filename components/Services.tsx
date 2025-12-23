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

export default function Services() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="services" className="py-24 bg-slate-50" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            What We Build
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            From AI integrations to complete automation systems—all from one partner
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              className={`p-8 rounded-2xl transition-all duration-300 ${
                service.highlight
                  ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white lg:col-span-2"
                  : "bg-white"
              }`}
            >
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  service.highlight ? "bg-white/20" : "bg-cyan-100"
                }`}
              >
                <service.icon
                  className={`w-7 h-7 ${
                    service.highlight ? "text-white" : "text-cyan-600"
                  }`}
                />
              </motion.div>

              {/* Title */}
              <h3
                className={`text-2xl font-bold mb-3 ${
                  service.highlight ? "text-white" : "text-slate-900"
                }`}
              >
                {service.title}
              </h3>

              {/* Description */}
              <p
                className={`mb-4 ${
                  service.highlight ? "text-cyan-50" : "text-slate-600"
                }`}
              >
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: index * 0.1 + i * 0.1 }}
                    className={`flex items-center gap-2 ${
                      service.highlight ? "text-cyan-50" : "text-slate-700"
                    }`}
                  >
                    <span
                      className={
                        service.highlight ? "text-cyan-200" : "text-cyan-500"
                      }
                    >
                      ✓
                    </span>
                    {feature}
                  </motion.li>
                ))}
              </ul>

              {/* Badge for featured service */}
              {service.highlight && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="mt-6"
                >
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    Featured Service
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
