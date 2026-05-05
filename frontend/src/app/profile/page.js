"use client";
import { useEffect, useState } from "react";
import { LogOut, Edit3, X, Check, Plus, Grid, Heart, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import UniversityBadges from "@/components/UniversityBadges";

const MOCK_POSTS = [
  { id: 1, img: "https://picsum.photos/seed/post1/300/300", likes: 124, comments: 18 },
  { id: 2, img: "https://picsum.photos/seed/post2/300/300", likes: 89, comments: 42 },
  { id: 3, img: "https://picsum.photos/seed/post3/300/300", likes: 342, comments: 89 },
  { id: 4, img: "https://picsum.photos/seed/post4/300/300", likes: 56, comments: 12 },
  { id: 5, img: "https://picsum.photos/seed/post5/300/300", likes: 211, comments: 33 },
  { id: 6, img: "https://picsum.photos/seed/post6/300/300", likes: 178, comments: 27 },
];

const MOCK_FOLLOWERS = [
  { id: 1, name: "Priya Sharma", university: "Rishihood University", avatar: "https://i.pravatar.cc/150?u=priya1" },
  { id: 2, name: "Arjun Mehta", university: "Delhi University", avatar: "https://i.pravatar.cc/150?u=arjun1" },
  { id: 3, name: "Sneha Gupta", university: "Amity University", avatar: "https://i.pravatar.cc/150?u=sneha1" },
];

const MOCK_FOLLOWING = [
  { id: 4, name: "Ravi Kumar", university: "IIT Delhi", avatar: "https://i.pravatar.cc/150?u=ravi1" },
  { id: 5, name: "Asha Patel", university: "DTU", avatar: "https://i.pravatar.cc/150?u=asha1" },
];

const INTEREST_OPTIONS = ["Music 🎵", "Cricket 🏏", "Coding 💻", "Art 🎨", "Travel ✈️", "Gaming 🎮", "Books 📚", "Fitness 💪", "Movies 🎬", "Cooking 🍳"];
const SPORT_OPTIONS = ["Football ⚽", "Basketball 🏀", "Cricket 🏏", "Tennis 🎾", "Badminton 🏸", "Volleyball 🏐", "Table Tennis 🏓", "Athletics 🏃", "Swimming 🏊", "Chess ♟️"];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null); // 'followers' | 'following' | 'edit' | 'story' | 'post'
  const [activePost, setActivePost] = useState(null);
  const [editData, setEditData] = useState({ instaId: "", snapId: "", interests: [], sports: [] });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("collegeadda_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    const profile = JSON.parse(localStorage.getItem("collegeadda_profile") || "{}");
    setEditData({ instaId: profile.instaId || "", snapId: profile.snapId || "", interests: profile.interests || [], sports: profile.sports || [] });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/login");
  };

  const saveProfile = () => {
    localStorage.setItem("collegeadda_profile", JSON.stringify(editData));
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); }, 1200);
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

  const profile = JSON.parse(typeof window !== "undefined" ? (localStorage.getItem("collegeadda_profile") || "{}") : "{}");

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
              onClick={() => setModal("story")}
              className="cursor-pointer relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] flex-shrink-0 bg-gradient-to-tr from-pink-500 via-purple-500 to-orange-400 bg-[length:200%_200%] animate-[gradient_3s_ease_infinite] shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:scale-105 transition-transform"
            >
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-foreground border border-background">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-1 justify-between gap-2">
              <div className="flex flex-col items-center justify-center bg-surface/50 hover:bg-surface border border-white/5 hover:border-white/10 rounded-2xl py-2 px-2 flex-1 transition-all shadow-sm">
                <p className="text-lg font-bold bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">{MOCK_POSTS.length}</p>
                <p className="text-[10px] sm:text-xs text-muted font-medium">Posts</p>
              </div>
              <button 
                className="flex flex-col items-center justify-center bg-surface/50 hover:bg-surface border border-white/5 hover:border-white/10 rounded-2xl py-2 px-2 flex-1 transition-all shadow-sm group/btn" 
                onClick={() => setModal("followers")}
              >
                <p className="text-lg font-bold group-hover/btn:bg-gradient-to-br group-hover/btn:from-indigo-400 group-hover/btn:to-purple-400 group-hover/btn:bg-clip-text group-hover/btn:text-transparent transition-all">{
                  JSON.parse(typeof window !== "undefined" ? (localStorage.getItem("collegeadda_followers_list") || "[]") : "[]").length + MOCK_FOLLOWERS.length
                }</p>
                <p className="text-[10px] sm:text-xs text-muted font-medium">Followers</p>
              </button>
              <button 
                className="flex flex-col items-center justify-center bg-surface/50 hover:bg-surface border border-white/5 hover:border-white/10 rounded-2xl py-2 px-2 flex-1 transition-all shadow-sm group/btn" 
                onClick={() => setModal("following")}
              >
                <p className="text-lg font-bold group-hover/btn:bg-gradient-to-br group-hover/btn:from-indigo-400 group-hover/btn:to-purple-400 group-hover/btn:bg-clip-text group-hover/btn:text-transparent transition-all">{
                  JSON.parse(typeof window !== "undefined" ? (localStorage.getItem("collegeadda_following_list") || "[]") : "[]").length + MOCK_FOLLOWING.length
                }</p>
                <p className="text-[10px] sm:text-xs text-muted font-medium">Following</p>
              </button>
            </div>
          </div>

          {/* Name + Bio */}
          <div className="relative z-10 space-y-1">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">{user.name}</h2>
            <p className="text-sm text-muted/80 font-medium">
              {user.university}
              {profile.sports && profile.sports.length > 0 && ` • ${profile.sports.join(", ")}`}
            </p>

            {/* University Badges */}
            <div className="pt-1 pb-2">
              <UniversityBadges userId={user.id || user.email || "mock-user-123"} />
            </div>

            {/* Social Links */}
            {(profile.instaId || profile.snapId) && (
              <div className="flex flex-wrap gap-2 mt-2 pt-1">
                {profile.instaId && (
                  <a
                    href={`https://instagram.com/${profile.instaId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full text-white font-medium shadow-md hover:scale-105 hover:shadow-lg transition-all bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    <span>@{profile.instaId}</span>
                  </a>
                )}
                {profile.snapId && (
                  <a
                    href={`https://snapchat.com/add/${profile.snapId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full font-medium shadow-md hover:scale-105 hover:shadow-lg transition-all"
                    style={{ background: "#FFFC00", color: "#000" }}
                  >
                    <span className="text-sm">👻</span>
                    <span>{profile.snapId}</span>
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
          {MOCK_POSTS.map((post, idx) => (
            <motion.div 
              key={post.id} 
              whileHover={{ scale: 0.98 }}
              onClick={() => { setActivePost(post); setModal("post"); }}
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
              {[...MOCK_FOLLOWERS, ...JSON.parse(localStorage.getItem("collegeadda_followers_list") || "[]")].map((f, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{f.name}</p>
                    <p className="text-xs text-muted">{f.university}</p>
                  </div>
                  <button className="text-xs text-primary font-medium border border-primary/30 px-3 py-1 rounded-xl hover:bg-primary/10 transition-colors">
                    Follow back
                  </button>
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
              {[...MOCK_FOLLOWING, ...JSON.parse(localStorage.getItem("collegeadda_following_list") || "[]")].map((f, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
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
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">{user.name?.charAt(0)}</div>
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
      {modal === "post" && activePost && (
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
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">{user.name?.charAt(0)}</div>
                <span className="font-bold text-foreground text-sm">{user.name}</span>
              </div>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted" /></button>
            </div>
            {/* Image */}
            <div className="w-full bg-black flex-shrink-0 flex items-center justify-center">
              <img src={activePost.img} className="w-full max-h-[400px] object-contain" alt="Post" />
            </div>
            {/* Actions */}
            <div className="p-3 flex items-center justify-between border-b border-border/10">
              <div className="flex space-x-4">
                <Heart size={24} className="text-foreground hover:text-red-500 cursor-pointer transition-colors" />
                <MessageCircle size={24} className="text-foreground hover:text-blue-500 cursor-pointer transition-colors" />
                <Send size={24} className="text-foreground cursor-pointer" />
              </div>
              <div className="text-foreground font-bold text-sm">{activePost.likes} likes</div>
            </div>
            {/* Comments List (Mock) */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
               <div className="flex space-x-2">
                 <span className="font-bold text-sm">{user.name}</span>
                 <span className="text-sm text-foreground/90">Campus vibes! ☀️</span>
               </div>
               <div className="text-xs text-muted font-bold mt-2 mb-2">View all {activePost.comments} comments</div>
               <div className="flex space-x-2">
                 <span className="font-bold text-sm">Priya Sharma</span>
                 <span className="text-sm text-foreground/90">Amazing click! 😍</span>
               </div>
               <div className="flex space-x-2">
                 <span className="font-bold text-sm">Ravi Kumar</span>
                 <span className="text-sm text-foreground/90">Which block is this?</span>
               </div>
            </div>
            {/* Add comment */}
            <div className="p-3 border-t border-border/50 flex items-center space-x-2 bg-surface">
              <input type="text" placeholder="Add a comment..." className="flex-1 bg-transparent text-sm text-foreground focus:outline-none" />
              <button className="text-primary font-bold text-sm">Post</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
