import React from 'react';
import {
  Trophy, TrendingUp, Gamepad2, Star, Search, Shield, Zap,
  Users, Medal, Mic, Map, Target, Crown, Crosshair,
  Binoculars, CheckCircle, BarChart3, Users as UsersIcon, Share2, Edit2, Play
} from 'lucide-react';
import clsx from 'clsx';

export default function ValorantProfileCard({ formData }) {
  // Destructure with fallbacks
  const {
    username = 'ShadowXD',
    tagline = 'Ascendant vibes.',
    photo_url = 'https://i.pravatar.cc/300?u=val',
    current_rank = 'Ascendant 2',
    highest_rank = 'Ascendant 3 (E7A2)',
    current_rr = '68',
    kd_ratio = '1.68',
    win_rate = '52',
    acs = '238',
    agents = ['Jett', 'Reyna', 'Raze'],
    val_playstyle = ['Aggressive', 'Entry Fragger', 'Clutch Player', 'Team Player', 'Comms On'],
    val_looking_for = ['Competitive', 'Ranked Duo/Trio', 'Scrims', 'Tournament Team', 'Esports Org', 'Casual']
  } = formData || {};

  const playstyleIcons = {
    'Aggressive': Zap,
    'Entry Fragger': Target,
    'Clutch Player': Crown,
    'Team Player': Users,
    'Comms On': Mic,
    'Supportive': Shield
  };

  const lookingForIcons = {
    'Competitive': Trophy,
    'Ranked Duo/Trio': Users,
    'Scrims': Crosshair,
    'Tournament Team': Shield,
    'Esports Org': Crown,
    'Casual': Star
  };

  const getAgentInfo = (agent, index) => {
    const mockPickRates = ['62%', '58%', '55%'];
    const info = {
      'Jett': { bg: 'bg-blue-900', border: 'border-blue-400', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070' },
      'Reyna': { bg: 'bg-purple-900', border: 'border-purple-400', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=2000' },
      'Raze': { bg: 'bg-orange-900', border: 'border-orange-400', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=2000' },
    };
    return {
      name: agent,
      pickRate: mockPickRates[index % 3],
      ...(info[agent] || { bg: 'bg-[#1F2937]', border: 'border-[#6B7280]', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000' })
    };
  };

  return (
    <div className="w-full max-w-[1300px] mx-auto my-4 rounded-[1.6rem] overflow-hidden shadow-[0_0_70px_rgba(255,70,85,0.18)] relative bg-[#070A0F] border border-[#343A46] font-sans text-[#FFFFFF] p-4 sm:p-7">
      
      {/* BACKGROUND IMAGE / OMEN GRAPHIC */}
      <div 
        className="absolute top-0 right-0 w-[54%] h-[58%] bg-cover bg-left opacity-65 mix-blend-lighten pointer-events-none"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000)', maskImage: 'linear-gradient(to left, black, transparent)' }}
      />
      <div className="absolute right-[10%] top-14 hidden lg:block h-72 w-72 rotate-45 border-[42px] border-[#FF4655]/28 pointer-events-none" />
      <div className="absolute right-[18%] top-24 hidden lg:block h-44 w-44 rotate-45 bg-[#FF4655]/18 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#FF4655]/18 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090C10] via-[#090C10]/90 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090C10] via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M99.25 48.66V10.28c0-.59-.75-.86-1.12-.39l-41.92 52.4a.627.627 0 00.49 1.02h30.29c1.63 0 3.11-.79 4.02-2.12l8.24-12.53zM53.64 10.67l-45.2 56.49c-.37.46-.04 1.14.55 1.14h29.93c1.63 0 3.11-.79 4.02-2.12l11.23-17.07V11.06c0-.58-.75-.86-1.12-.39z" fill="#FF4655"/>
            </svg>
            <span className="text-[#FFFFFF] text-sm sm:text-base font-black tracking-[0.16em]">MY <span className="text-[#FF4655]">VALORANT</span> PLAYER CARD</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#3C4452] bg-[#111722]/80 text-xs font-bold tracking-widest text-[#E2E8F0] hover:bg-[#FFFFFF]/5 transition-colors">
              <Share2 size={14} /> SHARE CARD
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#FF2E48] hover:bg-[#FF4655] text-[#FFFFFF] text-xs font-bold tracking-widest transition-colors shadow-[0_4px_18px_rgba(255,70,85,0.45)]">
              <UsersIcon size={14} /> INVITE TO TEAM
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* LEFT COLUMN (Sections 1, 2, 4) */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
            
            {/* 1. BASIC INFO */}
            <div className="bg-[#101722]/92 border border-[#3C4452] rounded-2xl p-5 relative shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2 text-[#FF4655] mb-4">
                <UsersIcon size={14} className="fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4655]">1. BASIC INFO</span>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-[#A0AEC0] uppercase font-bold tracking-wider">IGN</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h2 className="text-3xl sm:text-4xl font-black truncate max-w-[270px]">{username}</h2>
                    <span className="bg-[#FF4655]/10 text-[#FF4655] px-2 py-0.5 rounded text-xs font-bold tracking-wider">#XDXD</span>
                  </div>
                  <div className="mt-6">
                    <span className="text-[10px] text-[#A0AEC0] uppercase font-bold tracking-wider">TAGLINE</span>
                    <p className="text-[#E2E8F0] text-sm mt-1">{tagline}</p>
                  </div>
                </div>

                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full p-1 border-2 border-[#FF4655] relative shadow-[0_0_20px_rgba(255,70,85,0.4)]">
                    <img src={photo_url || 'https://i.pravatar.cc/300?u=val'} alt="Profile" className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#12171D] border border-[#2B3240] p-1.5 rounded-full text-[#FFFFFF]">
                    <Edit2 size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CURRENT RANK */}
            <div className="bg-[#101722]/92 border border-[#3C4452] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2 text-[#FF4655] mb-2 absolute top-5 left-5 z-20">
                <Trophy size={14} className="fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4655]">2. CURRENT RANK</span>
              </div>
              
              <div className="flex items-center justify-between mt-8 relative z-10">
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[10px] text-[#A0AEC0] uppercase font-bold tracking-wider block">CURRENT RANK</span>
                    <span className="text-xl font-black mt-1 block">{current_rank}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A0AEC0] uppercase font-bold tracking-wider block">PEAK RANK</span>
                    <span className="text-sm font-bold text-[#E2E8F0] mt-1 block">{highest_rank}</span>
                  </div>
                </div>

                {/* Big Rank Icon Mock */}
                <div className="relative">
                  <div className="absolute inset-0 bg-[#39FF82]/20 blur-2xl rounded-full" />
                  <div className="w-32 h-32 sm:w-40 sm:h-40 relative z-10">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M50 10L90 40L50 90L10 40L50 10Z" fill="#14B8A6" stroke="#5EEAD4" strokeWidth="2"/>
                      <path d="M50 20L75 42L50 80L25 42L50 20Z" fill="#0F766E"/>
                      <path d="M50 30L65 45L50 70L35 45L50 30Z" fill="#A7F3D0"/>
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-[#A0AEC0] uppercase font-bold tracking-wider block mb-1">CURRENT RR</span>
                  <div className="text-2xl font-black mb-2">{current_rr} <span className="text-sm text-[#A0AEC0]">/ 100</span></div>
                  <div className="w-32 h-1.5 bg-[#2B3240] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF4655]" style={{ width: `${current_rr}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. AGENT POOL */}
            <div className="bg-[#101722]/92 border border-[#3C4452] rounded-2xl p-5 relative shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2 text-[#FF4655] mb-4">
                <UsersIcon size={14} className="fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4655]">4. AGENT POOL <span className="text-[#A0AEC0] ml-1">(TOP 3 AGENTS)</span></span>
              </div>
              
              <div className="flex gap-3 h-24">
                {agents.slice(0,3).map((agent, i) => {
                  if (!agent) return null;
                  const info = getAgentInfo(agent, i);
                  return (
                    <div key={i} className={clsx("flex-1 rounded-xl relative overflow-hidden border", info.border, info.bg)}>
                      <img src={info.img} alt={agent} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[10px] text-[#A0AEC0] block mb-0.5">Pick Rate</span>
                            <span className="text-[#FF4655] font-black text-xs">{info.pickRate}</span>
                          </div>
                          <span className="text-sm font-black uppercase tracking-wider">{info.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Sections 3, 5, Background) */}
          <div className="col-span-12 md:col-span-7 flex flex-col gap-4 justify-end md:pt-32">
            
            {/* 3. CORE STATS */}
            <div className="bg-[#101722]/92 border border-[#3C4452] rounded-2xl p-5 relative backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2 text-[#FF4655] mb-4">
                <BarChart3 size={14} className="fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4655]">3. CORE STATS</span>
              </div>
              
              <div className="flex justify-around items-center text-center">
                <div className="flex flex-col items-center gap-2">
                  <Target size={20} className="text-[#A0AEC0]" />
                  <span className="text-[10px] text-[#A0AEC0] uppercase font-bold tracking-wider">K/D RATIO</span>
                  <span className="text-2xl font-black">{kd_ratio}</span>
                </div>
                <div className="w-px h-12 bg-[#2B3240]" />
                <div className="flex flex-col items-center gap-2">
                  <Trophy size={20} className="text-[#A0AEC0]" />
                  <span className="text-[10px] text-[#A0AEC0] uppercase font-bold tracking-wider">WIN RATE</span>
                  <span className="text-2xl font-black">{win_rate}%</span>
                </div>
                <div className="w-px h-12 bg-[#2B3240]" />
                <div className="flex flex-col items-center gap-2">
                  <Zap size={20} className="text-[#A0AEC0]" />
                  <span className="text-[10px] text-[#A0AEC0] uppercase font-bold tracking-wider">ACS</span>
                  <span className="text-2xl font-black">{acs}</span>
                </div>
              </div>
            </div>

            {/* 5. PLAYSTYLE */}
            <div className="bg-[#101722]/92 border border-[#3C4452] rounded-2xl p-5 relative backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2 text-[#FF4655] mb-4">
                <Star size={14} className="fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4655]">5. PLAYSTYLE <span className="text-[#A0AEC0] ml-1">(SELECT ALL THAT APPLY)</span></span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {val_playstyle.slice(0,5).map(style => {
                  const Icon = playstyleIcons[style] || Gamepad2;
                  return (
                    <div key={style} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-[#2B3240] bg-[#181E25] text-center min-h-[90px]">
                      <Icon size={20} className="text-[#FF4655]" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#A0AEC0]">{style}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* FULL WIDTH BOTTOM (Section 6) */}
          <div className="col-span-12">
            {/* 6. LOOKING FOR */}
            <div className="bg-[#101722]/92 border border-[#3C4452] rounded-2xl p-5 relative shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2 text-[#FF4655] mb-4">
                <Search size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4655]">6. LOOKING FOR <span className="text-[#A0AEC0] ml-1">(SELECT ALL THAT APPLY)</span></span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {val_looking_for.map(look => {
                  const Icon = lookingForIcons[look] || UsersIcon;
                  return (
                    <div key={look} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#2B3240] bg-[#181E25]">
                      <Icon size={14} className="text-[#E2E8F0]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#E2E8F0] whitespace-nowrap">{look}</span>
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
