"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";
import {
  Briefcase,
  CalendarClock,
  ExternalLink,
  GraduationCap,
  Loader,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
} from "lucide-react";

const COURSES = ["B.Tech", "B.E", "BCA", "MCA", "MBA", "BSc", "Diploma", "B.Com", "BA", "M.Tech", "Other"];
const BRANCHES = ["CSE", "IT", "ECE", "Mechanical", "Civil", "AI/ML", "Data Science", "Business", "Finance", "Marketing", "Design", "Biotech", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "Graduate"];
const TYPES = ["Internship", "Hackathon", "Workshop", "Scholarship", "Competition"];

const TYPE_STYLES = {
  Internship: { color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.2)" },
  Hackathon:  { color: "#2563EB", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.2)" },
  Workshop:   { color: "#D6A12C", bg: "rgba(214,161,44,0.08)", border: "rgba(214,161,44,0.25)" },
  Scholarship:{ color: "#D97706", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.2)" },
  Competition:{ color: "#D6A12C", bg: "rgba(214,161,44,0.08)", border: "rgba(214,161,44,0.3)" },
  Other:      { color: "#6F6F6F", bg: "#F4F1EB", border: "#ECE6DD" },
};

const getDeadlineState = (deadline) => {
  if (!deadline || /rolling|ongoing|not specified/i.test(deadline))
    return { urgent: false, label: deadline || "Deadline not listed" };

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return { urgent: false, label: deadline };

  const now = new Date();
  const daysLeft = Math.ceil((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { urgent: true, label: "Deadline passed" };
  if (daysLeft === 0) return { urgent: true, label: "Closes today" };
  if (daysLeft <= 7) return { urgent: true, label: `${daysLeft}d left` };

  return {
    urgent: false,
    label: parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
  };
};

const normalizeProfileText = (value) => {
  if (!value) return "";
  return String(value).replace(/\s+/g, " ").trim();
};

/* ─── Shared input style ─────────────────────────── */
const inputStyle = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid #ECE6DD",
  background: "#F4F1EB",
  color: "#1B1B1B",
  fontSize: 14,
  padding: "10px 14px",
  outline: "none",
  transition: "border-color 0.15s",
};

function FieldLabel({ children }) {
  return (
    <span
      className="block text-[10px] font-black uppercase tracking-widest mb-2"
      style={{ color: "#6F6F6F" }}
    >
      {children}
    </span>
  );
}

export default function OpportunityFinder({ currentUser }) {
  const inferredYear = useMemo(() => {
    const text = `${currentUser?.year || ""} ${currentUser?.yearMajor || ""} ${currentUser?.batch || ""}`;
    const match = text.match(/[1-4](?:st|nd|rd|th)?\s*year/i);
    return match ? match[0].replace(/\s+/g, " ") : "3rd Year";
  }, [currentUser]);

  const [form, setForm] = useState({
    course: currentUser?.course || "B.Tech",
    branch: currentUser?.branch || currentUser?.major || "CSE",
    year: inferredYear,
    location: currentUser?.city || currentUser?.location || "India",
    skills: Array.isArray(currentUser?.skills) ? currentUser.skills.join(", ") : "",
    types: ["Internship", "Hackathon"],
  });
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [cached, setCached] = useState(false);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleType = (type) => {
    setForm((prev) => {
      const exists = prev.types.includes(type);
      const nextTypes = exists ? prev.types.filter((item) => item !== type) : [...prev.types, type];
      return { ...prev, types: nextTypes.length ? nextTypes : [type] };
    });
  };

  const findOpportunities = async ({ refresh = false } = {}) => {
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await fetch("/api/find-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            course: normalizeProfileText(form.course),
            branch: normalizeProfileText(form.branch),
            year: normalizeProfileText(form.year),
            type: form.types,
            location: normalizeProfileText(form.location),
            skills: normalizeProfileText(form.skills),
          },
          refresh,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not find opportunities right now.");

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

  return (
    <section className="w-full">
      {/* ── Outer container ─── */}
      <div
        className="w-full rounded-[24px] border"
        style={{
          background: "#FFFFFF",
          borderColor: "#ECE6DD",
          boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* ── Panel header ─── */}
        <div
          className="flex items-center justify-between border-b px-8 py-6"
          style={{ borderColor: "#ECE6DD", background: "#F4F1EB" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "rgba(47,58,69,0.08)", color: "#2F3A45" }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.22em]"
                style={{ color: "#6F6F6F" }}
              >
                Opportunity Finder
              </p>
              <h2
                className="mt-0.5 text-xl font-black tracking-tight"
                style={{ color: "#1B1B1B" }}
              >
                Find what fits your semester.
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => findOpportunities({ refresh: true })}
            disabled={loading || !searched}
            className="flex items-center gap-2 rounded-full border text-[11px] font-black uppercase tracking-widest transition hover:border-[#2F3A45]/40 hover:text-[#2F3A45] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              borderColor: "#ECE6DD",
              background: "#FFFFFF",
              color: "#6F6F6F",
              padding: "8px 18px",
            }}
          >
            <RefreshCw size={14} className={clsx(loading && "animate-spin")} />
            Refresh Results
          </button>
        </div>

        {/* ── 4 + 8 grid body ─── */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 2fr",
            gap: 0,
            minHeight: 520,
          }}
        >
          {/* ══ LEFT: Student Filters (4 cols) ══ */}
          <div
            className="border-r flex flex-col"
            style={{ borderColor: "#ECE6DD", padding: "32px 32px 32px" }}
          >
            {/* Filter header */}
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal size={14} style={{ color: "#2F3A45" }} />
              <span
                className="text-[10px] font-black uppercase tracking-[0.2em]"
                style={{ color: "#6F6F6F" }}
              >
                Student Profile
              </span>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); findOpportunities(); }}
              className="flex flex-col gap-5 flex-1"
            >
              {/* Course */}
              <div>
                <FieldLabel>Course</FieldLabel>
                <select
                  value={form.course}
                  onChange={(e) => updateField("course", e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#D6A12C")}
                  onBlur={e => (e.target.style.borderColor = "#ECE6DD")}
                >
                  {COURSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Branch */}
              <div>
                <FieldLabel>Branch / Stream</FieldLabel>
                <select
                  value={form.branch}
                  onChange={(e) => updateField("branch", e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#D6A12C")}
                  onBlur={e => (e.target.style.borderColor = "#ECE6DD")}
                >
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>

              {/* Year + Location row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Year</FieldLabel>
                  <select
                    value={form.year}
                    onChange={(e) => updateField("year", e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#D6A12C")}
                    onBlur={e => (e.target.style.borderColor = "#ECE6DD")}
                  >
                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <input
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="India, Remote…"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#D6A12C")}
                    onBlur={e => (e.target.style.borderColor = "#ECE6DD")}
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <FieldLabel>Skills</FieldLabel>
                <input
                  value={form.skills}
                  onChange={(e) => updateField("skills", e.target.value)}
                  placeholder="Python, React, ML, finance…"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#D6A12C")}
                  onBlur={e => (e.target.style.borderColor = "#ECE6DD")}
                />
              </div>

              {/* Opportunity Type */}
              <div>
                <FieldLabel>Opportunity Type</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map((type) => {
                    const active = form.types.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        className="rounded-xl border px-3 py-2 text-left text-[11px] font-black uppercase tracking-wider transition active:scale-95"
                        style={
                          active
                            ? {
                                borderColor: "#2F3A45",
                                background: "rgba(47,58,69,0.08)",
                                color: "#2F3A45",
                              }
                            : {
                                borderColor: "#ECE6DD",
                                background: "#F4F1EB",
                                color: "#6F6F6F",
                              }
                        }
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTA — pinned to bottom */}
              <div className="mt-auto pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg,#D6A12C,#C28F18)",
                    boxShadow: "0 4px 20px rgba(214,161,44,0.32)",
                  }}
                >
                  {loading ? <Loader size={15} className="animate-spin" /> : <Search size={15} />}
                  {loading ? "Searching…" : "Find Opportunities"}
                </button>
              </div>
            </form>
          </div>

          {/* ══ RIGHT: Opportunity Results (8 cols) ══ */}
          <div style={{ padding: "32px 32px 32px" }}>
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <EmptyState title="Search needs a little setup" description={error} />
            ) : opportunities.length > 0 ? (
              <div>
                {/* Result count */}
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-xs font-bold" style={{ color: "#6F6F6F" }}>
                    {opportunities.length} result{opportunities.length === 1 ? "" : "s"} found
                    {cached ? " · from cache" : ""}
                  </p>
                  {cached && (
                    <span
                      className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                      style={{ borderColor: "rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.08)", color: "#059669" }}
                    >
                      Cached
                    </span>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {opportunities.map((opp, i) => (
                    <OpportunityCard key={`${opp.title}-${opp.organization}-${i}`} opportunity={opp} />
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

/* ─── Skeleton ────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-[20px] border p-5"
          style={{ borderColor: "#ECE6DD", background: "#F4F1EB" }}
        >
          <div className="mb-4 h-5 w-20 animate-pulse rounded-full" style={{ background: "#ECE6DD" }} />
          <div className="mb-3 h-5 w-4/5 animate-pulse rounded-lg" style={{ background: "#ECE6DD" }} />
          <div className="mb-2 h-3 w-2/3 animate-pulse rounded" style={{ background: "#ECE6DD" }} />
          <div className="mb-5 h-12 w-full animate-pulse rounded-xl" style={{ background: "#ECE6DD" }} />
          <div className="h-10 w-full animate-pulse rounded-2xl" style={{ background: "#ECE6DD" }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Opportunity Card ────────────────────────────── */
function OpportunityCard({ opportunity }) {
  const deadline = getDeadlineState(opportunity.deadline);
  const typeStyle = TYPE_STYLES[opportunity.type] || TYPE_STYLES.Other;

  return (
    <article
      className="group flex h-full flex-col rounded-[20px] border transition"
      style={{
        borderColor: "#ECE6DD",
        background: "#FFFFFF",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        padding: "20px",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "rgba(47,58,69,0.3)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
        e.currentTarget.style.borderColor = "#ECE6DD";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Type + Deadline badges */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border"
          style={{
            color: typeStyle.color,
            background: typeStyle.bg,
            borderColor: typeStyle.border,
          }}
        >
          {opportunity.type || "Other"}
        </span>
        <span
          className="flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold"
          style={
            deadline.urgent
              ? { borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#DC2626" }
              : { borderColor: "#ECE6DD", background: "#F4F1EB", color: "#6F6F6F" }
          }
        >
          <CalendarClock size={11} />
          {deadline.label}
        </span>
      </div>

      {/* Title + org */}
      <h3 className="text-base font-black leading-snug" style={{ color: "#1B1B1B" }}>
        {opportunity.title}
      </h3>
      <p className="mt-1 text-xs font-semibold" style={{ color: "#6F6F6F" }}>
        {opportunity.organization || "Organization not listed"}
      </p>

      {/* Description */}
      <p
        className="mt-3 flex-1 text-sm leading-relaxed line-clamp-3"
        style={{ color: "#6F6F6F" }}
      >
        {opportunity.description}
      </p>

      {/* Meta pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-semibold"
          style={{ borderColor: "#ECE6DD", background: "#F4F1EB", color: "#6F6F6F" }}
        >
          <MapPin size={11} />
          {opportunity.location || "Remote / India"}
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-semibold"
          style={{ borderColor: "#ECE6DD", background: "#F4F1EB", color: "#6F6F6F" }}
        >
          <GraduationCap size={11} />
          {(opportunity.eligibleBranches || []).slice(0, 2).join(", ") || "All branches"}
        </span>
      </div>

      {/* Apply CTA */}
      <a
        href={opportunity.applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-2xl text-xs font-black uppercase tracking-widest transition hover:scale-[1.02] active:scale-95"
        style={{
          background: "linear-gradient(135deg,#D6A12C,#C28F18)",
          color: "#FFFFFF",
          boxShadow: "0 2px 10px rgba(214,161,44,0.25)",
        }}
      >
        Apply Now
        <ExternalLink size={13} />
      </a>
    </article>
  );
}

/* ─── Empty State ─────────────────────────────────── */
function EmptyState({ title, description }) {
  return (
    <div
      className="flex min-h-[420px] flex-col items-center justify-center rounded-[20px] border border-dashed p-10 text-center"
      style={{ borderColor: "#ECE6DD", background: "#F4F1EB" }}
    >
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "rgba(47,58,69,0.08)", color: "#2F3A45" }}
      >
        <Trophy size={28} />
      </div>
      <h3 className="text-xl font-black tracking-tight" style={{ color: "#1B1B1B" }}>
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "#6F6F6F" }}>
        {description}
      </p>
      <div
        className="mt-6 flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest"
        style={{ borderColor: "#ECE6DD", background: "#FFFFFF", color: "#6F6F6F" }}
      >
        <Briefcase size={13} />
        Internships · Hackathons · Scholarships
      </div>
    </div>
  );
}
