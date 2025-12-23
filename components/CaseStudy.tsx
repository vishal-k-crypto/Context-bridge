"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const caseStudies = [
  {
    title: "EdTech Platform",
    challenge: "Students needed conversational access to 62+ data points",
    solution: "MCP server with 16 tools connecting Claude to LMS API",
    results: [
      "62 API endpoints integrated",
      "Real-time data access",
      "Delivered in 2 weeks",
    ],
    tech: ["Python", "MCP", "REST API", "OAuth"],
    category: "MCP Server",
  },
  {
    title: "Marketing Agency Dashboard",
    challenge: "Manual client reporting from 5+ platforms",
    solution: "Custom dashboard aggregating data from all marketing tools",
    results: [
      "5 platforms integrated",
      "Automated weekly reports",
      "80% time saved",
    ],
    tech: ["Next.js", "APIs", "PostgreSQL", "Cron Jobs"],
    category: "Full-Stack + API",
  },
];

export default function CaseStudy() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900"
        >
          Recent Projects
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-slate-600 text-center mb-16 max-w-2xl mx-auto"
        >
          Real results for real businesses
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              className="p-8 border-2 border-slate-200 rounded-2xl hover:border-cyan-500 hover:shadow-2xl transition-all duration-300 bg-white"
            >
              {/* Category badge */}
              <motion.span
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium"
              >
                {study.category}
              </motion.span>

              <h3 className="text-2xl font-bold mt-4 mb-3 text-slate-900">
                {study.title}
              </h3>

              <div className="space-y-4 text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">Challenge:</p>
                  <p>{study.challenge}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Solution:</p>
                  <p>{study.solution}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900 mb-2">Results:</p>
                  <ul className="space-y-1">
                    {study.results.map((result, i) => (
                      <motion.li
                        key={result}
                        initial={{ opacity: 0, x: -10 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.2 + i * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-cyan-500">✓</span>
                        {result}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500 mb-2">Tech Stack:</p>
                  <div className="flex flex-wrap gap-2">
                    {study.tech.map((tech) => (
                      <motion.span
                        key={tech}
                        whileHover={{ scale: 1.1 }}
                        className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
