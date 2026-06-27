"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#FAFAF8]">
      {/* Deep radial gradient to simulate the center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FFF8EC]/20 via-[#FAFAF8] to-[#FAFAF8]"></div>
      
      {/* Concentric Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute h-[150vw] w-[150vw] sm:h-[120vw] sm:w-[120vw] lg:h-[80vw] lg:w-[80vw] rounded-full border border-blue-500/10 opacity-50"
          style={{ borderStyle: "dashed", borderWidth: "2px" }}
        />
        {/* Ring 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute h-[120vw] w-[120vw] sm:h-[90vw] sm:w-[90vw] lg:h-[60vw] lg:w-[60vw] rounded-full border border-[#E8E6E0] opacity-60"
          style={{ borderTopStyle: "dashed", borderRightStyle: "dotted", borderWidth: "1px" }}
        />
        {/* Ring 3 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute h-[90vw] w-[90vw] sm:h-[60vw] sm:w-[60vw] lg:h-[45vw] lg:w-[45vw] rounded-full border-2 border-blue-600/30"
          style={{ borderStyle: "dashed" }}
        />
        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute h-[60vw] w-[60vw] sm:h-[40vw] sm:w-[40vw] lg:h-[30vw] lg:w-[30vw] rounded-full border border-cyan-300/40 opacity-80"
          style={{ borderLeftStyle: "dashed", borderBottomStyle: "dotted" }}
        />
        {/* Core Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute h-[30vw] w-[30vw] sm:h-[20vw] sm:w-[20vw] lg:h-[15vw] lg:w-[15vw] rounded-full border-4 border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.3)]"
          style={{ borderStyle: "dotted" }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-400"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [null, Math.random() * 0.8 + 0.2, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: Math.random() * 4 + 1 + "px",
              height: Math.random() * 4 + 1 + "px",
              boxShadow: "0 0 10px rgba(34, 211, 238, 0.8)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
