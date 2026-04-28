"use client";
import { Compass, Search } from "lucide-react";

export default function ExplorePage() {
  const trending = [
    { tag: "#ExamSzn", posts: "2.4k posts", university: "All Universities" },
    { tag: "#CampusCrush", posts: "1.8k posts", university: "DU" },
    { tag: "#HostelLife", posts: "3.1k posts", university: "All Universities" },
    { tag: "#PlacementPrep", posts: "987 posts", university: "IIT Delhi" },
    { tag: "#FoodReview", posts: "654 posts", university: "Amity" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex items-center space-x-3">
        <Compass className="text-primary" size={22} />
        <h1 className="text-xl font-bold text-foreground">Explore</h1>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search students, posts, colleges..."
            className="w-full bg-surface-hover border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Trending Tags */}
        <div>
          <h2 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">Trending on Campus</h2>
          <div className="space-y-2">
            {trending.map((item, i) => (
              <div key={i} className="glass-panel p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors">
                <div>
                  <p className="font-bold text-foreground">{item.tag}</p>
                  <p className="text-xs text-muted">{item.university} • {item.posts}</p>
                </div>
                <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
