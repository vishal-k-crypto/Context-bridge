"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Rocket, Briefcase, Building2 } from "lucide-react";

const audiences = [
  {
    icon: Rocket,
    title: "SaaS Startups",
    description:
      "You've raised funding, built your product, and now need AI to work seamlessly with your data.",
    gradient: "from-purple-500/20 to-blue-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    icon: Briefcase,
    title: "Growing Agencies",
    description:
      "Your team uses multiple tools and wants AI-powered efficiency without switching platforms.",
    gradient: "from-cyan-500/20 to-green-500/20",
    borderColor: "border-cyan-500/30",
  },
  {
    icon: Building2,
    title: "Enterprise Teams",
    description:
      "Legacy systems need modern AI interfaces without expensive re-platforming projects.",
    gradient: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function WhoWeServe() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden" ref={ref}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl" />
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
            Our Clients
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Who We Work With
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {audiences.map((audience) => (
            <motion.div
              key={audience.title}
              variants={itemVariants}
              className={`group p-8 bg-gradient-to-br ${audience.gradient} backdrop-blur-sm rounded-2xl border ${audience.borderColor} hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <audience.icon className="h-7 w-7 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {audience.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {audience.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
