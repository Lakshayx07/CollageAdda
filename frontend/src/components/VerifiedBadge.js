"use client";
import { motion } from "framer-motion";

export default function VerifiedBadge({ user, size = 14, className = "" }) {
  if (user && !user.isVerified) return null;

  return (
    <motion.span 
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`ml-1.5 inline-flex flex-shrink-0 items-center justify-center rounded-md border border-emerald-500/35 bg-white px-1.5 py-0.5 text-[10px] font-black uppercase leading-none tracking-wide text-emerald-600 shadow-sm ${className}`}
      title="Verified Student"
      style={{
        color: "#22C55E",
        fontSize: Math.max(9, Math.round(size * 0.62)),
      }}
    >
      Verified
    </motion.span>
  );
}
