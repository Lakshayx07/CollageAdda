"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

export default function Home() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Rahul Sharma",
      university: "Rishihood University",
      avatar: "https://i.pravatar.cc/150?u=rahul",
      time: "2 hours ago",
      content: "Just finished my final year project! So relieved. 🎉",
      likes: 124,
      isLiked: false,
      comments: 18,
    },
    {
      id: 2,
      author: "Priya Patel",
      university: "Delhi University",
      avatar: "https://i.pravatar.cc/150?u=priya",
      time: "5 hours ago",
      content: "Anyone have notes for the upcoming Data Structures mid-term? Willing to trade for a coffee! ☕",
      likes: 89,
      isLiked: true,
      comments: 42,
    },
    {
      id: 3,
      author: "Anonymous",
      university: "Rishihood University",
      avatar: "https://i.pravatar.cc/150?u=anon",
      time: "8 hours ago",
      content: "Confession #451: I think the new cafeteria food is actually pretty good, but I'm too scared to say it out loud.",
      likes: 342,
      isLiked: false,
      comments: 89,
    }
  ]);

  const toggleLike = (postId) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          const isCurrentlyLiked = post.isLiked;
          return {
            ...post,
            isLiked: !isCurrentlyLiked,
            likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );
    // In a real app, you would make the Supabase API call here.
    // If it fails, you revert the state. This is Optimistic UI!
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Campus Adda
        </h1>
        <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center">
          <Image src="/next.svg" alt="Logo" width={16} height={16} className="dark:invert opacity-50" />
        </div>
      </header>

      {/* Feed Content */}
      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {/* Create Post Prompt */}
        <div className="glass-panel p-4 rounded-2xl flex items-center space-x-3 cursor-text">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
            <div className="w-full h-full bg-surface rounded-full flex items-center justify-center overflow-hidden">
              <span className="text-sm">You</span>
            </div>
          </div>
          <div className="flex-1 bg-surface-hover rounded-full px-4 py-2.5 text-muted text-sm border border-border/50">
            What's happening on campus?
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="glass-panel rounded-2xl p-4 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface-hover overflow-hidden">
                    <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {post.author}
                      {post.author === "Anonymous" && <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">Gossip</span>}
                    </h3>
                    <p className="text-xs text-muted">{post.university} • {post.time}</p>
                  </div>
                </div>
                <button className="text-muted hover:text-foreground">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <p className="text-sm text-foreground mb-4 leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center space-x-6 border-t border-border/50 pt-3">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className={clsx(
                    "flex items-center space-x-1.5 transition-colors group",
                    post.isLiked ? "text-primary" : "text-muted hover:text-primary"
                  )}
                >
                  <Heart 
                    size={20} 
                    className={clsx("transition-transform group-active:scale-75", post.isLiked && "fill-primary")} 
                  />
                  <span className="text-xs font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1.5 text-muted hover:text-secondary transition-colors group">
                  <MessageCircle size={20} className="transition-transform group-active:scale-75" />
                  <span className="text-xs font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center space-x-1.5 text-muted hover:text-green-500 transition-colors ml-auto">
                  <Share2 size={18} />
                  <span className="text-[10px] hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
