"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, X, Check, Plus } from "lucide-react";
import Image from "next/image";
import NotificationBell from "../components/NotificationBell";
import VerifiedBadge from "../components/VerifiedBadge";
import clsx from "clsx";
import { motion } from "framer-motion";

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
  const [stories, setStories] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState('none');
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeStory, setActiveStory] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const scrollRef = useRef(null);

  // Auth Guard: Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("collegeadda_token");
    if (!token) {
      router.push("/login");
    } else {
      const u = JSON.parse(localStorage.getItem('collegeadda_user') || '{}');
      setCurrentUser(u);
      fetchPosts();
      fetchFriends();
      fetchStories();
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
          })) || [],
          mediaUrl: p.mediaUrl,
          mediaType: p.mediaType,
          authorFollowers: p.author?.followers || [],
          authorFollowing: p.author?.following || []
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

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/stories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Group stories by author for the horizontal bar
        const grouped = data.reduce((acc, story) => {
          const authorId = story.author._id || story.author.id;
          if (!acc[authorId]) {
            acc[authorId] = {
              author: story.author,
              stories: []
            };
          }
          acc[authorId].stories.push(story);
          return acc;
        }, {});
        setStories(Object.values(grouped));
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
  };

  const handleMediaSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedMedia(reader.result);
      setMediaType(type);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedMedia) return;
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          content: newPostContent,
          mediaUrl: selectedMedia || '',
          mediaType: mediaType
        })
      });
      if (res.ok) {
        const newPost = await res.json();
        setPosts(prev => [{
          id: newPost._id,
          author: currentUser?.name || "You",
          university: currentUser?.university || "",
          content: newPost.content,
          time: "Just now",
          likes: 0,
          comments: 0,
          isLiked: false,
          mediaUrl: newPost.mediaUrl,
          mediaType: newPost.mediaType
        }, ...prev]);
        setNewPostContent("");
        setSelectedMedia(null);
        setMediaType('none');
        setToastMsg("Post created! 🚀");
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
    const msgText = postToShare.content || `Check out this ${postToShare.mediaType} on Campus Adda!`;
    
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
          body: JSON.stringify({ 
            text: msgText,
            mediaUrl: postToShare.mediaUrl || '',
            mediaType: postToShare.mediaType || 'none'
          })
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

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        setToastMsg("Post deleted 🗑️");
        setPostMenu(null);
        setTimeout(() => setToastMsg(""), 2000);
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error(err);
    }
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
          <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center">
            <Image src="/next.svg" alt="Logo" width={16} height={16} className="dark:invert opacity-50" />
          </div>
        </div>
      </header>

      {/* Feed Content */}
      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        
        {/* Stories Section */}
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
          {/* Your Story bubble */}
          <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer" onClick={() => router.push('/profile')}>
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-[2px] bg-surface-hover border border-border/50 overflow-hidden">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                   {currentUser?.profilePic ? (
                     <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="You" />
                   ) : (
                     <span className="text-xl font-bold">{currentUser?.name?.charAt(0) || "Y"}</span>
                   )}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center text-white">
                <Plus size={12} strokeWidth={3} />
              </div>
            </div>
            <span className="text-[10px] text-muted font-medium">Your Story</span>
          </div>

          {/* Others' Stories */}
          {stories.map((group) => (
            <div 
              key={group.author._id} 
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
              onClick={() => setActiveStory(group)}
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                <div className="w-full h-full rounded-full bg-background p-[2px]">
                  <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                    <img 
                      src={group.author.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.author.name)}&background=6366f1&color=fff`} 
                      className="w-full h-full object-cover" 
                      alt={group.author.name} 
                    />
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-foreground font-medium truncate w-16 text-center">{group.author.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Create Post Prompt */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] flex-shrink-0 overflow-hidden">
              <div className="w-full h-full bg-surface rounded-full flex items-center justify-center overflow-hidden">
                {currentUser?.profilePic ? (
                  <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="You" />
                ) : (
                  <span className="text-sm font-bold">{currentUser?.name?.charAt(0) || "Y"}</span>
                )}
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

          {selectedMedia && (
            <div className="relative rounded-xl overflow-hidden border border-border/50 max-h-60">
              {mediaType === 'video' ? (
                <video src={selectedMedia} controls className="w-full h-full object-cover" />
              ) : (
                <img src={selectedMedia} className="w-full h-full object-cover" alt="Preview" />
              )}
              <button 
                onClick={() => { setSelectedMedia(null); setMediaType('none'); }}
                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/50 pt-3">
             <div className="flex space-x-4 text-muted">
               <input 
                 type="file" 
                 ref={photoInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={(e) => handleMediaSelect(e, 'image')} 
               />
               <input 
                 type="file" 
                 ref={videoInputRef} 
                 className="hidden" 
                 accept="video/*" 
                 onChange={(e) => handleMediaSelect(e, 'video')} 
               />
               
               <button 
                 onClick={() => photoInputRef.current?.click()}
                 className="flex items-center space-x-1.5 hover:text-primary transition-colors"
               >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                 <span className="text-xs font-medium hidden sm:inline">Photo</span>
               </button>
               <button 
                 onClick={() => videoInputRef.current?.click()}
                 className="flex items-center space-x-1.5 hover:text-secondary transition-colors"
               >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                 <span className="text-xs font-medium hidden sm:inline">Video</span>
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
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {post.author}
                      <VerifiedBadge user={{ followers: post.authorFollowers, following: post.authorFollowing }} /> 
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
                        
                        {(currentUser?._id === post.authorId || currentUser?.id === post.authorId) && (
                          <button 
                            onClick={() => handleDeletePost(post.id)} 
                            className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-red-500/10 transition-colors text-sm text-red-500 text-left border-t border-border/30"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            <span>Delete Post</span>
                          </button>
                        )}
                      </div>
                  )}
                </div>
              </div>
              
              {post.content && (
                <p className="text-sm text-foreground mb-3 leading-relaxed">
                  {post.content}
                </p>
              )}

              {post.mediaUrl && (
                <div className="rounded-xl overflow-hidden mb-4 border border-border/30 bg-surface-hover/50">
                  {post.mediaType === 'video' ? (
                    <video 
                      src={post.mediaUrl} 
                      controls 
                      className="w-full h-auto max-h-[400px] object-contain mx-auto" 
                    />
                  ) : (
                    <img 
                      src={post.mediaUrl} 
                      alt="Post content" 
                      className="w-full h-auto max-h-[400px] object-contain mx-auto" 
                    />
                  )}
                </div>
              )}

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
                  onClick={() => {
                    const text = post.content ? post.content : "Check out this media post on Campus Adda!";
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
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

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col" onClick={() => setActiveStory(null)}>
           {/* Progress Bars */}
           <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
              {activeStory.stories.map((s, i) => (
                <div key={i} className="h-0.5 bg-white/30 flex-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "100%" }} 
                    transition={{ duration: 5 }} 
                    onAnimationComplete={() => {
                      if (i === activeStory.stories.length - 1) setActiveStory(null);
                    }}
                    className="h-full bg-white" 
                  />
                </div>
              ))}
           </div>

           {/* Header */}
           <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-20">
              <div className="flex items-center space-x-2">
                <img 
                  src={activeStory.author.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeStory.author.name)}&background=6366f1&color=fff`} 
                  className="w-8 h-8 rounded-full border border-white/20" 
                  alt="" 
                />
                <span className="text-white font-bold text-sm">{activeStory.author.name}</span>
                <span className="text-white/60 text-xs">{new Date(activeStory.stories[0].createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <button onClick={() => setActiveStory(null)} className="text-white p-2">
                <X size={24} />
              </button>
           </div>

           {/* Content */}
           <div className="flex-1 flex items-center justify-center">
              {activeStory.stories[0].mediaType === 'video' ? (
                <video src={activeStory.stories[0].mediaUrl} autoPlay className="w-full h-auto max-h-screen" />
              ) : (
                <img src={activeStory.stories[0].mediaUrl} className="w-full h-auto max-h-screen object-contain" alt="" />
              )}
           </div>

           {/* Reply Bar */}
           <div className="p-4 bg-black flex items-center space-x-4">
              <input 
                type="text" 
                placeholder={`Reply to ${activeStory.author.name.split(' ')[0]}...`} 
                className="flex-1 bg-transparent border border-white/30 rounded-full px-4 py-2 text-white text-sm focus:outline-none"
                onClick={e => e.stopPropagation()}
              />
              <Heart className="text-white cursor-pointer" />
              <Send className="text-white cursor-pointer" />
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
