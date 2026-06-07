"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Grid, Heart, MessageCircle, Share2, MapPin, Zap, Star, Code, Send, Trophy, Ghost, Music, Palette, Gamepad2, Briefcase, Film, Camera, Book, Plus, Loader2, Image as ImageIcon, X } from "lucide-react";

import VerifiedBadge from "@/components/VerifiedBadge";
import UniversityBadges from "@/components/UniversityBadges";
import { extractInstagramUsername, extractGenericUsername } from "@/utils/socials";
import clsx from "clsx";

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function UserProfilePage({ params }) {
  const router = useRouter();
  // Unwrap params using React.use() as per Next.js 15 best practices
  const resolvedParams = use(params);
  const targetUserId = resolvedParams.userId;

  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectStatus, setConnectStatus] = useState("idle");

  const [modal, setModal] = useState(null);
  const [activePostIndex, setActivePostIndex] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem("collegeadda_user");
      const token = localStorage.getItem("collegeadda_token");
      if (!stored || !token) { router.push("/login"); return; }
      const me = JSON.parse(stored);
      setCurrentUser(me);

      try {
        // Fetch target user profile
        const userRes = await fetch(`${apiUrl}/api/users/${targetUserId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setProfileUser(userData);
          setFollowers(userData.followers || []);
          setFollowing(userData.following || []);
          
          // Check connect status
          if (me._id === userData._id || me.id === userData._id) {
            setConnectStatus("self");
          } else {
            // Re-fetch my full profile to check following array
            const myRes = await fetch(`${apiUrl}/api/users/profile`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (myRes.ok) {
              const myData = await myRes.json();
              if (myData.following && myData.following.includes(userData._id)) {
                setConnectStatus("connected");
              } else if (userData.connectionRequests && userData.connectionRequests.includes(me._id || me.id)) {
                 setConnectStatus("pending");
              } else {
                 setConnectStatus("idle");
              }
            }
          }
        } else {
          setError("User not found");
        }

        // Fetch posts
        const postsRes = await fetch(`${apiUrl}/api/posts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (postsRes.ok) {
          const allPosts = await postsRes.json();
          const pPosts = allPosts.filter(p => p.author?._id === targetUserId || p.author?.id === targetUserId);
          setUserPosts(pPosts.map(p => ({
            id: p._id,
            img: p.mediaUrl || "https://picsum.photos/seed/fallback/300/300",
            content: p.content,
            likes: p.likes?.length || 0,
            comments: p.comments?.length || 0,
          })));
        }
      } catch (err) {
        console.error(err);
        setError("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [targetUserId, router]);

  const handleConnectAction = async () => {
    if (connectStatus !== "idle") return;
    setConnectStatus("connecting");
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/users/${profileUser._id}/follow`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Just mock it to connected for immediate feedback
        setConnectStatus("connected");
        setFollowers(prev => [...prev, currentUser._id]);
      } else {
        setConnectStatus("idle");
      }
    } catch (err) {
      console.error(err);
      setConnectStatus("idle");
    }
  };

  const handleDirectMessage = () => {
    router.push(`/messages?userId=${profileUser._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="animate-spin text-purple-500" />
        <p className="text-xs font-black uppercase tracking-widest text-white/30">Loading Profile...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/30">
          <Ghost size={30} />
        </div>
        <p className="text-sm font-bold text-white/50">{error || "User not found"}</p>
        <button onClick={() => router.back()} className="px-6 py-2 glass rounded-full text-xs font-black uppercase text-white hover:bg-white/10 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const isSelf = connectStatus === "self";

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative overflow-x-hidden pb-20">
      {/* Background Decorative Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[150px] rounded-full z-0 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full z-0 pointer-events-none" />

      {/* Top Nav */}
      <div className="fixed top-0 inset-x-0 z-50 p-4 flex items-center justify-between pointer-events-none">
        <button onClick={() => router.back()} className="p-3 glass rounded-full text-white pointer-events-auto hover:bg-white/10 transition-colors shadow-lg backdrop-blur-md">
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="max-w-xl mx-auto relative z-10">
        {/* --- SECTION 1: HERO / BANNER --- */}
        <div className="relative">
          <div className="h-[140px] md:h-[180px] w-full bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 relative">
            <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
            <div className="relative group">
              <div className="w-[120px] h-[120px] rounded-full p-1 bg-[#0A0A0F] shadow-2xl">
                <img 
                  src={profileUser.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=7C3AED&color=fff`} 
                  className="w-full h-full rounded-full object-cover border-[4px] border-transparent"
                  style={{ background: 'linear-gradient(#0A0A0F, #0A0A0F) padding-box, linear-gradient(to right bottom, #a855f7, #06b6d4) border-box' }}
                  alt={profileUser.name}
                />
              </div>
              {profileUser.rank && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[13px] font-black px-3 py-1 rounded-full border-[3px] border-[#0A0A0F] shadow-lg">
                  #{profileUser.rank}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- SECTION 2: USER IDENTITY --- */}
        <div className="pt-16 px-6 text-center space-y-3">
          <div className="flex justify-center">
            <span className="bg-white/5 text-cyan-300 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-cyan-500/20 shadow-sm cursor-default inline-block">
              {profileUser.badgeTitle || "Verified Student"}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <h2 className="text-3xl font-black text-white tracking-tighter">{profileUser.name}</h2>
            <VerifiedBadge user={profileUser} size={22} />
          </div>

          {profileUser.bio && (
            <p className="text-sm text-white/60 italic font-medium max-w-sm mx-auto">"{profileUser.bio}"</p>
          )}

          <div className="flex flex-col items-center gap-1.5 pt-2">
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider flex items-center justify-center gap-1 hover:text-purple-400 transition-colors cursor-pointer" onClick={() => router.push('/explore')}>
              <MapPin size={12} /> {profileUser.university || "Campus Adda"}
            </p>
            <p className="text-[11px] font-bold text-cyan-400/80 mt-1 uppercase tracking-wider">
              {[profileUser.course, profileUser.studyYear || profileUser.year, profileUser.passOutBatch ? `Batch of ${profileUser.passOutBatch}` : ""].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>

        {/* --- SECTION 3: STATS ROW --- */}
        <div className="px-6 mt-8">
          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="glass-card p-4 rounded-3xl border border-white/5 text-center flex flex-col justify-center cursor-default hover:bg-white/5 transition-colors">
              <p className="text-2xl font-black text-white tracking-tighter">{userPosts.length}</p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Posts</p>
            </div>
            <button onClick={() => setModal("followers")} className="glass-card p-4 rounded-3xl border border-white/5 text-center flex flex-col justify-center hover:bg-white/10 transition-colors hover:scale-[1.02]">
              <p className="text-2xl font-black text-white tracking-tighter">{followers.length}</p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Followers</p>
            </button>
            <button onClick={() => setModal("following")} className="glass-card p-4 rounded-3xl border border-white/5 text-center flex flex-col justify-center hover:bg-white/10 transition-colors hover:scale-[1.02]">
              <p className="text-2xl font-black text-white tracking-tighter">{following.length}</p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Following</p>
            </button>
          </div>
        </div>

        {/* --- SECTION 4: ACTION BUTTONS --- */}
        <div className="px-6 mt-6 flex gap-3">
          {isSelf ? (
            <>
              <button onClick={() => router.push('/profile')} className="flex-1 gradient-bg py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-xl border border-white/10 hover:scale-[1.02] transition-transform">
                ✏️ Edit Profile
              </button>
              <button onClick={() => {
                navigator.share ? navigator.share({ title: 'Campus Adda', url: window.location.href }) : alert('Copy link: ' + window.location.href);
              }} className="p-4 glass rounded-2xl text-white/50 border border-white/10 hover:text-white transition-colors">
                <Share2 size={18} />
              </button>
            </>
          ) : connectStatus === "connected" ? (
            <>
              <button onClick={handleDirectMessage} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                💬 Chat Now
              </button>
              <div className="flex-1 glass py-4 rounded-2xl text-[11px] font-black text-white/40 uppercase tracking-widest text-center border border-white/5 flex items-center justify-center gap-2 cursor-default">
                👥 Squad ✓
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={handleConnectAction}
                disabled={connectStatus !== "idle"}
                className={clsx(
                  "flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                  connectStatus === "pending" ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed" : "gradient-bg text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02]"
                )}
              >
                {connectStatus === "idle" && "⚡ Connect"}
                {connectStatus === "connecting" && <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> ...</span>}
                {connectStatus === "pending" && "⏳ Request Sent"}
              </button>
              <button onClick={() => {
                navigator.share ? navigator.share({ title: `Campus Adda: ${profileUser.name}`, url: window.location.href }) : alert('Copy link: ' + window.location.href);
              }} className="p-4 glass rounded-2xl text-white/50 border border-white/10 hover:text-white transition-colors hover:scale-[1.02]">
                <Share2 size={18} />
              </button>
            </>
          )}
        </div>

        {/* --- SECTION 5: CAMPUS SOCIALS --- */}
        {(profileUser.instagram || profileUser.linkedin || profileUser.github || profileUser.snapchat) && (
          <div className="px-6 mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Campus Socials</h3>
              <UniversityBadges userId={profileUser._id} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {profileUser.instagram && (
                <a href={profileUser.instagram.includes('http') ? profileUser.instagram : `https://instagram.com/${profileUser.instagram}`} target="_blank" rel="noopener noreferrer" className="glass-card p-4 rounded-3xl border border-white/5 flex items-center space-x-3 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-2xl flex items-center justify-center text-white shrink-0">
                    <InstagramIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Instagram</p>
                    <p className="text-[13px] font-black text-white truncate leading-none mt-0.5">{extractInstagramUsername(profileUser.instagram)}</p>
                  </div>
                </a>
              )}
              {profileUser.linkedin && (
                <a href={profileUser.linkedin} target="_blank" rel="noopener noreferrer" className="glass-card p-4 rounded-3xl border border-white/5 flex items-center space-x-3 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-[#0A66C2] rounded-2xl flex items-center justify-center text-white shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">LinkedIn</p>
                    <p className="text-[13px] font-black text-white truncate leading-none mt-0.5">View Profile →</p>
                  </div>
                </a>
              )}
              {profileUser.github && (
                <a href={profileUser.github} target="_blank" rel="noopener noreferrer" className="glass-card p-4 rounded-3xl border border-white/5 flex items-center space-x-3 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black shrink-0">
                    <Code size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">GitHub</p>
                    <p className="text-[13px] font-black text-white truncate leading-none mt-0.5">{extractGenericUsername(profileUser.github, 'github.com') || 'Profile →'}</p>
                  </div>
                </a>
              )}
              {profileUser.snapchat && (
                <a href={`https://snapchat.com/add/${profileUser.snapchat}`} target="_blank" rel="noopener noreferrer" className="glass-card p-4 rounded-3xl border border-white/5 flex items-center space-x-3 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-[#FFFC00] rounded-2xl flex items-center justify-center text-black shrink-0">
                    <Ghost size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Snapchat</p>
                    <p className="text-[13px] font-black text-white truncate leading-none mt-0.5">{profileUser.snapchat}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* --- SECTION 6: INTERESTS & SPORTS --- */}
        {((profileUser.interests && profileUser.interests.length > 0) || (profileUser.sports && profileUser.sports.length > 0)) && (
          <div className="px-6 mt-10">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              ✨ Interests & Sports
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {(profileUser.interests || []).map(int => (
                <span key={int} className="glass px-4 py-2 rounded-full text-[11px] font-bold text-white/70 border border-white/5 flex items-center gap-1.5 hover:border-purple-500/30 hover:text-purple-400 transition-colors cursor-default">
                  💡 {int}
                </span>
              ))}
              {(profileUser.sports || []).map(sport => (
                <span key={sport} className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-default">
                  <Trophy size={11} /> {sport}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* --- SECTION 8: CAMPUS VIBE --- */}
        {userPosts.length > 5 && (
          <div className="px-6 mt-10">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">🔥 Campus Vibe</h3>
            <div className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-4 cursor-default hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-white">Frequent Poster</p>
                <p className="text-[11px] text-white/50 mt-1">Regularly posts on campus feed and engages with peers.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- SECTION 7: MEMORIES / POSTS --- */}
        <div className="px-6 mt-10 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
              📸 Memories
            </h3>
            <Grid size={16} className="text-white/20" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {userPosts.length === 0 ? (
              <div className="col-span-3 py-16 glass-card rounded-[2rem] border-white/5 border-dashed text-center mt-2">
                <ImageIcon size={30} className="mx-auto text-white/10 mb-3" />
                <p className="text-[13px] font-black text-white/30">No memories yet 📷</p>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Check back later</p>
              </div>
            ) : (
              userPosts.map((post, idx) => (
                <div key={post.id} onClick={() => { setActivePostIndex(idx); setModal("post"); }} className="aspect-square rounded-[1rem] sm:rounded-[1.25rem] overflow-hidden relative group cursor-pointer border border-white/5">
                  <img src={post.img} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <div className="flex items-center text-white text-[10px] font-black">
                      <Heart size={12} className="fill-white mr-1" /> {post.likes}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* Followers/Following Modal (Simple view for external users) */}
        {(modal === "followers" || modal === "following") && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div 
              initial={{ y: 100, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.95 }}
              className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 glass-card sm:rounded-[2.5rem] bg-[#0A0A0F]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{modal}</h3>
                <button onClick={() => setModal(null)} className="p-2 glass rounded-full text-white/30 hover:text-white transition-colors bg-white/5"><X size={16} /></button>
              </div>
              <div className="p-10 text-center text-white/30">
                <p className="text-xs font-bold">List is hidden for privacy</p>
                <p className="text-[10px] mt-1">You must be connected to view this.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
