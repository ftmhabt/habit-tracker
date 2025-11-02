"use client";

import { motion } from "framer-motion";

export default function AnimatedHeader({ name }: { name: string }) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-2"
    >
      <h1 className="text-3xl font-semibold">Welcome back, {name} 👋</h1>
      <p className="text-muted-foreground">{formattedDate}</p>
    </motion.div>
  );
}
