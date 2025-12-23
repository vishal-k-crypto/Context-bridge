"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const techCategories = [
  {
    category: "AI & MCP",
    icon: "🤖",
    tools: ["Claude MCP", "OpenAI API", "RAG Systems", "Vector DBs"],
    color: "from-purple-500/20 to-blue-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    category: "Backend",
    icon: "⚙️",
    tools: ["Python", "Node.js", "FastAPI", "Express"],
    color: "from-green-500/20 to-cyan-500/20",
    borderColor: "border-green-500/30",
  },
  {
    category: "Frontend",
    icon: "💻",
    tools: ["React", "Next.js", "Vue", "Tailwind CSS"],
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30",
  },
  {
    category: "Databases",
    icon: "🗄️",
    tools: ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
  },
  {
    category: "APIs",
    icon: "🔗",
    tools: ["REST", "GraphQL", "Webhooks", "WebSockets"],
    color: "from-pink-500/20 to-purple-500/20",
    borderColor: "border-pink-500/30",
  },
  {
    category: "Tools We Integrate",
    icon: "🔧",
    tools: ["Salesforce", "HubSpot", "Jira", "Shopify", "Custom APIs"],
    color: "from-yellow-500/20 to-orange-500/20",
    borderColor: "border-yellow-500/30",
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function TechStack() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden" ref={ref}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
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
            Technology
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Tech Stack
          </h2>
          <p className="text-xl text-gray-400">
            If it has an API, we can connect it
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {techCategories.map((cat) => (
            <motion.div
              key={cat.category}
              variants={itemVariants}
              className={`group p-6 bg-gradient-to-br ${cat.color} rounded-2xl border ${cat.borderColor} hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <h3 className="font-bold text-lg text-white">
                  {cat.category}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-sm text-gray-300 border border-white/10 hover:border-white/30 hover:bg-white/20 transition-all duration-200 cursor-default"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
