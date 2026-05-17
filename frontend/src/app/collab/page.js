"use client";
import React, { useState } from "react";
import { Zap, Code, Shield, Palette, X, Check, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mockProjects = [
  { 
    id: 1, 
    title: "Smart India Hackathon 2024", 
    roleNeeded: "Frontend Dev (React/Next.js)", 
    host: "Rahul (DTU)",
    description: "Building an AI-based traffic management system. Need someone who can build sleek dashboards fast. Backend is ready in Node.js.",
    urgency: "High",
    tags: ["React", "Tailwind", "Hackathon"]
  },
  { 
    id: 2, 
    title: "Fintech Mobile App Startup", 
    roleNeeded: "UI/UX Designer", 
    host: "Sneha (Rishihood)",
    description: "Pre-seed funded startup looking for a creative designer. You'll get equity and stipend. Must know Figma.",
    urgency: "Medium",
    tags: ["Figma", "Fintech", "Startup"]
  },
  { 
    id: 3, 
    title: "Campus Events Platform", 
    roleNeeded: "Backend Dev (Node/Postgres)", 
    host: "Karan (SRM)",
    description: "I have the UI ready. Need someone to write the APIs and manage the database. Easy project for resume.",
    urgency: "Low",
    tags: ["Node.js", "Postgres", "Side Project"]
  }
];

export default function CollabPage() {
  const [cards, setCards] = useState(mockProjects);
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
    <div className="flex-1 flex flex-col h-full bg-[#050508] relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-8 relative z-10 text-center border-b border-white/5">
        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center justify-center mb-2">
          <Zap className="mr-3 text-blue-500" size={32} /> 
          Team Matchmaker<span className="text-blue-500">.</span>
        </h1>
        <p className="text-white/50 text-sm font-medium">
          Swipe to find your next co-founder, hackathon teammate, or project partner.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
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
                className="absolute inset-0 bg-[#0A0A0F] border border-white/10 rounded-[2rem] shadow-2xl shadow-black p-6 flex flex-col"
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
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white/30">
                <Search size={48} className="mb-4 opacity-20" />
                <h3 className="font-bold text-lg mb-1">No more projects</h3>
                <p className="text-xs">Check back later for new teams.</p>
                <button 
                  onClick={() => setCards(mockProjects)}
                  className="mt-6 px-4 py-2 border border-white/10 rounded-xl text-xs hover:bg-white/5 text-white/50"
                >
                  Reload Mock Data
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
