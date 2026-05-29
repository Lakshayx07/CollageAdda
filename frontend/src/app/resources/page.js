"use client";
import { BookOpen, Download, FileText, Filter, Search, TrendingUp } from "lucide-react";

export default function ResourcesPage() {
  const resources = [
    { title: "Data Structures PYQ 2024", subject: "CS301", university: "DU", type: "PYQ", downloads: 342 },
    { title: "Organic Chemistry Notes", subject: "CHEM201", university: "Amity", type: "Notes", downloads: 189 },
    { title: "Engineering Maths Solved", subject: "MATH101", university: "DTU", type: "PYQ", downloads: 567 },
    { title: "Microeconomics Summary", subject: "ECON202", university: "JNU", type: "Notes", downloads: 234 },
    { title: "OS Lab Manual", subject: "CS402", university: "IIT Delhi", type: "Manual", downloads: 421 },
  ];

  return (
    <div className="page-shell flex flex-col">
      <header className="page-header sticky top-0 z-40 px-5 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="icon-tile h-11 w-11">
              <BookOpen size={21} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground">Smart Vault</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">Notes and PYQs</p>
            </div>
          </div>
          <button className="hidden h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-bold text-white/70 transition hover:border-primary/40 hover:text-white sm:flex">
            <Filter size={15} />
            Filter
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-5 sm:py-8">
        <section className="app-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-muted">
                <TrendingUp size={14} className="text-primary" />
                Top campus downloads
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Find study material faster.</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search notes, PYQs, manuals..."
                className="input-surface h-[3.25rem] w-full rounded-2xl py-4 pl-12 pr-4 text-sm placeholder:text-white/25"
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3">
          {resources.map((res, i) => (
            <div key={i} className="app-panel flex items-center justify-between gap-4 rounded-[1.35rem] p-4 transition hover:border-primary/30">
              <div className="flex min-w-0 items-center gap-3">
                <div className="icon-tile h-11 w-11 shrink-0">
                  <FileText className="text-primary" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{res.title}</p>
                  <p className="mt-1 text-xs text-muted">{res.subject} • {res.university}</p>
                  <span className="mt-2 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent">{res.type}</span>
                </div>
              </div>
              <button className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-muted transition hover:border-primary/40 hover:text-primary">
                <Download size={18} />
                <span className="text-[10px]">{res.downloads}</span>
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
