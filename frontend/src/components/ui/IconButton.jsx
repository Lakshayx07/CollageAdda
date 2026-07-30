"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

export function IconButton({ 
  children, 
  disabled = false, 
  loading = false,
  className,
  type = "button",
  ...props 
}) {
  return (
    <motion.button
      type={type}
      whileHover={(!disabled && !loading) ? { scale: 1.05 } : {}}
      whileTap={(!disabled && !loading) ? { scale: 0.92 } : {}}
      disabled={disabled || loading}
      className={clsx(
        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        "text-foreground-muted hover:bg-secondary-background hover:text-foreground",
        (disabled || loading) ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer",
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
      ) : (
        children
      )}
    </motion.button>
  );
}
