"use client";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle({ compact = false }) {
  const { isDark, toggle } = useTheme();

  if (compact) {
    // Simple icon-only button for tight spaces (BottomNav area)
    return (
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="flex items-center justify-center w-9 h-9 rounded-2xl border border-white/8 bg-[#F3F2EE] text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F3F2EE] transition-all duration-200"
      >
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </motion.span>
      </button>
    );
  }

  // Full pill toggle for sidebar
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative flex items-center w-[52px] h-[28px] rounded-full border transition-all duration-300 shrink-0"
      style={{
        background: isDark ? "#1e1b4b" : "#e0f2fe",
        borderColor: isDark ? "rgba(124,92,255,0.3)" : "rgba(6,182,212,0.3)",
        boxShadow: isDark
          ? "0 0 10px rgba(124,92,255,0.2)"
          : "0 0 10px rgba(6,182,212,0.2)",
      }}
    >
      {/* Sliding circle */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute flex items-center justify-center w-[22px] h-[22px] rounded-full bg-white shadow-md"
        style={{ left: isDark ? "3px" : "27px" }}
      >
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-[13px] leading-none"
        >
          {isDark ? "🌙" : "☀️"}
        </motion.span>
      </motion.div>
    </button>
  );
}
