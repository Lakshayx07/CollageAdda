"use client";
import React, { useState } from "react";
import { Check, Code, Palette, Search, Shield, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CollabPage() {
  const [cards, setCards] = useState([]);
  const [direction, setDirection] = useState("");

  const handleSwipe = (isAccept) => {
    if (cards.length === 0) return;
    setDirection(isAccept ? "right" : "left");
    
    // Simulate notification if accepted
    if (isAccept) {
      // In a real app, send API request here
    }

    setTimeout(() => {
      setCards(prev => prev.slice(1));
      setDirection("");
    }, 300);
  };

  return (
    <div className="page-shell flex flex-col overflow-hidden">
      <header className="page-header sticky top-0 z-40 px-5 py-5">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 text-left sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="icon-tile h-12 w-12">
              <Zap size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Team Matchmaker<span className="text-primary">.</span>
              </h1>
              <p className="mt-1 text-sm font-medium text-muted">Hackathons, side projects, societies, and startup teams.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="app-chip text-xs font-bold"><Code size={13} /> Dev</span>
            <span className="app-chip text-xs font-bold"><Palette size={13} /> Design</span>
            <span className="app-chip text-xs font-bold"><Shield size={13} /> Ops</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-8">
        <div className="relative w-full max-w-sm aspect-[3/4] perspective-1000">
          <AnimatePresence>
            {cards.length > 0 ? (
              <motion.div
                key={cards[0].id}
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  x: direction === "right" ? 200 : direction === "left" ? -200 : 0,
                  rotate: direction === "right" ? 15 : direction === "left" ? -15 : 0
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="app-panel absolute inset-0 rounded-[1.75rem] p-6 flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                    {cards[0].roleNeeded}
                  </span>
                  <span className="text-[10px] text-red-400 font-bold uppercase">
                    {cards[0].urgency} Urgency
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white leading-tight mb-2">{cards[0].title}</h2>
                <p className="text-sm text-white/50 mb-6">Hosted by <span className="text-white font-bold">{cards[0].host}</span></p>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <p className="text-white/80 text-sm leading-relaxed mb-6">
                    "{cards[0].description}"
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {cards[0].tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold text-white/60 bg-white/5 border border-white/5 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Swipe Buttons (Visual only, no actual drag for simplicity here, but fully functional buttons) */}
                <div className="flex justify-center space-x-6 pt-6 border-t border-white/10">
                  <button 
                    onClick={() => handleSwipe(false)}
                    className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  >
                    <X size={28} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => handleSwipe(true)}
                    className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  >
                    <Check size={28} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="app-panel absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] p-7 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <Search size={34} />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white">Project deck is empty</h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Team cards will appear here with roles, skills, urgency, and swipe actions.
                </p>
                <div className="mt-6 grid w-full grid-cols-3 gap-2">
                  {["Build", "Pitch", "Ship"].map((label) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-xs font-black uppercase tracking-wider text-white/70">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
