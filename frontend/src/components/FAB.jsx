"use client";
import React from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAB({ onClick, isVisible = true }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={onClick}
          className="fixed bottom-[90px] right-5 z-[100] flex items-center justify-center sm:hidden"
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            background: "var(--primary, #FDE68A)",
            color: "#FFFFFF",
            boxShadow: "0 8px 24px rgba(253, 230, 138,0.4), 0 4px 8px rgba(0,0,0,0.1)",
            border: "none",
            outline: "none",
            WebkitTapHighlightColor: "transparent"
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Create Post"
        >
          <Plus size={24} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
