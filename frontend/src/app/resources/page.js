"use client";
import { BookOpen, FileText, Download, Search } from "lucide-react";

export default function ResourcesPage() {
  const resources = [
    { title: "Data Structures PYQ 2024", subject: "CS301", university: "DU", type: "PYQ", downloads: 342 },
    { title: "Organic Chemistry Notes", subject: "CHEM201", university: "Amity", type: "Notes", downloads: 189 },
    { title: "Engineering Maths Solved", subject: "MATH101", university: "DTU", type: "PYQ", downloads: 567 },
    { title: "Microeconomics Summary", subject: "ECON202", university: "JNU", type: "Notes", downloads: 234 },
    { title: "OS Lab Manual", subject: "CS402", university: "IIT Delhi", type: "Manual", downloads: 421 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex items-center space-x-3">
        <BookOpen className="text-primary" size={22} />
        <h1 className="text-xl font-bold text-foreground">Smart Vault</h1>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search notes, PYQs, manuals..."
            className="w-full bg-surface-hover border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Resource Cards */}
        <div className="space-y-3">
          {resources.map((res, i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <FileText className="text-primary" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{res.title}</p>
                  <p className="text-xs text-muted">{res.subject} • {res.university}</p>
                  <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">{res.type}</span>
                </div>
              </div>
              <button className="flex flex-col items-center text-muted hover:text-primary transition-colors">
                <Download size={18} />
                <span className="text-[10px]">{res.downloads}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
