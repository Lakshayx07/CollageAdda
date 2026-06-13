import React, { useState } from "react";
import { Clock, Users, MoreVertical, Trash2, Share2 } from "lucide-react";
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

export default function CollabCard({ card, currentUser, onContribute, onShare, onDelete }) {
  const [showOptions, setShowOptions] = useState(false);

  if (!card) return null;
  const isOwner = currentUser && (currentUser.id === card.user_id || currentUser._id === card.user_id);

  // Assume card structure:
  // {
  //   user_id, building, year_major, project_type, urgency, skills (text[]),
  //   roles_needed (text[]), description,
  //   profiles: { full_name, avatar_url, university, is_verified } // joined from supabase
  // }

  const profile = card.profiles || {};
  const skillsArray = Array.isArray(card.skills) ? card.skills : (card.skills ? card.skills.split(",") : []);
  const rolesArray = Array.isArray(card.roles_needed) ? card.roles_needed : (card.roles_needed ? card.roles_needed.split(",") : []);

  return (
    <div className="app-panel rounded-[1.75rem] p-6 flex flex-col w-full bg-white/[0.02] border border-white/10 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Header badges & Options */}
      <div className="flex justify-between items-start mb-5 z-10 relative">
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
      <div className="flex items-center gap-3 mb-4 z-10">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name} className="w-10 h-10 rounded-full object-cover border border-white/20" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-sm font-black text-white shrink-0">
            {profile.full_name?.charAt(0) || "?"}
          </div>
        )}
        
        <div>
          <div className="flex items-center gap-1">
            <p className="text-sm font-black text-white">{profile.full_name || "Campus Student"}</p>
            {profile.is_verified && <VerifiedBadge size={14} />}
          </div>
          <p className="text-[11px] text-white/50 font-medium">
            {[profile.university, card.year_major].filter(Boolean).join(" • ") || "Student"}
          </p>
        </div>
      </div>

      {/* What they're building */}
      <div className="mb-4 z-10">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">What I&apos;m Building</p>
        <h2 className="text-xl font-black text-white leading-tight">{card.building}</h2>
      </div>

      {/* Skillset */}
      {skillsArray.length > 0 && (
        <div className="mb-4 z-10">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">My Skillset</p>
          <div className="flex flex-wrap gap-1.5">
            {skillsArray.map((s, i) => (
              <span key={i} className="text-[10px] font-bold text-white/70 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                {s.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Roles Needed */}
      {rolesArray.length > 0 && (
        <div className="mb-4 z-10">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">
            <Users size={9} className="inline mr-1" />Roles Needed
          </p>
          <div className="flex flex-wrap gap-1.5">
            {rolesArray.map((r, i) => (
              <span key={i} className="text-[10px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
                {r.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {card.description && (
        <div className="mb-6 z-10 flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">Description</p>
          <p className="text-xs text-white/60 leading-relaxed italic border-l-2 border-primary/30 pl-3 py-1">
            &quot;{card.description}&quot;
          </p>
        </div>
      )}

      {/* Contribute Button */}
      <div className="mt-auto pt-4 z-10">
        <button
          onClick={() => onContribute(card)}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2"
        >
          ✦ Contribute Now
        </button>
      </div>
    </div>
  );
}
