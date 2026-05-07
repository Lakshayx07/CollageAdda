"use client";
import { useEffect, useState } from "react";
import { LogOut, Edit3, X, Check, Plus, Grid, Heart, MessageCircle, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import UniversityBadges from "@/components/UniversityBadges";

const INTEREST_OPTIONS = ["Music 🎵", "Cricket 🏏", "Coding 💻", "Art 🎨", "Travel ✈️", "Gaming 🎮", "Books 📚", "Fitness 💪", "Movies 🎬", "Cooking 🍳"];
const SPORT_OPTIONS = ["Football ⚽", "Basketball 🏀", "Cricket 🏏", "Tennis 🎾", "Badminton 🏸", "Volleyball 🏐", "Table Tennis 🏓", "Athletics 🏃", "Swimming 🏊", "Chess ♟️"];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [modal, setModal] = useState(null); // 'followers' | 'following' | 'edit' | 'story' | 'post' | 'share'
  const [activePostIndex, setActivePostIndex] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [shareSearchTerm, setShareSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  
  const [editData, setEditData] = useState({ profilePic: "", instaId: "", snapId: "", interests: [], sports: [] });
  const [saved, setSaved] = useState(false);

  const minSwipeDistance = 50;
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNextPost();
    if (distance < -minSwipeDistance) handlePrevPost();
  };
  const handleNextPost = () => { if (activePostIndex !== null && activePostIndex < userPosts.length - 1) setActivePostIndex(activePostIndex + 1); };
  const handlePrevPost = () => { if (activePostIndex !== null && activePostIndex > 0) setActivePostIndex(activePostIndex - 1); };

  const handleLike = () => {
    if (activePostIndex === null) return;
    setUserPosts(prev => prev.map((p, i) => i === activePostIndex ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || activePostIndex === null) return;
    setUserPosts(prev => prev.map((p, i) => i === activePostIndex ? {
      ...p, comments: p.comments + 1, commentsList: [...p.commentsList, { id: Date.now(), author: "You", text: commentInput }]
    } : p));
    setCommentInput("");
  };

  const handleShare = (friend) => {
    const postToShare = userPosts[activePostIndex];
    const msgText = `Check out my post: "${postToShare?.img}"`;
    const savedMessages = JSON.parse(localStorage.getItem("collegeadda_messages") || "{}");
    const newMsg = { id: Date.now(), text: msgText, sender: "me", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const chatId = `mock_friend_${friend.id}`;
    savedMessages[chatId] = [...(savedMessages[chatId] || []), newMsg];
    localStorage.setItem("collegeadda_messages", JSON.stringify(savedMessages));

    const mockRooms = JSON.parse(localStorage.getItem("collegeadda_mock_rooms") || "[]");
    const existingRoom = mockRooms.find(r => r.id === chatId);
    if (!existingRoom) {
      mockRooms.push({ id: chatId, name: friend.name, type: "private", avatar: friend.avatar, lastMsg: msgText, time: "Just now" });
    } else {
      existingRoom.lastMsg = msgText; existingRoom.time = "Just now";
    }
    localStorage.setItem("collegeadda_mock_rooms", JSON.stringify(mockRooms));
    setToastMsg(`Post sent to ${friend.name} successfully!`);
    setModal("post");
    setShareSearchTerm("");
    setTimeout(() => setToastMsg(""), 2000);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      const stored = localStorage.getItem("collegeadda_user");
      const token = localStorage.getItem("collegeadda_token");
      if (!stored || !token) { router.push("/login"); return; }
      
      const u = JSON.parse(stored);
      setUser(u);
      
      try {
        // Fetch fresh profile
        const profileRes = await fetch(`${apiUrl}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
          setEditData({ 
            profilePic: profileData.profilePic || "",
            instaId: profileData.instagram || "", 
            snapId: profileData.snapchat || "", 
            interests: profileData.interests || [], 
            sports: profileData.sports || [] 
          });
        }

        // Fetch user posts (by filtering feed posts for now, since no specific user posts API exists)
        const postsRes = await fetch(`${apiUrl}/api/posts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          const myPosts = postsData.filter(p => p.author?._id === u._id || p.author?._id === u.id);
          
          if (myPosts.length > 0) {
            setUserPosts(myPosts.map(p => ({
              id: p._id,
              img: p.mediaUrl || "https://picsum.photos/seed/fallback/300/300", // Fallback if no mediaUrl
              likes: p.likes?.length || 0,
              isLiked: p.likes?.includes(u._id || u.id),
              comments: p.comments?.length || 0,
              commentsList: p.comments?.map(c => ({
                id: c._id || Math.random().toString(),
                author: "Student",
                text: c.text
              })) || []
            })));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchProfileAndPosts();

    // Fetch followers & following
    const fetchSocial = async () => {
      try {
        const token = localStorage.getItem("collegeadda_token");
        const [followersRes, followingRes] = await Promise.all([
          fetch(`${apiUrl}/api/users/me/followers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/users/me/following`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (followersRes.ok) setFollowers(await followersRes.json());
        if (followingRes.ok) setFollowing(await followingRes.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchSocial();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/login");
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profilePic: editData.profilePic,
          instagram: editData.instaId,
          snapchat: editData.snapId,
          interests: editData.interests,
          sports: editData.sports
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem("collegeadda_user", JSON.stringify(updatedUser));
        setSaved(true);
        setTimeout(() => { setSaved(false); setModal(null); }, 1200);
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleInterest = (interest) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleSport = (sport) => {
    setEditData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }));
  };

  if (!user) return null;

  // profile is now part of user object (from backend)
  const profile = user;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{user.name?.split(" ")[0] || "Profile"}</h1>
        <button onClick={handleLogout} className="flex items-center space-x-1 text-muted hover:text-red-400 transition-colors text-sm">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full relative">
        {/* Subtle animated gradient background */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent -z-10 pointer-events-none blur-3xl opacity-60"></div>
        
        {/* Instagram-style Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-4 space-y-5"
        >
          {/* Glassmorphism Profile Card */}
          <div className="glass-panel bg-surface/40 backdrop-blur-xl rounded-3xl p-5 border border-white/5 shadow-lg space-y-5 relative overflow-hidden">
            {/* Inner top glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Avatar + Stats Row */}
            <div className="flex items-center space-x-6 relative z-10">
            {/* Avatar */}
            <div 
              className="cursor-pointer relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] flex-shrink-0 bg-gradient-to-tr from-pink-500 via-purple-500 to-orange-400 bg-[length:200%_200%] animate-[gradient_3s_ease_infinite] shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:scale-105 transition-transform"
            >
              <div 
                onClick={() => setModal("story")}
                className="w-full h-full bg-background rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-foreground border border-background overflow-hidden"
              >
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0)?.toUpperCase() || "?"
                )}
              </div>
              
              {/* Instagram-style Plus Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); setModal("avatar_options"); }}
                className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full border-2 border-background flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg z-20"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-1 justify-between gap-2">
              <div className="flex flex-col items-center justify-center bg-surface/50 hover:bg-surface border border-white/5 hover:border-white/10 rounded-2xl py-2 px-2 flex-1 transition-all shadow-sm">
                <p className="text-lg font-bold bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">{userPosts.length}</p>
                <p className="text-[10px] sm:text-xs text-muted font-medium">Posts</p>
              </div>
              <button 
                className="flex flex-col items-center justify-center bg-surface/50 hover:bg-surface border border-white/5 hover:border-white/10 rounded-2xl py-2 px-2 flex-1 transition-all shadow-sm group/btn" 
                onClick={() => setModal("followers")}
              >
                <p className="text-lg font-bold group-hover/btn:bg-gradient-to-br group-hover/btn:from-indigo-400 group-hover/btn:to-purple-400 group-hover/btn:bg-clip-text group-hover/btn:text-transparent transition-all">{followers.length}</p>
                <p className="text-[10px] sm:text-xs text-muted font-medium">Followers</p>
              </button>
              <button 
                className="flex flex-col items-center justify-center bg-surface/50 hover:bg-surface border border-white/5 hover:border-white/10 rounded-2xl py-2 px-2 flex-1 transition-all shadow-sm group/btn" 
                onClick={() => setModal("following")}
              >
                <p className="text-lg font-bold group-hover/btn:bg-gradient-to-br group-hover/btn:from-indigo-400 group-hover/btn:to-purple-400 group-hover/btn:bg-clip-text group-hover/btn:text-transparent transition-all">{following.length}</p>
                <p className="text-[10px] sm:text-xs text-muted font-medium">Following</p>
              </button>
            </div>
          </div>

          {/* Name + Bio */}
          <div className="relative z-10 space-y-1">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">{user.name}</h2>
            <p className="text-sm text-muted/80 font-medium">
              {user.university}
            </p>
            {profile.sports && profile.sports.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {profile.sports.map((sport, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center text-[11px] font-extrabold px-2.5 py-0.5 rounded-md shadow-sm relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)",
                      color: "#451A03", // dark brown/gold for contrast
                      boxShadow: "0 2px 10px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)"
                    }}
                  >
                    {/* Sparkle animation effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]"></span>
                    <span className="relative z-10 flex items-center gap-1 tracking-wide uppercase">
                      ✨ {sport}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {/* University Badges */}
            <div className="pt-1 pb-2">
              <UniversityBadges userId={user.id || user.email || "mock-user-123"} />
            </div>

            {/* Social Links */}
            {(profile.instagram || profile.snapchat) && (
              <div className="flex flex-wrap gap-2 mt-2 pt-1">
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full text-white font-medium shadow-md hover:scale-105 hover:shadow-lg transition-all bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    <span>@{profile.instagram}</span>
                  </a>
                )}
                {profile.snapchat && (
                  <a
                    href={`https://snapchat.com/add/${profile.snapchat}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full font-medium shadow-md hover:scale-105 hover:shadow-lg transition-all"
                    style={{ background: "#FFFC00", color: "#000" }}
                  >
                    <span className="text-sm">👻</span>
                    <span>{profile.snapchat}</span>
                  </a>
                )}
              </div>
            )}

            {/* Interests */}
            {profile.interests?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-white/5 relative z-10">
                {profile.interests.map(i => (
                  <span key={i} className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/20">{i}</span>
                ))}
              </div>
            )}
          </div>

          {/* Edit Profile Button */}
          <div className="pt-2 relative z-10">
            <button
              onClick={() => setModal("edit")}
              className="relative w-full py-2.5 rounded-xl bg-surface-hover text-sm font-bold text-foreground flex items-center justify-center space-x-2 group overflow-hidden transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="absolute inset-0 bg-gradient-to-r from-primary/50 to-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity blur-md z-0" />
              <div className="absolute inset-[1px] bg-surface rounded-xl z-0 transition-colors group-hover:bg-surface-hover" />
              <span className="relative z-10 flex items-center space-x-2">
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </span>
            </button>
          </div>
          </div>
        </motion.div>

        {/* Posts Grid Divider */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center border-t border-border/50 py-3 mt-2"
        >
          <div className="p-2 rounded-full bg-surface-hover">
            <Grid size={18} className="text-foreground" />
          </div>
        </motion.div>

        {/* Instagram-style Posts Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-[2px] pb-20"
        >
          {userPosts.length === 0 && (
            <div className="col-span-3 text-center py-10 text-muted">
              <p className="text-lg font-semibold">No posts yet</p>
              <p className="text-sm mt-1">Share something on the feed!</p>
            </div>
          )}
          {userPosts.map((post, idx) => (
            <motion.div 
              key={post.id} 
              whileHover={{ scale: 0.98 }}
              onClick={() => { setActivePostIndex(idx); setModal("post"); }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative group aspect-square overflow-hidden cursor-pointer"
            >
              <img src={post.img} alt="post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-5 backdrop-blur-[2px]">
                <div className="flex flex-col items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <Heart size={20} className="fill-white text-white mb-1 drop-shadow-md" />
                  <span className="text-white text-sm font-bold drop-shadow-md">{post.likes}</span>
                </div>
                <div className="flex flex-col items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  <MessageCircle size={20} className="fill-white text-white mb-1 drop-shadow-md" />
                  <span className="text-white text-sm font-bold drop-shadow-md">{post.comments}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── MODAL: Followers ── */}
      {modal === "followers" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md bg-surface rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">Followers</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted" /></button>
            </div>
            <div className="space-y-3">
              {followers.length === 0 && (
                <p className="text-sm text-muted text-center py-4">No followers yet. Share your profile!</p>
              )}
              {followers.map((f, idx) => (
                <div key={f._id || idx} className="flex items-center space-x-3">
                  <img src={f.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=6366f1&color=fff`} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{f.name}</p>
                    <p className="text-xs text-muted">{f.university}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Following ── */}
      {modal === "following" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md bg-surface rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">Following</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted" /></button>
            </div>
            <div className="space-y-3">
              {following.length === 0 && (
                <p className="text-sm text-muted text-center py-4">You're not following anyone yet.</p>
              )}
              {following.map((f, idx) => (
                <div key={f._id || idx} className="flex items-center space-x-3">
                  <img src={f.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=6366f1&color=fff`} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{f.name}</p>
                    <p className="text-xs text-muted">{f.university}</p>
                  </div>
                  <button className="text-xs text-muted font-medium border border-border/50 px-3 py-1 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors">
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit Profile ── */}
      {modal === "edit" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md bg-surface rounded-t-3xl p-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">Edit Profile</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted" /></button>
            </div>

            <div className="space-y-4">
              {/* Profile Picture */}
              <div>
                <label className="text-xs text-muted mb-1 block">Profile Picture URL</label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center bg-surface-hover border border-border/50 rounded-xl overflow-hidden">
                    <input
                      value={editData.profilePic}
                      onChange={e => setEditData(prev => ({ ...prev, profilePic: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                      className="flex-1 bg-transparent py-3 px-4 text-sm text-foreground focus:outline-none"
                    />
                  </div>
                  {editData.profilePic && (
                    <div className="flex items-center space-x-3 p-2 bg-surface-hover/50 rounded-xl border border-border/30">
                      <img src={editData.profilePic} className="w-12 h-12 rounded-full object-cover border border-primary/30" alt="Preview" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=Error&background=ef4444&color=fff'} />
                      <span className="text-[10px] text-muted">Preview (looks good!)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Instagram ID */}
              <div>
                <label className="text-xs text-muted mb-1 block">Instagram Username</label>
                <div className="flex items-center bg-surface-hover border border-border/50 rounded-xl overflow-hidden">
                  <span className="px-3 text-sm" style={{ color: "#bc1888" }}>@</span>
                  <input
                    value={editData.instaId}
                    onChange={e => setEditData(prev => ({ ...prev, instaId: e.target.value.replace("@", "") }))}
                    placeholder="your_instagram"
                    className="flex-1 bg-transparent py-3 pr-4 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Snapchat ID */}
              <div>
                <label className="text-xs text-muted mb-1 block">Snapchat Username</label>
                <div className="flex items-center bg-surface-hover border border-border/50 rounded-xl overflow-hidden">
                  <span className="px-3 text-lg">👻</span>
                  <input
                    value={editData.snapId}
                    onChange={e => setEditData(prev => ({ ...prev, snapId: e.target.value }))}
                    placeholder="your_snapchat"
                    className="flex-1 bg-transparent py-3 pr-4 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="text-xs text-muted mb-2 block">Interests (select up to 5)</label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(interest => {
                    const selected = editData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        disabled={!selected && editData.interests.length >= 5}
                        className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full border transition-all ${
                          selected
                            ? "bg-primary/20 text-primary border-primary/40 font-medium"
                            : "bg-surface-hover text-muted border-border/50 hover:border-primary/30 disabled:opacity-40"
                        }`}
                      >
                        {selected && <Check size={10} />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sports */}
              <div>
                <label className="text-xs text-muted mb-2 block">Sports (select your sports)</label>
                <div className="flex flex-wrap gap-2">
                  {SPORT_OPTIONS.map(sport => {
                    const selected = editData.sports.includes(sport);
                    return (
                      <button
                        key={sport}
                        onClick={() => toggleSport(sport)}
                        className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full border transition-all ${
                          selected
                            ? "bg-green-500/20 text-green-500 border-green-500/40 font-medium"
                            : "bg-surface-hover text-muted border-border/50 hover:border-green-500/30"
                        }`}
                      >
                        {selected && <Check size={10} />}
                        <span>{sport}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveProfile}
                className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {saved ? <><Check size={18} /><span>Saved!</span></> : <><span>Save Changes</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Story ── */}
      {modal === "story" && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black" onClick={() => setModal(null)}>
          {/* Story Progress */}
          <div className="absolute top-2 left-2 right-2 flex space-x-1 z-10">
            <div className="h-0.5 bg-white/50 w-full rounded-full overflow-hidden">
               <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5 }} className="h-full bg-white" onAnimationComplete={() => setModal(null)} />
            </div>
          </div>
          {/* Story Header */}
          <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-10">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
              </div>
              <span className="text-white font-semibold text-sm">{user.name}</span>
              <span className="text-white/60 text-xs">2h</span>
            </div>
            <button onClick={() => setModal(null)} className="text-white"><X size={24} /></button>
          </div>
          {/* Story Content */}
          <div className="flex-1 flex items-center justify-center bg-zinc-900 relative">
             <img src="https://images.unsplash.com/photo-1523050335456-c38a7047d28c?w=800&q=80" className="w-full h-auto max-h-full object-contain" alt="Story" />
          </div>
          {/* Reply bar */}
          <div className="p-4 flex items-center space-x-3 bg-black">
            <div className="flex-1 rounded-full border border-white/30 px-4 py-3 text-white/50 text-sm">Reply to {user.name.split(" ")[0]}...</div>
            <Heart className="text-white" />
            <Send className="text-white" />
          </div>
        </div>
      )}

      {/* ── MODAL: Post View ── */}
      {modal === "post" && activePostIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setModal(null)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-surface h-[85vh] sm:h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl relative" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3 flex justify-between items-center border-b border-border/50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                </div>
                <span className="font-bold text-foreground text-sm">{user.name}</span>
              </div>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted" /></button>
            </div>
            {/* Image with Swipe handlers */}
            <div 
              className="w-full bg-black flex-shrink-0 flex items-center justify-center relative group/img"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEndHandler}
            >
              {activePostIndex > 0 && (
                <button onClick={handlePrevPost} className="absolute left-2 p-2 bg-black/50 text-white rounded-full z-10 opacity-0 group-hover/img:opacity-100 transition-opacity"><ChevronLeft size={20}/></button>
              )}
              <img src={userPosts[activePostIndex].img} className="w-full max-h-[400px] object-contain select-none" alt="Post" draggable="false" />
              {activePostIndex < userPosts.length - 1 && (
                <button onClick={handleNextPost} className="absolute right-2 p-2 bg-black/50 text-white rounded-full z-10 opacity-0 group-hover/img:opacity-100 transition-opacity"><ChevronRight size={20}/></button>
              )}
            </div>
            {/* Actions */}
            <div className="p-3 flex items-center justify-between border-b border-border/10">
              <div className="flex space-x-4">
                <Heart onClick={handleLike} size={24} className={`cursor-pointer transition-colors ${userPosts[activePostIndex].isLiked ? 'fill-red-500 text-red-500' : 'text-foreground hover:text-red-500'}`} />
                <MessageCircle size={24} className="text-foreground hover:text-blue-500 cursor-pointer transition-colors" />
                <Send onClick={() => setModal("share")} size={24} className="text-foreground cursor-pointer hover:text-primary transition-colors" />
              </div>
              <div className="text-foreground font-bold text-sm">{userPosts[activePostIndex].likes} likes</div>
            </div>
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
               <div className="flex space-x-2">
                 <span className="font-bold text-sm">{user.name}</span>
                 <span className="text-sm text-foreground/90">Campus vibes! ☀️</span>
               </div>
               <div className="text-xs text-muted font-bold mt-2 mb-2">View all {userPosts[activePostIndex].comments} comments</div>
               {userPosts[activePostIndex].commentsList.map(comment => (
                 <div key={comment.id} className="flex space-x-2">
                   <span className="font-bold text-sm">{comment.author}</span>
                   <span className="text-sm text-foreground/90">{comment.text}</span>
                 </div>
               ))}
            </div>
            {/* Add comment */}
            <div className="p-3 border-t border-border/50 flex items-center space-x-2 bg-surface">
              <input 
                type="text" 
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleAddComment()}
                placeholder="Add a comment..." 
                className="flex-1 bg-transparent text-sm text-foreground focus:outline-none" 
              />
              <button onClick={handleAddComment} className="text-primary font-bold text-sm">Post</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Share Modal */}
      {modal === "share" && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal("post")}>
          <div className="w-full max-w-md bg-surface rounded-t-3xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">Send to...</h2>
              <button onClick={() => setModal("post")} className="text-muted hover:text-foreground"><X size={20} /></button>
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
              {[...followers, ...following].filter((f, i, arr) => arr.findIndex(x => x._id === f._id) === i).filter(f => f.name.toLowerCase().includes(shareSearchTerm.toLowerCase())).map(friend => {
                const avatar = friend.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=6366f1&color=fff`;
                return (
                  <div key={friend._id} className="flex items-center space-x-3 p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer" onClick={() => handleShare(friend)}>
                    <img src={avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{friend.name}</p>
                    </div>
                    <button className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full hover:scale-105 transition-transform shadow-md shadow-primary/20">
                      Send
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Avatar Options (Instagram Style) ── */}
      {modal === "avatar_options" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            className="w-full max-w-md bg-surface rounded-t-3xl p-6 space-y-4" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg text-foreground">Create</h3>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => document.getElementById('profilePicInput').click()}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-hover border border-border/50 hover:border-primary/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <span className="text-sm font-bold text-foreground">Profile Pic</span>
              </button>
              
              <button 
                onClick={() => document.getElementById('storyInput').click()}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-hover border border-border/50 hover:border-pink-500/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 mb-2 group-hover:scale-110 transition-transform">
                  <Heart size={24} />
                </div>
                <span className="text-sm font-bold text-foreground">Add Story</span>
              </button>
            </div>
            
            <input 
              type="file" 
              id="profilePicInput" 
              className="hidden" 
              accept="image/*" 
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // Convert to Base64
                const reader = new FileReader();
                reader.onloadend = async () => {
                  const base64String = reader.result;
                  try {
                    const token = localStorage.getItem("collegeadda_token");
                    const res = await fetch(`${apiUrl}/api/users/profile`, {
                      method: 'PUT',
                      headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ profilePic: base64String })
                    });
                    if (res.ok) {
                      const updatedUser = await res.json();
                      setUser(updatedUser);
                      localStorage.setItem("collegeadda_user", JSON.stringify(updatedUser));
                      setToastMsg("Profile picture updated!");
                      setModal(null);
                      setTimeout(() => setToastMsg(""), 2000);
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Failed to update profile picture");
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            
            <input 
              type="file" 
              id="storyInput" 
              className="hidden" 
              accept="image/*,video/*" 
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onloadend = async () => {
                  const base64String = reader.result;
                  try {
                    const token = localStorage.getItem("collegeadda_token");
                    const res = await fetch(`${apiUrl}/api/stories`, {
                      method: 'POST',
                      headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ 
                        mediaUrl: base64String,
                        mediaType: file.type.startsWith('video') ? 'video' : 'image'
                      })
                    });
                    if (res.ok) {
                      setToastMsg("Story shared for 24 hours! 🌟");
                      setModal(null);
                      setTimeout(() => setToastMsg(""), 2000);
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Failed to post story");
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface border border-border/50 px-6 py-3 rounded-full shadow-2xl z-[120] animate-fade-in flex items-center space-x-2">
          <div className="bg-green-500/20 text-green-500 p-1 rounded-full">
            <Check size={14} strokeWidth={3} />
          </div>
          <span className="text-sm font-bold text-foreground whitespace-nowrap">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
