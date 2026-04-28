"use client";
import { useState } from "react";
import { PlusSquare, Image, Type, Send } from "lucide-react";

export default function CreatePage() {
  const [content, setContent] = useState("");
  const [isAnon, setIsAnon] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex items-center space-x-3">
        <PlusSquare className="text-primary" size={22} />
        <h1 className="text-xl font-bold text-foreground">Create Post</h1>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        <div className="glass-panel p-4 rounded-2xl space-y-4">
          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Post Anonymously</p>
              <p className="text-xs text-muted">Your name will be hidden</p>
            </div>
            <button
              onClick={() => setIsAnon(!isAnon)}
              className={`w-12 h-6 rounded-full transition-colors ${isAnon ? 'bg-primary' : 'bg-surface-hover'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${isAnon ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="border-t border-border/50" />

          {/* Text Area */}
          <div className="relative">
            <Type className="absolute left-3 top-3 text-muted" size={18} />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening on campus? Share a thought, confession, or update..."
              rows={5}
              className="w-full bg-surface-hover border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Image Upload Button */}
          <button className="flex items-center space-x-2 text-muted hover:text-primary transition-colors text-sm">
            <Image size={18} />
            <span>Add Image</span>
          </button>
        </div>

        {/* Post Button */}
        <button
          disabled={!content.trim()}
          className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2"
        >
          <Send size={18} />
          <span>{isAnon ? "Post Anonymously" : "Post to Campus"}</span>
        </button>
      </div>
    </div>
  );
}
