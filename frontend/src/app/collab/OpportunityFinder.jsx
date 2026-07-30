"use client";

import React, { useMemo, useState, useRef } from "react";
import clsx from "clsx";
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CalendarClock,
  ExternalLink,
  GraduationCap,
  Loader,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

const COURSES  = ["B.Tech","B.E","BCA","MCA","MBA","BSc","Diploma","B.Com","BA","M.Tech","Other"];
const BRANCHES = ["CSE","IT","ECE","Mechanical","Civil","AI/ML","Data Science","Business","Finance","Marketing","Design","Biotech","Other"];
const YEARS    = ["1st Year","2nd Year","3rd Year","4th Year","Final Year","Graduate"];
const TYPES    = ["Internship","Hackathon","Startup","Competition","Workshop","Scholarship"];

const TYPE_STYLES = {
  Internship:  { color: "#059669", bg: "rgba(5,150,105,0.08)",   border: "rgba(5,150,105,0.2)" },
  Hackathon:   { color: "#2563EB", bg: "rgba(37,99,235,0.08)",   border: "rgba(37,99,235,0.2)" },
  Workshop:    { color: "#D6A12C", bg: "rgba(214,161,44,0.08)",  border: "rgba(214,161,44,0.25)" },
  Scholarship: { color: "#D97706", bg: "rgba(217,119,6,0.08)",   border: "rgba(217,119,6,0.2)" },
  Competition: { color: "#D6A12C", bg: "rgba(214,161,44,0.08)",  border: "rgba(214,161,44,0.3)" },
  Startup:     { color: "#7C3AED", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)" },
  Other:       { color: "#6F6F6F", bg: "#F4F1EB",                border: "#ECE6DD" },
};

/* ─── Logo color palette (deterministic by org name) ── */
const LOGO_GRADIENTS = [
  "linear-gradient(135deg,#D6A12C,#B8861C)",
  "linear-gradient(135deg,#2563EB,#1D4ED8)",
  "linear-gradient(135deg,#059669,#047857)",
  "linear-gradient(135deg,#7C3AED,#6D28D9)",
  "linear-gradient(135deg,#DC2626,#B91C1C)",
  "linear-gradient(135deg,#2F3A45,#1A2530)",
  "linear-gradient(135deg,#D97706,#B45309)",
  "linear-gradient(135deg,#0891B2,#0E7490)",
];

const getLogoGradient = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return LOGO_GRADIENTS[Math.abs(hash) % LOGO_GRADIENTS.length];
};

const getOrgInitials = (name = "") =>
  (name || "?")
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/).filter(Boolean)
    .map(w => w[0].toUpperCase())
    .slice(0, 2).join("") || "?";

/* ─── Match score (deterministic, position-weighted) ── */
const getMatchScore = (opp, index, total, selectedTypes) => {
  const base      = Math.round(96 - (index / Math.max(total - 1, 1)) * 26);
  const typeBonus = (selectedTypes || []).includes(opp.type) ? 2 : -2;
  const jitter    = (opp.title?.length || 10) % 7 - 3; // -3 to +3
  return Math.min(99, Math.max(66, base + typeBonus + jitter));
};

/* ─── Deadline helper ──────────────────────────────── */
const getDeadlineState = (deadline) => {
  if (!deadline || /rolling|ongoing|not specified/i.test(deadline))
    return { urgent: false, label: deadline || "Deadline not listed" };
  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return { urgent: false, label: deadline };
  const now = new Date();
  const daysLeft = Math.ceil((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0)  return { urgent: true,  label: "Deadline passed" };
  if (daysLeft === 0) return { urgent: true,  label: "Closes today" };
  if (daysLeft <= 7)  return { urgent: true,  label: `${daysLeft}d left` };
  return { urgent: false, label: parsed.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) };
};

const normalizeProfileText = (v) => !v ? "" : String(v).replace(/\s+/g," ").trim();

/* ─── Typography helpers ───────────────────────────── */
const LABEL_STYLE = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
  textTransform: "uppercase", color: "#1B1B1B",
  display: "block", marginBottom: 8,
};

const GROUP_LABEL_STYLE = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.16em",
  textTransform: "uppercase", color: "#1B1B1B",
  opacity: 0.8, marginBottom: 14,
};

/* ─── Shared select/input style ────────────────────── */
const SELECT_STYLE = {
  width: "100%", borderRadius: 10,
  border: "1px solid #ECE6DD", background: "#FFFFFF",
  color: "#1B1B1B", fontSize: 14,
  padding: "9px 12px", outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  appearance: "none",
  cursor: "pointer",
};

/* ─── Main component ───────────────────────────────── */
export default function OpportunityFinder({ currentUser }) {
  const inferredYear = useMemo(() => {
    const text = `${currentUser?.year||""} ${currentUser?.yearMajor||""} ${currentUser?.batch||""}`;
    const match = text.match(/[1-4](?:st|nd|rd|th)?\s*year/i);
    return match ? match[0].replace(/\s+/g," ") : "3rd Year";
  }, [currentUser]);

  /* ── Form state ─── */
  const [form, setForm] = useState({
    course:   currentUser?.course   || "B.Tech",
    branch:   currentUser?.branch   || currentUser?.major || "CSE",
    year:     inferredYear,
    location: currentUser?.city     || currentUser?.location || "India",
    types:    ["Internship","Hackathon"],
  });

  /* ── Skill tags ─── */
  const [skillTags,  setSkillTags]  = useState(
    Array.isArray(currentUser?.skills) ? currentUser.skills.filter(Boolean) : []
  );
  const [skillInput, setSkillInput] = useState("");
  const skillInputRef = useRef(null);

  /* ── Results ─── */
  const [opportunities, setOpportunities] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [error,    setError]    = useState("");
  const [cached,   setCached]   = useState(false);

  /* ── Handlers ─── */
  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleType = (type) => {
    setForm(prev => {
      const exists   = prev.types.includes(type);
      const nextTypes = exists
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      return { ...prev, types: nextTypes.length ? nextTypes : [type] };
    });
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const val = skillInput.trim().replace(/,+$/, "");
      if (val && !skillTags.includes(val)) setSkillTags(prev => [...prev, val]);
      setSkillInput("");
    } else if (e.key === "Backspace" && !skillInput && skillTags.length > 0) {
      setSkillTags(prev => prev.slice(0, -1));
    }
  };

  const removeSkillTag = (tag) => setSkillTags(prev => prev.filter(t => t !== tag));

  const handleReset = () => {
    setForm({ course:"B.Tech", branch:"CSE", year:"3rd Year", location:"India", types:["Internship","Hackathon"] });
    setSkillTags([]);
    setSkillInput("");
    setOpportunities([]);
    setSearched(false);
    setError("");
    setCached(false);
  };

  const findOpportunities = async ({ refresh = false } = {}) => {
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await fetch("/api/find-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            course:   normalizeProfileText(form.course),
            branch:   normalizeProfileText(form.branch),
            year:     normalizeProfileText(form.year),
            type:     form.types,
            location: normalizeProfileText(form.location),
            skills:   skillTags.join(", "),
          },
          refresh,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not find opportunities right now.");
      setOpportunities(Array.isArray(data.opportunities) ? data.opportunities : []);
      setCached(Boolean(data.cached));
    } catch (err) {
      setOpportunities([]);
      setCached(false);
      setError(err.message || "Something went wrong while finding opportunities.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ─── */
  return (
    <section className="w-full">
      {/* Outer panel — no overflow:hidden so sticky sidebar works */}
      <div
        className="w-full rounded-[24px] border-4 mb-10"
        style={{
          background: "#F4F1EB",
          borderColor: "#1B1B1B",
          boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
        }}
      >
        {/* ── Panel header ─────────────────────────── */}
        <div
          className="flex items-center justify-between px-8 py-7"
          style={{ background: "#F4F1EB", borderRadius: "24px 24px 0 0" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "rgba(47,58,69,0.08)", color: "#2F3A45", width: 44, height: 44 }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6F6F6F" }}>
                Opportunity Finder
              </p>
              <h2 className="mt-0.5 text-2xl font-bold leading-snug" style={{ color: "#1B1B1B" }}>
                Find what fits your semester.
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => findOpportunities({ refresh: true })}
            disabled={loading || !searched}
            className="flex items-center gap-2 rounded-full border-[1.5px] transition disabled:cursor-not-allowed"
            style={{
              borderColor: "#C0B8AD", background: "#FFFFFF", color: "#000000",
              fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "9px 18px",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#1B1B1B"; e.currentTarget.style.background="#F4F1EB"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#C0B8AD"; e.currentTarget.style.background="#FFFFFF"; }}
          >
            <RefreshCw size={13} className={clsx(loading && "animate-spin")} />
            Refresh Results
          </button>
        </div>

        {/* ── 4 + 8 Grid ───────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", minHeight: 600 }}>

          {/* ══ LEFT: Sticky Filter Sidebar ══ */}
          <div
            style={{
              background: "#F4F1EB",
              borderRadius: "0 0 0 24px",
              position: "sticky",
              top: 148,
              height: "fit-content",
              maxHeight: "calc(100vh - 168px)",
              overflowY: "auto",
              scrollbarWidth: "none",
            }}
          >
            <form onSubmit={(e) => { e.preventDefault(); findOpportunities(); }}>

              {/* Sidebar top row: title + Reset */}
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "28px 28px 0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <SlidersHorizontal size={13} style={{ color: "#2F3A45" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2F3A45" }}>
                    Student Profile
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 transition"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#D6A12C", fontSize: 12, fontWeight: 600 }}
                  onMouseEnter={e => e.currentTarget.style.color="#C28F18"}
                  onMouseLeave={e => e.currentTarget.style.color="#D6A12C"}
                >
                  <RotateCcw size={11} />
                  Reset Filters
                </button>
              </div>

              {/* All filter groups */}
              <div style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 28 }}>

                {/* ── Group 1: Student Details ── */}
                <div>
                  <div style={GROUP_LABEL_STYLE}>Student Details</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                    {/* Course */}
                    <div>
                      <span style={LABEL_STYLE}>Course</span>
                      <select
                        value={form.course}
                        onChange={e => updateField("course", e.target.value)}
                        style={SELECT_STYLE}
                        onFocus={e => { e.target.style.borderColor="#D6A12C"; e.target.style.boxShadow="0 0 0 3px rgba(214,161,44,0.12)"; }}
                        onBlur={e  => { e.target.style.borderColor="#ECE6DD"; e.target.style.boxShadow="none"; }}
                      >
                        {COURSES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Branch */}
                    <div>
                      <span style={LABEL_STYLE}>Branch / Stream</span>
                      <select
                        value={form.branch}
                        onChange={e => updateField("branch", e.target.value)}
                        style={SELECT_STYLE}
                        onFocus={e => { e.target.style.borderColor="#D6A12C"; e.target.style.boxShadow="0 0 0 3px rgba(214,161,44,0.12)"; }}
                        onBlur={e  => { e.target.style.borderColor="#ECE6DD"; e.target.style.boxShadow="none"; }}
                      >
                        {BRANCHES.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>

                    {/* Year + Location row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <span style={LABEL_STYLE}>Year</span>
                        <select
                          value={form.year}
                          onChange={e => updateField("year", e.target.value)}
                          style={SELECT_STYLE}
                          onFocus={e => { e.target.style.borderColor="#D6A12C"; e.target.style.boxShadow="0 0 0 3px rgba(214,161,44,0.12)"; }}
                          onBlur={e  => { e.target.style.borderColor="#ECE6DD"; e.target.style.boxShadow="none"; }}
                        >
                          {YEARS.map(y => <option key={y}>{y}</option>)}
                        </select>
                      </div>
                      <div>
                        <span style={LABEL_STYLE}>Location</span>
                        <input
                          value={form.location}
                          onChange={e => updateField("location", e.target.value)}
                          placeholder="India, Remote…"
                          style={SELECT_STYLE}
                          onFocus={e => { e.target.style.borderColor="#D6A12C"; e.target.style.boxShadow="0 0 0 3px rgba(214,161,44,0.12)"; }}
                          onBlur={e  => { e.target.style.borderColor="#ECE6DD"; e.target.style.boxShadow="none"; }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Group 2: Skills Tag Input ── */}
                <div>
                  <div style={GROUP_LABEL_STYLE}>Skills</div>
                  <div
                    onClick={() => skillInputRef.current?.focus()}
                    style={{
                      minHeight: 52,
                      border: "1px solid #ECE6DD",
                      borderRadius: 12,
                      background: "#FFFFFF",
                      padding: "8px 10px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      cursor: "text",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocusCapture={e => { e.currentTarget.style.borderColor="#D6A12C"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(214,161,44,0.12)"; }}
                    onBlurCapture={e  => { e.currentTarget.style.borderColor="#ECE6DD"; e.currentTarget.style.boxShadow="none"; }}
                  >
                    {skillTags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "rgba(47,58,69,0.08)", color: "#2F3A45",
                          borderRadius: 6, padding: "4px 8px",
                          fontSize: 12, fontWeight: 600,
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeSkillTag(tag); }}
                          style={{ background:"none", border:"none", cursor:"pointer", color:"#2F3A45", padding:0, lineHeight:1, display:"flex" }}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                    <input
                      ref={skillInputRef}
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder={skillTags.length === 0 ? "React, Express, etc... Enter to add" : "Add more..."}
                      className="!bg-transparent !outline-none !shadow-none !border-none"
                      style={{
                        fontSize: 14, color: "#1B1B1B", flex: 1, minWidth: 80,
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: "#1B1B1B", opacity: 0.7, marginTop: 5 }}>
                    Press Enter or comma to add a tag
                  </p>
                </div>

                {/* ── Group 3: Opportunity Types ── */}
                <div>
                  <div style={GROUP_LABEL_STYLE}>Opportunity Types</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {TYPES.map((type) => {
                      const active = form.types.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleType(type)}
                          style={{
                            borderRadius: 999,
                            border: "1px solid",
                            padding: "7px 15px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.18s ease",
                            ...(active
                              ? {
                                  background: "linear-gradient(135deg,#D6A12C,#C28F18)",
                                  borderColor: "transparent",
                                  color: "#FFFFFF",
                                  boxShadow: "0 2px 10px rgba(214,161,44,0.4)",
                                }
                              : {
                                  background: "#FFFFFF",
                                  borderColor: "#ECE6DD",
                                  color: "#6F6F6F",
                                }),
                          }}
                          onMouseEnter={e => {
                            if (!active) {
                              e.currentTarget.style.borderColor = "#2F3A45";
                              e.currentTarget.style.color       = "#2F3A45";
                              e.currentTarget.style.transform   = "scale(1.03)";
                            } else {
                              e.currentTarget.style.transform = "scale(1.04)";
                              e.currentTarget.style.boxShadow = "0 4px 16px rgba(214,161,44,0.5)";
                            }
                          }}
                          onMouseLeave={e => {
                            if (!active) {
                              e.currentTarget.style.borderColor = "#ECE6DD";
                              e.currentTarget.style.color       = "#6F6F6F";
                            } else {
                              e.currentTarget.style.boxShadow = "0 2px 10px rgba(214,161,44,0.4)";
                            }
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Search CTA ── */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", height: 56, borderRadius: 16,
                    background: "linear-gradient(135deg,#D6A12C,#C28F18)",
                    color: "#FFFFFF",
                    fontSize: 13, fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    border: "none", cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    boxShadow: "0 4px 20px rgba(214,161,44,0.35)",
                    transition: "all 0.2s ease",
                    opacity: loading ? 0.65 : 1,
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.transform   = "translateY(-2px)";
                      e.currentTarget.style.boxShadow   = "0 10px 30px rgba(214,161,44,0.5)";
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(214,161,44,0.35)";
                  }}
                >
                  {loading
                    ? <Loader size={17} className="animate-spin" />
                    : <Search size={17} />
                  }
                  {loading ? "Searching…" : "Find Opportunities"}
                </button>

              </div>
            </form>
          </div>

          {/* ══ RIGHT: Results ══ */}
          <div style={{ padding: "32px 32px 32px", background: "#FFFFFF", borderRadius: "24px 0 24px 0" }}>
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <EmptyState title="Search needs a little setup" description={error} />
            ) : opportunities.length > 0 ? (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-sm font-medium" style={{ color: "#6F6F6F" }}>
                    {opportunities.length} result{opportunities.length === 1 ? "" : "s"} found
                    {cached ? " · from cache" : ""}
                  </p>
                  {cached && (
                    <span
                      className="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.1em]"
                      style={{ borderColor: "rgba(58,166,117,0.2)", background: "rgba(58,166,117,0.08)", color: "#3AA675" }}
                    >
                      Cached
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {opportunities.map((opp, i) => (
                    <OpportunityCard
                      key={`${opp.title}-${opp.organization}-${i}`}
                      opportunity={opp}
                      matchScore={getMatchScore(opp, i, opportunities.length, form.types)}
                    />
                  ))}
                </div>
              </div>
            ) : searched ? (
              <EmptyState
                title="No results found"
                description="Try adjusting filters, widening your location, or selecting another opportunity type."
              />
            ) : (
              <EmptyState
                title="Ready when you are"
                description="Set your course, branch, year, and opportunity types — then hit Find Opportunities."
              />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Loading Skeleton ─────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {[0,1,2,3].map(i => (
        <div key={i} style={{ borderRadius:18, border:"1.5px solid #ECE6DD", background:"#FFFFFF", padding:20 }}>
          {/* Logo + bookmark row */}
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:"#ECE6DD" }} className="animate-pulse" />
            <div style={{ width:36, height:36, borderRadius:10, background:"#ECE6DD" }} className="animate-pulse" />
          </div>
          <div className="mb-2 h-5 w-4/5 animate-pulse rounded-lg"  style={{ background:"#ECE6DD" }} />
          <div className="mb-4 h-4 w-1/2 animate-pulse rounded"     style={{ background:"#ECE6DD" }} />
          <div className="mb-4 h-3 w-1/3 animate-pulse rounded-full" style={{ background:"#ECE6DD" }} />
          <div className="mb-4 flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-md" style={{ background:"#ECE6DD" }} />
            <div className="h-6 w-14 animate-pulse rounded-md" style={{ background:"#ECE6DD" }} />
          </div>
          {/* Score bar */}
          <div className="mb-5 h-2 w-full animate-pulse rounded-full" style={{ background:"#ECE6DD" }} />
          <div className="h-12 w-full animate-pulse" style={{ borderRadius:14, background:"#ECE6DD" }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Opportunity Card ─────────────────────────────── */
function OpportunityCard({ opportunity, matchScore = 85 }) {
  const [bookmarked, setBookmarked] = useState(false);
  const deadline   = getDeadlineState(opportunity.deadline);
  const typeStyle  = TYPE_STYLES[opportunity.type] || TYPE_STYLES.Other;
  const logoGrad   = getLogoGradient(opportunity.organization || "");
  const initials   = getOrgInitials(opportunity.organization);
  const tags       = (opportunity.eligibleBranches || []).slice(0, 3).filter(Boolean);
  const scoreColor = matchScore >= 88 ? "#3AA675" : matchScore >= 75 ? "#D6A12C" : "#6F6F6F";
  const scoreGrad  = matchScore >= 88
    ? "linear-gradient(90deg,#3AA675,#2D8F61)"
    : matchScore >= 75
      ? "linear-gradient(90deg,#D6A12C,#C28F18)"
      : "linear-gradient(90deg,#9E9E9E,#757575)";

  return (
    <article
      style={{
        padding: 20,
        borderRadius: 18,
        border: "1.5px solid #ECE6DD",
        background: "#FFFFFF",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform   = "translateY(-6px)";
        e.currentTarget.style.boxShadow   = "0 18px 52px rgba(0,0,0,0.11)";
        e.currentTarget.style.borderColor = "#D6A12C";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = "translateY(0)";
        e.currentTarget.style.boxShadow   = "0 2px 12px rgba(0,0,0,0.04)";
        e.currentTarget.style.borderColor = "#ECE6DD";
      }}
    >
      {/* ── Row 1: Logo + Bookmark ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        {/* Org logo avatar */}
        <div
          style={{
            width:52, height:52, borderRadius:14, flexShrink:0,
            background: logoGrad,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, fontWeight:800, color:"#FFFFFF", letterSpacing:"-0.02em",
            boxShadow:"0 4px 14px rgba(0,0,0,0.14)",
          }}
        >
          {initials}
        </div>

        {/* Bookmark toggle */}
        <button
          type="button"
          onClick={() => setBookmarked(p => !p)}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          style={{
            width:36, height:36, borderRadius:10, flexShrink:0,
            border:"1.5px solid",
            borderColor: bookmarked ? "#D6A12C" : "#ECE6DD",
            background:  bookmarked ? "rgba(214,161,44,0.1)" : "transparent",
            color:       bookmarked ? "#D6A12C" : "#6F6F6F",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer",
            transition:"all 0.18s ease",
          }}
          onMouseEnter={e => {
            if (!bookmarked) {
              e.currentTarget.style.borderColor = "#D6A12C";
              e.currentTarget.style.color       = "#D6A12C";
              e.currentTarget.style.background  = "rgba(214,161,44,0.07)";
            } else {
              e.currentTarget.style.transform = "scale(1.1)";
            }
          }}
          onMouseLeave={e => {
            if (!bookmarked) {
              e.currentTarget.style.borderColor = "#ECE6DD";
              e.currentTarget.style.color       = "#6F6F6F";
              e.currentTarget.style.background  = "transparent";
            }
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      {/* ── Opportunity name ── */}
      <h3 style={{ fontSize:17, fontWeight:600, lineHeight:1.35, color:"#1B1B1B", marginBottom:4 }}>
        {opportunity.title}
      </h3>

      {/* ── Company + Location ── */}
      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:12 }}>
        <span style={{ fontSize:13, fontWeight:600, color:"#2F3A45" }}>
          {opportunity.organization || "Organization"}
        </span>
        {opportunity.location && (
          <>
            <span style={{ color:"#D4CEC5", fontSize:13 }}>·</span>
            <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:13, color:"#6F6F6F" }}>
              <MapPin size={11} style={{ flexShrink:0 }} />
              {opportunity.location}
            </span>
          </>
        )}
      </div>

      {/* ── Deadline ── */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
        <CalendarClock size={13} style={{ color: deadline.urgent ? "#DC2626" : "#6F6F6F", flexShrink:0 }} />
        <span
          style={{
            fontSize:12, fontWeight:600,
            color:       deadline.urgent ? "#DC2626" : "#6F6F6F",
            background:  deadline.urgent ? "rgba(220,38,38,0.07)" : "#F4F1EB",
            borderRadius:6, padding:"3px 9px",
          }}
        >
          {deadline.label}
        </span>
      </div>

      {/* ── Tags ── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
        {/* Type tag */}
        <span
          style={{
            fontSize:10, fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase",
            color:typeStyle.color, background:typeStyle.bg,
            border:`1px solid ${typeStyle.border}`,
            borderRadius:6, padding:"4px 9px",
          }}
        >
          {opportunity.type || "Other"}
        </span>
        {/* Branch/skill tags */}
        {tags.map(tag => (
          <span
            key={tag}
            style={{
              fontSize:11, fontWeight:600,
              color:"#2F3A45", background:"rgba(47,58,69,0.07)",
              borderRadius:6, padding:"4px 9px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* ── Match Score ── */}
      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#6F6F6F" }}>
            Match Score
          </span>
          <span style={{ fontSize:13, fontWeight:700, color:scoreColor }}>
            {matchScore}%
          </span>
        </div>
        <div style={{ height:5, background:"#ECE6DD", borderRadius:999, overflow:"hidden" }}>
          <div
            style={{
              height:"100%", width:`${matchScore}%`,
              background:scoreGrad,
              borderRadius:999,
              transition:"width 0.9s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </div>
      </div>

      {/* Flex spacer */}
      <div style={{ flex:1 }} />

      {/* ── Apply button ── */}
      <a
        href={opportunity.applyLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          height:48, borderRadius:14, textDecoration:"none",
          background:"linear-gradient(135deg,#D6A12C,#C28F18)",
          color:"#FFFFFF",
          fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
          boxShadow:"0 2px 10px rgba(214,161,44,0.28)",
          transition:"all 0.18s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(214,161,44,0.48)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(214,161,44,0.28)";
        }}
      >
        Apply Now
        <ExternalLink size={14} />
      </a>
    </article>
  );
}

/* ─── Empty State ──────────────────────────────────── */
function EmptyState({ title, description }) {
  return (
    <div
      className="flex min-h-[420px] flex-col items-center justify-center rounded-[24px] border p-10 text-center"
      style={{ borderColor:"#ECE6DD", background:"#FCFAF7" }}
    >
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background:"#FFF1E0", color:"#F97316" }}
      >
        <Trophy size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-bold leading-snug" style={{ color:"#1B1B1B" }}>{title}</h3>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed font-medium" style={{ color:"#6F6F6F" }}>{description}</p>
      <div
        className="mt-7 flex items-center gap-2 rounded-full px-6 py-2.5 transition-transform hover:-translate-y-0.5"
        style={{ fontSize:12, fontWeight:700, letterSpacing:"0.05em",
          background:"#FFC96B", color:"#1B1B1B" }}
      >
        <Briefcase size={15} strokeWidth={2.5} />
        Internships · Hackathons · Scholarships
      </div>
    </div>
  );
}

