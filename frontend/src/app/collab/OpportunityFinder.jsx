"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";
import {
  Briefcase,
  CalendarClock,
  ExternalLink,
  Filter,
  GraduationCap,
  Loader,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";

const COURSES = ["B.Tech", "B.E", "BCA", "MCA", "MBA", "BSc", "Diploma", "B.Com", "BA", "M.Tech", "Other"];
const BRANCHES = ["CSE", "IT", "ECE", "Mechanical", "Civil", "AI/ML", "Data Science", "Business", "Finance", "Marketing", "Design", "Biotech", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "Graduate"];
const TYPES = ["Internship", "Hackathon", "Workshop", "Scholarship", "Competition"];

const TYPE_STYLES = {
  Internship: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  Hackathon: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  Workshop: "text-[#C8922A] bg-[#C8922A]/10 border-[#E8E6E0]",
  Scholarship: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  Competition: "text-[#C8922A] bg-[#C8922A]/10 border-[#C8922A]/30",
  Other: "text-[#6B6B6B] bg-[#F3F2EE] border-[#E8E6E0]",
};

/**
 * @typedef {Object} Opportunity
 * @property {string} title
 * @property {string} organization
 * @property {string} type
 * @property {string[]} eligibleBranches
 * @property {string} location
 * @property {string} deadline
 * @property {string} description
 * @property {string} applyLink
 */

const getDeadlineState = (deadline) => {
  if (!deadline || /rolling|ongoing|not specified/i.test(deadline)) return { urgent: false, label: deadline || "Deadline not listed" };

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return { urgent: false, label: deadline };

  const now = new Date();
  const daysLeft = Math.ceil((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { urgent: true, label: "Deadline passed recently" };
  if (daysLeft === 0) return { urgent: true, label: "Closes today" };
  if (daysLeft <= 7) return { urgent: true, label: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` };

  return {
    urgent: false,
    label: parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
  };
};

const normalizeProfileText = (value) => {
  if (!value) return "";
  return String(value).replace(/\s+/g, " ").trim();
};

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
    <section className="w-full space-y-5">
      <div className="app-panel overflow-hidden rounded-[1.75rem]">
        <div className="border-b border-[#E8E6E0] bg-[#F3F2EE] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Opportunity Finder</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#1A1A1A]">Find what fits your semester.</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => findOpportunities({ refresh: true })}
              disabled={loading || !searched}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#E8E6E0] bg-[#F3F2EE] px-4 text-xs font-black uppercase tracking-widest text-muted transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={15} className={clsx(loading && "animate-spin")} />
              Refresh Results
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              findOpportunities();
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted">
              <Filter size={13} />
              Student Profile
            </div>

            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Course</span>
              <select
                value={form.course}
                onChange={(event) => updateField("course", event.target.value)}
                className="w-full rounded-xl border border-[#E8E6E0] bg-black px-3 py-3 text-sm text-[#1A1A1A] outline-none transition focus:border-primary"
              >
                {COURSES.map((course) => <option key={course}>{course}</option>)}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Branch / Stream</span>
              <select
                value={form.branch}
                onChange={(event) => updateField("branch", event.target.value)}
                className="w-full rounded-xl border border-[#E8E6E0] bg-black px-3 py-3 text-sm text-[#1A1A1A] outline-none transition focus:border-primary"
              >
                {BRANCHES.map((branch) => <option key={branch}>{branch}</option>)}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <label className="block space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Year</span>
                <select
                  value={form.year}
                  onChange={(event) => updateField("year", event.target.value)}
                  className="w-full rounded-xl border border-[#E8E6E0] bg-black px-3 py-3 text-sm text-[#1A1A1A] outline-none transition focus:border-primary"
                >
                  {YEARS.map((year) => <option key={year}>{year}</option>)}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Location</span>
                <input
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="India, Delhi, Remote..."
                  className="w-full rounded-xl border border-[#E8E6E0] bg-black px-3 py-3 text-sm text-[#1A1A1A] outline-none transition focus:border-primary"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Skills</span>
              <input
                value={form.skills}
                onChange={(event) => updateField("skills", event.target.value)}
                placeholder="Python, React, ML, finance..."
                className="w-full rounded-xl border border-[#E8E6E0] bg-black px-3 py-3 text-sm text-[#1A1A1A] outline-none transition focus:border-primary"
              />
            </label>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Opportunity Type</span>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((type) => {
                  const active = form.types.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      className={clsx(
                        "rounded-xl border px-3 py-2 text-left text-[11px] font-black uppercase tracking-wider transition active:scale-95",
                        active
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-[#E8E6E0] bg-[#F3F2EE] text-muted hover:border-[#E8E6E0] hover:text-[#1A1A1A]"
                      )}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-button flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-xs font-black uppercase tracking-widest transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader size={15} className="animate-spin" /> : <Search size={15} />}
              {loading ? "Searching..." : "Find Opportunities"}
            </button>
          </form>

          <div className="min-h-[28rem]">
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="rounded-[1.35rem] border border-[#E8E6E0] bg-[#F3F2EE] p-4">
                    <div className="mb-4 h-4 w-24 animate-pulse rounded-full bg-[#F3F2EE]" />
                    <div className="mb-3 h-5 w-4/5 animate-pulse rounded bg-[#F3F2EE]" />
                    <div className="mb-2 h-3 w-2/3 animate-pulse rounded bg-[#F3F2EE]" />
                    <div className="mb-4 h-12 w-full animate-pulse rounded bg-[#F3F2EE]" />
                    <div className="h-10 w-full animate-pulse rounded-xl bg-[#F3F2EE]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <EmptyState title="Search needs a little setup" description={error} />
            ) : opportunities.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-muted">
                    {opportunities.length} result{opportunities.length === 1 ? "" : "s"} found{cached ? " from cache" : ""}
                  </p>
                  {cached && <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">Cached</span>}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {opportunities.map((opportunity, index) => (
                    <OpportunityCard key={`${opportunity.title}-${opportunity.organization}-${index}`} opportunity={opportunity} />
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
                description="Choose your course, branch, year, and opportunity types to discover current openings."
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function OpportunityCard({ opportunity }) {
  const deadline = getDeadlineState(opportunity.deadline);
  const style = TYPE_STYLES[opportunity.type] || TYPE_STYLES.Other;

  return (
    <article className="group flex h-full flex-col rounded-[1.35rem] border border-[#E8E6E0] bg-[#F3F2EE] p-4 transition hover:border-primary/40">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className={clsx("rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest", style)}>
          {opportunity.type || "Other"}
        </span>
        <span
          className={clsx(
            "flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black",
            deadline.urgent
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-[#E8E6E0] bg-[#F3F2EE] text-[#6B6B6B]"
          )}
        >
          <CalendarClock size={11} />
          {deadline.label}
        </span>
      </div>

      <h3 className="text-base font-black leading-tight text-[#1A1A1A]">{opportunity.title}</h3>
      <p className="mt-1 text-xs font-bold text-muted">{opportunity.organization || "Organization not listed"}</p>

      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[#6B6B6B]">{opportunity.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg border border-[#E8E6E0] bg-[#F3F2EE] px-2 py-1 text-[10px] font-bold text-[#888888]5">
          <MapPin size={11} />
          {opportunity.location || "Remote / India"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-[#E8E6E0] bg-[#F3F2EE] px-2 py-1 text-[10px] font-bold text-[#888888]5">
          <GraduationCap size={11} />
          {(opportunity.eligibleBranches || []).slice(0, 2).join(", ") || "All branches"}
        </span>
      </div>

      <a
        href={opportunity.applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-2xl bg-white text-xs font-black uppercase tracking-widest text-black transition hover:scale-[1.02]"
      >
        Apply Now
        <ExternalLink size={14} />
      </a>
    </article>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-[#E8E6E0] bg-[#F3F2EE] p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Trophy size={28} />
      </div>
      <h3 className="text-xl font-black tracking-tight text-[#1A1A1A]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      <div className="mt-5 flex items-center gap-2 rounded-full border border-[#E8E6E0] bg-[#F3F2EE] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted">
        <Briefcase size={13} />
        Internships · Hackathons · Scholarships
      </div>
    </div>
  );
}
