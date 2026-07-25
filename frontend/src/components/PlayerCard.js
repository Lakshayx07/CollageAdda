import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Target, Brain, Activity, Handshake, MessageCircle, Zap, Shield, Crown, Swords, Users, Search, Play } from 'lucide-react';
import { getAvatarSrc, getDefaultAvatar } from "@/utils/defaultAvatars";

export default function PlayerCard({ player }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isEsports = player.category === 'esports';

  // Holographic shimmer logic (CSS inline for dynamic tilt could be added, but using CSS animation here)
  const themeColors = isEsports 
    ? "from-[#D4A843] via-indigo-600 to-[#D4A843] shadow-[0_0_30px_rgba(6,182,212,0.5)]" 
    : "from-orange-500 via-red-600 to-yellow-600 shadow-[0_0_30px_rgba(249,115,22,0.5)]";

  const SkillBar = ({ label, icon: Icon, value }) => (
    <div className="mb-2 w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-[#4A4A4A] uppercase tracking-widest font-bold flex items-center">
          <Icon size={10} className="mr-1" /> {label}
        </span>
        <span className="text-[10px] font-black text-[#1A1A1A]">{value}/10</span>
      </div>
      <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden border border-[#E8E6E0]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={clsx("h-full rounded-full", isEsports ? "bg-gradient-to-r from-[#D4A843] to-[#D4A843]" : "bg-gradient-to-r from-orange-400 to-yellow-400")}
        />
      </div>
    </div>
  );

  return (
    <div 
      className="relative w-full max-w-[280px] aspect-[3/4] perspective-1000 cursor-pointer mx-auto group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* ================= FRONT OF CARD ================= */}
        <div className={clsx(
          "absolute inset-0 backface-hidden rounded-2xl p-1 bg-gradient-to-br",
          themeColors
        )}>
          {/* Inner Card content */}
          <div className="bg-[#FAFAF8]/90 rounded-xl h-full w-full relative overflow-hidden backdrop-blur-md flex flex-col border border-[#E8E6E0]">
            {/* Holographic Shimmer Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer pointer-events-none" style={{ backgroundSize: '200% 200%' }} />
            
            {/* Top Header */}
            <div className="flex justify-between items-center p-3 border-b border-[#E8E6E0] bg-black/40">
              <span className="text-2xl font-black text-[#1A1A1A] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] italic">
                {player.overallRating || 90}
              </span>
              <div className="flex flex-col items-end">
                <span className={clsx("text-[10px] font-black uppercase px-2 py-0.5 rounded border shadow-lg", isEsports ? "bg-[#C8922A]/10 border-cyan-400/50 text-[#C8922A]" : "bg-orange-500/20 border-orange-400/50 text-orange-300")}>
                  {player.game_or_sport}
                </span>
                <span className="text-[8px] font-bold text-[#6B6B6B] uppercase mt-1 tracking-widest">{player.role_or_position}</span>
              </div>
            </div>

            {/* Profile Photo area */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-4">
              <div className={clsx("absolute w-32 h-32 blur-2xl rounded-full", isEsports ? "bg-[#C8922A]/10" : "bg-orange-500/20")} />
              <div className={clsx(
                "w-24 h-24 rounded-full p-1 bg-gradient-to-b shadow-2xl relative z-10",
                isEsports ? "from-[#D4A843] to-[#D4A843] shadow-cyan-500/50" : "from-orange-400 to-red-600 shadow-orange-500/50"
              )}>
                <img 
                  src={getAvatarSrc(player.photo_url, player.name, player.id)} 
                  alt={player.name} 
                  className="w-full h-full rounded-full object-cover border-2 border-[#050508]" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getDefaultAvatar(player.name, player.id);
                  }}
                />
              </div>
              <h2 className="text-[#1A1A1A] font-black text-xl uppercase tracking-wider mt-4 text-center drop-shadow-md">{player.name}</h2>
              <p className="text-xs text-[#6B6B6B] font-bold tracking-widest">@{player.username}</p>
              <p className="text-[10px] text-[#6B6B6B] uppercase mt-1">{player.college}</p>
            </div>

            {/* Bottom Mini Stats */}
            <div className="grid grid-cols-3 gap-0 border-t border-[#E8E6E0] bg-black/60 p-2 text-center relative z-10">
              <div className="border-r border-[#E8E6E0]">
                <span className="block text-[8px] text-[#6B6B6B] uppercase tracking-widest">Rank</span>
                <span className={clsx("text-xs font-black", isEsports ? "text-[#C8922A]" : "text-yellow-400")}>{player.rank}</span>
              </div>
              <div className="border-r border-[#E8E6E0]">
                <span className="block text-[8px] text-[#6B6B6B] uppercase tracking-widest">Available</span>
                <span className="text-[10px] font-bold text-[#1A1A1A] uppercase mt-0.5 block truncate px-1">{player.availability}</span>
              </div>
              <div>
                <span className="block text-[8px] text-[#6B6B6B] uppercase tracking-widest">EXP</span>
                <span className="text-[10px] font-bold text-[#1A1A1A] uppercase mt-0.5 block truncate px-1">{player.experience_level}</span>
              </div>
            </div>
            
            <div className="absolute bottom-16 right-2 animate-bounce opacity-50">
              <span className="text-[8px] text-[#1A1A1A] uppercase tracking-widest bg-black/50 px-1 py-0.5 rounded">Tap</span>
            </div>
          </div>
        </div>

        {/* ================= BACK OF CARD ================= */}
        <div className={clsx(
          "absolute inset-0 backface-hidden rounded-2xl p-1 bg-gradient-to-br rotate-y-180",
          themeColors
        )}>
          <div className="bg-[#FAFAF8]/95 rounded-xl h-full w-full relative overflow-hidden backdrop-blur-md flex flex-col border border-[#E8E6E0] p-4">
            <h3 className="text-[#1A1A1A] font-black uppercase tracking-widest text-sm mb-3 border-b border-[#E8E6E0] pb-2 text-center">Player Stats</h3>
            
            {/* Skills */}
            <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
              {isEsports ? (
                <>
                  <SkillBar label="Accuracy" icon={Target} value={player.skills?.accuracy || 8} />
                  <SkillBar label="Game Sense" icon={Brain} value={player.skills?.gamesense || 9} />
                  <SkillBar label="Clutch" icon={Zap} value={player.skills?.clutch || 7} />
                  <SkillBar label="Teamwork" icon={Handshake} value={player.skills?.teamwork || 8} />
                  <SkillBar label="Comms" icon={MessageCircle} value={player.skills?.comms || 6} />
                </>
              ) : (
                <>
                  <SkillBar label="Speed" icon={Zap} value={player.skills?.speed || 8} />
                  <SkillBar label="Stamina" icon={Activity} value={player.skills?.stamina || 9} />
                  <SkillBar label="Technique" icon={Target} value={player.skills?.technique || 7} />
                  <SkillBar label="Teamwork" icon={Handshake} value={player.skills?.teamwork || 8} />
                  <SkillBar label="Leadership" icon={Crown} value={player.skills?.leadership || 6} />
                </>
              )}
              
              <div className="mt-4 p-2 bg-[#F3F2EE] rounded-lg border border-[#E8E6E0]">
                <p className="text-[10px] text-[#4A4A4A] italic text-center">"{player.bio}"</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={(e) => { e.stopPropagation(); alert('Challenge sent!'); }}
                className={clsx("flex flex-col items-center justify-center py-2 rounded-lg border border-[#E8E6E0] hover:border-[#E8E6E0] transition shadow-lg", isEsports ? "bg-[#C8922A]/10 text-[#C8922A]" : "bg-red-500/20 text-red-300")}
              >
                <Swords size={16} className="mb-1" />
                <span className="text-[9px] font-black uppercase tracking-widest">Challenge</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); alert('Invited to Network!'); }}
                className={clsx("flex flex-col items-center justify-center py-2 rounded-lg border border-[#E8E6E0] hover:border-[#E8E6E0] transition shadow-lg", isEsports ? "bg-[#C8922A]/10 text-[#C8922A]" : "bg-orange-500/20 text-orange-300")}
              >
                <Users size={16} className="mb-1" />
                <span className="text-[9px] font-black uppercase tracking-widest">Add to Network</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); alert('Added to Scout List!'); }}
                className="col-span-2 flex items-center justify-center py-2 rounded-lg bg-[#F3F2EE] border border-[#E8E6E0] hover:bg-[#F3F2EE] transition text-[#1A1A1A]"
              >
                <Search size={14} className="mr-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Scout Player</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
