"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowUpRight } from "lucide-react";

const caseStudies = [
  {
    title: "EdTech Platform",
    challenge: "Students needed conversational access to 62+ data points",
    solution: "MCP server with 16 tools connecting Claude to LMS API",
    results: [
      { metric: "62", label: "API endpoints" },
      { metric: "16", label: "MCP tools" },
      { metric: "2 weeks", label: "delivery" },
    ],
    tech: ["Python", "MCP", "REST API", "OAuth"],
    category: "MCP Server",
    gradient: "from-purple-500/20 to-blue-500/20",
    borderColor: "border-purple-500/50",
    accentColor: "text-purple-400",
  },
  {
    title: "Marketing Agency Dashboard",
    challenge: "Manual client reporting from 5+ platforms",
    solution: "Custom dashboard aggregating data from all marketing tools",
    results: [
      { metric: "5+", label: "platforms" },
      { metric: "80%", label: "time saved" },
      { metric: "Auto", label: "weekly reports" },
    ],
    tech: ["Next.js", "APIs", "PostgreSQL", "Cron Jobs"],
    category: "Full-Stack + API",
    gradient: "from-cyan-500/20 to-green-500/20",
    borderColor: "border-cyan-500/50",
    accentColor: "text-cyan-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function CaseStudy() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden" ref={ref}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
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
            Case Studies
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Recent Projects
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real results for real businesses
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {caseStudies.map((study) => (
            <motion.div
              key={study.title}
              variants={itemVariants}
              className={`group relative p-8 rounded-2xl bg-gradient-to-br ${study.gradient} backdrop-blur-sm border ${study.borderColor} hover:scale-[1.02] transition-transform duration-300`}
            >
              {/* Category badge */}
              <span className={`inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium ${study.accentColor} mb-4`}>
                {study.category}
              </span>

              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                {study.title}
                <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>

              {/* Challenge & Solution */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Challenge</p>
                  <p className="text-gray-200">{study.challenge}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Solution</p>
                  <p className="text-gray-200">{study.solution}</p>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-black/20 rounded-xl">
                {study.results.map((result, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-2xl font-bold ${study.accentColor}`}>{result.metric}</div>
                    <div className="text-xs text-gray-400">{result.label}</div>
                  </div>
                ))}
              </div>

              {/* Tech Stack */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {study.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-white/10 rounded text-xs font-medium text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
