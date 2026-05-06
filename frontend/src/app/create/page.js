"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusSquare, Type, Send } from "lucide-react";

export default function CreatePage() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, isAnonymous: false }),
      });
      if (res.ok) {
        setContent("");
        router.push("/");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create post");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex items-center space-x-3">
        <PlusSquare className="text-primary" size={22} />
        <h1 className="text-xl font-bold text-foreground">Create Post</h1>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        <div className="glass-panel p-4 rounded-2xl space-y-4">
          {/* Text Area */}
          <div className="relative">
            <Type className="absolute left-3 top-3 text-muted" size={18} />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening on campus? Share a thought or update..."
              rows={6}
              className="w-full bg-surface-hover border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>

        {/* Post Button */}
        <button
          onClick={handlePost}
          disabled={!content.trim() || isLoading}
          className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send size={18} />
              <span>Post to Campus</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
