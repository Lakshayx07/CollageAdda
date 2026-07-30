"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

export function Button({ 
  children, 
  variant = "primary", 
  disabled = false, 
  loading = false, 
  className,
  type = "button",
  ...props 
}) {
  const baseStyles = "relative flex items-center justify-center font-bold text-[14px] transition-all duration-250 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background select-none h-[44px] px-6 border border-transparent";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary-hover text-white rounded-[14px] shadow-[0_4px_14px_rgba(201,161,75,0.25)] hover:shadow-[0_8px_24px_rgba(201,161,75,0.38)]",
    secondary: "bg-card text-foreground rounded-[14px] border-border shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:border-border/80 hover:bg-secondary-background",
    danger: "bg-danger/10 text-danger rounded-[14px] shadow-sm hover:bg-danger/20 hover:shadow-md",
    ghost: "bg-transparent text-foreground-muted rounded-[14px] hover:bg-secondary-background hover:text-foreground"
  };

  return (
    <motion.button
      type={type}
      whileHover={(!disabled && !loading) ? { y: -2, scale: 1.015 } : {}}
      whileTap={(!disabled && !loading) ? { scale: 0.97, y: 0 } : {}}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variants[variant],
        (disabled || loading) ? "opacity-60 cursor-not-allowed pointer-events-none hover:translate-y-0 shadow-none hover:shadow-none" : "cursor-pointer",
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
      ) : (
        children
      )}
    </motion.button>
  );
}
