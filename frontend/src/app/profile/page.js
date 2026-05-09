"use client";

import { useEffect, useState } from "react";
import { LogOut, Edit3, X, Check, Plus, Grid, Heart, MessageCircle, Send, ChevronLeft, ChevronRight, Share2, Ghost, MapPin, Zap, Star, Camera, Clock, Image as ImageIcon, Music, Code, Palette, Plane, Gamepad2, Book, Dumbbell, Film, Utensils, Trophy } from "lucide-react";

const InstagramIcon = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import UniversityBadges from "@/components/UniversityBadges";
import VerifiedBadge from "@/components/VerifiedBadge";
import clsx from "clsx";

const INTEREST_OPTIONS = [
  { name: "Music", icon: <Music size={12} /> },
  { name: "Cricket", icon: <Trophy size={12} /> },
  { name: "Coding", icon: <Code size={12} /> },
  { name: "Art", icon: <Palette size={12} /> },
  { name: "Travel", icon: <Plane size={12} /> },
  { name: "Gaming", icon: <Gamepad2 size={12} /> },
  { name: "Books", icon: <Book size={12} /> },
  { name: "Fitness", icon: <Dumbbell size={12} /> },
  { name: "Movies", icon: <Film size={12} /> },
  { name: "Cooking", icon: <Utensils size={12} /> }
];
const SPORT_OPTIONS = [
  { name: "Football", icon: <Trophy size={12} /> },
  { name: "Basketball", icon: <Trophy size={12} /> },
  { name: "Cricket", icon: <Trophy size={12} /> },
  { name: "Tennis", icon: <Trophy size={12} /> },
  { name: "Badminton", icon: <Trophy size={12} /> },
  { name: "Volleyball", icon: <Trophy size={12} /> },
  { name: "Table Tennis", icon: <Trophy size={12} /> },
  { name: "Athletics", icon: <Trophy size={12} /> },
  { name: "Swimming", icon: <Trophy size={12} /> },
  { name: "Chess", icon: <Trophy size={12} /> }
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [modal, setModal] = useState(null); 
  const [activePostIndex, setActivePostIndex] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [userStories, setUserStories] = useState([]);
  const [activeStories, setActiveStories] = useState([]);
  const [storyInput, setStoryInput] = useState({ imageUrl: "", caption: "" });
  const [storyUploading, setStoryUploading] = useState(false);
  const [viewingStoryIndex, setViewingStoryIndex] = useState(0);

  const [editData, setEditData] = useState({ profilePic: "", instaId: "", snapId: "", interests: [], sports: [] });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unfollowingId, setUnfollowingId] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      const stored = localStorage.getItem("collegeadda_user");
      const token = localStorage.getItem("collegeadda_token");
      if (!stored || !token) { router.push("/login"); return; }
      
      const u = JSON.parse(stored);
      setUser(u);
      
      try {
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

        const postsRes = await fetch(`${apiUrl}/api/posts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          const myPosts = postsData.filter(p => p.author?._id === u._id || p.author?._id === u.id);
          
          if (myPosts.length > 0) {
            setUserPosts(myPosts.map(p => ({
              id: p._id,
              img: p.mediaUrl || "https://picsum.photos/seed/fallback/300/300",
              content: p.content,
              likes: p.likes?.length || 0,
              isLiked: p.likes?.includes(u._id || u.id),
              comments: p.comments?.length || 0,
              commentsList: p.comments?.map(c => ({
                id: c._id || Math.random().toString(),
                author: c.user?.name || "Student",
                text: c.text
              })) || []
            })));
          }
        }

        // Load stories from localStorage (24-hour expiry)
        try {
          const storedStories = JSON.parse(localStorage.getItem("collegeadda_stories") || "[]");
          const now = Date.now();
          const validStories = storedStories.filter(s => now - s.createdAt < 24 * 60 * 60 * 1000);
          if (validStories.length !== storedStories.length) {
            localStorage.setItem("collegeadda_stories", JSON.stringify(validStories));
          }
          setActiveStories(validStories);
          setUserStories(validStories);
        } catch (e) {
          setActiveStories([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchProfileAndPosts();

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

  const handleUnfollow = async (targetUserId) => {
    if (unfollowingId) return;
    setUnfollowingId(targetUserId);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/users/${targetUserId}/follow`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFollowing(prev => prev.filter(f => f._id !== targetUserId));
        setToastMsg("Unfollowed successfully");
        setTimeout(() => setToastMsg(""), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUnfollowingId(null);
    }
  };

  const saveProfile = async () => {
    if (isSaving) return;
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const toggleInterest = (interestName) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestName)
        ? prev.interests.filter(i => i !== interestName)
        : [...prev.interests, interestName]
    }));
  };

  const toggleSport = (sportName) => {
    setEditData(prev => ({
      ...prev,
      sports: prev.sports.includes(sportName)
        ? prev.sports.filter(s => s !== sportName)
        : [...prev.sports, sportName]
    }));
  };

  const handleAddStory = () => {
    if (!storyInput.imageUrl.trim()) return;
    setStoryUploading(true);
    try {
      const newStory = {
        id: Date.now().toString(),
        imageUrl: storyInput.imageUrl,
        caption: storyInput.caption,
        createdAt: Date.now(),
        user: { name: user.name, profilePic: user.profilePic }
      };
      const existing = JSON.parse(localStorage.getItem("collegeadda_stories") || "[]");
      const updated = [newStory, ...existing];
      localStorage.setItem("collegeadda_stories", JSON.stringify(updated));
      setActiveStories(updated);
      setUserStories(updated);
      setStoryInput({ imageUrl: "", caption: "" });
      setModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setStoryUploading(false);
    }
  };

  const hasActiveStory = activeStories.length > 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-24 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/10 blur-[150px] rounded-full z-0" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Header - only show on mobile, sidebar handles desktop nav */}
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-xl font-black text-white tracking-tight"
        >
          {user.name?.split(" ")[0]}<span className="text-purple-500">.</span>
        </motion.h1>
        <div className="flex items-center space-x-3">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 glass rounded-2xl text-white/40 hover:text-white border border-white/10"
          >
            <Share2 size={20} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2.5 glass rounded-2xl text-red-500/50 hover:text-red-500 border border-white/10"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 pt-10 relative z-10 space-y-10">
        {/* Profile Stats Section */}
        <div className="flex flex-col items-center space-y-8">
          {/* Avatar Area */}
          <div className="relative group">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 gradient-bg rounded-[3rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity" 
            />
            {/* Story Ring */}
            {hasActiveStory && (
              <div className="absolute -inset-1.5 rounded-[3rem] p-[3px] z-10 pointer-events-none"
                style={{ background: "conic-gradient(from 0deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #a855f7, #7c3aed, #f09433)" }}
              >
                <div className="w-full h-full rounded-[2.7rem] bg-[#0A0A0F]" />
              </div>
            )}
            <div className="relative w-32 h-32 rounded-[2.8rem] p-[3px] gradient-bg shadow-2xl z-20">
              <div 
                onClick={() => hasActiveStory ? setModal("viewStory") : null}
                className={`w-full h-full rounded-[2.7rem] bg-[#0A0A0F] flex items-center justify-center overflow-hidden ${hasActiveStory ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
              >
                {user.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7C3AED&color=fff`; }}
                  />
                ) : (
                  <span className="text-4xl font-black text-white">{user.name?.charAt(0)}</span>
                )}
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setModal("uploadChoice")}
                className="absolute -bottom-2 -right-2 w-10 h-10 gradient-bg rounded-2xl border-4 border-[#0A0A0F] flex items-center justify-center text-white shadow-xl z-30"
              >
                <Plus size={20} strokeWidth={3} />
              </motion.button>
            </div>
          </div>

          {/* User Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <h2 className="text-3xl font-black text-white tracking-tighter">{user.name}</h2>
              <VerifiedBadge user={user} size={22} />
            </div>
            <div className="flex items-center justify-center space-x-2 text-purple-400 font-bold uppercase tracking-[0.2em] text-[10px]">
              <MapPin size={12} className="text-purple-500" />
              <span>{user.university}</span>
            </div>
          </div>

          {/* Stat Pills */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {[
              { label: "Posts", value: userPosts.length },
              { label: "Followers", value: followers.length, action: () => setModal("followers") },
              { label: "Following", value: following.length, action: () => setModal("following") }
            ].map((stat, i) => (
              <motion.button
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                onClick={stat.action}
                className="glass-card p-4 rounded-3xl border border-white/5 hover:border-white/20 transition-all group text-center"
              >
                <p className="text-2xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform">{stat.value}</p>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{stat.label}</p>
              </motion.button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 w-full">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModal("edit")}
              className="flex-1 gradient-bg py-4 rounded-2xl text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-purple-500/20"
            >
              Edit Profile
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 glass rounded-2xl text-white/40 border border-white/10"
            >
              <Zap size={20} />
            </motion.button>
          </div>
        </div>

        {/* Connections & Socials */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Campus Socials</h3>
            <UniversityBadges userId={user.id || user.email} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {user.instagram && (
              <motion.a 
                whileHover={{ y: -4 }}
                href={`https://instagram.com/${user.instagram}`}
                className="glass-card p-4 rounded-3xl border border-white/5 flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-2xl flex items-center justify-center text-white">
                  <InstagramIcon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Instagram</p>
                  <p className="text-sm font-black text-white truncate leading-none">@{user.instagram}</p>
                </div>
              </motion.a>
            )}
            {user.snapchat && (
              <motion.a 
                whileHover={{ y: -4 }}
                href={`https://snapchat.com/add/${user.snapchat}`}
                className="glass-card p-4 rounded-3xl border border-white/5 flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-[#FFFC00] rounded-2xl flex items-center justify-center text-black">
                  <Ghost size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Snapchat</p>
                  <p className="text-sm font-black text-black truncate leading-none">{user.snapchat}</p>
                </div>
              </motion.a>
            )}
          </div>
        </div>

        {/* Interests & Sports */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center">
              <Star size={12} className="mr-2 text-yellow-500" /> Interests & Sports
            </h3>
            <div className="flex flex-wrap gap-2">
              {(user.interests || []).map((i, idx) => (
                <span key={idx} className="glass px-4 py-2 rounded-full text-[11px] font-bold text-white/60 border border-white/5 hover:border-purple-500/30 hover:text-purple-400 transition-all flex items-center space-x-2">
                  <Star size={10} className="text-purple-400" />
                  <span>{i}</span>
                </span>
              ))}
              {(user.sports || []).map((s, idx) => (
                <span key={idx} className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center space-x-2">
                  <Trophy size={10} />
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Post Grid Section */}
        <div className="space-y-6 pb-10">
          <div className="flex items-center justify-between border-t border-white/5 pt-8">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Memories</h3>
            <Grid size={16} className="text-white/20" />
          </div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-3 gap-2"
          >
            {userPosts.length === 0 ? (
              <div className="col-span-3 py-20 glass-card rounded-[2.5rem] border-white/5 border-dashed text-center">
                <p className="text-xl font-black text-white/10">No Posts Yet</p>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-2">Your story starts here</p>
              </div>
            ) : (
              userPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { scale: 0.8, opacity: 0 },
                    visible: { scale: 1, opacity: 1 }
                  }}
                  whileHover={{ scale: 0.98 }}
                  onClick={() => { setActivePostIndex(idx); setModal("post"); }}
                  className="aspect-square rounded-[1.5rem] overflow-hidden relative group cursor-pointer border border-white/5"
                >
                  <img src={post.img} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-purple-600/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-4">
                    <div className="flex items-center text-white text-xs font-black">
                      <Heart size={14} className="fill-white mr-1" /> {post.likes}
                    </div>
                    <div className="flex items-center text-white text-xs font-black">
                      <MessageCircle size={14} className="fill-white mr-1" /> {post.comments}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl px-6 py-3 rounded-full text-sm font-bold text-white"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* Followers/Following Modal */}
        {(modal === "followers" || modal === "following") && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md glass-card rounded-[3rem] border border-white/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black text-white capitalize">{modal}</h3>
                <button onClick={() => setModal(null)} className="p-2 glass rounded-full text-white/30"><X size={20} /></button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {(modal === "followers" ? followers : following).length === 0 ? (
                  <div className="py-10 text-center text-white/20 font-bold uppercase tracking-widest text-[10px]">No connections yet</div>
                ) : (
                  (modal === "followers" ? followers : following).map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-[2rem] transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full p-[1.5px] gradient-bg">
                          <img 
                            src={f.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=7C3AED&color=fff`} 
                            className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0F]" 
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white flex items-center">{f.name} <VerifiedBadge user={f} size={14} className="ml-1" /></p>
                          <p className="text-[10px] text-white/30 font-bold uppercase">{f.university}</p>
                        </div>
                      </div>
                      {modal === "following" && (
                        <button 
                          onClick={() => handleUnfollow(f._id)}
                          disabled={unfollowingId === f._id}
                          className="px-4 py-2 glass rounded-xl text-[10px] font-black uppercase text-red-400 border border-red-500/10 disabled:opacity-50"
                        >
                          {unfollowingId === f._id ? "..." : "Unfollow"}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Modal */}
        {modal === "edit" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md glass-card rounded-[3rem] border border-white/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Edit Vibe</h3>
                <button onClick={() => setModal(null)} className="p-2 glass rounded-full text-white/30"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                {/* Interests */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(i => (
                      <button
                        key={i.name}
                        onClick={() => toggleInterest(i.name)}
                        className={clsx(
                          "px-4 py-2 rounded-full text-[10px] font-bold transition-all border flex items-center space-x-2",
                          editData.interests.includes(i.name) ? "gradient-bg text-white border-transparent" : "glass text-white/40 border-white/5"
                        )}
                      >
                        {i.icon}
                        <span>{i.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sports */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Sports</label>
                  <div className="flex flex-wrap gap-2">
                    {SPORT_OPTIONS.map(s => (
                      <button
                        key={s.name}
                        onClick={() => toggleSport(s.name)}
                        className={clsx(
                          "px-4 py-2 rounded-full text-[10px] font-bold transition-all border flex items-center space-x-2",
                          editData.sports.includes(s.name) ? "bg-yellow-500 text-black border-transparent font-black" : "glass text-white/40 border-white/5"
                        )}
                      >
                        {s.icon}
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveProfile}
                  disabled={isSaving}
                  className="w-full gradient-bg py-5 rounded-[2rem] text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-purple-500/20 disabled:opacity-50 flex justify-center items-center h-16"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : saved ? (
                    "Saved!"
                  ) : (
                    "Update Profile"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Post Detail Modal */}
        {modal === "post" && activePostIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-card rounded-[3rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Post Header */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl p-[1.5px] gradient-bg">
                    <img src={user.profilePic} className="w-full h-full rounded-[0.9rem] object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{user.name}</p>
                    <p className="text-[10px] text-white/30 font-bold uppercase">Memories</p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-2 glass rounded-full text-white/30"><X size={20} /></button>
              </div>

              {/* Post Image */}
              <div className="relative aspect-square">
                 <img src={userPosts[activePostIndex].img} className="w-full h-full object-cover" />
                 {/* Navigation buttons */}
                 <div className="absolute inset-y-0 left-0 flex items-center px-2">
                   <button onClick={(e) => { e.stopPropagation(); if(activePostIndex > 0) setActivePostIndex(activePostIndex-1); }} className="p-2 glass rounded-full text-white/50 hover:text-white"><ChevronLeft size={20}/></button>
                 </div>
                 <div className="absolute inset-y-0 right-0 flex items-center px-2">
                   <button onClick={(e) => { e.stopPropagation(); if(activePostIndex < userPosts.length-1) setActivePostIndex(activePostIndex+1); }} className="p-2 glass rounded-full text-white/50 hover:text-white"><ChevronRight size={20}/></button>
                 </div>
              </div>

              {/* Post Actions */}
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Heart size={24} className={clsx("cursor-pointer transition-all", userPosts[activePostIndex].isLiked ? "text-red-500 fill-red-500 scale-110" : "text-white/40 hover:text-red-500")} />
                    <MessageCircle size={24} className="text-white/40 hover:text-purple-400" />
                    <Send size={24} className="text-white/40 hover:text-cyan-400" />
                  </div>
                  <div className="text-xs font-black text-white/30 uppercase tracking-widest">{userPosts[activePostIndex].likes} Vibes</div>
                </div>
                
                <div className="space-y-4">
                   <p className="text-sm text-white/80 leading-relaxed font-medium">
                     <span className="font-black mr-2">{user.name}</span>
                     {userPosts[activePostIndex].content || "No caption provided."}
                   </p>
                   
                   <div className="space-y-3 pt-4 border-t border-white/5">
                      {userPosts[activePostIndex].commentsList.map(c => (
                        <div key={c.id} className="flex items-start space-x-2 text-sm">
                          <span className="font-black text-white whitespace-nowrap">{c.author}</span>
                          <span className="text-white/60">{c.text}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Add Comment Input */}
              <div className="p-4 glass-panel border-t border-white/5 flex items-center space-x-3">
                 <input 
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder="Drop a vibe..."
                  className="flex-1 bg-transparent text-sm text-white focus:outline-none font-medium"
                 />
                 <button className="text-purple-500 font-black uppercase text-[10px] tracking-widest">Post</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ====== UPLOAD CHOICE MODAL ====== */}
        {modal === "uploadChoice" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-[#111118] border border-white/10 rounded-[2.5rem] p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-center text-lg font-black text-white tracking-tight mb-2">What do you want to add?</h3>
              <button
                onClick={() => setModal("editPic")}
                className="w-full flex items-center space-x-4 p-5 glass-card rounded-2xl border border-white/5 hover:border-purple-500/40 transition-all group"
              >
                <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Camera size={22} />
                </div>
                <div className="text-left">
                  <p className="font-black text-white text-sm">Profile Picture</p>
                  <p className="text-[11px] text-white/40 font-medium mt-0.5">Visible to everyone, always</p>
                </div>
              </button>
              <button
                onClick={() => setModal("addStory")}
                className="w-full flex items-center space-x-4 p-5 glass-card rounded-2xl border border-white/5 hover:border-pink-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #f09433, #dc2743, #bc1888)" }}
                >
                  <ImageIcon size={22} />
                </div>
                <div className="text-left">
                  <p className="font-black text-white text-sm">Add Story</p>
                  <p className="text-[11px] text-white/40 font-medium mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> Disappears after 24 hours
                  </p>
                </div>
              </button>
              <button onClick={() => setModal(null)} className="w-full py-3 text-white/30 text-sm font-bold">Cancel</button>
            </motion.div>
          </motion.div>
        )}

        {/* ====== EDIT PROFILE PIC MODAL ====== */}
        {modal === "editPic" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-[#111118] border border-white/10 rounded-[2.5rem] p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Update Profile Picture</h3>
                <button onClick={() => setModal(null)} className="p-2 glass rounded-full text-white/30"><X size={18} /></button>
              </div>
              {/* Preview */}
              {editData.profilePic && (
                <div className="flex justify-center">
                  <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-2 border-purple-500/50 shadow-xl">
                    <img src={editData.profilePic} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {/* File picker button */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setEditData(prev => ({ ...prev, profilePic: reader.result }));
                    reader.readAsDataURL(file);
                  }}
                />
                <div className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-all">
                  <Camera size={32} className="text-purple-400" />
                  <p className="text-sm font-black text-white/60">Tap to choose from gallery</p>
                  <p className="text-[10px] text-white/30">JPG, PNG, WEBP — visible to everyone</p>
                </div>
              </label>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={saveProfile}
                disabled={!editData.profilePic}
                className="w-full gradient-bg py-4 rounded-2xl text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-purple-500/20 disabled:opacity-40"
              >
                {saved ? "Saved! ✅" : "Save Picture"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ====== ADD STORY MODAL ====== */}
        {modal === "addStory" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-[#111118] border border-white/10 rounded-[2.5rem] p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Add Story</h3>
                  <p className="text-[11px] text-white/30 font-medium flex items-center gap-1 mt-0.5"><Clock size={10} /> Visible for 24 hours only</p>
                </div>
                <button onClick={() => setModal(null)} className="p-2 glass rounded-full text-white/30"><X size={18} /></button>
              </div>
              {/* Preview */}
              {storyInput.imageUrl && (
                <div className="relative w-full aspect-[9/16] max-h-64 rounded-2xl overflow-hidden border border-white/10">
                  <img src={storyInput.imageUrl} className="w-full h-full object-cover" />
                  {storyInput.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm font-bold text-center">{storyInput.caption}</p>
                    </div>
                  )}
                </div>
              )}
              {/* File picker */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setStoryInput(prev => ({ ...prev, imageUrl: reader.result }));
                    reader.readAsDataURL(file);
                  }}
                />
                {!storyInput.imageUrl ? (
                  <div className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 transition-all">
                    <ImageIcon size={32} className="text-pink-400" />
                    <p className="text-sm font-black text-white/60">Tap to choose from gallery</p>
                    <p className="text-[10px] text-white/30">JPG, PNG, WEBP — disappears in 24h</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-pink-400 text-center font-bold">Tap to change photo</p>
                )}
              </label>
              <div className="space-y-1">
                <label className="text-[11px] text-white/30 font-bold uppercase tracking-widest">Caption (optional)</label>
                <input
                  value={storyInput.caption}
                  onChange={e => setStoryInput(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Write something..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors placeholder-white/20"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddStory}
                disabled={storyUploading || !storyInput.imageUrl.trim()}
                className="w-full py-4 rounded-2xl text-sm font-black text-white uppercase tracking-widest shadow-xl disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #f09433, #dc2743, #bc1888)" }}
              >
                {storyUploading ? "Adding..." : "Share Story"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ====== VIEW STORY MODAL ====== */}
        {modal === "viewStory" && activeStories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black flex items-center justify-center"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm h-full max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Progress bars */}
              <div className="absolute top-4 left-4 right-4 z-20 flex space-x-1">
                {activeStories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                    <div className={`h-full bg-white rounded-full transition-all duration-300 ${i < viewingStoryIndex ? 'w-full' : i === viewingStoryIndex ? 'w-1/2' : 'w-0'}`} />
                  </div>
                ))}
              </div>
              {/* Header */}
              <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white">
                    {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-bg flex items-center justify-center text-white font-black text-sm">{user.name?.charAt(0)}</div>}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{user.name}</p>
                    <p className="text-white/60 text-[10px] flex items-center gap-1">
                      <Clock size={9} />
                      {Math.round((Date.now() - activeStories[viewingStoryIndex]?.createdAt) / 60000)}m ago · expires in {Math.round((24 * 60 - (Date.now() - activeStories[viewingStoryIndex]?.createdAt) / 60000))}m
                    </p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-2 bg-white/10 rounded-full text-white"><X size={18} /></button>
              </div>
              {/* Story Image */}
              <div className="w-full h-full rounded-3xl overflow-hidden relative">
                <img src={activeStories[viewingStoryIndex]?.imageUrl} className="w-full h-full object-cover" />
                {activeStories[viewingStoryIndex]?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold text-center text-base">{activeStories[viewingStoryIndex].caption}</p>
                  </div>
                )}
                {/* Tap zones */}
                <button className="absolute left-0 top-0 w-1/3 h-full" onClick={() => setViewingStoryIndex(Math.max(0, viewingStoryIndex - 1))} />
                <button className="absolute right-0 top-0 w-1/3 h-full" onClick={() => viewingStoryIndex < activeStories.length - 1 ? setViewingStoryIndex(viewingStoryIndex + 1) : setModal(null)} />
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
