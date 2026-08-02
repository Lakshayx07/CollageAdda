import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, Gamepad2, Star, Search, Shield, Zap,
  Users, Medal, Mic, Map, Target, Crown, Crosshair,
  Binoculars, CheckCircle, BarChart3, Users as UsersIcon
} from 'lucide-react';
import clsx from 'clsx';

export default function BGMIProfileCard({ formData }) {
  // Destructure with fallbacks
  const {
    username = 'SHADOW_OP',
    display_name = 'Shadow Gaming',
    photo_url = 'https://i.pravatar.cc/300',
    current_rank = 'Ace Dominator',
    highest_rank = 'Conqueror',
    current_rp = '6432',
    kd_ratio = '4.82',
    matches_played = '1,240',
    top_10_rate = '71',
    preferred_roles = ['IGL', 'Assaulter'],
    playstyles = ['Aggressive', 'Competitive', 'Team Player', 'Tournament Ready', 'Mic ON'],
    looking_for = 'Tournament Team'
  } = formData || {};

  // Mappings
  const roleIcons = {
    'IGL': Crown,
    'Assaulter': Target,
    'Sniper': Crosshair,
    'Support': Shield,
    'Entry Fragger': Zap,
    'Scout': Binoculars
  };

  const playstyleIcons = {
    'Aggressive': Zap,
    'Competitive': Trophy,
    'Team Player': Users,
    'Tournament Ready': Medal,
    'Mic ON': Mic
  };

  const lookingForIcons = {
    'Rank Push': TrendingUp,
    'Tournament Team': Shield,
    'Scrims': Target,
    'Classic': Map,
    'Esports Org': Crown,
    'Casual': Star
  };

  const accentColor = '#39FF82'; // Neon green accent from the image
  const darkCard = '#111518';
  const borderSubtle = '#22292E';

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl relative bg-[#0B1015] border border-[#22292E] font-sans text-white">
      {/* BACKGROUND BANNER */}
      <div 
        className="absolute top-0 left-0 w-full h-[280px] bg-cover bg-center opacity-40 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070)' }}
      />
      <div className="absolute top-0 left-0 w-full h-[280px] bg-gradient-to-b from-transparent via-[#0B1015]/80 to-[#0B1015] pointer-events-none" />

      <div className="relative z-10 p-6">
        
        {/* ── TOP SECTION (Avatar & Identity) ── */}
        <div className="flex items-center gap-6 mb-8 pt-4">
          <div className="relative">
            {/* Hexagon Avatar */}
            <div 
              className="w-32 h-32 flex items-center justify-center p-1 bg-gradient-to-b from-[#39FF82] to-[#111518]"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${photo_url})`, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              />
            </div>
            {/* Level/Rating badge at bottom of hexagon */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0B1015] text-[#39FF82] border border-[#39FF82] px-3 py-0.5 rounded-full text-sm font-black shadow-[0_0_10px_rgba(57,255,130,0.3)]">
              78
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-widest text-white uppercase">{username}</h1>
              <CheckCircle size={22} className="text-[#39FF82] fill-[#39FF82]/20" />
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 mt-1 mb-4">
              <Shield size={14} />
              <span className="text-sm font-bold tracking-wider">{display_name}</span>
            </div>

            {/* Active Badges/Roles Header */}
            <div className="flex items-center gap-3">
              {preferred_roles.map((role, idx) => {
                const Icon = roleIcons[role] || Gamepad2;
                return (
                  <div key={role} className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider",
                    idx === 0 ? "bg-[#39FF82]/10 border border-[#39FF82]/30 text-[#39FF82]" : "bg-white/5 border border-white/10 text-gray-300"
                  )}>
                    <Icon size={14} className={idx === 0 ? "text-[#F5A623]" : ""} /> {role}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tournament Ready absolute badge top right */}
          <div className="self-end mb-10 flex items-center gap-2 bg-[#1A1A1A] border border-[#333] px-4 py-2 rounded-full shadow-lg">
            <Medal size={16} className="text-[#F5A623]" />
            <span className="text-xs font-black text-gray-300 tracking-wider">Tournament Ready</span>
          </div>
        </div>

        {/* ── MIDDLE SECTION (Rank & Stats) ── */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          
          {/* RANK BOX */}
          <div className="col-span-5 bg-[#111518] border border-[#22292E] rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#39FF82] mb-4">
              <Trophy size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Rank</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Dummy Rank Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#F5A623] to-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(245,166,35,0.2)]">
                <Crown size={40} className="text-white drop-shadow-md" />
              </div>
              
              <div>
                <h3 className="text-xl font-black text-white">{current_rank}</h3>
                <p className="text-xs text-gray-400 font-bold tracking-widest mt-1">
                  Highest: <span className="text-gray-200">{highest_rank}</span>
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="bg-[#22292E] text-gray-300 text-[10px] font-black px-1.5 py-0.5 rounded">RP</span>
                  <span className="text-sm font-black text-white">{current_rp} RP</span>
                </div>
              </div>
            </div>
          </div>

          {/* CORE STATS BOX */}
          <div className="col-span-7 bg-[#111518] border border-[#22292E] rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#39FF82] mb-6">
              <BarChart3 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Core Stats</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-[#22292E]">
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">K/D Ratio</p>
                <p className="text-3xl font-black text-white">{kd_ratio}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Matches Played</p>
                <p className="text-3xl font-black text-white">{matches_played}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Top 10 Rate</p>
                <p className="text-3xl font-black text-white">{top_10_rate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── GRIDS (Roles, Playstyle, Looking For) ── */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          
          {/* Preferred Role Grid */}
          <div className="col-span-4 bg-[#111518] border border-[#22292E] rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#39FF82] mb-4">
              <Gamepad2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Preferred Role <span className="text-gray-500 font-normal ml-1">(UP TO 2)</span></span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(roleIcons).map(role => {
                const Icon = roleIcons[role];
                const isActive = preferred_roles.includes(role);
                return (
                  <div key={role} className={clsx(
                    "flex items-center gap-1.5 p-2.5 rounded-lg text-xs font-bold transition-all",
                    isActive ? "bg-[#39FF82]/10 border border-[#39FF82] text-white" : "bg-transparent border border-[#22292E] text-gray-400"
                  )}>
                    <Icon size={14} className={isActive ? (role === 'IGL' ? 'text-[#F5A623]' : 'text-[#39FF82]') : "text-gray-500"} />
                    <span className="truncate">{role}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Playstyle Grid */}
          <div className="col-span-4 bg-[#111518] border border-[#22292E] rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#39FF82] mb-4">
              <Star size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Playstyle</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(playstyleIcons).map(style => {
                const Icon = playstyleIcons[style];
                const isActive = playstyles.includes(style);
                return (
                  <div key={style} className={clsx(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    isActive ? "bg-[#39FF82]/5 border border-[#39FF82]/50 text-gray-200" : "bg-transparent border border-[#22292E] text-gray-400"
                  )}>
                    <Icon size={12} className={isActive ? (style === 'Tournament Ready' || style === 'Competitive' ? 'text-[#F5A623]' : 'text-[#39FF82]') : "text-gray-500"} />
                    <span className="truncate">{style}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Looking For Grid */}
          <div className="col-span-4 bg-[#111518] border border-[#22292E] rounded-xl p-5">
            <div className="flex items-center gap-2 text-[#39FF82] mb-4">
              <Search size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Looking For</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(lookingForIcons).map(look => {
                const Icon = lookingForIcons[look];
                // Support both array and string for looking_for
                const isActive = Array.isArray(looking_for) ? looking_for.includes(look) : looking_for === look;
                return (
                  <div key={look} className={clsx(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    isActive ? "bg-[#39FF82]/5 border border-[#39FF82]/50 text-gray-200" : "bg-transparent border border-[#22292E] text-gray-400"
                  )}>
                    <Icon size={12} className={isActive ? "text-[#39FF82]" : "text-gray-500"} />
                    <span className="truncate">{look}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="flex items-center gap-4 mt-4">
          <button className="flex-1 bg-[#39FF82] hover:bg-[#39FF82]/90 text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
            <UsersIcon size={18} /> Invite to Squad
          </button>
          
          <button className="flex-1 bg-[#1A1F24] hover:bg-[#22292E] border border-[#2A3238] text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all">
            View Full Profile
          </button>

          <div className="bg-[#111518] border border-[#22292E] rounded-xl p-3 flex items-center gap-4 flex-1">
            <div className="w-10 h-10 bg-[#F5A623]/10 rounded-lg flex items-center justify-center border border-[#F5A623]/30">
              <Star size={20} className="text-[#F5A623]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-300">Sportsmanship <span className="text-[#39FF82] ml-2">4.9<span className="text-gray-500">/5</span></span></p>
              <p className="text-[10px] text-gray-500 mt-0.5">Matches Completed: 582</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
