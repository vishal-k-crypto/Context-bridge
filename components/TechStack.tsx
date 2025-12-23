"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";

const techCategories = [
  {
    category: "AI & MCP",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    tools: ["Claude MCP", "OpenAI API", "RAG Systems", "Vector DBs"],
    gradient: "from-violet-600 via-purple-600 to-indigo-600",
    glowColor: "purple",
    bgGlow: "bg-purple-500",
  },
  {
    category: "Backend",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    tools: ["Python", "Node.js", "FastAPI", "Express"],
    gradient: "from-emerald-600 via-green-600 to-teal-600",
    glowColor: "green",
    bgGlow: "bg-emerald-500",
  },
  {
    category: "Frontend",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    tools: ["React", "Next.js", "Vue", "Tailwind CSS"],
    gradient: "from-rose-600 via-red-600 to-orange-600",
    glowColor: "rose",
    bgGlow: "bg-rose-500",
  },
  {
    category: "Databases",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    tools: ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
    gradient: "from-orange-600 via-amber-600 to-yellow-600",
    glowColor: "orange",
    bgGlow: "bg-orange-500",
  },
  {
    category: "APIs",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    tools: ["REST", "GraphQL", "Webhooks", "WebSockets"],
    gradient: "from-pink-600 via-rose-600 to-red-600",
    glowColor: "pink",
    bgGlow: "bg-pink-500",
  },
  {
    category: "Integrations",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    tools: ["Salesforce", "HubSpot", "Jira", "Shopify", "Zapier"],
    gradient: "from-rose-600 via-pink-600 to-red-600",
    glowColor: "indigo",
    bgGlow: "bg-indigo-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    } 
  }
};

const floatingAnimation = {
  y: [-5, 5, -5],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export default function TechStack() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden" ref={ref}>
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-600/20 rounded-full blur-[128px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/20 rounded-full blur-[128px]"
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={inView ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/30 rounded-full backdrop-blur-xl mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-rose-400 text-sm font-semibold tracking-wide uppercase">Technology Stack</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="text-white">Built with </span>
            <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Modern Tech
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            If it has an API, we can connect it. Our expertise spans the full stack.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
        >
          {techCategories.map((cat, index) => (
            <motion.div
              key={cat.category}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              onHoverStart={() => setHoveredCard(cat.category)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group relative"
            >
              {/* Glow effect on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredCard === cat.category ? 0.4 : 0 }}
                transition={{ duration: 0.3 }}
                className={`absolute -inset-1 ${cat.bgGlow} rounded-3xl blur-xl`}
              />
              
              <div className="relative h-full p-6 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden group-hover:border-slate-600/50 transition-colors duration-300">
                {/* Card gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Animated corner accent */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={hoveredCard === cat.category ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${cat.gradient} rounded-full blur-2xl opacity-30`}
                />
                
                <div className="relative z-10">
                  {/* Icon and title */}
                  <div className="flex items-center gap-4 mb-5">
                    <motion.div 
                      animate={hoveredCard === cat.category ? floatingAnimation : {}}
                      className={`p-3 rounded-xl bg-gradient-to-br ${cat.gradient} text-white shadow-lg`}
                    >
                      {cat.icon}
                    </motion.div>
                    <h3 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all duration-300">
                      {cat.category}
                    </h3>
                  </div>
                  
                  {/* Tools grid */}
                  <div className="flex flex-wrap gap-2">
                    {cat.tools.map((tool, toolIndex) => (
                      <motion.span
                        key={tool}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.5 + index * 0.1 + toolIndex * 0.05 }}
                        whileHover={{ 
                          scale: 1.05,
                          backgroundColor: "rgba(255,255,255,0.15)"
                        }}
                        className="px-4 py-2 bg-slate-800/60 backdrop-blur-sm rounded-xl text-sm text-slate-300 border border-slate-700/50 hover:border-slate-500/50 hover:text-white transition-all duration-200 cursor-default"
                      >
                        {tool}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom accent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-500 text-sm">
            ...and many more. We adapt to your existing infrastructure.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
