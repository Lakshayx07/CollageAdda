"use client";
import React, { useState, useEffect } from "react";
import { Check, Code, Palette, Shield, X, Zap, Plus, Users, Clock, Briefcase, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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

export default function CollabPage() {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState("");
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

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").trim();

  useEffect(() => {
    const storedUser = localStorage.getItem("collegeadda_user");
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/collab`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (err) {
      console.error("Error fetching collab cards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (isAccept) => {
    if (cards.length === 0) return;
    const topCard = cards[0];
    setDirection(isAccept ? "right" : "left");

    if (isAccept) {
      try {
        const token = localStorage.getItem("collegeadda_token");
        await fetch(`${apiUrl}/api/collab/${topCard._id}/interest`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });
        setToastMsg("Interest sent! 🎉 They can reach out to you.");
        setTimeout(() => setToastMsg(""), 3000);
      } catch (err) {
        console.error(err);
      }
    }

    setTimeout(() => {
      setCards(prev => prev.slice(1));
      setDirection("");
    }, 300);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!skillset.trim() || !building.trim() || !yearMajor.trim()) {
      alert("Please fill in your skillset, what you're building, and your class year.");
      return;
    }
    setIsPosting(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/collab`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          skillset,
          building,
          yearMajor,
          projectType,
          rolesNeeded: rolesNeeded.split(",").map(r => r.trim()).filter(Boolean),
          urgency,
          description
        })
      });
      if (res.ok) {
        setToastMsg("Your collab card is live! 🚀");
        setTimeout(() => setToastMsg(""), 3000);
        setShowPostModal(false);
        setSkillset(""); setBuilding(""); setYearMajor("");
        setProjectType("Side Project"); setRolesNeeded(""); setUrgency("Medium"); setDescription("");
        fetchCards();
      }
    } catch (err) {
      console.error(err);
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

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-8">
        <div className="relative w-full max-w-sm" style={{ minHeight: 480 }}>
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] app-panel">
              <Loader size={32} className="animate-spin text-primary mb-4" />
              <p className="text-sm text-muted font-bold">Loading campus cards…</p>
            </div>
          ) : (
            <AnimatePresence>
              {cards.length > 0 ? (
                <motion.div
                  key={cards[0]._id}
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    x: direction === "right" ? 200 : direction === "left" ? -200 : 0,
                    rotate: direction === "right" ? 12 : direction === "left" ? -12 : 0
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="app-panel absolute inset-0 rounded-[1.75rem] p-6 flex flex-col"
                >
                  {/* Header badges */}
                  <div className="flex justify-between items-start mb-5">
                    <span className={clsx(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border",
                      PROJECT_TYPE_COLORS[cards[0].projectType] || PROJECT_TYPE_COLORS.Other
                    )}>
                      {cards[0].projectType}
                    </span>
                    <span className={clsx(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded-full border",
                      URGENCY_COLORS[cards[0].urgency] || URGENCY_COLORS.Medium
                    )}>
                      <Clock size={9} className="inline mr-1" />{cards[0].urgency} Urgency
                    </span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-sm font-black text-white shrink-0">
                      {cards[0].author?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-black text-white">{cards[0].author?.name || "Campus Student"}</p>
                        <VerifiedBadge user={cards[0].author} size={14} />
                      </div>
                      <p className="text-[11px] text-white/50 font-medium">{cards[0].yearMajor}</p>
                    </div>
                  </div>

                  {/* What they're building */}
                  <div className="mb-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">What I&apos;m Building</p>
                    <h2 className="text-xl font-black text-white leading-tight">{cards[0].building}</h2>
                  </div>

                  {/* Skillset */}
                  <div className="mb-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">My Skillset</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cards[0].skillset.split(",").map((s, i) => (
                        <span key={i} className="text-[10px] font-bold text-white/70 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Roles Needed */}
                  {cards[0].rolesNeeded?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">
                        <Users size={9} className="inline mr-1" />Roles Needed
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cards[0].rolesNeeded.map((r, i) => (
                          <span key={i} className="text-[10px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {cards[0].description && (
                    <p className="text-xs text-white/50 leading-relaxed mb-4 italic flex-1">
                      &quot;{cards[0].description}&quot;
                    </p>
                  )}

                  {/* Interested count */}
                  <p className="text-[10px] text-white/30 font-bold mb-3">
                    {cards[0].interests?.length || 0} people interested · {cards[0].author?.university}
                  </p>

                  {/* Swipe Buttons */}
                  <div className="flex justify-center space-x-6 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleSwipe(false)}
                      className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    >
                      <X size={28} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => handleSwipe(true)}
                      className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    >
                      <Check size={28} strokeWidth={3} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="app-panel absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] p-7 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Briefcase size={34} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white">No cards on campus</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Be the first to post a collab card for your campus!
                  </p>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="mt-6 primary-button px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest"
                  >
                    <Plus size={14} className="inline mr-2" />Post Your Card
                  </button>
                </div>
              )}
            </AnimatePresence>
          )}
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
