"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  {
    number: "01",
    label: "Home Feed",
    tagline: "Everything happening on your campus.",
    description: "Stay updated with posts, photos, videos, polls, discussions and campus trends. Your campus pulse — live, always.",
    icon: "🏠",
    image: "/landing/feature-feed.png",
    color: "purple"
  },
  {
    number: "02",
    label: "College Pride",
    tagline: "Represent your college. Climb the leaderboard.",
    description: "Verify your student identity, earn XP points and push your college to the top of India's campus rankings.",
    icon: "🏆",
    image: "/landing/feature-pride.png",
    color: "amber"
  },
  {
    number: "03",
    label: "Explore",
    tagline: "Explore beyond your circle.",
    description: "Discover colleges across India, find students through Daily Discovery, and compete in cross-campus Arena battles.",
    icon: "🔭",
    image: "/landing/feature-explore.png",
    color: "teal"
  },
  {
    number: "04",
    label: "Network",
    tagline: "Meet students who matter.",
    description: "Connect with classmates, seniors, juniors and future teammates. Your campus network, finally in one place.",
    icon: "👥",
    image: "/landing/feature-network.png",
    color: "blue"
  },
  {
    number: "05",
    label: "Hustle Hub",
    tagline: "Buy. Sell. Earn.",
    description: "A student-only marketplace for books, hostel items, services and gigs. Trusted buyers and sellers, all verified students.",
    icon: "💸",
    image: "/landing/feature-hustle.png",
    color: "green"
  },
  {
    number: "06",
    label: "Collab",
    tagline: "Build together. Achieve more.",
    description: "Find teammates for hackathons, startups, and college projects. Match by skills — developer, designer, marketer.",
    icon: "🤝",
    image: "/landing/feature-collab.png",
    color: "pink"
  },
  {
    number: "07",
    label: "You're All Set!",
    tagline: "Your campus journey starts now.",
    description: "Connect. Engage. Grow. Make your college life unforgettable.",
    icon: "🚀",
    image: "/landing/feature-final.png",
    color: "purple",
    isFinal: true
  }
];

export function CampusCTA() {
  return (
    <div className="w-full bg-[#050814] py-24 px-6 flex flex-col items-center justify-center text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
        Your campus journey starts now.
      </h2>
      <p className="text-[#94a3b8] text-lg md:text-xl max-w-2xl mx-auto mb-12">
        Connect. Engage. Grow. Make your college life unforgettable.
      </p>
      
      <div className="flex items-center justify-center gap-4 md:gap-8 mb-16 relative">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] border-t-2 border-dashed border-[#C8922A]/30 z-0" />
        {['💬', '👥', '⚡', '🏆'].map((emoji, idx) => (
          <div key={idx} className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1e1e2e] border-2 border-[#C8922A]/30 flex items-center justify-center text-2xl md:text-3xl relative z-10 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
            {emoji}
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => window.open('https://campusadda.social/', '_blank', 'noopener,noreferrer')}
        className="block w-full max-w-sm mx-auto px-12 py-4 text-lg font-semibold rounded-full text-[#1A1A1A] bg-gradient-to-r from-[#C8922A] to-violet-500 hover:scale-105 hover:shadow-lg hover:shadow-[0_4px_14px_rgba(200,146,42,0.15)] transition-all duration-300"
      >
        Let's Go to CampusAdda 🚀
      </button>
    </div>
  );
}

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered) {
        setActiveTab(prev => (prev + 1) % tabs.length);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <div className="min-h-screen bg-[#080b1a] flex flex-col pt-24 pb-0 w-full overflow-hidden">
      <div className="flex-1 flex items-center w-full">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <span className="inline-block text-[#7c3aed] uppercase tracking-widest text-xs font-bold mb-4">
              FEATURES
            </span>
            <h2 className="text-[#f1f5f9] text-4xl md:text-[56px] leading-tight font-bold mb-6">
              Everything in <span className="bg-gradient-to-r from-[#C8922A] to-violet-400 bg-clip-text text-transparent">One Place.</span>
            </h2>
            <p className="text-[#94a3b8] text-lg md:text-xl">
              One platform. Every part of your college life.
            </p>
          </div>

          <div 
            className="flex flex-col lg:flex-row gap-16 items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* LEFT SIDE — TAB LIST */}
            <div className="flex-shrink-0 w-full lg:w-[340px] flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              {tabs.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`cursor-pointer rounded-lg transition-all duration-300 flex-shrink-0 w-[280px] lg:w-auto p-4 border-l-[3px] 
                      ${isActive 
                        ? 'bg-[rgba(124,58,237,0.12)] border-[#7c3aed] shadow-[inset_0_0_24px_rgba(124,58,237,0.15)]' 
                        : 'border-transparent hover:bg-[rgba(255,255,255,0.02)]'}`}
                  >
                    <div className="flex items-center gap-3">
                      {isActive && (
                        <div className="w-6 h-6 rounded-full bg-[#7c3aed] flex items-center justify-center text-xs text-[#1A1A1A] font-medium">
                          {tab.number}
                        </div>
                      )}
                      <h3 className={`font-semibold text-lg ${isActive ? 'text-[#f1f5f9]' : 'text-[#94a3b8]'}`}>
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </h3>
                    </div>
                    
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-[#f1f5f9] font-medium text-sm">
                            {tab.tagline}
                          </p>
                          <p className="mt-2 text-[#94a3b8] text-sm leading-relaxed">
                            {tab.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* RIGHT SIDE — LAPTOP MOCKUP */}
            <div className="flex-1 w-full flex flex-col items-center">
              <div className="relative w-full max-w-[580px]">
                {/* Glow behind */}
                <div className="absolute inset-0 bg-[#C8922A] opacity-20 blur-3xl rounded-full z-0" />
                
                <div className="relative z-10">
                  {/* TOP: screen */}
                  <div style={{ background: '#111118', borderRadius: '12px 12px 0 0', border: '2px solid #2d2d3d', padding: '10px 10px 0 10px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2d2d3d', margin: '0 auto 6px' }} />
                    <div style={{ background: '#000', borderRadius: '6px', overflow: 'hidden', aspectRatio: '16/10' }}>
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeTab}
                          src={tabs[activeTab].image || `https://via.placeholder.com/900x562/0f0b1e/7c3aed?text=${encodeURIComponent(tabs[activeTab].label)}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/900x562/0f0b1e/7c3aed?text=${encodeURIComponent(tabs[activeTab].label)}`;
                          }}
                          alt={tabs[activeTab].label}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                        />
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* BOTTOM: laptop base */}
                  <div style={{ background: '#1a1a2e', height: '18px', borderRadius: '0 0 4px 4px', border: '2px solid #2d2d3d', borderTop: 'none' }} />
                  {/* hinge/stand */}
                  <div style={{ background: '#141428', height: '10px', width: '40%', margin: '0 auto', borderRadius: '0 0 8px 8px' }} />
                </div>
              </div>

              {/* CTA if active tab is final */}
              <div className="h-24 mt-8 flex items-center justify-center w-full">
                <AnimatePresence>
                  {tabs[activeTab].isFinal && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="text-center w-full"
                    >
                      <a
                        href="https://campusadda.social/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-12 py-4 text-lg font-semibold rounded-full text-[#1A1A1A] bg-gradient-to-r from-[#C8922A] to-violet-500 hover:scale-105 hover:shadow-lg hover:shadow-[0_4px_14px_rgba(200,146,42,0.15)] transition-all duration-300"
                      >
                        Let's Go to CampusAdda 🚀
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom CTA Section */}
      <CampusCTA />
    </div>
  );
}
