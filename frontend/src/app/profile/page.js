"use client";

import { useEffect, useState } from "react";
import { LogOut, Edit3, X, Check, Plus, Grid, Heart, MessageCircle, Send, ChevronLeft, ChevronRight, Share2, Ghost, MapPin, Zap, Star } from "lucide-react";

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

const INTEREST_OPTIONS = ["Music 🎵", "Cricket 🏏", "Coding 💻", "Art 🎨", "Travel ✈️", "Gaming 🎮", "Books 📚", "Fitness 💪", "Movies 🎬", "Cooking 🍳"];
const SPORT_OPTIONS = ["Football ⚽", "Basketball 🏀", "Cricket 🏏", "Tennis 🎾", "Badminton 🏸", "Volleyball 🏐", "Table Tennis 🏓", "Athletics 🏃", "Swimming 🏊", "Chess ♟️"];

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
  
  const [editData, setEditData] = useState({ profilePic: "", instaId: "", snapId: "", interests: [], sports: [] });
  const [saved, setSaved] = useState(false);

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

        const storyRes = await fetch(`${apiUrl}/api/stories/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (storyRes.ok) {
          const storiesData = await storyRes.json();
          setUserStories(storiesData);
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
    }
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

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-24 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/10 blur-[150px] rounded-full z-0" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
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
            <div className="relative w-32 h-32 rounded-[2.8rem] p-[3px] gradient-bg shadow-2xl">
              <div 
                onClick={() => setModal("story")}
                className="w-full h-full rounded-[2.7rem] bg-[#0A0A0F] flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform"
              >
                {user.profilePic ? (
                  <img src={user.profilePic} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-white">{user.name?.charAt(0)}</span>
                )}
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setModal("edit")}
                className="absolute -bottom-2 -right-2 w-10 h-10 gradient-bg rounded-2xl border-4 border-[#0A0A0F] flex items-center justify-center text-white shadow-xl"
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
                <span key={idx} className="glass px-4 py-2 rounded-full text-[11px] font-bold text-white/60 border border-white/5 hover:border-purple-500/30 hover:text-purple-400 transition-all">
                  {i}
                </span>
              ))}
              {(user.sports || []).map((s, idx) => (
                <span key={idx} className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider">
                  {s}
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
                          className="px-4 py-2 glass rounded-xl text-[10px] font-black uppercase text-red-400 border border-red-500/10"
                        >
                          Unfollow
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
                {/* Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Profile Avatar URL</label>
                    <input 
                      value={editData.profilePic}
                      onChange={e => setEditData({...editData, profilePic: e.target.value})}
                      className="w-full glass border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                      placeholder="Paste image link..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Instagram</label>
                      <input 
                        value={editData.instaId}
                        onChange={e => setEditData({...editData, instaId: e.target.value})}
                        className="w-full glass border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                        placeholder="@username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Snapchat</label>
                      <input 
                        value={editData.snapId}
                        onChange={e => setEditData({...editData, snapId: e.target.value})}
                        className="w-full glass border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                        placeholder="snap_user"
                      />
                    </div>
                  </div>
                </div>

                {/* Option Toggles */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Interests</label>
                   <div className="flex flex-wrap gap-2">
                     {INTEREST_OPTIONS.map(i => (
                       <button
                        key={i}
                        onClick={() => toggleInterest(i)}
                        className={clsx(
                          "px-4 py-2 rounded-full text-[10px] font-bold transition-all border",
                          editData.interests.includes(i) ? "gradient-bg text-white border-transparent" : "glass text-white/40 border-white/5"
                        )}
                       >
                         {i}
                       </button>
                     ))}
                   </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveProfile}
                  className="w-full gradient-bg py-5 rounded-[2rem] text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-purple-500/20"
                >
                  {saved ? "Saved! ⚡" : "Update Profile"}
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
      </AnimatePresence>
    </div>
  );
}
