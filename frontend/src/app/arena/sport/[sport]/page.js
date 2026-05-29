"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, Swords, Plus, X, Search, Crown, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import clsx from 'clsx';

const sportLimits = {
  'volleyball': { limit: 12, icon: '🏐' },
  'football': { limit: 18, icon: '⚽' },
  'badminton': { limit: 4, icon: '🏸' },
  'basketball': { limit: 10, icon: '🏀' },
  'cricket': { limit: 15, icon: '🏏' },
  'tennis': { limit: 4, icon: '🎾' },
  'swimming': { limit: 8, icon: '🏊' },
  'bgmi': { limit: 5, icon: '🎮' },
  'valorant': { limit: 5, icon: '🎮' },
  'fifa': { limit: 2, icon: '🎮' }
};

// Mock Data
const mockTeams = [
  { id: 1, college: 'DTU', letter: 'A', players: 8, max: 12, isFull: false },
  { id: 2, college: 'IIT Delhi', letter: 'A', players: 12, max: 12, isFull: true }
];

const mockStudents = [
  { id: 101, name: 'Lakshay Y.', username: 'lakshay', hasCard: true },
  { id: 102, name: 'Rahul V.', username: 'rahulv', hasCard: true },
  { id: 103, name: 'Arjun K.', username: 'arjun', hasCard: true },
  { id: 104, name: 'Aditi S.', username: 'aditi', hasCard: true }
];

export default function SportTeamsPage() {
  const router = useRouter();
  const params = useParams();
  const rawSport = params.sport || 'volleyball';
  const sportKey = rawSport.toLowerCase();
  
  const sportName = rawSport.charAt(0).toUpperCase() + rawSport.slice(1);
  const sportData = sportLimits[sportKey] || { limit: 10, icon: '🏆' };

  const [hasMyTeam, setHasMyTeam] = useState(false);
  const [myTeamFull, setMyTeamFull] = useState(false);
  
  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSeeTeamModal, setShowSeeTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Register Flow State
  const [registerStep, setRegisterStep] = useState(1);
  const [newTeam, setNewTeam] = useState({ name: '', letter: 'A', captainId: '', players: [] });
  const [searchQuery, setSearchQuery] = useState('');

  // Setup user college mock
  const userCollege = "Rishihood";
  const myTeamName = `${userCollege} ${sportName} - Team ${newTeam.letter}`;

  const getStatusPill = (players, max) => {
    if (players >= max) return <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center"><div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5" /> Full Team</span>;
    if (players === 0) return <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center"><div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5" /> Open</span>;
    return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5" /> {players}/{max}</span>;
  };

  const handleAddPlayer = (student) => {
    if (newTeam.players.length >= sportData.limit) {
      alert(`Limit reached! Max ${sportData.limit} players allowed for ${sportName}.`);
      return;
    }
    if (!newTeam.players.find(p => p.id === student.id)) {
      setNewTeam(prev => ({ ...prev, players: [...prev.players, student] }));
      // In a real app we'd send a notification here
    }
  };

  const finishRegistration = () => {
    setHasMyTeam(true);
    setMyTeamFull(newTeam.players.length >= sportData.limit);
    setShowRegisterModal(false);
    setRegisterStep(1);
  };

  return (
    <div className="page-shell text-white overflow-hidden">
      <header className="page-header sticky top-0 z-40 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center">
        <button onClick={() => router.back()} className="mr-3 p-2 bg-white/5 rounded-full hover:bg-white/10 transition">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-widest flex items-center">
          <span className="mr-2 text-2xl">{sportData.icon}</span> {sportName}
        </h1>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-24 relative z-10">
        
        {/* MY TEAM SECTION */}
        {!hasMyTeam ? (
          <div className="app-panel border-orange-500/30 rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-orange-500/50">
              <Users size={28} className="text-orange-400" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest mb-2">No Team Found</h2>
            <p className="text-xs text-white/50 mb-6 font-medium">Your college doesn't have a registered {sportName} team yet. Be the first to build the squad!</p>
            <button 
              onClick={() => { setNewTeam({...newTeam, letter: 'A'}); setShowRegisterModal(true); }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 hover:scale-105 transition w-full"
            >
              + Register Your College Team
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-[10px] text-white/40 font-black uppercase tracking-widest pl-1">Your Squad</h3>
            <div className="bg-white/5 border border-orange-500/30 rounded-2xl p-1 shadow-[0_0_20px_rgba(249,115,22,0.1)] relative">
              <div className="absolute top-0 right-4 bg-orange-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-b-md shadow-lg">Your Team ✅</div>
              <div className="app-panel rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-black text-lg text-white uppercase tracking-wider">{myTeamName}</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusPill(newTeam.players.length, sportData.limit)}
                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Max {sportData.limit}</span>
                  </div>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                  <button onClick={() => setShowSeeTeamModal(true)} className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition">See Team 👥</button>
                </div>
              </div>
            </div>

            {myTeamFull && (
              <button 
                onClick={() => { setNewTeam({ name: '', letter: 'B', captainId: '', players: [] }); setShowRegisterModal(true); }}
                className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition"
              >
                + Register 2nd Team (Team B)
              </button>
            )}
          </div>
        )}

        {/* OTHER COLLEGE TEAMS */}
        <div className="space-y-4 pt-4">
          <h3 className="text-[10px] text-white/40 font-black uppercase tracking-widest pl-1 border-t border-white/10 pt-6">Other College Teams</h3>
          
          {mockTeams.map((team) => (
            <div key={team.id} className="app-panel rounded-[1.35rem] p-4 hover:border-primary/30 transition group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-sm text-white uppercase tracking-wider group-hover:text-cyan-400 transition">{team.college} {sportName}</h4>
                  <div className="mt-2">
                    {getStatusPill(team.players, team.max)}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setShowSeeTeamModal(true)} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 text-[10px] font-black uppercase tracking-widest transition">See Team 👥</button>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-purple-300 hover:from-purple-600/40 hover:to-indigo-600/40 text-[10px] font-black uppercase tracking-widest transition"
                >
                  Send Invitation ⚔️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODALS ================= */}
      
      {/* 1. Register Flow Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="app-panel rounded-[1.75rem] w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-black uppercase tracking-widest text-sm text-white">Register Team {newTeam.letter}</h3>
                <button onClick={() => setShowRegisterModal(false)} className="text-white/50 hover:text-white"><X size={18}/></button>
              </div>
              
              <div className="p-6">
                {/* Progress Bar */}
                <div className="flex space-x-2 mb-6">
                  <div className={clsx("h-1.5 flex-1 rounded-full", registerStep >= 1 ? "bg-orange-500" : "bg-white/10")} />
                  <div className={clsx("h-1.5 flex-1 rounded-full", registerStep >= 2 ? "bg-orange-500" : "bg-white/10")} />
                </div>

                {registerStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div>
                      <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">College</label>
                      <input type="text" disabled value={userCollege} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 text-sm font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Team Name (Optional)</label>
                      <input type="text" placeholder={`${userCollege} ${sportName}`} value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Select Captain</label>
                      <select 
                        value={newTeam.captainId} onChange={e => setNewTeam({...newTeam, captainId: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition appearance-none"
                      >
                        <option value="">Choose a player...</option>
                        {mockStudents.map(s => <option key={s.id} value={s.id}>{s.name} (@{s.username})</option>)}
                      </select>
                    </div>
                    <button 
                      onClick={() => setRegisterStep(2)}
                      disabled={!newTeam.captainId}
                      className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Step <ChevronRight size={14} className="inline ml-1" />
                    </button>
                  </div>
                )}

                {registerStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] text-white/50 font-black uppercase tracking-widest">Add Players</label>
                      <span className={clsx("text-xs font-black uppercase", newTeam.players.length >= sportData.limit ? "text-red-400" : "text-orange-400")}>
                        {newTeam.players.length}/{sportData.limit}
                      </span>
                    </div>
                    
                    {/* Search bar */}
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3.5 text-white/40" />
                      <input type="text" placeholder="Search college students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition" />
                    </div>

                    <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                      {mockStudents.filter(s => s.id.toString() !== newTeam.captainId && s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(student => {
                        const isAdded = newTeam.players.find(p => p.id === student.id);
                        return (
                          <div key={student.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <div>
                              <p className="text-sm font-bold text-white">{student.name}</p>
                              <p className="text-[10px] text-white/40">@{student.username}</p>
                            </div>
                            {isAdded ? (
                              <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-black uppercase flex items-center"><CheckCircle2 size={12} className="mr-1"/> Added</div>
                            ) : (
                              <button onClick={() => handleAddPlayer(student)} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"><Plus size={16} /></button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-white/10">
                      <button onClick={() => setRegisterStep(1)} className="flex-1 py-3.5 rounded-xl bg-white/5 text-white/70 text-xs font-black uppercase tracking-widest">Back</button>
                      <button onClick={finishRegistration} className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
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

      {/* 2. See Team Modal */}
      <AnimatePresence>
        {showSeeTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setShowSeeTeamModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="app-panel rounded-[1.75rem] w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
                <button onClick={() => setShowSeeTeamModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white bg-black/50 p-1.5 rounded-full"><X size={16}/></button>
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-3xl">{sportData.icon}</span>
                </div>
                <h3 className="font-black text-center text-lg text-white uppercase tracking-wider">DTU {sportName}</h3>
                <p className="text-center text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">8 / 12 Players</p>
              </div>
              
              <div className="p-4 max-h-64 overflow-y-auto custom-scrollbar bg-white/[0.03]">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-surface mr-3 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]" />
                    <div className="flex-1">
                      <p className="text-sm font-black text-yellow-400 uppercase flex items-center">Kabir M. <Crown size={12} className="ml-1.5" /></p>
                      <p className="text-[10px] text-white/40 font-bold uppercase">Captain</p>
                    </div>
                  </div>
                  
                  {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} className="flex items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-surface mr-3 border border-white/10" />
                      <div>
                        <p className="text-sm font-bold text-white">Player {i}</p>
                        <p className="text-[10px] text-white/40 font-medium">Starter</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Send Invitation Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setShowInviteModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="app-panel border-purple-500/30 rounded-[1.75rem] w-full max-w-sm overflow-hidden flex flex-col relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
              <div className="p-6 text-center">
                <Swords size={32} className="text-purple-400 mx-auto mb-4" />
                <h3 className="font-black text-lg text-white uppercase tracking-wider mb-2">Challenge DTU?</h3>
                <p className="text-xs text-white/50 mb-6 font-medium">Select your team to send an official match invitation.</p>
                
                <div className="space-y-3 mb-6">
                  <label className="flex items-center p-4 bg-white/5 border border-purple-500/30 rounded-xl cursor-pointer hover:bg-white/10 transition">
                    <input type="radio" name="team" className="accent-purple-500 w-4 h-4 mr-3" defaultChecked />
                    <span className="text-sm font-bold text-white">{userCollege} {sportName} Team A</span>
                  </label>
                  {myTeamFull && (
                    <label className="flex items-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition opacity-50">
                      <input type="radio" name="team" className="accent-purple-500 w-4 h-4 mr-3" disabled />
                      <span className="text-sm font-bold text-white">No Team B Registered</span>
                    </label>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button onClick={() => setShowInviteModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 text-xs font-black uppercase tracking-widest">Cancel</button>
                  <button 
                    onClick={() => { alert('Invitation Sent to DTU Captain!'); setShowInviteModal(false); }}
                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20"
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
