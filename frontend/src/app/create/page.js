"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, PlusSquare, Send, Sparkles, Type, UsersRound } from "lucide-react";

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
    <div className="page-shell flex flex-col">
      <header className="page-header sticky top-0 z-40 px-5 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-tile h-11 w-11">
              <PlusSquare size={21} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground">Create</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">Campus post</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-muted sm:flex">
            <UsersRound size={14} />
            Student feed
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-5 sm:py-8">
        <section className="app-panel overflow-hidden rounded-[1.75rem]">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">New update</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">What is happening on campus?</h2>
              </div>
              <div className="brand-mark flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                <Sparkles size={22} className="text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
          <div className="relative">
            <Type className="absolute left-4 top-4 text-muted" size={18} />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share a thought, event, win, question, or campus moment..."
              rows={8}
              className="input-surface w-full resize-none rounded-[1.35rem] py-4 pl-12 pr-4 text-sm leading-6 placeholder:text-white/25"
            />
          </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-primary/40 hover:text-white" type="button">
                  <ImagePlus size={18} />
                </button>
                <span>{content.trim().length} characters</span>
              </div>

              <button
                onClick={handlePost}
                disabled={!content.trim() || isLoading}
                className="primary-button flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black uppercase tracking-[0.18em] transition active:scale-95 disabled:active:scale-100 sm:w-auto"
              >
                {isLoading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Send size={17} />
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
