"use client";

import { motion } from "framer-motion";
import {
  Users,
  FolderKanban,
  Database,
  ShoppingCart,
  GraduationCap,
  Code,
} from "lucide-react";

const categories = [
  {
    icon: Users,
    name: "CRMs",
    tools: ["Salesforce", "HubSpot", "Pipedrive"],
  },
  {
    icon: FolderKanban,
    name: "Project Management",
    tools: ["Jira", "Asana", "Linear", "Monday.com"],
  },
  {
    icon: Database,
    name: "Databases",
    tools: ["PostgreSQL", "MongoDB", "MySQL", "Redis"],
  },
  {
    icon: ShoppingCart,
    name: "E-commerce",
    tools: ["Shopify", "WooCommerce", "BigCommerce"],
  },
  {
    icon: GraduationCap,
    name: "Education",
    tools: ["Canvas", "Moodle", "Custom LMS"],
  },
  {
    icon: Code,
    name: "Custom APIs",
    tools: ["REST", "GraphQL", "SOAP"],
  },
];

export default function TechStack() {
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
            We Integrate With Your Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            If it has an API, we can connect it to Claude
          </p>
        </motion.div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              className="p-6 bg-gray-50 rounded-xl border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <category.icon className="h-5 w-5 text-primary-800" />
                </div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1 bg-white text-sm text-gray-600 rounded-full border border-gray-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-8 text-center text-gray-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          ...and any other system with an API
        </motion.p>
      </div>
    </section>
  );
}
