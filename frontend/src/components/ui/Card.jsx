"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

export function Card({ 
  children, 
  className,
  noPadding = false,
  hoverable = true,
  ...props 
}) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" } : {}}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={clsx(
        "bg-card border-y border-border/50 sm:border sm:rounded-[20px]",
        noPadding ? "" : "p-4 sm:p-6", // smaller padding on mobile
        className
      )}
      style={{
        boxShadow: "var(--shadow-card, 0 4px 10px rgba(0,0,0,0.05))",
        ...props.style
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
