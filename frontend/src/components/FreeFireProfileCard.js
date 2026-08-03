import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Users, Check, MapPin, Target, Gamepad2, Flame, Mic, Shield, Trophy } from 'lucide-react';

export default function FreeFireProfileCard({ formData }) {
  // Safe defaults
  const {
    username = 'SHADOW FF',
    tagline = "I don't chase, I eliminate.",
    photo_url = '',
    current_rank = 'Grandmaster V',
    ff_rank_score = '9856',
    kd_ratio = '3.45',
    matches_played = '1250',
    booyah_rate = '28.6%',
    ff_preferred_roles = ['Rusher'],
    ff_playstyles = ['Aggressive', 'Competitive', 'Mic On'],
    ff_looking_for = ['Rank Push', 'Tournament', 'Guild']
  } = formData || {};

  const uid = 'UID: 849204918';

  const roleIcons = {
    'Rusher': Flame,
    'Sniper': Target,
    'Support': Shield,
    'Bomber': Flame,
    'Igl': Mic,
    'Flanker': Target
  };

  return (
    <div 
      className="w-full max-w-[900px] min-h-[600px] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden font-sans border"
      style={{ backgroundColor: '#0E1015', borderColor: '#1F232B', color: '#FFFFFF' }}
    >
      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black italic tracking-wider" style={{ color: '#FBBF24' }}>
            FREE<span style={{ color: '#FFFFFF' }}>FIRE</span>
          </div>
          <div className="text-xs font-bold tracking-[0.2em] uppercase mt-1" style={{ color: '#9CA3AF' }}>
            PLAYER CARD
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: '#2B3240', color: '#D1D5DB' }}
          >
            <Share2 size={16} /> SHARE CARD
          </button>
          <button 
            className="px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-lg cursor-pointer"
            style={{ backgroundColor: '#FBBF24', color: '#000000' }}
          >
            <Users size={16} /> INVITE TO SQUAD
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        
        {/* ── ROW 1: Identity & Rank ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Identity Box */}
          <div 
            className="md:col-span-7 rounded-2xl p-6 border flex items-center gap-6 relative overflow-hidden"
            style={{ backgroundColor: '#14171E', borderColor: '#1F232B' }}
          >
            {/* Avatar container */}
            <div className="relative shrink-0">
              <div 
                className="w-28 h-28 rounded-full border-4 shadow-xl p-1 relative"
                style={{ borderColor: '#FBBF24' }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1F2B]">
                  {photo_url ? (
                    <img src={photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-2xl" style={{ backgroundColor: '#222834', color: '#FBBF24' }}>
                      {(username || 'F')[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 border text-xs font-black px-2.5 py-0.5 rounded-md shadow-lg"
                style={{ backgroundColor: '#0E1015', borderColor: '#FBBF24', color: '#FFFFFF' }}
              >
                LVL 68
              </div>
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black uppercase tracking-tight truncate" style={{ color: '#FFFFFF' }}>{username}</h2>
                <div className="rounded-md p-1 shrink-0" style={{ backgroundColor: '#9333EA' }}>
                  <Check size={12} style={{ color: '#FFFFFF' }} strokeWidth={4} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-medium mb-3" style={{ color: '#9CA3AF' }}>
                <span>{uid}</span>
              </div>
              
              <p className="italic text-xs mb-4 truncate" style={{ color: '#D1D5DB', opacity: 0.9 }}>
                "{tagline}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#D1D5DB' }}>
                  <Target size={14} style={{ color: '#FBBF24' }} /> BR MAIN
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#D1D5DB' }}>
                  <MapPin size={14} style={{ color: '#9CA3AF' }} /> INDIA
                </div>
              </div>
            </div>
          </div>

          {/* Rank Box */}
          <div 
            className="md:col-span-5 rounded-2xl p-6 border flex flex-col justify-center relative overflow-hidden"
            style={{ backgroundColor: '#14171E', borderColor: '#1F232B' }}
          >
            <h3 className="text-xs font-black tracking-widest mb-4 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
              <span style={{ color: '#FBBF24' }}>RANK</span> OVERVIEW
            </h3>
            
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 shrink-0 flex items-center justify-center rounded-2xl border p-2" style={{ backgroundColor: '#1A1F2B', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                <Trophy size={40} style={{ color: '#FBBF24' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-black uppercase mb-1 tracking-wider truncate" style={{ color: '#FFFFFF' }}>{current_rank}</h4>
                <div className="text-[10px] font-black tracking-widest mb-1 flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                  SCORE
                </div>
                <div className="text-2xl font-black mb-2" style={{ color: '#FFFFFF' }}>{ff_rank_score}</div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: '#1F232B' }}>
                  <div className="h-full w-[80%] rounded-full" style={{ backgroundColor: '#FBBF24' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── ROW 2: Core Stats & Playstyle ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Core Stats Box */}
          <div 
            className="md:col-span-5 rounded-2xl p-6 border flex flex-col justify-between"
            style={{ backgroundColor: '#14171E', borderColor: '#1F232B' }}
          >
            <h3 className="text-xs font-black tracking-widest mb-4 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
              <span style={{ color: '#FBBF24' }}>📊</span> CORE STATS
            </h3>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center">
                <Target size={18} className="mb-2" style={{ color: '#FBBF24' }} />
                <div className="text-[9px] font-black tracking-widest mb-1" style={{ color: '#9CA3AF' }}>K/D RATIO</div>
                <div className="text-xl font-black" style={{ color: '#FFFFFF' }}>{kd_ratio}</div>
              </div>
              <div className="flex flex-col items-center border-x px-1" style={{ borderColor: '#262C38' }}>
                <Gamepad2 size={18} className="mb-2" style={{ color: '#FBBF24' }} />
                <div className="text-[9px] font-black tracking-widest mb-1" style={{ color: '#9CA3AF' }}>MATCHES</div>
                <div className="text-xl font-black" style={{ color: '#FFFFFF' }}>{matches_played}</div>
              </div>
              <div className="flex flex-col items-center">
                <Flame size={18} className="mb-2" style={{ color: '#FBBF24' }} />
                <div className="text-[9px] font-black tracking-widest mb-1" style={{ color: '#9CA3AF' }}>BOOYAH %</div>
                <div className="text-xl font-black" style={{ color: '#FFFFFF' }}>{booyah_rate}</div>
              </div>
            </div>
          </div>

          {/* Preferred Roles */}
          <div 
            className="md:col-span-7 rounded-2xl p-6 border flex flex-col justify-between"
            style={{ backgroundColor: '#14171E', borderColor: '#1F232B' }}
          >
            <h3 className="text-xs font-black tracking-widest mb-4 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
              <span style={{ color: '#FBBF24' }}>🔥</span> PREFERRED ROLES
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {['Rusher', 'Sniper', 'Support', 'Bomber', 'Igl', 'Flanker'].map(role => {
                const IconComponent = roleIcons[role] || Target;
                const active = ff_preferred_roles.includes(role);
                return (
                  <div
                    key={role}
                    className="p-3 rounded-xl border flex items-center gap-2 transition"
                    style={{
                      backgroundColor: active ? 'rgba(251, 191, 36, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      borderColor: active ? '#FBBF24' : '#262C38',
                      color: active ? '#FBBF24' : '#D1D5DB'
                    }}
                  >
                    <IconComponent size={14} style={{ color: active ? '#FBBF24' : '#9CA3AF' }} />
                    <span className="text-xs font-bold truncate">{role}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── ROW 3: Playstyle & Looking For ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          <div 
            className="md:col-span-6 rounded-2xl p-5 border"
            style={{ backgroundColor: '#14171E', borderColor: '#1F232B' }}
          >
            <h3 className="text-xs font-black tracking-widest mb-3 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
              <span style={{ color: '#FBBF24' }}>⭐</span> PLAYSTYLE
            </h3>
            <div className="flex flex-wrap gap-2">
              {ff_playstyles.map(style => (
                <span
                  key={style}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold"
                  style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)', color: '#FBBF24' }}
                >
                  {style}
                </span>
              ))}
            </div>
          </div>

          <div 
            className="md:col-span-6 rounded-2xl p-5 border"
            style={{ backgroundColor: '#14171E', borderColor: '#1F232B' }}
          >
            <h3 className="text-xs font-black tracking-widest mb-3 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
              <span style={{ color: '#FBBF24' }}>🎯</span> LOOKING FOR
            </h3>
            <div className="flex flex-wrap gap-2">
              {ff_looking_for.map(item => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: '#262C38', color: '#D1D5DB' }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
