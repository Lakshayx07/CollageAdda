"use client";
import React, { useState } from "react";
import { GraduationCap, Briefcase, Coffee, Building2, ChevronRight, MessageSquare, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AlumniAngelsPage() {
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  
  // Real data will be fetched here
  const alumniList = [];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050508] relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-8 relative z-10 border-b border-white/5">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-amber-500/20">
            <GraduationCap size={24} className="text-black" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            Alumni Angels<span className="text-amber-500">.</span>
          </h1>
        </div>
        <p className="text-white/50 text-sm font-medium max-w-lg">
          The VIP Club. Connect with verified alumni from top-tier companies. Request referrals or a 15-minute virtual coffee chat.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        {alumniList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alumniList.map(alumni => (
              <motion.div 
                key={alumni.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0A0A0F] border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start group hover:border-amber-500/30 transition shadow-lg relative overflow-hidden"
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
                    {alumni.available && <div className="w-2 h-2 rounded-full bg-green-500 ml-2 animate-pulse" title="Available for Chats" />}
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
          <div className="flex flex-col items-center justify-center h-full text-center text-white/30 pt-20">
            <GraduationCap size={48} className="mb-4 opacity-20" />
            <h3 className="font-bold text-lg mb-1">No Alumni Registered</h3>
            <p className="text-xs">Be the first to join the network.</p>
          </div>
        )}
      </div>

      {/* Coffee Chat Modal */}
      <AnimatePresence>
        {selectedAlumni && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedAlumni(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#050508] border border-amber-500/30 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.15)]"
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
