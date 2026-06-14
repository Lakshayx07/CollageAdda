import React, { useState } from "react";
import { Clock, Users, MoreVertical, Trash2, Share2, ChevronLeft, ChevronRight, Rocket, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import VerifiedBadge from "@/components/VerifiedBadge";

const URGENCY_COLORS = {
  High: "text-red-400 bg-red-500/10 border-red-500/20",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  Low: "text-green-400 bg-green-500/10 border-green-500/20"
};

const PROJECT_TYPE_COLORS = {
  Hackathon: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Startup: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Research: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "Side Project": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Society: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Other: "text-white/40 bg-white/5 border-white/10"
};

export default function CollabCard({ card, currentUser, hasApplied, appStatus, onContribute, onShare, onDelete, onNext, onPrev, currentIndex, totalCards }) {
  const [showOptions, setShowOptions] = useState(false);
  
  if (!card) return null;
  const isOwner = currentUser && (
    (currentUser?.id || "").toString() === (card?.user_id || "").toString() || 
    (currentUser?._id || "").toString() === (card?.user_id || "").toString()
  );
  const isApplied = !!hasApplied;

  // Assume card structure:
  // {
  //   user_id, building, year_major, project_type, urgency, skills (text[]),
  //   roles_needed (text[]), description,
  //   profiles: { full_name, avatar_url, university, is_verified } // joined from supabase
  // }

  // Profile is now fetched from the card directly or fallback
  const skillsArray = Array.isArray(card.skills) ? card.skills : (card.skills ? card.skills.split(",") : []);
  const rolesArray = Array.isArray(card.roles_needed) ? card.roles_needed : (card.roles_needed ? card.roles_needed.split(",") : []);

  return (
    <div className="app-panel rounded-[1.75rem] flex flex-col w-full h-[520px] bg-gradient-to-b from-white/[0.04] to-black/40 border border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
      {/* Background glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative z-10">
        {/* Header badges & Options */}
        <div className="flex justify-between items-start mb-5 relative">
        <div className="flex gap-2">
          <span className={clsx(
            "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border",
            PROJECT_TYPE_COLORS[card.project_type] || PROJECT_TYPE_COLORS.Other
          )}>
            {card.project_type || "Project"}
          </span>
          <span className={clsx(
            "text-[10px] font-bold uppercase px-2 py-1 rounded-full border",
            URGENCY_COLORS[card.urgency] || URGENCY_COLORS.Medium
          )}>
            <Clock size={9} className="inline mr-1" />{card.urgency || "Medium"} Urgency
          </span>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-1 w-36 bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-xl overflow-hidden z-50"
              >
                <button
                  onClick={() => {
                    setShowOptions(false);
                    onShare(card);
                  }}
                  className="w-full px-4 py-3 text-left text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                >
                  <Share2 size={14} /> Share
                </button>
                {isOwner && (
                  <button
                    onClick={() => {
                      setShowOptions(false);
                      if (window.confirm("Are you sure you want to delete this card?")) {
                        onDelete(card.id);
                      }
                    }}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-white/5"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 mb-4">
        {card.poster_avatar ? (
          <img src={card.poster_avatar} alt={card.poster_name || "Student"} className="w-12 h-12 rounded-full object-cover border border-white/20" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 uppercase tracking-widest">
            {card.user_id ? String(card.user_id).slice(-4) : "?"}
          </div>
        )}
        
        <div>
          <div className="flex items-center gap-1">
            <p className="text-sm font-black text-white">{card.poster_name || "Campus Student"}</p>
          </div>
          <p className="text-[11px] text-white/50 font-medium">{card.year_major || "Student"}</p>
        </div>
      </div>

      {/* What they're building */}
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 mb-2 flex items-center gap-1.5">
          <Rocket size={12} className="text-violet-400" /> What I&apos;m Building
        </p>
        <h2 className="text-base font-bold text-white leading-tight tracking-tight line-clamp-2">
          {card.building}
        </h2>
      </div>

      {/* Skillset */}
      {skillsArray.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center gap-1.5">
            <Code size={12} /> My Skillset
          </p>
          <div className="flex flex-wrap gap-2">
            {(skillsArray || []).map((s, i) => (
              <span key={i} className="text-[10px] font-bold text-violet-100 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:bg-violet-500/20 transition-colors">
                {s.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Roles Needed */}
      {rolesArray.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center gap-1.5">
            <Users size={12} /> Roles Needed
          </p>
          <div className="flex flex-wrap gap-2">
            {(rolesArray || []).map((r, i) => (
              <span key={i} className="text-[10px] font-bold text-blue-100 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:bg-blue-500/20 transition-colors">
                {r.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {card.description && (
        <div className="mb-6 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Description</p>
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] shadow-inner">
            <p className="text-[13px] text-white/70 leading-relaxed font-medium">
              {card.description}
            </p>
          </div>
        </div>
      )}
      </div>

      {/* Fixed footer - never scrolls away */}
      <div className="border-t border-white/10 p-4 space-y-3 shrink-0 bg-black/20 backdrop-blur-md relative z-20">
        {/* Arrow navigation */}
        {totalCards > 1 && (
          <div className="flex items-center justify-between px-2">
            <button onClick={onPrev} className="p-2 text-white/50 hover:text-white transition">
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Card {currentIndex + 1} of {totalCards}
            </span>
            <button onClick={onNext} className="p-2 text-white/50 hover:text-white transition">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
        {/* Contribute button */}
        {isApplied ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-sm py-3">
              ✓ Applied
            </div>
            
            {/* Applicant Status Tracking */}
            {appStatus === 'pending' && (
              <p className="text-amber-400 text-xs text-center mt-1">
                ⏳ Application under review
              </p>
            )}
            {appStatus === 'impressive' && (
              <p className="text-emerald-400 text-xs text-center mt-1 animate-pulse">
                ✨ Marked Impressive! Check your messages 🎉
              </p>
            )}
            {appStatus === 'rejected' && (
              <p className="text-white/40 text-xs text-center mt-1">
                Application not selected this time. Keep building! 💪
              </p>
            )}
          </div>
        ) : isOwner ? null : (
          <button
            onClick={() => onContribute(card)}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl py-3 font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:from-violet-500 hover:to-indigo-500 flex items-center justify-center gap-2"
          >
            ✦ Contribute Now
          </button>
        )}
      </div>
    </div>
  );
}
