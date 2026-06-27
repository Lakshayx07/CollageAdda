"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Users, Swords, Plus, X, Search,
  Crown, CheckCircle2, ChevronRight, Loader2, MapPin
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import clsx from 'clsx';

const SPORT_CONFIG = {
  volleyball:  { limit: 12, icon: '🏐' },
  football:    { limit: 18, icon: '⚽' },
  badminton:   { limit: 4,  icon: '🏸' },
  basketball:  { limit: 10, icon: '🏀' },
  cricket:     { limit: 15, icon: '🏏' },
  tennis:      { limit: 4,  icon: '🎾' },
  swimming:    { limit: 8,  icon: '🏊' },
  bgmi:        { limit: 5,  icon: '🎮' },
  valorant:    { limit: 5,  icon: '🎮' },
  fifa:        { limit: 2,  icon: '🎮' },
  chess:       { limit: 2,  icon: '♟️' },
  carrom:      { limit: 2,  icon: '🎯' },
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
  const sportData  = SPORT_CONFIG[sportKey] || { limit: 10, icon: '🏆' };

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
    <div className="page-shell text-[#1A1A1A] overflow-hidden pb-24">
      {/* Header */}
      <header className="page-header sticky top-0 z-40 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-[#F3F2EE] rounded-full hover:bg-[#F3F2EE] transition">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
            <span className="text-2xl">{sportData.icon}</span> {sportName}
          </h1>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6 relative z-10">

        {/* ── MY TEAM SECTION ─────────────────────────────────────────────── */}
        {!hasMyTeam ? (
          <div className="app-panel border-orange-500/30 rounded-[1.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-orange-500/50">
              <Users size={28} className="text-orange-400" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest mb-2">No Team Yet</h2>
            <p className="text-xs text-[#6B6B6B] mb-6 font-medium">
              {userCollege} doesn't have a registered {sportName} team yet.
              Be the first to build the squad!
            </p>
            <button
              onClick={() => { setNewTeam({ letter: 'A', captainId: '', players: [] }); setShowRegisterModal(true); }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-[#1A1A1A] font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 hover:scale-105 transition w-full"
            >
              + Register Your College Team
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest pl-1">Your Squad</h3>
            <div className="bg-[#F3F2EE] border border-orange-500/30 rounded-2xl p-1 shadow-[0_0_20px_rgba(249,115,22,0.1)] relative">
              <div className="absolute top-0 right-4 bg-orange-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-b-md shadow-lg">
                Your Team ✅
              </div>
              <div className="app-panel rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-black text-base text-[#1A1A1A] uppercase tracking-wider">{myTeamName}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusPill count={newTeam.players.length} max={sportData.limit} />
                    <span className="text-[10px] text-[#6B6B6B] uppercase tracking-widest font-bold">Max {sportData.limit}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowSeeTeamModal(true)}
                    className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-[#F3F2EE] hover:bg-[#F3F2EE] text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest transition"
                  >
                    See Team 👥
                  </button>
                </div>
              </div>
            </div>

            {myTeamFull && (
              <button
                onClick={() => { setNewTeam({ letter: 'B', captainId: '', players: [] }); setShowRegisterModal(true); }}
                className="w-full py-3 rounded-xl border border-dashed border-[#E8E6E0] text-[#6B6B6B] hover:bg-[#F3F2EE] text-[10px] font-black uppercase tracking-widest transition"
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
                            const avatar = student.profilePic ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1a1a2e&color=fff`;
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
                      src={captainStudent.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(captainStudent.name)}&background=1a1a2e&color=fff`}
                      className="w-10 h-10 rounded-full object-cover border border-yellow-500/40 mr-3"
                      alt={captainStudent.name}
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
                        src={player.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1a1a2e&color=fff`}
                        className="w-10 h-10 rounded-full object-cover border border-[#E8E6E0] mr-3"
                        alt={player.name}
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

  const Sk = ({ className }) => <div className={clsx("animate-pulse rounded-xl bg-white/6", className)} />;

  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest pl-1 border-t border-[#E8E6E0] pt-6">
        Other College Teams
      </h3>

      {colleges === null ? (
        Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="app-panel rounded-[1.35rem] p-4 space-y-3">
            <Sk className="h-5 w-40" />
            <Sk className="h-4 w-24" />
            <div className="flex gap-2">
              <Sk className="h-10 flex-1 rounded-xl" />
              <Sk className="h-10 flex-1 rounded-xl" />
            </div>
          </div>
        ))
      ) : colleges.length === 0 ? (
        <div className="app-panel rounded-[1.5rem] py-12 text-center border border-[#E8E6E0]">
          <p className="text-sm font-black text-[#888888]">No colleges found</p>
        </div>
      ) : (
        colleges.slice(0, 6).map(college => (
          <div key={college._id} className="app-panel rounded-[1.35rem] p-4 hover:border-[#E8E6E0] transition group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-black text-sm text-[#1A1A1A] uppercase tracking-wider group-hover:text-[#C8922A] transition">
                  {college.name} {sportName}
                </h4>
                <p className="text-[10px] text-[#6B6B6B] flex items-center gap-1 mt-1 font-bold">
                  <MapPin size={9} /> {college.location || 'India'}
                </p>
              </div>
              <span className="text-2xl">{sportData.icon}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInviteFor(college)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#C8922A]/20 to-[#D4A843]/20 border border-[#C8922A]/30 text-[#C8922A] hover:from-[#C8922A]/40 hover:to-[#D4A843]/40 text-[10px] font-black uppercase tracking-widest transition"
              >
                Send Invitation ⚔️
              </button>
            </div>
          </div>
        ))
      )}

      {/* Invite Modal — no hardcoded team names */}
      <AnimatePresence>
        {showInviteFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md" onClick={() => setShowInviteFor(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="app-panel border-[#C8922A]/30 rounded-[1.75rem] w-full max-w-sm overflow-hidden flex flex-col relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C8922A] to-[#D4A843]" />
              <div className="p-6 text-center">
                <Swords size={32} className="text-[#C8922A] mx-auto mb-4" />
                <h3 className="font-black text-lg text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Challenge {showInviteFor.name}?
                </h3>
                <p className="text-xs text-[#6B6B6B] mb-6 font-medium">
                  Send an official {sportName} match invitation to their team captain.
                </p>
                <p className="text-[10px] text-[#6B6B6B] mb-6 font-bold uppercase tracking-widest">
                  Match scheduling coming soon
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowInviteFor(null)} className="flex-1 py-3 rounded-xl bg-[#F3F2EE] text-[#4A4A4A] text-xs font-black uppercase tracking-widest">
                    Cancel
                  </button>
                  <button
                    onClick={() => { alert(`Invitation sent to ${showInviteFor.name}!`); setShowInviteFor(null); }}
                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-[#C8922A] to-[#D4A843] text-[#1A1A1A] text-xs font-black uppercase tracking-widest shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)]"
                  >
                    Send Challenge ⚔️
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
