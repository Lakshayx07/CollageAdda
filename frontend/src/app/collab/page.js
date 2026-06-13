"use client";
import React, { useState, useEffect } from "react";
import { Check, Code, Palette, Shield, X, Zap, Plus, Users, Clock, Briefcase, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import VerifiedBadge from "@/components/VerifiedBadge";
import OpportunityFinder from "./OpportunityFinder";
import CollabCarousel from "@/components/collab/CollabCarousel";
import { supabase } from "@/utils/supabase";

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

export default function CollabPage() {
  const router = useRouter();
  const [showPostModal, setShowPostModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Form fields
  const [skillset, setSkillset] = useState("");
  const [building, setBuilding] = useState("");
  const [yearMajor, setYearMajor] = useState("");
  const [projectType, setProjectType] = useState("Side Project");
  const [rolesNeeded, setRolesNeeded] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("collegeadda_user");
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!skillset.trim() || !building.trim() || !yearMajor.trim()) {
      alert("Please fill in your skillset, what you're building, and your class year.");
      return;
    }
    
    if (!currentUser?.id) {
      alert("You must be logged in to post.");
      return;
    }

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('collab_cards')
        .insert({
          user_id: currentUser.id,
          skills: skillset.split(",").map(s => s.trim()).filter(Boolean),
          building,
          year_major: yearMajor,
          project_type: projectType,
          urgency,
          roles_needed: rolesNeeded.split(",").map(r => r.trim()).filter(Boolean),
          description,
          status: 'active'
        });

      if (error) throw error;
      
      setToastMsg("Your collab card is live! 🚀");
      setTimeout(() => setToastMsg(""), 3000);
      setShowPostModal(false);
      setSkillset(""); setBuilding(""); setYearMajor("");
      setProjectType("Side Project"); setRolesNeeded(""); setUrgency("Medium"); setDescription("");
      
    } catch (err) {
      console.error(err);
      alert("Failed to post collab card.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="page-shell flex flex-col overflow-hidden">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 left-1/2 z-[999] -translate-x-1/2 rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-black shadow-xl"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="page-header sticky top-0 z-40 px-5 py-5">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 text-left sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="icon-tile h-12 w-12">
              <Zap size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Team Matchmaker<span className="text-primary">.</span>
              </h1>
              <p className="mt-1 text-sm font-medium text-muted">
                Hackathons, side projects, societies, and startup teams.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="primary-button flex w-full items-center justify-center rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest transition hover:scale-[1.03] sm:w-auto"
          >
            <Plus size={16} className="mr-2" /> Post Your Card
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <OpportunityFinder currentUser={currentUser} />

          <CollabCarousel currentUser={currentUser} onPostCard={() => setShowPostModal(true)} />
        </div>
      </main>

      {/* Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="app-panel rounded-[1.75rem] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                <h3 className="font-black uppercase tracking-widest text-sm text-white flex items-center">
                  <Plus size={16} className="mr-2 text-primary" /> Post Your Collab Card
                </h3>
                <button onClick={() => setShowPostModal(false)} className="text-white/50 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handlePost} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">My Skillset</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, Figma, Marketing..."
                    value={skillset}
                    onChange={e => setSkillset(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition"
                  />
                  <p className="text-[10px] text-white/30 mt-1">Comma-separated, e.g. &quot;Python, ML, Data Analysis&quot;</p>
                </div>

                <div>
                  <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">What I&apos;m Building</label>
                  <input
                    type="text"
                    placeholder="AI-powered study assistant, Fintech startup..."
                    value={building}
                    onChange={e => setBuilding(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Class Year / Major</label>
                  <input
                    type="text"
                    placeholder="3rd Year, CSE · 2nd Year, MBA..."
                    value={yearMajor}
                    onChange={e => setYearMajor(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Project Type</label>
                    <select
                      value={projectType}
                      onChange={e => setProjectType(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:border-primary focus:outline-none transition appearance-none"
                    >
                      <option>Hackathon</option>
                      <option>Startup</option>
                      <option>Research</option>
                      <option>Side Project</option>
                      <option>Society</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Urgency</label>
                    <select
                      value={urgency}
                      onChange={e => setUrgency(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:border-primary focus:outline-none transition appearance-none"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Roles Needed</label>
                  <input
                    type="text"
                    placeholder="Backend Dev, UI Designer, Business Lead..."
                    value={rolesNeeded}
                    onChange={e => setRolesNeeded(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition"
                  />
                  <p className="text-[10px] text-white/30 mt-1">Comma-separated roles</p>
                </div>

                <div>
                  <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Short Description (Optional)</label>
                  <textarea
                    placeholder="Any extra context about the project or what you're looking for..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPosting}
                  className="w-full py-4 bg-primary text-black rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPosting ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                  {isPosting ? "Posting..." : "Go Live 🚀"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
