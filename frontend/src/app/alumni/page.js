"use client";
import React, { useState } from "react";
import { GraduationCap, Briefcase, Coffee, Building2, ChevronRight, MessageSquare, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AlumniAngelsPage() {
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  
  // Real data will be fetched here
  const alumniList = [];

  return (
    <div className="page-shell flex flex-col overflow-hidden">
      <header className="page-header sticky top-0 z-40 px-5 py-5">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-black shadow-lg shadow-amber-500/20">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Alumni Angels<span className="text-amber-400">.</span>
              </h1>
              <p className="mt-1 max-w-xl text-sm font-medium text-muted">
                Verified alumni, referrals, resume reviews, and quick career chats.
              </p>
            </div>
          </div>
          <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto">
            {["Referrals", "Coffee chats", "Mentors"].map((label) => (
              <span key={label} className="app-chip text-xs font-bold">{label}</span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-4 py-6 sm:px-5 sm:py-8">
        {alumniList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alumniList.map(alumni => (
              <motion.div 
                key={alumni.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="app-panel rounded-[1.5rem] p-6 flex flex-col sm:flex-row items-center sm:items-start group hover:border-amber-500/30 transition relative overflow-hidden"
              >
                {alumni.company === "Google" && <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full blur-xl pointer-events-none" />}
                {alumni.company === "Microsoft" && <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-bl-full blur-xl pointer-events-none" />}
                
                <div className="relative mb-4 sm:mb-0 sm:mr-6 shrink-0">
                  <img src={alumni.image} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10" alt={alumni.name} />
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-md border border-amber-400">
                    ALUMNI
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left w-full">
                  <h3 className="text-xl font-black text-white leading-tight flex items-center justify-center sm:justify-start">
                    {alumni.name} 
                  </h3>
                  <p className="text-sm text-white/50 font-bold mb-3">{alumni.college} ' {alumni.gradYear.slice(2)}</p>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3 mb-5">
                    <div className="flex items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                      <Building2 size={14} className="text-amber-400 mr-2" />
                      <span className="text-xs font-bold text-white">{alumni.company}</span>
                    </div>
                    <div className="flex items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                      <Briefcase size={14} className="text-amber-400 mr-2" />
                      <span className="text-xs font-bold text-white/70">{alumni.role}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3 w-full">
                    <button 
                      onClick={() => setSelectedAlumni(alumni)}
                      disabled={!alumni.available}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition flex items-center justify-center disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      <Coffee size={14} className="mr-2" /> Coffee Chat
                    </button>
                    <button className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition flex items-center justify-center">
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="app-panel mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center rounded-[1.75rem] p-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400/10 text-amber-300">
              <GraduationCap size={34} />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">Alumni network is warming up</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">
              Once alumni accounts are added, this page will show mentors by company, college, and availability.
            </p>
            <div className="mt-6 grid w-full max-w-md grid-cols-1 gap-3 min-[420px]:grid-cols-3">
              {[
                ["0", "Mentors"],
                ["0", "Referrals"],
                ["0", "Chats"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Coffee Chat Modal */}
      <AnimatePresence>
        {selectedAlumni && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedAlumni(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="app-panel border-amber-500/30 rounded-[1.75rem] w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 text-center">
                <Coffee size={32} className="text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Request Coffee Chat</h3>
                <p className="text-xs text-white/50">with {selectedAlumni.name} ({selectedAlumni.company})</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Topic of Discussion</label>
                  <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none transition appearance-none">
                    <option>Resume Review</option>
                    <option>Mock Interview</option>
                    <option>Referral Request</option>
                    <option>General Career Advice</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">A short note (Optional)</label>
                  <textarea rows={3} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none transition resize-none custom-scrollbar" placeholder="Hi Priya, I am a 3rd year student and would love your advice on..."></textarea>
                </div>
                <button 
                  onClick={() => { alert("Request Sent!"); setSelectedAlumni(null); }}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20"
                >
                  Send Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
