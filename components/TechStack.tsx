"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const techCategories = [
  {
    category: "AI & MCP",
    tools: ["Claude MCP", "OpenAI API", "RAG Systems", "Vector DBs"],
  },
  {
    category: "Backend",
    tools: ["Python", "Node.js", "FastAPI", "Express"],
  },
  {
    category: "Frontend",
    tools: ["React", "Next.js", "Vue", "Tailwind CSS"],
  },
  {
    category: "Databases",
    tools: ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
  },
  {
    category: "APIs",
    tools: ["REST", "GraphQL", "Webhooks", "WebSockets"],
  },
  {
    category: "Tools We Integrate",
    tools: ["Salesforce", "HubSpot", "Jira", "Shopify", "Custom APIs"],
  },
];

export default function TechStack() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Our Tech Stack
          </h2>
          <p className="text-xl text-slate-600">
            If it has an API, we can connect it
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {techCategories.map((cat, index) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200"
            >
              <h3 className="font-bold text-lg mb-4 text-slate-900">
                {cat.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.tools.map((tool, i) => (
                  <motion.span
                    key={tool}
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ delay: index * 0.1 + i * 0.05 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="px-3 py-1 bg-white rounded-lg text-sm shadow-sm border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all cursor-default"
                  >
                    {tool}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
