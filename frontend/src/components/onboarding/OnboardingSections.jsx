"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Users, MessageSquareText, TrendingUp, Trophy, Search, 
  ShoppingBag, Briefcase, Plus, CheckCircle, ShieldCheck, 
  MapPin, Target, Zap, Heart, MessageCircle
} from "lucide-react";
import clsx from "clsx";

// Reusable hook for scroll animation
const useScrollFade = (ref) => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "0.5 0.5"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return { opacity, y, scale };
};

export const HeroSection = ({ onSkip, onStart }) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#C8922A]/10 blur-[150px] rounded-full z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#C8922A]/10 blur-[150px] rounded-full z-0" />
      
      {/* Network Animation Layer */}
      <div className="absolute inset-0 z-0 opacity-40">
        {/* Placeholder for SVG network lines, similar to login */}
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
           <motion.path 
             initial={{ pathLength: 0, opacity: 0 }}
             animate={{ pathLength: 1, opacity: 0.5 }}
             transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
             d="M100 200 Q 300 100 500 500 T 900 800" 
             stroke="#8b5cf6" strokeWidth="2" fill="none" 
           />
           <motion.path 
             initial={{ pathLength: 0, opacity: 0 }}
             animate={{ pathLength: 1, opacity: 0.5 }}
             transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
             d="M200 800 Q 400 900 600 400 T 800 200" 
             stroke="#06b6d4" strokeWidth="2" fill="none" 
           />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center space-x-2 bg-[#F3F2EE] border border-[#E8E6E0] px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#4A4A4A]">Your Campus Is Now Online</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] tracking-tighter leading-tight">
            The Social Layer of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8922A] via-[#D4A843] to-[#C8922A]">
              Your College.
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-[#6B6B6B] font-medium max-w-xl leading-relaxed"
        >
          Connect, discover, collaborate, and grow with students around you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button onClick={onStart} className="ca-btn-primary px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-[0_4px_14px_rgba(200,146,42,0.15)]">
            Start Exploring
          </button>
          <button onClick={onSkip} className="ca-btn-secondary px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest">
            Skip Tour
          </button>
        </motion.div>
      </div>

      {/* Floating Avatars */}
      {[
        { src: "https://ui-avatars.com/api/?name=A&background=8b5cf6&color=fff", top: "20%", left: "15%", delay: 0 },
        { src: "https://ui-avatars.com/api/?name=B&background=06b6d4&color=fff", top: "60%", left: "10%", delay: 0.5 },
        { src: "https://ui-avatars.com/api/?name=C&background=ec4899&color=fff", top: "30%", right: "15%", delay: 1 },
        { src: "https://ui-avatars.com/api/?name=D&background=10b981&color=fff", top: "70%", right: "10%", delay: 1.5 },
      ].map((avatar, i) => (
        <motion.div
          key={i}
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, delay: avatar.delay, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute w-16 h-16 rounded-full border-2 border-[#E8E6E0] overflow-hidden shadow-2xl z-10"
          style={{ top: avatar.top, left: avatar.left, right: avatar.right }}
        >
          <img src={avatar.src} alt="Student" className="w-full h-full object-cover" />
        </motion.div>
      ))}
    </section>
  );
};

export const PulseSection = () => {
  const ref = useRef(null);
  const { opacity, y, scale } = useScrollFade(ref);

  return (
    <section ref={ref} className="min-h-screen flex flex-col justify-center px-6 py-20 relative z-10">
      <motion.div style={{ opacity, y, scale }} className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-[#1A1A1A] shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)]">
            <MessageSquareText size={28} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter">
            Everything Happening On Your Campus
          </h2>
          <p className="text-lg text-[#6B6B6B] leading-relaxed font-medium">
            Posts, photos, videos, polls, discussions, and trends from students around you.
          </p>
        </div>

        <div className="relative h-[500px] w-full max-w-md mx-auto">
          {/* Feed Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="absolute top-0 left-0 w-full ca-card p-5 z-20 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C8922A] to-[#C8922A] p-[2px]">
                <div className="w-full h-full bg-[#F9F8F5] rounded-full" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">Rohan Sharma</p>
                <p className="text-[10px] text-[#6B6B6B]">2 hours ago</p>
              </div>
            </div>
            <p className="text-sm text-[#4A4A4A] mb-4">Just finished the hackathon! What an amazing experience building with Next.js and Supabase 🚀</p>
            <div className="flex items-center gap-4 text-[#6B6B6B] text-xs font-bold">
              <span className="flex items-center gap-1"><Heart size={14}/> 24</span>
              <span className="flex items-center gap-1"><MessageCircle size={14}/> 5</span>
            </div>
          </motion.div>

          {/* Feed Card 2 - Poll */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 40 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute top-32 left-8 w-[90%] ca-card p-5 z-10 opacity-60 scale-95"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#C8922A] mb-3">
              <TrendingUp size={14}/> Trending Poll
            </div>
            <p className="text-sm font-bold text-[#1A1A1A] mb-3">Best spot for late night coding?</p>
            <div className="space-y-2">
              <div className="w-full h-8 bg-[#F3F2EE] rounded-lg relative overflow-hidden flex items-center px-3 text-xs text-[#1A1A1A]">
                <motion.div initial={{width:0}} whileInView={{width:"65%"}} className="absolute left-0 top-0 h-full bg-[#C8922A]/10" />
                <span className="relative z-10 flex justify-between w-full"><span>Library</span><span>65%</span></span>
              </div>
              <div className="w-full h-8 bg-[#F3F2EE] rounded-lg relative overflow-hidden flex items-center px-3 text-xs text-[#1A1A1A]">
                <motion.div initial={{width:0}} whileInView={{width:"35%"}} className="absolute left-0 top-0 h-full bg-[#C8922A]/10" />
                <span className="relative z-10 flex justify-between w-full"><span>Hostel Room</span><span>35%</span></span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export const FindPeopleSection = () => {
  const ref = useRef(null);
  const { opacity, y, scale } = useScrollFade(ref);

  return (
    <section ref={ref} className="min-h-screen flex flex-col justify-center px-6 py-20 relative z-10 bg-[#F3F2EE]">
      <motion.div style={{ opacity, y, scale }} className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="order-2 lg:order-1 relative h-[400px] w-full flex items-center justify-center">
          <div className="relative w-full max-w-sm h-full">
            {/* Center Node */}
            <motion.div 
              initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: false }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-[#C8922A] to-[#D4A843] rounded-full border-4 border-white z-20 flex items-center justify-center shadow-[0_0_30px_rgba(200,146,42,0.3)]"
            >
              <Users size={32} className="text-[#1A1A1A]" />
            </motion.div>

            {/* Connecting Nodes */}
            {[
              { x: -100, y: -100, delay: 0.2, label: "Classmate" },
              { x: 100, y: -80, delay: 0.4, label: "Senior" },
              { x: -80, y: 100, delay: 0.6, label: "Teammate" },
              { x: 120, y: 80, delay: 0.8, label: "Friend" },
            ].map((node, i) => (
              <React.Fragment key={i}>
                {/* Line */}
                <svg className="absolute top-1/2 left-1/2 overflow-visible w-0 h-0 z-0">
                  <motion.line 
                    x1="0" y1="0" x2={node.x} y2={node.y} 
                    stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: node.delay }}
                  />
                </svg>
                {/* Node */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: node.delay + 0.5, type: "spring" }}
                  className="absolute top-1/2 left-1/2 w-14 h-14 rounded-full bg-[#F3F2EE] border border-[#E8E6E0] backdrop-blur-md flex items-center justify-center z-10 flex-col"
                  style={{ transform: `translate(calc(-50% + ${node.x}px), calc(-50% + ${node.y}px))` }}
                >
                  <span className="w-10 h-10 rounded-full bg-black/50" />
                  <span className="absolute -bottom-6 text-[10px] font-bold text-[#6B6B6B] bg-black/40 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {node.label}
                  </span>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2 space-y-6">
          <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-[#1A1A1A] shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)]">
            <Users size={28} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter">
            Find Your People
          </h2>
          <p className="text-lg text-[#6B6B6B] leading-relaxed font-medium">
            Connect with classmates, seniors, teammates, and future friends. Build your campus network effortlessly.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            {["Network", "Connections", "Direct Messages", "Leaderboard"].map((tag, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-[#F3F2EE] border border-[#E8E6E0] text-xs font-bold text-[#4A4A4A] uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
        </div>

      </motion.div>
    </section>
  );
};

export const ExploreSection = () => {
  const ref = useRef(null);
  const { opacity, y, scale } = useScrollFade(ref);

  return (
    <section ref={ref} className="min-h-screen flex flex-col justify-center px-6 py-20 relative z-10">
      <motion.div style={{ opacity, y, scale }} className="max-w-6xl mx-auto w-full space-y-16">
        
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#C8922A] to-[#D4A843] rounded-2xl flex items-center justify-center text-[#1A1A1A] shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)]">
            <Search size={28} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter">
            Discover Students Beyond Your Circle
          </h2>
          <p className="text-lg text-[#6B6B6B] leading-relaxed font-medium">
            Explore colleges, discover new students, and expand your campus network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Daily Discovery (Center Stage) */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="md:col-span-3 lg:col-span-1 lg:order-2 ca-card p-8 flex flex-col items-center text-center relative overflow-hidden border-cyan-500/30 ring-1 ring-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8922A]/10 blur-[50px]" />
            <SparklesIcon className="text-[#C8922A] mb-4 w-10 h-10" />
            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">Daily Discovery</h3>
            <p className="text-sm text-[#6B6B6B] mb-6">Students handpicked for your campus circle. Fresh recommendations every 12 hours.</p>
            
            <div className="w-full relative h-48 mt-auto flex items-center justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    scale: i === 1 ? 1 : 0.85,
                    x: i === 0 ? -60 : i === 2 ? 60 : 0,
                    zIndex: i === 1 ? 10 : 0,
                    opacity: i === 1 ? 1 : 0.4
                  }}
                  className="absolute w-32 h-40 bg-white rounded-2xl border border-[#E8E6E0] shadow-xl flex flex-col items-center justify-center p-3"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C8922A] to-[#C8922A] p-[2px] mb-2">
                    <div className="w-full h-full bg-white rounded-full" />
                  </div>
                  <div className="w-16 h-2 bg-[#F3F2EE] rounded-full mb-1" />
                  <div className="w-10 h-2 bg-[#F3F2EE] rounded-full mb-3" />
                  {i === 1 && <span className="text-[9px] text-[#C8922A] font-bold bg-[#C8922A]/10 px-2 py-0.5 rounded-full">98% Match</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Colleges */}
          <motion.div whileHover={{ y: -5 }} className="lg:order-1 ca-card p-6 flex flex-col">
            <MapPin className="text-[#C8922A] mb-4 w-8 h-8" />
            <h3 className="text-xl font-black text-[#1A1A1A] mb-2">Explore Colleges</h3>
            <p className="text-sm text-[#6B6B6B] mb-6">Discover campuses and see what's trending across the country.</p>
            <div className="mt-auto space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 bg-[#F3F2EE] p-3 rounded-xl">
                  <div className="w-10 h-10 bg-[#F3F2EE] rounded-lg" />
                  <div>
                    <div className="w-24 h-3 bg-[#F3F2EE] rounded-full mb-1" />
                    <div className="w-16 h-2 bg-[#F3F2EE] rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Arena */}
          <motion.div whileHover={{ y: -5 }} className="lg:order-3 ca-card p-6 flex flex-col">
            <Trophy className="text-yellow-400 mb-4 w-8 h-8" />
            <h3 className="text-xl font-black text-[#1A1A1A] mb-2">Campus Arena</h3>
            <p className="text-sm text-[#6B6B6B] mb-6">Sports and esports competitions across campuses. Register and compete.</p>
            <div className="mt-auto grid grid-cols-2 gap-3">
              {['BGMI', 'Valorant', 'Football', 'Cricket'].map(sport => (
                <div key={sport} className="bg-[#F3F2EE] py-2 px-3 rounded-xl text-[10px] font-bold text-center text-[#4A4A4A] uppercase tracking-widest border border-[#E8E6E0]">
                  {sport}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
};

export const CommunitySection = () => {
  const ref = useRef(null);
  const { opacity, y, scale } = useScrollFade(ref);

  return (
    <section ref={ref} className="min-h-screen flex flex-col justify-center px-6 py-20 relative z-10 bg-[#F3F2EE]">
      <motion.div style={{ opacity, y, scale }} className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="space-y-6">
          <div className="w-14 h-14 bg-purple-500/20 text-purple-500 rounded-2xl flex items-center justify-center border border-purple-500/30">
            <Users size={28} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter">
            Campus Community
          </h2>
          <p className="text-lg text-[#6B6B6B] leading-relaxed font-medium">
            Connect, share updates, ask questions, participate in college events, and compete on the campus leaderboard with your peers.
          </p>
        </div>

        <div className="relative h-[400px] flex items-center justify-center">
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-[#E8E6E0]">
            <img src="/welcome-community.png" alt="Campus Community" className="w-full h-full object-cover object-top" />
          </div>
        </div>

      </motion.div>
    </section>
  );
};

export const HustleHubSection = CommunitySection;

export const CollabSection = () => {
  const ref = useRef(null);
  const { opacity, y, scale } = useScrollFade(ref);

  return (
    <section ref={ref} className="min-h-screen flex flex-col justify-center px-6 py-20 relative z-10">
      <motion.div style={{ opacity, y, scale }} className="max-w-4xl mx-auto w-full text-center space-y-16">
        
        <div className="space-y-6">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#C8922A] to-[#D4A843] rounded-2xl flex items-center justify-center text-[#1A1A1A] shadow-lg">
            <Zap size={28} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter">
            Build Together
          </h2>
          <p className="text-lg text-[#6B6B6B] leading-relaxed font-medium max-w-2xl mx-auto">
            Find teammates for hackathons, startups, clubs, and projects. Turn ideas into reality.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* Students uniting */}
          <div className="flex -space-x-4">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
                className="w-16 h-16 rounded-full border-4 border-white bg-gradient-to-br from-[#C8922A] to-[#C8922A] p-[2px] z-10"
              >
                <div className="w-full h-full bg-[#F9F8F5] rounded-full flex items-center justify-center text-[#1A1A1A] font-bold text-xs">P{i}</div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.8 }}
            className="hidden md:flex text-[#6B6B6B]"
          >
            <Plus size={24} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
            className="ca-card p-6 border-[#C8922A]/30 text-left w-full md:w-80"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C8922A] bg-[#C8922A]/10 px-2 py-1 rounded border border-[#E8E6E0] mb-3 inline-block">Hackathon</span>
            <h3 className="text-lg font-black text-[#1A1A1A] mb-2">AI Study Assistant</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[9px] font-bold bg-[#F3F2EE] px-2 py-1 rounded-full text-[#4A4A4A]">Frontend</span>
              <span className="text-[9px] font-bold bg-[#F3F2EE] px-2 py-1 rounded-full text-[#4A4A4A]">Backend</span>
              <span className="text-[9px] font-bold bg-[#F3F2EE] px-2 py-1 rounded-full text-[#4A4A4A]">Design</span>
            </div>
            <div className="w-full ca-btn-primary py-2 text-xs text-center rounded-xl font-bold uppercase">Team Formed 🎉</div>
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
};

export const PrideSection = () => {
  const ref = useRef(null);
  const { opacity, y, scale } = useScrollFade(ref);

  return (
    <section ref={ref} className="min-h-screen flex flex-col justify-center px-6 py-20 relative z-10 bg-[#F3F2EE]">
      <motion.div style={{ opacity, y, scale }} className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="order-2 lg:order-1 relative h-[400px] flex items-center justify-center">
          <div className="relative z-10 ca-card p-8 text-center border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 1.5 }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#C8922A] to-[#D4A843] rounded-full flex items-center justify-center text-[#1A1A1A] shadow-xl shadow-[0_4px_14px_rgba(200,146,42,0.15)] border-4 border-white"
            >
              <ShieldCheck size={40} />
            </motion.div>
            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">Verified Student</h3>
            <p className="text-[#6B6B6B] text-sm mb-6">Rishihood University</p>
            <div className="bg-[#F3F2EE] rounded-xl p-4 flex items-center justify-between border border-[#E8E6E0]">
              <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">Campus Rank</span>
              <motion.span 
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="text-2xl font-black text-amber-400"
              >
                #4
              </motion.span>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 space-y-6">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/30">
            <Trophy size={28} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter">
            Represent Your College
          </h2>
          <p className="text-lg text-[#6B6B6B] leading-relaxed font-medium">
            Every verified student helps strengthen their campus community. Climb the leaderboard and earn achievement badges.
          </p>
        </div>

      </motion.div>
    </section>
  );
};

export const FinalCTASection = ({ onComplete }) => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-[#FAFAF8]" />
      
      <div className="relative z-10 max-w-xl mx-auto w-full text-center space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }}>
          <h2 className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter mb-6">
            Welcome To Your <br/> Campus Online
          </h2>
          <p className="text-lg text-[#6B6B6B] font-medium">
            CampusAdda brings together everything students need in one place.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false }} transition={{ delay: 0.2 }}
          className="ca-card p-6 text-left space-y-4 max-w-sm mx-auto"
        >
          {[
            { text: "Profile Created", done: true },
            { text: "College Verified", done: true },
            { text: "Make Your First Post", done: false },
            { text: "Connect With Students", done: false }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.done ? (
                <CheckCircle className="text-emerald-400" size={20} />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[#E8E6E0]" />
              )}
              <span className={clsx("font-bold text-sm", item.done ? "text-[#1A1A1A]" : "text-[#6B6B6B]")}>{item.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ delay: 0.4 }}
          className="flex flex-col gap-4 max-w-xs mx-auto"
        >
          <button onClick={onComplete} className="ca-btn-primary w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-[0_4px_14px_rgba(200,146,42,0.15)] hover:scale-105 transition-transform">
            Enter CampusAdda
          </button>
          <button onClick={onComplete} className="text-[#6B6B6B] hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-widest transition-colors py-2">
            View Tour Later
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const SparklesIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);
