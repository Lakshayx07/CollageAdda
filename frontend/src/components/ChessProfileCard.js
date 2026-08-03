import React from 'react';
import { Share2, UserPlus, Check, MapPin, Calendar, Zap, Target, Brain, Crown, Scale, TrendingUp, Trophy, Smile, Users, Sword, Flame, Navigation, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function ChessProfileCard({ formData }) {
  // Safe defaults
  const ign = formData.username || 'KnightMaster';
  const tagline = formData.tagline || 'Think • Plan • Win';
  const uid = 'Player ID: CHS78902';
  
  const currentRating = formData.chess_current_rating || '1824';
  const playFormat = formData.chess_play_format || 'Rapid';
  const rankName = 'Diamond I'; // Determined by rating conceptually
  const progressToNext = 2000;
  
  const highestRating = formData.chess_highest_rating || '1943';
  const gamesPlayed = formData.chess_games_played || '842';
  const winRate = formData.chess_win_rate || '58%';
  
  const playStyles = formData.chess_playstyles || ['Aggressive', 'Tactical', 'Positional'];
  const lookingFor = formData.chess_looking_for || ['Practice', 'Improve', 'Tournaments'];

  const getPlayStyleStyle = (style) => {
    switch (style.toLowerCase()) {
      case 'aggressive': return { icon: <Zap size={14} />, color: 'text-purple-400' };
      case 'tactical': return { icon: <Target size={14} />, color: 'text-blue-400' };
      case 'positional': return { icon: <Navigation size={14} />, color: 'text-green-500' };
      case 'calculative': return { icon: <Brain size={14} />, color: 'text-yellow-400' };
      case 'endgame focused': return { icon: <Crown size={14} />, color: 'text-red-500' };
      case 'balanced': return { icon: <Scale size={14} />, color: 'text-purple-300' };
      default: return { icon: <Activity size={14} />, color: 'text-[#9CA3AF]' };
    }
  };

  const getLookingForStyle = (option) => {
    switch (option.toLowerCase()) {
      case 'practice': return { icon: <Check size={14} />, color: 'text-green-400' };
      case 'improve': return { icon: <TrendingUp size={14} />, color: 'text-blue-400' };
      case 'tournaments': return { icon: <Trophy size={14} />, color: 'text-yellow-500' };
      case 'casual': return { icon: <Smile size={14} />, color: 'text-purple-400' };
      case 'serious matches': return { icon: <Flame size={14} />, color: 'text-red-500' };
      case 'clubs / teams': return { icon: <Users size={14} />, color: 'text-green-500' };
      default: return { icon: <Check size={14} />, color: 'text-[#9CA3AF]' };
    }
  };

  return (
    <div className="w-full max-w-[950px] min-h-[600px] bg-[#0A0D14] rounded-3xl p-6 md:p-8 text-[#FFFFFF] shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden font-sans border border-[#1C2028]">
      
      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 text-[#CD8C38] opacity-90">
             <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.8 19H5.2c-.7 0-1.2.6-1.2 1.2V21c0 .6.5 1 1.2 1h13.6c.7 0 1.2-.4 1.2-1v-.8c0-.6-.5-1.2-1.2-1.2zM15 2h-6c-1.1 0-2 .9-2 2v2h10V4c0-1.1-.9-2-2-2zM6 8h12v2H6zm1.3 4h9.4l-.8 5H8.1l-.8-5z" />
            </svg>
          </div>
          <div className="text-xl md:text-2xl font-black tracking-widest text-[#CD8C38]">CHESS</div>
          <div className="text-sm font-bold text-[#E5E7EB] tracking-widest uppercase mt-1">PLAYER CARD</div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-[#2B3240] text-sm font-bold flex items-center gap-2 hover:bg-[#1A1E26] transition text-[#D1D5DB]">
            <Share2 size={16} /> SHARE CARD
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-[#CD8C38] text-[#1a1104] text-sm font-black flex items-center gap-2 hover:bg-[#e09d43] transition shadow-[0_0_20px_rgba(205,140,56,0.3)]">
            <UserPlus size={16} /> INVITE TO PLAY
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        
        {/* ── ROW 1 ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-5 h-[280px]">
          
          {/* Identity Box */}
          <div className="w-full md:w-[65%] bg-[#12151C] rounded-2xl border border-[#1C2028] relative overflow-hidden group shadow-lg">
            {/* Background Board Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
              style={{ backgroundImage: "url('https://i.imgur.com/5V3xP3u.jpg')" }} 
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14] via-[#0A0D14]/80 to-transparent"></div>
            
            <div className="relative z-10 p-8 flex items-center gap-8 h-full">
              {/* Avatar container */}
              <div className="relative shrink-0">
                <div className="w-36 h-36 rounded-full border-2 border-[#CD8C38] shadow-[0_0_40px_rgba(205,140,56,0.5)] p-1 relative">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1F2B]">
                    {formData.photo_url ? (
                      <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <img src="https://i.imgur.com/QkE19jD.png" alt="Chess Placeholder" className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0A0D14] border border-[#CD8C38] text-[#FFFFFF] text-sm font-black px-4 py-1.5 rounded-lg shadow-lg">
                  76
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-[32px] font-bold tracking-tight text-[#FFFFFF] leading-none">{ign}</h2>
                  <div className="bg-[#CD8C38] rounded-md p-1 shadow-[0_0_10px_rgba(205,140,56,0.5)]">
                    <Check size={14} className="text-[#0A0D14]" strokeWidth={4} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-[#9CA3AF] font-medium mb-4">
                  <span>{uid}</span>
                  <span className="cursor-pointer hover:text-[#FFFFFF] transition opacity-70"><Share2 size={12} /></span>
                </div>
                
                <p className="text-[#D1D5DB] italic mb-6 opacity-90 font-medium">
                  {tagline}
                </p>
                
                <div className="w-8 border-b-2 border-[#CD8C38]/50 mb-4"></div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D1D5DB]">
                    <MapPin size={14} className="text-[#9CA3AF]" /> India
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[#4B5563]"></div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D1D5DB]">
                    <Calendar size={14} className="text-[#9CA3AF]" /> Joined May 2024
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rank Box */}
          <div className="w-full md:w-[35%] bg-[#12151C] rounded-2xl p-6 md:p-8 border border-[#1C2028] flex flex-col justify-center relative overflow-hidden shadow-lg">
            <h3 className="text-[11px] font-black tracking-widest text-[#CD8C38] mb-6 flex items-center gap-2 uppercase">
              <Crown size={14} /> CURRENT RANK
            </h3>
            
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 shrink-0 drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                {/* Custom SVG for purple hexagon pawn rank */}
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 5L90 28.094V71.906L50 95L10 71.906V28.094L50 5Z" fill="#2E1C5B" stroke="#8B5CF6" strokeWidth="2"/>
                  <path d="M50 85L16 65.37V34.63L50 15L84 34.63V65.37L50 85Z" fill="#4C2691"/>
                  <path d="M50 25C44.4772 25 40 29.4772 40 35C40 38.6433 41.9472 41.826 44.8694 43.606C42.4965 46.208 41 49.882 41 54C41 56.402 43.3444 59.229 46.505 60.597C47.8844 61.194 49 62.585 49 64H51C51 62.585 52.1156 61.194 53.495 60.597C56.6556 59.229 59 56.402 59 54C59 49.882 57.5035 46.208 55.1306 43.606C58.0528 41.826 60 38.6433 60 35C60 29.4772 55.5228 25 50 25Z" fill="#9F7AEA"/>
                  <path d="M35 70H65V76H35V70Z" fill="#8B5CF6"/>
                  <path d="M30 78H70V82H30V78Z" fill="#8B5CF6"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <h4 className="text-4xl font-bold text-[#FFFFFF] tracking-tight">{currentRating}</h4>
                  <span className="text-xs font-bold text-[#9CA3AF]">{playFormat}</span>
                </div>
                <div className="text-sm font-bold text-[#9F7AEA] mb-4 tracking-wide">{rankName}</div>
                <div className="h-2 w-full bg-[#1C2028] rounded-full overflow-hidden mb-2">
                  <div className="h-full w-[80%] bg-[#8B5CF6] rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                </div>
                <div className="text-[10px] font-bold text-[#9CA3AF] text-right tracking-widest">
                  {currentRating} / {progressToNext}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── ROW 2 ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Core Stats Box */}
          <div className="bg-[#12151C] rounded-2xl p-6 border border-[#1C2028] shadow-lg">
            <h3 className="text-[11px] font-black tracking-widest text-[#9CA3AF] mb-8 flex items-center gap-2">
              <span className="text-[#CD8C38]"><Activity size={14} /></span> CORE STATS
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full border border-[#CD8C38] flex items-center justify-center mb-4 text-[#CD8C38]">
                  <Target size={16} />
                </div>
                <div className="text-[9px] font-black text-[#6B7280] tracking-widest mb-2 uppercase">Highest Rating</div>
                <div className="text-[28px] font-bold text-[#FFFFFF]">{highestRating}</div>
              </div>
              
              <div className="flex flex-col items-center text-center relative">
                {/* Divider */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-[#1C2028]"></div>
                
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4 text-[#CD8C38]">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <rect x="16" y="4" width="4" height="16" />
                    <rect x="9" y="10" width="4" height="10" />
                    <rect x="2" y="14" width="4" height="6" />
                  </svg>
                </div>
                <div className="text-[9px] font-black text-[#6B7280] tracking-widest mb-2 uppercase">Games Played</div>
                <div className="text-[28px] font-bold text-[#FFFFFF]">{gamesPlayed}</div>
                
                {/* Divider */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-[#1C2028]"></div>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4 text-[#CD8C38]">
                  <Trophy size={16} />
                </div>
                <div className="text-[9px] font-black text-[#6B7280] tracking-widest mb-2 uppercase">Win Rate</div>
                <div className="text-[28px] font-bold text-[#FFFFFF]">{winRate}</div>
              </div>
            </div>
          </div>

          {/* Play Style Box */}
          <div className="bg-[#12151C] rounded-2xl p-6 border border-[#1C2028] shadow-lg">
            <h3 className="text-[11px] font-black tracking-widest text-[#9CA3AF] mb-6 flex items-center gap-2">
              <span className="text-[#CD8C38]">★</span> PLAY STYLE
            </h3>
            
            <div className="flex flex-wrap justify-center gap-3">
              {playStyles.map(style => {
                const { icon, color } = getPlayStyleStyle(style);
                return (
                  <div
                    key={style}
                    className="flex items-center gap-2 py-2 px-4 rounded-xl border border-[#1C2028] text-xs font-medium text-[#E5E7EB] bg-[#0A0D14]"
                  >
                    <span className={color}>{icon}</span>
                    {style}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Looking For Box */}
          <div className="bg-[#12151C] rounded-2xl p-6 border border-[#1C2028] shadow-lg">
            <h3 className="text-[11px] font-black tracking-widest text-[#9CA3AF] mb-6 flex items-center gap-2 uppercase">
               <span className="text-[#CD8C38]"><Target size={14} /></span> Looking For
            </h3>
            
            <div className="flex flex-wrap justify-center gap-3">
              {lookingFor.map(item => {
                const { icon, color } = getLookingForStyle(item);
                return (
                  <div
                    key={item}
                    className="flex items-center gap-2 py-2 px-4 rounded-xl border border-[#1C2028] text-xs font-medium text-[#E5E7EB] bg-[#0A0D14]"
                  >
                    <span className={color}>{icon}</span>
                    {item}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
