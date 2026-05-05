"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, X, Check } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

export default function Home() {
  const router = useRouter();

  // Auth Guard: Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("collegeadda_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);
  const FRIENDS_LIST = [
    { id: 1, name: "Priya Sharma", avatar: "https://i.pravatar.cc/150?u=priya1" },
    { id: 2, name: "Arjun Mehta", avatar: "https://i.pravatar.cc/150?u=arjun1" },
    { id: 3, name: "Sneha Gupta", avatar: "https://i.pravatar.cc/150?u=sneha1" },
  ];

  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});
  const [shareModal, setShareModal] = useState(null);
  const [postMenu, setPostMenu] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

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
      commentsList: [{ id: 101, author: "Priya Patel", text: "Congratulations bro! 🎉" }],
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
      commentsList: [{ id: 102, author: "Rahul Sharma", text: "I have them, meet me at library!" }],
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
      commentsList: [{ id: 103, author: "Priya Patel", text: "Haha so true! 🤐" }],
    }
  ]);

  const handleComment = (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: [...(post.commentsList || []), { id: Date.now(), author: "You", text }]
          };
        }
        return post;
      })
    );
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const handleFollow = (author) => {
    if (followedUsers[author]) return;
    setFollowedUsers(prev => ({ ...prev, [author]: true }));
    
    const currentFollowing = JSON.parse(localStorage.getItem("collegeadda_following_list") || "[]");
    currentFollowing.push({ name: author, university: "University", avatar: `https://i.pravatar.cc/150?u=${author}` });
    localStorage.setItem("collegeadda_following_list", JSON.stringify(currentFollowing));
    
    setToastMsg(`You are now following ${author}`);
    setTimeout(() => setToastMsg(""), 2000);
  };

  const handleShare = () => {
    setToastMsg("Post sent successfully!");
    setShareModal(null);
    setTimeout(() => setToastMsg(""), 2000);
  };

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
        <div className="glass-panel p-4 rounded-2xl flex flex-col space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] flex-shrink-0">
              <div className="w-full h-full bg-surface rounded-full flex items-center justify-center overflow-hidden">
                <span className="text-sm">You</span>
              </div>
            </div>
            <textarea 
              placeholder="What's happening on campus today?"
              className="flex-1 bg-transparent resize-none text-sm focus:outline-none text-foreground placeholder:text-muted mt-2"
              rows={2}
            ></textarea>
          </div>
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
             <div className="flex space-x-4 text-muted">
               <button className="flex items-center space-x-1.5 hover:text-primary transition-colors">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                 <span className="text-xs font-medium hidden sm:inline">Photo</span>
               </button>
               <button className="flex items-center space-x-1.5 hover:text-secondary transition-colors">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                 <span className="text-xs font-medium hidden sm:inline">Video</span>
               </button>
               <button className="flex items-center space-x-1.5 hover:text-orange-500 transition-colors">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                 <span className="text-xs font-medium hidden sm:inline">Note</span>
               </button>
             </div>
             <button className="bg-primary text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
               Post
             </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="glass-panel rounded-2xl p-4 animate-slide-up">
              <div className="flex items-center justify-between mb-3 relative">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface-hover overflow-hidden">
                    <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {post.author}
                      {post.author === "Anonymous" ? (
                        <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">Gossip</span>
                      ) : (
                        <button 
                          onClick={() => handleFollow(post.author)}
                          className={clsx(
                            "text-[10px] border px-2.5 py-0.5 rounded-full transition-colors font-bold tracking-wide",
                            followedUsers[post.author] 
                              ? "bg-surface-hover text-muted border-border/50 cursor-default"
                              : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                          )}
                        >
                          {followedUsers[post.author] ? "Following" : "Follow"}
                        </button>
                      )}
                    </h3>
                    <p className="text-xs text-muted">{post.university} • {post.time}</p>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setPostMenu(postMenu === post.id ? null : post.id)} className="text-muted hover:text-foreground">
                    <MoreHorizontal size={20} />
                  </button>
                  {postMenu === post.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                      <button onClick={() => { setPostMenu(null); setShareModal(post.id); }} className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-surface-hover transition-colors text-sm text-foreground text-left">
                        <Send size={16} className="text-primary" />
                        <span>Share in Message</span>
                      </button>
                    </div>
                  )}
                </div>
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
                <button 
                  onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                  className="flex items-center space-x-1.5 text-muted hover:text-secondary transition-colors group"
                >
                  <MessageCircle size={20} className="transition-transform group-active:scale-75" />
                  <span className="text-xs font-medium">{post.comments}</span>
                </button>
                <button 
                  onClick={() => window.open(`https://wa.me/?text=Check out this post on Campus Adda: ${encodeURIComponent(post.content)}`, '_blank')}
                  className="flex items-center space-x-1.5 text-muted hover:text-green-500 transition-colors ml-auto group"
                >
                  <Share2 size={18} className="transition-transform group-active:scale-75" />
                  <span className="text-[10px] hidden sm:inline font-medium">WhatsApp</span>
                </button>
              </div>

              {/* Comment Input Box */}
              {activeCommentPost === post.id && (
                <div className="mt-3 border-t border-border/50 pt-3 animate-fade-in">
                  <div className="space-y-3 mb-3 max-h-40 overflow-y-auto pr-2">
                    {(post.commentsList || []).map(comment => (
                      <div key={comment.id} className="flex space-x-2">
                        <span className="font-bold text-xs">{comment.author}</span>
                        <span className="text-xs text-foreground/90">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px] flex-shrink-0">
                      <div className="w-full h-full bg-surface rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-[10px]">You</span>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyPress={(e) => e.key === "Enter" && handleComment(post.id)}
                      placeholder={`Reply to ${post.author}...`} 
                      className="flex-1 bg-surface-hover rounded-full px-4 py-2 text-xs focus:outline-none text-foreground border border-border/50" 
                    />
                    <button 
                      onClick={() => handleComment(post.id)}
                      className="text-xs bg-primary text-white font-bold px-3 py-1.5 rounded-full hover:scale-105 transition-transform shadow-md shadow-primary/20"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShareModal(null)}>
          <div className="w-full max-w-md bg-surface rounded-t-3xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">Send to...</h2>
              <button onClick={() => setShareModal(null)} className="text-muted hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-2">
              {FRIENDS_LIST.map(friend => (
                <div key={friend.id} className="flex items-center space-x-3 p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer" onClick={handleShare}>
                  <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{friend.name}</p>
                  </div>
                  <button className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full hover:scale-105 transition-transform shadow-md shadow-primary/20">
                    Send
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface border border-border/50 px-6 py-3 rounded-full shadow-2xl z-[60] animate-fade-in flex items-center space-x-2">
          <div className="bg-green-500/20 text-green-500 p-1 rounded-full">
            <Check size={14} strokeWidth={3} />
          </div>
          <span className="text-sm font-bold text-foreground whitespace-nowrap">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
