"use client";
import React, { useState, useEffect } from "react";
import { X, Zap, Plus, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OpportunityFinder from "./OpportunityFinder";
import CollabCarousel from "@/components/collab/CollabCarousel";
import { supabase } from "@/utils/supabase";

export default function CollabPage() {
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

    const userId = currentUser?.id || currentUser?._id;
    if (!userId) {
      alert("You must be logged in to post.");
      return;
    }

    setIsPosting(true);
    try {
      const insertData = {
        user_id: userId,
        skills: skillset.split(",").map(s => s.trim()).filter(Boolean),
        building,
        year_major: yearMajor,
        project_type: projectType,
        urgency,
        roles_needed: rolesNeeded.split(",").map(r => r.trim()).filter(Boolean),
        description,
        status: 'active'
      };

      try {
        insertData.poster_name = currentUser?.name || currentUser?.username || currentUser?.fullName || 'Student';
        insertData.poster_avatar = currentUser?.avatar || currentUser?.photo || currentUser?.profilePic || null;
      } catch(e) {}

      const { error } = await supabase
        .from('collab_cards')
        .insert(insertData);

      if (error) throw error;

      setToastMsg("Your collab card is live! 🚀");
      setTimeout(() => setToastMsg(""), 3000);
      setShowPostModal(false);
      setSkillset(""); setBuilding(""); setYearMajor("");
      setProjectType("Side Project"); setRolesNeeded(""); setUrgency("Medium"); setDescription("");

    } catch (err) {
      console.error(err);
      alert("Failed to post collab card: " + (err?.message || JSON.stringify(err)));
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-x-hidden"
      style={{ background: "#FAF8F4" }}
    >
      {/* ── Toast ───────────────────────────────────── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 left-1/2 z-[999] -translate-x-1/2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest shadow-xl"
            style={{ background: "#3AA675", color: "#FFFFFF" }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Navigation ──────────────────────────── */}
      <nav
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(250,248,244,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "#ECE6DD",
        }}
      >
        <div
          className="mx-auto flex w-full max-w-[1440px] items-center justify-between"
          style={{ padding: "0 48px", height: 72 }}
        >
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg,#D6A12C,#C28F18)" }}
            >
              <Zap size={18} className="text-white" />
            </div>
            <span
              className="text-base font-black tracking-tight"
              style={{ color: "#1B1B1B" }}
            >
              CollabAdda
            </span>
          </div>

          {/* Center heading */}
          <div className="flex flex-col items-center gap-1 text-center">
            <h1
              className="text-xl font-black tracking-tight leading-tight"
              style={{ color: "#1B1B1B" }}
            >
              Find your next opportunity
            </h1>
            <p className="text-xs font-medium" style={{ color: "#6F6F6F" }}>
              Hackathons, side projects, societies, and startup teams.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowPostModal(true)}
            className="flex shrink-0 items-center gap-2 rounded-full text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.04] active:scale-95"
            style={{
              background: "linear-gradient(135deg,#D6A12C,#C28F18)",
              padding: "10px 22px",
              boxShadow: "0 4px 20px rgba(214,161,44,0.4)",
            }}
          >
            <Plus size={14} />
            Post Your Card
          </button>
        </div>
      </nav>

      {/* ── Main Body ───────────────────────────────── */}
      <main
        className="mx-auto w-full max-w-[1440px] flex-1 flex flex-col"
        style={{ padding: "48px 48px 80px" }}
      >
        {/* Section 1 — Opportunity Finder */}
        <section>
          <OpportunityFinder currentUser={currentUser} />
        </section>

        {/* Section 2 — Team Cards */}
        <section style={{ marginTop: 56 }}>
          {/* Section header */}
          <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.22em]"
                style={{ color: "#6F6F6F" }}
              >
                Team Cards
              </p>
              <h2
                className="mt-1 text-2xl font-black tracking-tight"
                style={{ color: "#1B1B1B" }}
              >
                Campus Collabs
              </h2>
            </div>
            <span
              className="rounded-full border text-[10px] font-black uppercase tracking-widest"
              style={{
                borderColor: "#ECE6DD",
                background: "#FFFFFF",
                color: "#6F6F6F",
                padding: "6px 16px",
              }}
            >
              Swipe to explore
            </span>
          </div>

          {/* Carousel container */}
          <div
            className="w-full rounded-[24px] border"
            style={{
              background: "#FFFFFF",
              borderColor: "#ECE6DD",
              boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
              padding: "40px 48px",
            }}
          >
            <CollabCarousel currentUser={currentUser} onPostCard={() => setShowPostModal(true)} />
          </div>
        </section>
      </main>

      {/* ── Post Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="w-full max-w-md overflow-hidden flex flex-col rounded-[24px] border"
              style={{
                background: "#FFFFFF",
                borderColor: "#ECE6DD",
                maxHeight: "90vh",
                boxShadow: "0 24px 80px rgba(0,0,0,0.12)",
              }}
            >
              {/* Modal header */}
              <div
                className="flex shrink-0 items-center justify-between border-b px-6 py-5"
                style={{ borderColor: "#ECE6DD", background: "#F4F1EB" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: "linear-gradient(135deg,#D6A12C,#C28F18)" }}
                  >
                    <Plus size={14} className="text-white" />
                  </div>
                  <h3
                    className="text-sm font-black uppercase tracking-widest"
                    style={{ color: "#1B1B1B" }}
                  >
                    Post Your Collab Card
                  </h3>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
                  style={{ color: "#6F6F6F" }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePost} className="overflow-y-auto p-6 space-y-5">
                {[
                  { label: "My Skillset", placeholder: "React, Node.js, Figma, Marketing...", value: skillset, onChange: setSkillset, hint: 'Comma-separated, e.g. "Python, ML, Data Analysis"' },
                  { label: "What I'm Building", placeholder: "AI-powered study assistant, Fintech startup...", value: building, onChange: setBuilding },
                  { label: "Class Year / Major", placeholder: "3rd Year, CSE · 2nd Year, MBA...", value: yearMajor, onChange: setYearMajor },
                ].map(({ label, placeholder, value, onChange, hint }) => (
                  <div key={label}>
                    <label
                      className="block text-[10px] font-black uppercase tracking-widest mb-2"
                      style={{ color: "#6F6F6F" }}
                    >
                      {label}
                    </label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={value}
                      onChange={e => onChange(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
                      style={{
                        borderColor: "#ECE6DD",
                        background: "#F4F1EB",
                        color: "#1B1B1B",
                      }}
                      onFocus={e => (e.target.style.borderColor = "#D6A12C")}
                      onBlur={e => (e.target.style.borderColor = "#ECE6DD")}
                    />
                    {hint && (
                      <p className="mt-1 text-[10px]" style={{ color: "#AAAAAA" }}>{hint}</p>
                    )}
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Project Type", value: projectType, onChange: setProjectType, options: ["Hackathon", "Startup", "Research", "Side Project", "Society", "Other"] },
                    { label: "Urgency", value: urgency, onChange: setUrgency, options: ["Low", "Medium", "High"] },
                  ].map(({ label, value, onChange, options }) => (
                    <div key={label}>
                      <label
                        className="block text-[10px] font-black uppercase tracking-widest mb-2"
                        style={{ color: "#6F6F6F" }}
                      >
                        {label}
                      </label>
                      <select
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="w-full appearance-none rounded-xl border px-3 py-3 text-sm outline-none transition"
                        style={{
                          borderColor: "#ECE6DD",
                          background: "#F4F1EB",
                          color: "#1B1B1B",
                        }}
                      >
                        {options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div>
                  <label
                    className="block text-[10px] font-black uppercase tracking-widest mb-2"
                    style={{ color: "#6F6F6F" }}
                  >
                    Roles Needed
                  </label>
                  <input
                    type="text"
                    placeholder="Backend Dev, UI Designer, Business Lead..."
                    value={rolesNeeded}
                    onChange={e => setRolesNeeded(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
                    style={{ borderColor: "#ECE6DD", background: "#F4F1EB", color: "#1B1B1B" }}
                    onFocus={e => (e.target.style.borderColor = "#D6A12C")}
                    onBlur={e => (e.target.style.borderColor = "#ECE6DD")}
                  />
                  <p className="mt-1 text-[10px]" style={{ color: "#AAAAAA" }}>Comma-separated roles</p>
                </div>

                <div>
                  <label
                    className="block text-[10px] font-black uppercase tracking-widest mb-2"
                    style={{ color: "#6F6F6F" }}
                  >
                    Short Description{" "}
                    <span className="font-medium normal-case tracking-normal" style={{ color: "#AAAAAA" }}>
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    placeholder="Any extra context about the project or what you're looking for..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition"
                    style={{ borderColor: "#ECE6DD", background: "#F4F1EB", color: "#1B1B1B" }}
                    onFocus={e => (e.target.style.borderColor = "#D6A12C")}
                    onBlur={e => (e.target.style.borderColor = "#ECE6DD")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPosting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#D6A12C,#C28F18)", boxShadow: "0 4px 20px rgba(214,161,44,0.35)" }}
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
