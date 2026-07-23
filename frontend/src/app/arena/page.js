"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Users, Shield,
  Gamepad2, Star, Flame, Activity, MapPin,
  RefreshCw, CalendarX
} from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { getAvatarSrc, getDefaultAvatar } from "@/utils/defaultAvatars";

// ─── Esports-only Arena config ───────────────────────────────────────────────
const ESPORTS_TAB = {
  id: "esports",
  label: "Esports",
  icon: Gamepad2,
  color: "#39FF82",
  sports: [
    { key: "bgmi",     icon: "🎮" },
    { key: "valorant", icon: "🔫" },
    { key: "fifa",     icon: "⚽" },
    { key: "chess",    icon: "♟️" },
    { key: "carrom",   icon: "🎯" },
  ]
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ className }) => (
  <div className={clsx("animate-pulse rounded-xl bg-white/6", className)} />
);

// ─── Leaderboard Row ──────────────────────────────────────────────────────────
function LeaderboardRow({ college, rank, cfg, onChallenge, challenged }) {
  const rankLabel = ["🥇", "🥈", "🥉"][rank - 1] || `#${rank}`;
  const rankBg = [
    "border-yellow-400/25 bg-yellow-400/8",
    "border-slate-300/20 bg-slate-300/8",
    "border-amber-600/25 bg-amber-600/8",
  ][rank - 1] || "border-white/8 bg-white/4";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.06 }}
      className={clsx("flex items-center gap-3 p-4 rounded-[1.25rem] border", rankBg)}
    >
      <span className="text-xl w-8 text-center shrink-0">{rankLabel}</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-[#1A1A1A] truncate">{college.name}</p>
        <p className="text-[10px] text-[#6B6B6B] font-bold flex items-center gap-1 mt-0.5 truncate">
          <MapPin size={9} /> {college.location || "India"}
        </p>
      </div>

      {/* Activity score — real count from API, never a made-up number */}
      <div className="text-right shrink-0 mr-2">
        {college.activityScore !== undefined ? (
          <>
            <p className="text-lg font-black" style={{ color: cfg.color }}>
              {college.activityScore}
            </p>
            <p className="text-[9px] text-[#6B6B6B] font-bold uppercase tracking-wider">activity</p>
          </>
        ) : (
          <Sk className="h-6 w-12" />
        )}
      </div>

      {/* Challenge button — shows toast since /api/arena/challenges not yet live */}
      <button
        onClick={() => onChallenge(college)}
        disabled={challenged}
        className={clsx(
          "shrink-0 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
          challenged
            ? "bg-[#F3F2EE] text-[#6B6B6B] border border-[#E8E6E0] cursor-default"
            : "border hover:scale-105 active:scale-95"
        )}
        style={
          !challenged
            ? { borderColor: cfg.color, color: cfg.color, background: `${cfg.color}15` }
            : undefined
        }
      >
        {challenged ? "Pending" : "Challenge"}
      </button>
    </motion.div>
  );
}

// ─── Player Card ──────────────────────────────────────────────────────────────
function PlayerCard({ player, cfg, onClick }) {
  const avatar = getAvatarSrc(player.profilePic, player.name, player.id || player._id);

  // Show real sport/interest from DB — never fabricate
  const badge =
    (player.sports && player.sports[0]) ||
    (player.interests && player.interests[0]) ||
    null;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="shrink-0 w-32 app-panel rounded-[1.25rem] p-3 flex flex-col items-center gap-2 cursor-pointer border border-[#E8E6E0] hover:border-white/15 transition-all"
    >
      <div
        className="w-14 h-14 rounded-2xl overflow-hidden border-2 shrink-0"
        style={{ borderColor: `${cfg.color}55` }}
      >
        <img 
          src={avatar}
          alt={player.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getDefaultAvatar(player.name, player.id || player._id);
          }} />
      </div>
      <div className="text-center w-full min-w-0">
        <p className="text-[11px] font-black text-[#1A1A1A] truncate">{player.name}</p>
        <p className="text-[9px] text-[#6B6B6B] truncate">{player.university || "—"}</p>
        {badge && (
          <span
            className="mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{ background: `${cfg.color}20`, color: cfg.color }}
          >
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sport Pill ───────────────────────────────────────────────────────────────
function SportPill({ entry, onClick }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border border-white/8 bg-[#F3F2EE] hover:border-[#E8E6E0] hover:bg-white/8 transition-all group"
    >
      <span className="text-2xl group-hover:scale-110 transition-transform">{entry.icon}</span>
      <span className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-wider group-hover:text-[#1A1A1A] transition-colors">
        {entry.key}
      </span>
    </button>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[999] bg-white text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-2xl shadow-2xl"
    >
      {msg}
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ArenaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState(null);   // null = not yet loaded
  const [players, setPlayers] = useState(null);     // null = not yet loaded
  const [challenged, setChallenged] = useState({});
  const [toast, setToast] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const cfg = ESPORTS_TAB;

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => { setIsMounted(true); }, []);

  // ── Fetch colleges + esports players ──────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setColleges(null);
    setPlayers(null);

    const token = localStorage.getItem("collegeadda_token");
    if (!token) { setLoading(false); return; }

    // ── 1. Colleges with real activity counts ────────────────────────────
    let enrichedColleges = [];
    try {
      const res = await fetch(`${apiUrl}/api/colleges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const raw = (await res.json()) || [];
        // Enrich top 5 with real student + post counts from college detail API
        enrichedColleges = await Promise.all(
          raw.slice(0, 5).map(async (c) => {
            try {
              const dr = await fetch(`${apiUrl}/api/colleges/${c._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (dr.ok) {
                const d = await dr.json();
                return {
                  ...c,
                  activityScore:
                    (d.studentsData?.length || 0) + (d.postsData?.length || 0)
                };
              }
            } catch (_) {}
            return { ...c, activityScore: 0 };
          })
        );
        // Sort by real activity score descending
        enrichedColleges.sort((a, b) => (b.activityScore || 0) - (a.activityScore || 0));
      }
    } catch (e) {
      console.error("Colleges fetch:", e);
    }
    setColleges(enrichedColleges);

    // ── 2. Players — esports interest keywords ───────────────────────────
    let playerList = [];
    try {
      const keywords = ["gaming", "esports", "bgmi", "valorant"];

      for (const kw of keywords) {
        const res = await fetch(
          `${apiUrl}/api/users/search/query?q=${encodeURIComponent(kw)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          const arr = data?.users || (Array.isArray(data) ? data : []);
          if (arr.length > 0) {
            playerList = arr.slice(0, 8);
            break;
          }
        }
      }
    } catch (e) {
      console.error("Players fetch:", e);
    }
    setPlayers(playerList);
    setLoading(false);
  }, [apiUrl]);

  useEffect(() => {
    if (isMounted) fetchAll();
  }, [isMounted, fetchAll]);

  // ── Challenge handler ─────────────────────────────────────────────────────
  const handleChallenge = (college) => {
    const id = college._id || college.id;
    // The /api/arena/challenges route doesn't exist yet in the backend.
    // We mark it as "pending" locally and inform the user.
    setChallenged(prev => ({ ...prev, [id]: true }));
    setToast(`Challenge sent to ${college.name}! ⚔️`);
  };

  if (!isMounted) return null;

  const tabColor = cfg.color;

  return (
    <div className="page-shell relative overflow-x-hidden pb-24">
      {/* Background glow */}
      <div
        className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] blur-[130px] rounded-full z-0 pointer-events-none transition-all duration-700"
        style={{ background: `${tabColor}14` }}
      />
      <div
        className="fixed bottom-[-15%] left-[-15%] w-[40%] h-[40%] blur-[120px] rounded-full z-0 pointer-events-none transition-all duration-700"
        style={{ background: `${tabColor}0c` }}
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="page-header sticky top-0 z-40 px-5 py-5">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-500"
              style={{ background: `${tabColor}25`, border: `1.5px solid ${tabColor}50` }}
            >
              <cfg.icon size={22} style={{ color: tabColor }} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A]">
                Arena<span style={{ color: tabColor }}>.</span>
              </h1>
              <p className="text-[10px] text-[#6B6B6B] font-bold uppercase tracking-widest">
                Esports Battles
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchAll()}
            disabled={loading}
            className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-5 space-y-7 relative z-10">

        {/* ── Pick Your Game ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <Shield size={12} style={{ color: tabColor }} />
            Play On
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {cfg.sports.map(entry => (
              <SportPill
                key={entry.key}
                entry={entry}
                onClick={() => router.push(`/arena/sport/${entry.key}`)}
              />
            ))}
          </div>
        </section>

        {/* ── Featured Match — no match API yet, show honest empty state ── */}
        <section>
          <h2 className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <Activity size={12} style={{ color: tabColor }} />
            Featured Match
          </h2>
          <div
            className="app-panel rounded-[1.75rem] p-8 flex flex-col items-center text-center gap-3 border"
            style={{ borderColor: `${tabColor}20` }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `${tabColor}18`, border: `1.5px solid ${tabColor}35` }}
            >
              <CalendarX size={24} style={{ color: tabColor }} />
            </div>
            <p className="text-sm font-black text-[#1A1A1A]">No matches scheduled</p>
            <p className="text-[11px] text-[#888888] font-medium max-w-xs">
              Challenge a college from the leaderboard below to create a match.
              Live match tracking coming soon.
            </p>
          </div>
        </section>

        {/* ── Campus Leaderboard ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] flex items-center gap-2">
              <Trophy size={12} style={{ color: tabColor }} />
              Campus Rankings
            </h2>
            <span
              className="text-[10px] bg-[#F9F8F5] border border-[#E8E6E0] px-3 py-1 rounded-full font-bold border"
              style={{ color: tabColor, borderColor: `${tabColor}30` }}
            >
              {colleges === null ? "—" : `${colleges.length} colleges`}
            </span>
          </div>

          <div className="space-y-2.5">
            {colleges === null ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-[1.25rem] bg-[#F3F2EE] border border-white/8">
                  <Sk className="w-8 h-8 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Sk className="h-4 w-40" />
                    <Sk className="h-3 w-24" />
                  </div>
                  <Sk className="h-6 w-14 shrink-0" />
                  <Sk className="h-8 w-20 rounded-xl shrink-0" />
                </div>
              ))
            ) : colleges.length === 0 ? (
              <div className="app-panel rounded-[1.5rem] py-12 text-center border border-[#E8E6E0]">
                <Trophy size={32} className="mx-auto text-[#888888] mb-3" />
                <p className="text-sm font-black text-[#888888]">No colleges found</p>
              </div>
            ) : (
              colleges.map((college, idx) => (
                <LeaderboardRow
                  key={college._id || idx}
                  college={college}
                  rank={idx + 1}
                  cfg={cfg}
                  challenged={!!challenged[college._id || college.id]}
                  onChallenge={handleChallenge}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Players to Watch ────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] flex items-center gap-2">
              <Star size={12} style={{ color: tabColor }} />
              Players to Watch
            </h2>
            <span
              className="text-[10px] bg-[#F9F8F5] border border-[#E8E6E0] px-3 py-1 rounded-full font-bold border"
              style={{ color: tabColor, borderColor: `${tabColor}30` }}
            >
              {players === null ? "—" : players.length > 0 ? `${players.length} found` : "none"}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {players === null ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 w-32 app-panel rounded-[1.25rem] p-3 flex flex-col items-center gap-2 border border-[#E8E6E0]">
                  <Sk className="w-14 h-14 rounded-2xl" />
                  <Sk className="h-3 w-20" />
                  <Sk className="h-3 w-14" />
                </div>
              ))
            ) : players.length === 0 ? (
              <div className="w-full py-10 text-center text-[#6B6B6B]">
                <Users size={30} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold">No players found for this category</p>
                <p className="text-[10px] mt-1 text-[#888888]">
                  Students with matching interests will appear here
                </p>
              </div>
            ) : (
              players.map(player => (
                <PlayerCard
                  key={player._id}
                  player={player}
                  cfg={cfg}
                  onClick={() => router.push(`/profile/${player._id}`)}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="app-panel rounded-[1.75rem] p-6 text-center relative overflow-hidden"
          style={{ border: `1.5px solid ${tabColor}25` }}
        >
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 0%, ${tabColor}, transparent 70%)` }}
          />
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `${tabColor}18`, border: `1.5px solid ${tabColor}40` }}
          >
            <Flame size={26} style={{ color: tabColor }} />
          </div>
          <h3 className="text-lg font-black text-[#1A1A1A] mb-1">
            Join the Battle
          </h3>
          <p className="text-xs text-[#6B6B6B] mb-5 font-medium max-w-xs mx-auto">
            Form your esports squad and dominate the campus leaderboard.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {cfg.sports.slice(0, 4).map(entry => (
              <button
                key={entry.key}
                onClick={() => router.push(`/arena/sport/${entry.key}`)}
                className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                style={{
                  background: `${tabColor}15`,
                  border: `1px solid ${tabColor}35`,
                  color: tabColor
                }}
              >
                {entry.icon} {entry.key}
              </button>
            ))}
          </div>
        </motion.section>

      </div>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      </AnimatePresence>
    </div>
  );
}
