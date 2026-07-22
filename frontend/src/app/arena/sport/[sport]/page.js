"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Users, Swords, Plus, X, Search,
  Crown, CheckCircle2, ChevronRight, Loader2, MapPin
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import clsx from 'clsx';
import { getAvatarSrc, getDefaultAvatar } from "@/utils/defaultAvatars";

/** App theme accent — matches Campus Adda gold across the product */
const APP_ACCENT = '#C8922A';
const APP_ACCENT_SOFT = '#D4A843';

const SPORT_CONFIG = {
  volleyball:  { limit: 12, icon: '🏐', tagline: 'Campus court battles' },
  football:    { limit: 18, icon: '⚽', tagline: 'Inter-college football' },
  badminton:   { limit: 4,  icon: '🏸', tagline: 'Singles & doubles' },
  basketball:  { limit: 10, icon: '🏀', tagline: 'Hoops on campus' },
  cricket:     { limit: 15, icon: '🏏', tagline: 'Build your XI' },
  tennis:      { limit: 4,  icon: '🎾', tagline: 'Court challenge' },
  swimming:    { limit: 8,  icon: '🏊', tagline: 'Relay & freestyle' },
  bgmi:        { limit: 5,  icon: '🎮', tagline: 'Squad up. Drop in.' },
  valorant:    { limit: 5,  icon: '🔫', tagline: '5v5 agent battles' },
  fifa:        { limit: 2,  icon: '⚽', tagline: '1v1 & co-op' },
  chess:       { limit: 2,  icon: '♟️', tagline: 'Mind games' },
  carrom:      { limit: 2,  icon: '🎯', tagline: 'Strike & pocket' },
};

const Sk = ({ className }) => (
  <div className={clsx("animate-pulse rounded-xl bg-white/6", className)} />
);

function StatusPill({ count, max }) {
  if (count >= max)  return <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center"><div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5" />Full</span>;
  if (count === 0)   return <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center"><div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5" />Open</span>;
  return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5" />{count}/{max}</span>;
}

export default function SportTeamsPage() {
  const router = useRouter();
  const params = useParams();
  const rawSport   = params.sport || 'volleyball';
  const sportKey   = rawSport.toLowerCase();
  const sportName  = rawSport.charAt(0).toUpperCase() + rawSport.slice(1);
  const sportData  = SPORT_CONFIG[sportKey] || {
    limit: 10,
    icon: '🏆',
    tagline: 'Campus competition',
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // ── Auth user ────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);

  // ── Real data ────────────────────────────────────────────────────────────
  const [collegeStudents, setCollegeStudents] = useState(null); // from /api/users/search
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Team state (local session only — no backend route yet) ─────────────
  const [hasMyTeam, setHasMyTeam] = useState(false);
  const [myTeamFull, setMyTeamFull] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSeeTeamModal,  setShowSeeTeamModal]  = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [newTeam, setNewTeam] = useState({ letter: 'A', captainId: '', players: [] });

  // ── Boot ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('collegeadda_user');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (_) {}
  }, []);

  // ── Fetch real campus students for team-builder ───────────────────────
  const fetchStudents = useCallback(async (query = '') => {
    const token = localStorage.getItem('collegeadda_token');
    if (!token) return;
    setLoadingStudents(true);
    try {
      const q = query.trim() || (currentUser?.university || '');
      const res = await fetch(
        `${apiUrl}/api/users/search/query?q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setCollegeStudents(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingStudents(false); }
  }, [apiUrl, currentUser?.university]);

  useEffect(() => {
    if (currentUser) fetchStudents();
  }, [currentUser, fetchStudents]);

  // Debounced search inside modal
  useEffect(() => {
    if (!showRegisterModal) return;
    const t = setTimeout(() => fetchStudents(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, showRegisterModal, fetchStudents]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddPlayer = (student) => {
    const id = student._id || student.id;
    if (newTeam.players.length >= sportData.limit) {
      alert(`Limit reached! Max ${sportData.limit} players for ${sportName}.`);
      return;
    }
    if (!newTeam.players.find(p => (p._id || p.id) === id)) {
      setNewTeam(prev => ({ ...prev, players: [...prev.players, student] }));
    }
  };

  const finishRegistration = () => {
    setHasMyTeam(true);
    setMyTeamFull(newTeam.players.length >= sportData.limit);
    setShowRegisterModal(false);
    setRegisterStep(1);
  };

  const userCollege = currentUser?.university || 'Your College';
  const myTeamName  = `${userCollege} ${sportName} – Team ${newTeam.letter}`;

  // Captain name from real student list
  const captainStudent = (collegeStudents || []).find(
    s => (s._id || s.id) === newTeam.captainId
  );

  return (
    <div className="page-shell text-[#1A1A1A] overflow-x-hidden pb-24">
      {/* Soft accent wash */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 h-64 z-0"
        style={{
          background: `linear-gradient(180deg, ${APP_ACCENT}14 0%, transparent 100%)`,
        }}
      />

      {/* Header */}
      <header className="page-header sticky top-0 z-40 px-4 py-3 backdrop-blur-md bg-[#FAFAF8]/90 border-b border-[#E8E6E0]/80">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="sport-lobby-back p-2.5 rounded-full border border-[#E8E6E0] bg-white hover:bg-[#F9F8F5] transition cursor-pointer shadow-sm"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center border-2 border-[#E8D9B0] bg-[#FFF8EC] shrink-0 shadow-sm"
          >
            <span className="text-xl leading-none">{sportData.icon}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-black uppercase tracking-widest text-[#1A1A1A] truncate">
              {sportName}
            </h1>
            <p className="text-[11px] font-semibold text-[#888888] truncate">
              {sportData.tagline}
            </p>
          </div>
        </div>
      </header>

      <div className="relative z-10 p-4 max-w-3xl mx-auto space-y-6">

        {/* ── MY TEAM / LOBBY HERO ─────────────────────────────────────────── */}
        {!hasMyTeam ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[1.75rem] border-2 border-[#E8E6E0] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.05)]"
          >
            <div
              className="h-1.5 w-full"
              style={{ background: `linear-gradient(90deg, ${APP_ACCENT}, ${APP_ACCENT_SOFT})` }}
            />
            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border-2 border-[#E8D9B0] bg-[#FFF8EC] shadow-sm">
                <Users size={28} className="text-[#C8922A]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-[#C8922A]">
                Open Lobby
              </p>
              <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] mb-2">
                No team yet for {userCollege}
              </h2>
              <p className="text-sm text-[#6B6B6B] mb-6 font-medium max-w-sm leading-relaxed">
                Be the first to register a {sportName} squad. Invite campus players and start challenging other colleges.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <span className="rounded-full bg-[#F9F8F5] border border-[#E8E6E0] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                  Max {sportData.limit} players
                </span>
                <span className="rounded-full bg-[#F9F8F5] border border-[#E8E6E0] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                  College vs college
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setNewTeam({ letter: 'A', captainId: '', players: [] }); setShowRegisterModal(true); }}
                className="sport-lobby-cta w-full sm:w-auto min-w-[240px] font-black uppercase tracking-widest text-xs px-6 py-3.5 rounded-2xl transition hover:opacity-95 cursor-pointer shadow-[0_6px_18px_rgba(200,146,42,0.28)]"
                style={{
                  background: `linear-gradient(135deg, ${APP_ACCENT}, ${APP_ACCENT_SOFT})`,
                  color: '#1A1A1A',
                }}
              >
                + Register Your College Team
              </button>
            </div>
          </motion.section>
        ) : (
          <div className="space-y-4">
            <h3 className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest pl-1">Your Squad</h3>
            <div className="relative overflow-hidden rounded-[1.5rem] border-2 border-[#E8E6E0] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
              <div
                className="h-1.5 w-full"
                style={{ background: `linear-gradient(90deg, ${APP_ACCENT}, ${APP_ACCENT_SOFT})` }}
              />
              <div className="absolute top-3 right-3 text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-[#FFF8EC] text-[#1A1A1A] border border-[#E8D9B0]">
                Your Team
              </div>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-black text-base text-[#1A1A1A] tracking-tight">{myTeamName}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusPill count={newTeam.players.length} max={sportData.limit} />
                    <span className="text-[10px] text-[#6B6B6B] uppercase tracking-widest font-bold">Max {sportData.limit}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSeeTeamModal(true)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-[#E8E6E0] bg-[#F9F8F5] hover:bg-white text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest transition cursor-pointer"
                >
                  See Team
                </button>
              </div>
            </div>

            {myTeamFull && (
              <button
                type="button"
                onClick={() => { setNewTeam({ letter: 'B', captainId: '', players: [] }); setShowRegisterModal(true); }}
                className="w-full py-3 rounded-xl border border-dashed border-[#E8E6E0] text-[#6B6B6B] hover:bg-[#F9F8F5] text-[10px] font-black uppercase tracking-widest transition cursor-pointer"
              >
                + Register 2nd Team (Team B)
              </button>
            )}
          </div>
        )}

        {/* ── OTHER COLLEGES — real data from /api/colleges ────────────── */}
        <OtherColleges sportName={sportName} sportData={sportData} apiUrl={apiUrl} />

      </div>

      {/* ══ REGISTER MODAL ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="app-panel rounded-[1.75rem] w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#E8E6E0] flex justify-between items-center bg-[#F3F2EE]">
                <h3 className="font-black uppercase tracking-widest text-sm text-[#1A1A1A]">Register Team {newTeam.letter}</h3>
                <button onClick={() => setShowRegisterModal(false)} className="text-[#6B6B6B] hover:text-[#1A1A1A]"><X size={18} /></button>
              </div>

              <div className="p-6">
                {/* Progress */}
                <div className="flex gap-2 mb-6">
                  <div className={clsx("h-1.5 flex-1 rounded-full", registerStep >= 1 ? "bg-orange-500" : "bg-[#F3F2EE]")} />
                  <div className={clsx("h-1.5 flex-1 rounded-full", registerStep >= 2 ? "bg-orange-500" : "bg-[#F3F2EE]")} />
                </div>

                {registerStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">College</label>
                      <input
                        type="text" disabled
                        value={userCollege}
                        className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#6B6B6B] text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">Select Captain</label>
                      {collegeStudents === null ? (
                        <Sk className="h-12 w-full" />
                      ) : (
                        <select
                          value={newTeam.captainId}
                          onChange={e => setNewTeam(p => ({ ...p, captainId: e.target.value }))}
                          className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:border-orange-500 focus:outline-none transition appearance-none"
                        >
                          <option value="">Choose from campus students...</option>
                          {collegeStudents.map(s => (
                            <option key={s._id || s.id} value={s._id || s.id}>
                              {s.name}{s.year ? ` · ${s.year}` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <button
                      onClick={() => setRegisterStep(2)}
                      disabled={!newTeam.captainId}
                      className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-[#1A1A1A] text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next Step <ChevronRight size={14} className="inline ml-1" />
                    </button>
                  </div>
                )}

                {registerStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest">Add Players</label>
                      <span className={clsx("text-xs font-black uppercase", newTeam.players.length >= sportData.limit ? "text-red-400" : "text-orange-400")}>
                        {newTeam.players.length}/{sportData.limit}
                      </span>
                    </div>

                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3.5 text-[#6B6B6B]" />
                      <input
                        type="text"
                        placeholder="Search campus students..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl pl-10 pr-4 py-3 text-[#1A1A1A] text-sm focus:border-orange-500 focus:outline-none transition"
                      />
                      {loadingStudents && <Loader2 size={14} className="absolute right-3 top-3.5 text-[#6B6B6B] animate-spin" />}
                    </div>

                    <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                      {collegeStudents === null ? (
                        Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-12 w-full" />)
                      ) : collegeStudents.filter(s => (s._id || s.id) !== newTeam.captainId).length === 0 ? (
                        <p className="text-center text-xs text-[#6B6B6B] py-4 font-bold">No students found</p>
                      ) : (
                        collegeStudents
                          .filter(s => (s._id || s.id) !== newTeam.captainId)
                          .map(student => {
                            const sid = student._id || student.id;
                            const isAdded = !!newTeam.players.find(p => (p._id || p.id) === sid);
                            const avatar = getAvatarSrc(student.profilePic, student.name, sid);
                            return (
                              <div key={sid} className="flex justify-between items-center p-3 bg-[#F3F2EE] rounded-xl border border-[#E8E6E0] gap-3">
                                <img src={avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#E8E6E0]" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-[#1A1A1A] truncate">{student.name}</p>
                                  <p className="text-[10px] text-[#6B6B6B] flex items-center gap-1 truncate">
                                    <MapPin size={8} />{student.university || '—'}
                                  </p>
                                </div>
                                {isAdded ? (
                                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-black uppercase flex items-center shrink-0">
                                    <CheckCircle2 size={12} className="mr-1" /> Added
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAddPlayer(student)}
                                    className="p-1.5 bg-[#F3F2EE] hover:bg-[#F3F2EE] text-[#1A1A1A] rounded-lg transition shrink-0"
                                  >
                                    <Plus size={16} />
                                  </button>
                                )}
                              </div>
                            );
                          })
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[#E8E6E0]">
                      <button onClick={() => setRegisterStep(1)} className="flex-1 py-3.5 rounded-xl bg-[#F3F2EE] text-[#4A4A4A] text-xs font-black uppercase tracking-widest">Back</button>
                      <button onClick={finishRegistration} className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-[#1A1A1A] text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
                        Finish Registration
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ SEE TEAM MODAL (real players from newTeam) ══════════════════════ */}
      <AnimatePresence>
        {showSeeTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSeeTeamModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="app-panel rounded-[1.75rem] w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-[#E8E6E0] bg-gradient-to-b from-white/5 to-transparent relative">
                <button onClick={() => setShowSeeTeamModal(false)} className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#1A1A1A] bg-black/50 p-1.5 rounded-full"><X size={16} /></button>
                <div className="text-4xl text-center mb-2">{sportData.icon}</div>
                <h3 className="font-black text-center text-base text-[#1A1A1A] uppercase tracking-wider">{myTeamName}</h3>
                <p className="text-center text-[10px] text-[#6B6B6B] font-bold uppercase tracking-widest mt-1">
                  {newTeam.players.length} / {sportData.limit} Players
                </p>
              </div>

              <div className="p-4 max-h-72 overflow-y-auto custom-scrollbar space-y-2">
                {/* Captain row */}
                {captainStudent && (
                  <div className="flex items-center p-3 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl">
                    <img
                      src={getAvatarSrc(captainStudent.profilePic, captainStudent.name, captainStudent._id || captainStudent.id)}
                      className="w-10 h-10 rounded-full object-cover border border-yellow-500/40 mr-3"
                      alt={captainStudent.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getDefaultAvatar(captainStudent.name, captainStudent._id || captainStudent.id);
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-black text-yellow-400 flex items-center">{captainStudent.name} <Crown size={12} className="ml-1.5" /></p>
                      <p className="text-[10px] text-[#6B6B6B] font-bold uppercase">Captain</p>
                    </div>
                  </div>
                )}
                {/* Added players */}
                {newTeam.players.map(player => {
                  const pid = player._id || player.id;
                  return (
                    <div key={pid} className="flex items-center p-3 bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl">
                      <img
                        src={getAvatarSrc(player.profilePic, player.name, player._id || player.id)}
                        className="w-10 h-10 rounded-full object-cover border border-[#E8E6E0] mr-3"
                        alt={player.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getDefaultAvatar(player.name, player._id || player.id);
                        }}
                      />
                      <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">{player.name}</p>
                        <p className="text-[10px] text-[#6B6B6B] font-medium">{player.university || 'Player'}</p>
                      </div>
                    </div>
                  );
                })}
                {newTeam.players.length === 0 && !captainStudent && (
                  <p className="text-center text-xs text-[#6B6B6B] py-8 font-bold">No players added yet</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Other Colleges component — fetches real data ─────────────────────────────
function OtherColleges({ sportName, sportData, apiUrl }) {
  const [colleges, setColleges] = useState(null);
  const [showInviteFor, setShowInviteFor] = useState(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('collegeadda_token');
      if (!token) return;
      try {
        const res = await fetch(`${apiUrl}/api/colleges`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setColleges(Array.isArray(data) ? data : []);
        }
      } catch (e) { setColleges([]); }
    };
    load();
  }, [apiUrl]);

  const Sk = ({ className }) => <div className={clsx("animate-pulse rounded-xl bg-[#EFEDE8]", className)} />;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-end justify-between gap-3 border-t border-[#E8E6E0] pt-6">
        <div>
          <h3 className="text-[11px] text-[#1A1A1A] font-black uppercase tracking-widest">
            Challenge Board
          </h3>
          <p className="text-[11px] text-[#888888] font-medium mt-1">
            Other college teams for {sportName}
          </p>
        </div>
        {colleges && (
          <span className="shrink-0 rounded-full bg-[#F9F8F5] border border-[#E8E6E0] px-2.5 py-1 text-[10px] font-bold text-[#6B6B6B]">
            {Math.min(colleges.length, 6)} listed
          </span>
        )}
      </div>

      {colleges === null ? (
        Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-[1.35rem] border border-[#E8E6E0] bg-white p-4 space-y-3">
            <Sk className="h-5 w-40" />
            <Sk className="h-4 w-24" />
            <Sk className="h-10 w-full rounded-xl" />
          </div>
        ))
      ) : colleges.length === 0 ? (
        <div className="rounded-[1.5rem] py-12 text-center border border-[#E8E6E0] bg-white">
          <p className="text-sm font-black text-[#888888]">No colleges found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {        colleges.slice(0, 6).map((college) => (
            <div
              key={college._id}
              className="group relative overflow-hidden rounded-[1.35rem] border-2 border-[#E8E6E0] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:border-[#C8922A]/55 transition-all"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8922A]" />
              <div className="p-4 pl-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center border-2 border-[#E8D9B0] bg-[#FFF8EC] shrink-0">
                  <span className="text-xl leading-none">{sportData.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm text-[#1A1A1A] tracking-tight truncate group-hover:text-[#C8922A] transition">
                    {college.name} {sportName}
                  </h4>
                  <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1 mt-1 font-semibold">
                    <MapPin size={11} /> {college.location || 'India'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteFor(college)}
                  className="sport-lobby-cta w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-[#E8D9B0] bg-[#FFF8EC] hover:bg-[#C8922A]/15 text-[10px] font-black uppercase tracking-widest transition cursor-pointer"
                >
                  <Swords size={13} className="text-[#C8922A]" />
                  Challenge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showInviteFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md" onClick={() => setShowInviteFor(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border-2 border-[#E8E6E0] rounded-[1.75rem] w-full max-w-sm overflow-hidden flex flex-col relative shadow-2xl"
            >
              <div
                className="absolute top-0 left-0 w-full h-1.5"
                style={{ background: `linear-gradient(90deg, ${APP_ACCENT}, ${APP_ACCENT_SOFT})` }}
              />
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center border-2 border-[#E8D9B0] bg-[#FFF8EC]">
                  <Swords size={26} className="text-[#C8922A]" />
                </div>
                <h3 className="font-black text-lg text-[#1A1A1A] tracking-tight mb-1">
                  Challenge {showInviteFor.name}?
                </h3>
                <p className="text-xs text-[#6B6B6B] mb-4 font-medium">
                  Send an official {sportName} match invitation to their team captain.
                </p>
                <p className="text-[10px] text-[#888888] mb-6 font-bold uppercase tracking-widest">
                  Match scheduling coming soon
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteFor(null)}
                    className="flex-1 py-3 rounded-xl bg-[#F3F2EE] border border-[#E8E6E0] text-[#4A4A4A] text-xs font-black uppercase tracking-widest cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { alert(`Invitation sent to ${showInviteFor.name}!`); setShowInviteFor(null); }}
                    className="sport-lobby-cta flex-[2] py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${APP_ACCENT}, ${APP_ACCENT_SOFT})`,
                      color: '#1A1A1A',
                    }}
                  >
                    Send Challenge
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
