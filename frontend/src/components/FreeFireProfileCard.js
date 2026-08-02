import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Users, Check, MapPin, Target, Gamepad2, Flame, Mic, Shield } from 'lucide-react';
import clsx from 'clsx';

export default function FreeFireProfileCard({ formData }) {
  // Safe defaults
  const ign = formData.username || 'SHADOW FF';
  const tagline = formData.tagline || "I don't chase, I eliminate.";
  const uid = 'UID: 123456789';
  
  const rankScore = formData.ff_rank_score || '9856';
  const currentRank = formData.current_rank || 'Grandmaster V';
  
  const kd = formData.kd_ratio || '3.45';
  const matches = formData.matches_played || '1250';
  const booyah = formData.booyah_rate || '28.6%';
  
  const preferredRoles = formData.ff_preferred_roles || ['Rusher'];
  const lookingFor = formData.ff_looking_for || ['Competitive', 'Ranked Duo/Trio', 'Casual'];

  // Icons for Playstyle roles
  const getRoleIcon = (role) => {
    switch(role.toLowerCase()) {
      case 'rusher': return <Flame size={14} />;
      case 'sniper': return <Target size={14} />;
      case 'support': return <Shield size={14} />;
      case 'bomber': return <Flame size={14} />; // fallback
      case 'igl': return <Mic size={14} />;
      case 'flanker': return <Flame size={14} />; // fallback
      default: return <Target size={14} />;
    }
  };

  const getLookingForIcon = (option) => {
    // Basic mapping for looking for icons
    return <Users size={12} className="opacity-70" />;
  };

  return (
    <div className="w-full max-w-[900px] min-h-[600px] bg-[#0E1015] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden font-sans border border-[#1F232B]">
      
      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black italic tracking-wider text-[#FBBF24]">FREE<span className="text-white">FIRE</span></div>
          <div className="text-sm font-bold text-gray-400 tracking-[0.2em] uppercase mt-1">PLAYER CARD</div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-[#2B3240] text-sm font-bold flex items-center gap-2 hover:bg-[#1A1E26] transition text-gray-300">
            <Share2 size={16} /> SHARE CARD
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-[#FBBF24] text-black text-sm font-black flex items-center gap-2 hover:bg-[#e6ab17] transition shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <Users size={16} /> INVITE TO SQUAD
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        
        {/* ── ROW 1: Identity & Rank ─────────────────────────────────────────────── */}
        <div className="flex gap-4">
          
          {/* Identity Box */}
          <div className="w-[58%] bg-[#14171E] rounded-2xl p-6 border border-[#1F232B] flex items-center gap-8 relative overflow-hidden group">
            {/* Background subtle glow */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-32 h-32 bg-[#FBBF24] rounded-full blur-[80px] opacity-10"></div>
            
            {/* Avatar container */}
            <div className="relative z-10 shrink-0">
              <div className="w-32 h-32 rounded-full border-4 border-[#FBBF24] shadow-[0_0_25px_rgba(251,191,36,0.4)] p-1 relative">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1F2B]">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://i.imgur.com/vHqQG2g.png" alt="Free Fire Placeholder" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0E1015] border border-[#FBBF24] text-white text-xs font-black px-3 py-1 rounded-md shadow-lg">
                68
              </div>
            </div>

            <div className="flex flex-col z-10 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-[28px] font-black uppercase tracking-tight text-white leading-none">{ign}</h2>
                <div className="bg-[#9333EA] rounded-md p-1 shadow-[0_0_10px_rgba(147,51,234,0.5)]">
                  <Check size={12} className="text-white" strokeWidth={4} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-4">
                <span>{uid}</span>
                <span className="cursor-pointer hover:text-white transition"><Target size={14} /></span>
              </div>
              
              <p className="text-gray-300 italic text-sm mb-5 opacity-80">
                {tagline}
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                  <Target size={14} className="text-[#FBBF24]" /> BR MAIN
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                  <MapPin size={14} className="text-gray-400" /> INDIA
                </div>
              </div>
            </div>
          </div>

          {/* Rank Box */}
          <div className="w-[42%] bg-[#14171E] rounded-2xl p-6 border border-[#1F232B] flex flex-col justify-center relative overflow-hidden">
            <h3 className="text-xs font-black tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <span className="text-[#FBBF24]">RANK</span> OVERVIEW
            </h3>
            
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 shrink-0 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                <img src="https://i.imgur.com/xO4b81o.png" alt="Grandmaster" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black uppercase text-white mb-1 tracking-wider">{currentRank}</h4>
                <div className="text-[10px] font-black text-gray-500 tracking-widest mb-1 flex items-center gap-1">
                  <span className="text-gray-400">§</span> SCORE
                </div>
                <div className="text-2xl font-black text-white mb-3">{rankScore}</div>
                <div className="h-1.5 w-full bg-[#1F232B] rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-[#FBBF24] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── ROW 2: Core Stats & Playstyle ─────────────────────────────────────────────── */}
        <div className="flex gap-4">
          
          {/* Core Stats Box */}
          <div className="w-[50%] bg-[#14171E] rounded-2xl p-6 border border-[#1F232B] flex flex-col justify-between">
            <h3 className="text-xs font-black tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <span className="text-[#FBBF24]">📊</span> CORE STATS
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <Target size={20} className="text-gray-400 mb-3" />
                <div className="text-[10px] font-bold text-gray-500 tracking-widest mb-1">K/D RATIO</div>
                <div className="text-3xl font-black text-white">{kd}</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <Gamepad2 size={20} className="text-gray-400 mb-3" />
                <div className="text-[10px] font-bold text-gray-500 tracking-widest mb-1">MATCHES PLAYED</div>
                <div className="text-3xl font-black text-white">{matches}</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <Flame size={20} className="text-gray-400 mb-3" />
                <div className="text-[10px] font-bold text-gray-500 tracking-widest mb-1">BOOYAH RATE</div>
                <div className="text-3xl font-black text-white">{booyah}</div>
              </div>
            </div>
          </div>

          {/* Playstyle Box */}
          <div className="w-[50%] bg-[#14171E] rounded-2xl p-6 border border-[#1F232B]">
            <h3 className="text-xs font-black tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <span className="text-[#FBBF24]">★</span> PLAYSTYLE
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {['Rusher', 'Sniper', 'Support', 'Bomber', 'Igl', 'Flanker'].map(role => {
                const isActive = preferredRoles.includes(role);
                return (
                  <div
                    key={role}
                    className={clsx(
                      "flex items-center gap-2 py-3 px-3 rounded-lg border text-[13px] font-bold transition-all",
                      isActive
                        ? "bg-[#1A1F2B] border-[#FBBF24] text-white shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                        : "bg-transparent border-[#1F232B] text-gray-400"
                    )}
                  >
                    <span className={isActive ? "text-[#FBBF24]" : "text-gray-500"}>
                      {getRoleIcon(role)}
                    </span>
                    {role}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── ROW 3: Agent Pool & Looking For ─────────────────────────────────────────────── */}
        <div className="flex gap-4">
          
          {/* Agent Pool Box */}
          <div className="w-[35%] bg-[#14171E] rounded-2xl p-6 border border-[#1F232B]">
            <div className="flex items-center gap-2 mb-6">
              <Users size={14} className="text-[#FBBF24]" />
              <h3 className="text-xs font-black tracking-widest text-[#FBBF24]">AGENT POOL</h3>
              <span className="text-[10px] font-bold text-gray-500 ml-2">TOP 3 AGENTS</span>
            </div>
            
            <div className="flex justify-between px-2">
              {/* Using placeholders to match user request screenshot */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#1A1E26] rounded-lg border border-[#2B3240] overflow-hidden mb-2">
                  <img src="https://i.imgur.com/Z4w29qV.png" alt="Jett" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-gray-300">Jett</span>
                <span className="text-[11px] font-black text-[#FBBF24]">62%</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#1A1E26] rounded-lg border border-[#2B3240] overflow-hidden mb-2">
                  <img src="https://i.imgur.com/uI9N0vP.png" alt="Hayato" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-gray-300">Hayato</span>
                <span className="text-[11px] font-black text-[#FBBF24]">58%</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#1A1E26] rounded-lg border border-[#2B3240] overflow-hidden mb-2">
                  <img src="https://i.imgur.com/4zQ32m3.png" alt="Alok" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-gray-300">Alok</span>
                <span className="text-[11px] font-black text-[#FBBF24]">55%</span>
              </div>
            </div>
          </div>

          {/* Looking For Box */}
          <div className="w-[65%] bg-[#14171E] rounded-2xl border border-[#1F232B] relative overflow-hidden flex flex-col justify-end p-6">
            {/* Background image mapping exactly to screenshot (A free fire crate) */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
              style={{ backgroundImage: "url('https://i.imgur.com/K1R9W1r.jpg')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#14171E] via-[#14171E]/90 to-transparent"></div>
            
            <div className="relative z-10 w-3/4">
              <h3 className="text-xs font-black tracking-widest text-[#FBBF24] mb-4 flex items-center gap-2">
                <Target size={14} /> LOOKING FOR
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {['Competitive', 'Ranked Duo/Trio', 'Scrims', 'Tournament Team', 'Esports Org', 'Casual'].map(item => {
                  // We map from what is collected in form OR just show static ones from the mock if not in array, 
                  // but we want to dynamically show what user picked if possible.
                  const isActive = lookingFor.includes(item);
                  return (
                    <div
                      key={item}
                      className={clsx(
                        "flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all",
                        isActive
                          ? "bg-[#1A1F2B]/80 border-[#FBBF24]/50 text-white backdrop-blur-sm"
                          : "bg-[#0E1015]/60 border-[#1F232B] text-gray-400 backdrop-blur-sm"
                      )}
                    >
                      {getLookingForIcon(item)}
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
