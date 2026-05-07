"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, X, Check } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import NotificationBell from "@/components/NotificationBell";

export default function Home() {
  const router = useRouter();


  const [friendsList, setFriendsList] = useState([]);

  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});
  const [shareModal, setShareModal] = useState(null);
  const [postMenu, setPostMenu] = useState(null);
  const [shareSearchTerm, setShareSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Auth Guard: Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("collegeadda_token");
    if (!token) {
      router.push("/login");
    } else {
      fetchPosts();
      fetchFriends();
    }
  }, [router]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const user = JSON.parse(localStorage.getItem('collegeadda_user') || '{}');
        const formatted = data.map(p => ({
          id: p._id,
          author: p.author?.name || 'Unknown',
          authorId: p.author?._id,
          university: p.university,
          avatar: p.author?.profilePic
            ? p.author.profilePic
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.author?.name || 'U')}&background=6366f1&color=fff`,
          time: new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          content: p.content,
          likes: p.likes?.length || 0,
          isLiked: p.likes?.includes(user._id || user.id),
          comments: p.comments?.length || 0,
          commentsList: p.comments?.map(c => ({
            id: c._id || Math.random().toString(),
            author: c.user?.name || 'Student',
            text: c.text
          })) || []
        }));
        setPosts(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/users/me/following`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFriendsList(data.map(u => ({
          id: u._id,
          name: u.name,
          avatar: u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/posts`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newPostContent, isAnonymous: false })
      });
      if (res.ok) {
        setNewPostContent("");
        fetchPosts();
        setToastMsg("Post created!");
        setTimeout(() => setToastMsg(""), 2000);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to create post");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId) => {
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

    if (typeof postId !== 'string' || !postId) return; // skip non-real posts
    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async (authorId, authorName) => {
    if (!authorId) return;
    const currentlyFollowing = followedUsers[authorId];
    // Optimistic update
    setFollowedUsers(prev => ({ ...prev, [authorId]: !currentlyFollowing }));
    setToastMsg(currentlyFollowing ? `Unfollowed ${authorName}` : `Now following ${authorName}`);
    setTimeout(() => setToastMsg(""), 2000);
    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/users/${authorId}/follow`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Refresh friends list after follow/unfollow
      fetchFriends();
    } catch (err) {
      console.error(err);
      // Revert on failure
      setFollowedUsers(prev => ({ ...prev, [authorId]: currentlyFollowing }));
    }
  };

  const handleShare = async (friend) => {
    const postToShare = posts.find(p => p.id === shareModal);
    if (!postToShare) return;
    const msgText = `Check out this post on Campus Adda: "${postToShare.content}"`;
    
    try {
      const token = localStorage.getItem("collegeadda_token");
      // 1. Get or create the chat room with this friend
      const roomRes = await fetch(`${apiUrl}/api/chat/rooms`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId: friend.id })
      });
      
      if (roomRes.ok) {
        const room = await roomRes.json();
        // 2. Send the message to the room
        await fetch(`${apiUrl}/api/chat/rooms/${room._id}/messages`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: msgText })
        });
        
        setToastMsg(`Post sent to ${friend.name} successfully!`);
      } else {
        setToastMsg(`Failed to send to ${friend.name}`);
      }
    } catch (err) {
      console.error(err);
      setToastMsg("Error sharing post");
    }

    setShareModal(null);
    setShareSearchTerm("");
    setTimeout(() => setToastMsg(""), 2000);
  };

  const toggleLike = async (postId) => {
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
    
    if (typeof postId !== 'string' || !postId) return; // skip non-real posts
    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Campus Adda
        </h1>
        <div className="flex items-center space-x-2">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center overflow-hidden">
            <Image src="/next.svg" alt="Logo" width={16} height={16} className="dark:invert opacity-50" />
          </div>
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
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
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
             <button onClick={handleCreatePost} className="bg-primary text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
               Post
             </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loadingPosts && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          )}
          {!loadingPosts && posts.length === 0 && (
            <div className="text-center py-10 text-muted">
              <p className="text-lg font-semibold">No posts yet 👀</p>
              <p className="text-sm mt-1">Be the first to post something on your campus!</p>
            </div>
          )}
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
                      <button 
                          onClick={() => handleFollow(post.authorId, post.author)}
                          className={clsx(
                            "text-[10px] border px-2.5 py-0.5 rounded-full transition-colors font-bold tracking-wide",
                            followedUsers[post.authorId] 
                              ? "bg-surface-hover text-muted border-border/50"
                              : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                          )}
                        >
                          {followedUsers[post.authorId] ? "Following" : "Follow"}
                        </button>
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
                  <div className="space-y-3 mb-3 max-h-60 overflow-y-auto pr-2">
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
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Search friends..." 
                value={shareSearchTerm}
                onChange={(e) => setShareSearchTerm(e.target.value)}
                className="w-full bg-surface-hover border border-border/50 rounded-xl py-2 px-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {friendsList.length === 0 && (
                <p className="text-sm text-muted text-center py-4">Follow people to share posts with them.</p>
              )}
              {friendsList.filter(f => f.name.toLowerCase().includes(shareSearchTerm.toLowerCase())).map(friend => (
                <div key={friend.id} className="flex items-center space-x-3 p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer" onClick={() => handleShare(friend)}>
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
