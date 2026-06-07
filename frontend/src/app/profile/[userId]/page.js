"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Grid, Heart, MessageCircle, Share2, MapPin,
  Zap, Code, Trophy, Ghost, Briefcase, Loader2, Image as ImageIcon, X,
  Send, BookOpen
} from "lucide-react";

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

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function UserProfilePage({ params }) {
  const router = useRouter();
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

  // modal: null | "followers" | "following" | "post"
  const [modal, setModal] = useState(null);
  const [activePostIndex, setActivePostIndex] = useState(null);

  // Post lightbox state
  const [postLiking, setPostLiking] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentSending, setCommentSending] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  /* ─────────────────────────── init ─────────────────────────── */
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

          if (me._id === userData._id || me.id === userData._id) {
            setConnectStatus("self");
          } else {
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
          const me2 = JSON.parse(stored);
          const pPosts = allPosts.filter(p => p.author?._id === targetUserId || p.author?.id === targetUserId);
          setUserPosts(pPosts.map(p => ({
            id: p._id,
            img: p.mediaUrl || "",
            content: p.content || "",
            author: p.author,
            createdAt: p.createdAt,
            likes: p.likes?.length || 0,
            isLiked: !!(p.likes?.includes(me2._id || me2.id)),
            likeIds: p.likes || [],
            comments: (p.comments || []).map(c => ({
              id: c._id || Math.random().toString(),
              user: c.user,
              text: c.text,
              createdAt: c.createdAt
            })),
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

  /* ─────────────────────── keyboard shortcuts ─────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (modal !== "post") return;
      if (e.key === "Escape") { setModal(null); setActivePostIndex(null); }
      if (e.key === "ArrowRight") setActivePostIndex(i => Math.min(i + 1, userPosts.length - 1));
      if (e.key === "ArrowLeft")  setActivePostIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, userPosts.length]);

  /* ────────────────────────── actions ────────────────────────── */
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
        setConnectStatus("connected");
        setFollowers(prev => [...prev, currentUser._id || currentUser.id]);
      } else {
        setConnectStatus("idle");
      }
    } catch (err) {
      setConnectStatus("idle");
    }
  };

  const handleDirectMessage = () => router.push(`/messages?userId=${profileUser._id}`);

  const toggleLike = async () => {
    if (postLiking || activePostIndex === null) return;
    const post = userPosts[activePostIndex];
    const myId = currentUser?._id || currentUser?.id;

    // Optimistic update
    setUserPosts(prev => prev.map((p, i) => {
      if (i !== activePostIndex) return p;
      const liked = p.isLiked;
      return { ...p, isLiked: !liked, likes: liked ? p.likes - 1 : p.likes + 1 };
    }));

    setPostLiking(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/posts/${post.id}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      // Revert on failure
      setUserPosts(prev => prev.map((p, i) => {
        if (i !== activePostIndex) return p;
        const liked = p.isLiked;
        return { ...p, isLiked: !liked, likes: liked ? p.likes - 1 : p.likes + 1 };
      }));
    } finally {
      setPostLiking(false);
    }
  };

  const submitComment = async () => {
    if (!commentInput.trim() || commentSending || activePostIndex === null) return;
    const post = userPosts[activePostIndex];
    const text = commentInput.trim();
    const tempComment = {
      id: Date.now().toString(),
      user: { name: currentUser?.name, profilePic: currentUser?.profilePic },
      text,
      createdAt: new Date().toISOString()
    };

    // Optimistic
    setUserPosts(prev => prev.map((p, i) => {
      if (i !== activePostIndex) return p;
      return { ...p, comments: [...p.comments, tempComment] };
    }));
    setCommentInput("");
    setCommentSending(true);

    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
    } catch (err) {
      // Silent fail — optimistic comment stays
    } finally {
      setCommentSending(false);
    }
  };

  /* ──────────────────────── loading / error ──────────────────── */
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
  const activePost = activePostIndex !== null ? userPosts[activePostIndex] : null;

  /* ──────────────────────────── render ─────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0A0A0F] relative overflow-x-hidden pb-24">
      {/* Background glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[150px] rounded-full z-0 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full z-0 pointer-events-none" />

      {/* Top nav */}
      <div className="fixed top-0 inset-x-0 z-50 p-4 flex items-center pointer-events-none">
        <button onClick={() => router.back()} className="p-3 glass rounded-full text-white pointer-events-auto hover:bg-white/10 transition-colors shadow-lg backdrop-blur-md">
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="max-w-xl mx-auto relative z-10">

        {/* ── SECTION 1: HERO BANNER ── */}
        <div className="relative">
          <div className="h-[140px] md:h-[180px] w-full bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 relative">
            <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-14">
            <div className="relative">
              {/* Gradient border ring */}
              <div className="w-[120px] h-[120px] rounded-full p-[3px] shadow-2xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0A0A0F]">
                  <img
                    src={profileUser.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=7C3AED&color=fff`}
                    alt={profileUser.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                  />
                </div>
              </div>
              {profileUser.rank && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[13px] font-black px-3 py-1 rounded-full border-[3px] border-[#0A0A0F] shadow-lg">
                  #{profileUser.rank}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 2: IDENTITY ── */}
        <div className="pt-20 px-6 text-center space-y-2">
          <div className="flex justify-center">
            <span className="bg-white/5 text-cyan-300 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-cyan-500/20 cursor-default inline-block">
              {profileUser.badgeTitle || "Verified Student"}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{profileUser.name}</h2>
            <VerifiedBadge user={profileUser} size={22} />
          </div>
          {profileUser.bio && (
            <p className="text-sm text-white/60 italic font-medium max-w-sm mx-auto">"{profileUser.bio}"</p>
          )}
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider flex items-center justify-center gap-1 pt-1">
            <MapPin size={12} className="text-purple-400" />
            {profileUser.university || "Campus Adda"}
          </p>
          {/* Course · Year · Batch single line */}
          {(profileUser.course || profileUser.studyYear || profileUser.year || profileUser.passOutBatch) && (
            <p className="text-[11px] font-bold text-cyan-400/80 uppercase tracking-wider">
              {[profileUser.course, profileUser.studyYear || profileUser.year, profileUser.passOutBatch ? `Batch of ${profileUser.passOutBatch}` : ""].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>

        {/* ── FIX 3: COURSE / BATCH / YEAR info card ── */}
        <div className="px-6 mt-6">
          <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Course</p>
              <p className="mt-1 text-sm font-bold text-white/80">{profileUser.course || "Not added"}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Batch</p>
              <p className="mt-1 text-sm font-bold text-white/80">{profileUser.passOutBatch ? `Batch of ${profileUser.passOutBatch}` : "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Year</p>
              <p className="mt-1 text-sm font-bold text-white/80">{profileUser.studyYear || profileUser.year || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Campus</p>
              <p className="mt-1 text-sm font-bold text-white/80 truncate">{profileUser.university || "—"}</p>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: STATS ROW ── */}
        <div className="px-6 mt-6">
          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="glass-card p-4 rounded-3xl border border-white/5 text-center cursor-default hover:bg-white/5 transition-colors">
              <p className="text-2xl font-black text-white tracking-tighter">{userPosts.length}</p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Posts</p>
            </div>
            <button onClick={() => setModal("followers")} className="glass-card p-4 rounded-3xl border border-white/5 text-center hover:bg-white/10 transition-colors hover:scale-[1.02]">
              <p className="text-2xl font-black text-white tracking-tighter">{followers.length}</p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Followers</p>
            </button>
            <button onClick={() => setModal("following")} className="glass-card p-4 rounded-3xl border border-white/5 text-center hover:bg-white/10 transition-colors hover:scale-[1.02]">
              <p className="text-2xl font-black text-white tracking-tighter">{following.length}</p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Following</p>
            </button>
          </div>
        </div>

        {/* ── SECTION 4: ACTION BUTTONS ── */}
        <div className="px-6 mt-5 flex gap-3">
          {isSelf ? (
            <>
              <button onClick={() => router.push('/profile')} className="flex-1 gradient-bg py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform">
                ✏️ Edit Profile
              </button>
              <button onClick={() => navigator.share ? navigator.share({ title: 'Campus Adda', url: window.location.href }) : alert(window.location.href)} className="p-4 glass rounded-2xl text-white/50 border border-white/10 hover:text-white transition-colors">
                <Share2 size={18} />
              </button>
            </>
          ) : connectStatus === "connected" ? (
            <>
              <button onClick={handleDirectMessage} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                💬 Chat Now
              </button>
              <div className="flex-1 glass py-4 rounded-2xl text-[11px] font-black text-white/40 uppercase tracking-widest text-center border border-white/5 flex items-center justify-center cursor-default">
                👥 Squad ✓
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleConnectAction}
                disabled={connectStatus !== "idle"}
                className={clsx("flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                  connectStatus === "pending" ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed" : "gradient-bg text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02]"
                )}
              >
                {connectStatus === "idle" && "⚡ Connect"}
                {connectStatus === "connecting" && <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> ...</span>}
                {connectStatus === "pending" && "⏳ Request Sent"}
              </button>
              <button onClick={() => navigator.share ? navigator.share({ title: `Campus Adda: ${profileUser.name}`, url: window.location.href }) : alert(window.location.href)} className="p-4 glass rounded-2xl text-white/50 border border-white/10 hover:text-white transition-colors hover:scale-[1.02]">
                <Share2 size={18} />
              </button>
            </>
          )}
        </div>

        {/* ── SECTION 5: CAMPUS SOCIALS ── */}
        {(profileUser.instagram || profileUser.linkedin || profileUser.github || profileUser.snapchat) && (
          <div className="px-6 mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Campus Socials</h3>
              <UniversityBadges userId={profileUser._id} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {profileUser.instagram && (
                <a href={profileUser.instagram.includes('http') ? profileUser.instagram : `https://instagram.com/${profileUser.instagram}`} target="_blank" rel="noopener noreferrer" className="glass-card p-4 rounded-3xl border border-white/5 flex items-center space-x-3 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-2xl flex items-center justify-center text-white shrink-0"><InstagramIcon size={20} /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Instagram</p>
                    <p className="text-[13px] font-black text-white truncate leading-none mt-0.5">{extractInstagramUsername(profileUser.instagram)}</p>
                  </div>
                </a>
              )}
              {profileUser.linkedin && (
                <a href={profileUser.linkedin} target="_blank" rel="noopener noreferrer" className="glass-card p-4 rounded-3xl border border-white/5 flex items-center space-x-3 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-[#0A66C2] rounded-2xl flex items-center justify-center text-white shrink-0"><Briefcase size={18} /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">LinkedIn</p>
                    <p className="text-[13px] font-black text-white truncate leading-none mt-0.5">View Profile →</p>
                  </div>
                </a>
              )}
              {profileUser.github && (
                <a href={profileUser.github} target="_blank" rel="noopener noreferrer" className="glass-card p-4 rounded-3xl border border-white/5 flex items-center space-x-3 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black shrink-0"><Code size={18} /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">GitHub</p>
                    <p className="text-[13px] font-black text-white truncate leading-none mt-0.5">{extractGenericUsername(profileUser.github, 'github.com') || 'Profile →'}</p>
                  </div>
                </a>
              )}
              {profileUser.snapchat && (
                <a href={`https://snapchat.com/add/${profileUser.snapchat}`} target="_blank" rel="noopener noreferrer" className="glass-card p-4 rounded-3xl border border-white/5 flex items-center space-x-3 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-[#FFFC00] rounded-2xl flex items-center justify-center text-black shrink-0"><Ghost size={20} /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Snapchat</p>
                    <p className="text-[13px] font-black text-white truncate leading-none mt-0.5">{profileUser.snapchat}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 6: INTERESTS & SPORTS ── */}
        {((profileUser.interests?.length > 0) || (profileUser.sports?.length > 0)) && (
          <div className="px-6 mt-10">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">✨ Interests & Sports</h3>
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

        {/* ── SECTION 8: CAMPUS VIBE ── */}
        {userPosts.length > 5 && (
          <div className="px-6 mt-10">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">🔥 Campus Vibe</h3>
            <div className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-4 cursor-default hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-white">Frequent Poster</p>
                <p className="text-[11px] text-white/50 mt-1">Regularly posts on campus feed and engages with peers.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 7: MEMORIES / POSTS GRID ── */}
        <div className="px-6 mt-10 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">📸 Memories</h3>
            <Grid size={16} className="text-white/20" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {userPosts.length === 0 ? (
              <div className="col-span-3 py-16 glass-card rounded-[2rem] border border-white/5 border-dashed text-center">
                <ImageIcon size={30} className="mx-auto text-white/10 mb-3" />
                <p className="text-[13px] font-black text-white/30">No memories yet 📷</p>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Check back later</p>
              </div>
            ) : (
              userPosts.map((post, idx) => (
                <div
                  key={post.id}
                  onClick={() => { setActivePostIndex(idx); setModal("post"); setCommentInput(""); }}
                  className="aspect-square rounded-[1rem] overflow-hidden relative group cursor-pointer border border-white/5 bg-white/5"
                >
                  {post.img ? (
                    <img src={post.img} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <BookOpen size={24} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
                    <span className="flex items-center text-white text-[11px] font-black"><Heart size={13} className="fill-white mr-1" /> {post.likes}</span>
                    <span className="flex items-center text-white text-[11px] font-black"><MessageCircle size={13} className="fill-white mr-1" /> {post.comments.length}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>

        {/* ── Followers / Following list ── */}
        {(modal === "followers" || modal === "following") && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 100, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 100, scale: 0.95 }}
              className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A0A0F] sm:rounded-[2.5rem]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{modal}</h3>
                <button onClick={() => setModal(null)} className="p-2 bg-white/5 rounded-full text-white/30 hover:text-white transition-colors"><X size={16} /></button>
              </div>
              <div className="p-10 text-center text-white/30">
                <p className="text-xs font-bold">List hidden for privacy</p>
                <p className="text-[10px] mt-1">Connect first to view.</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── FIX 2: POST LIGHTBOX ── */}
        {modal === "post" && activePost && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => { setModal(null); setActivePostIndex(null); }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg mx-3 sm:mx-4 bg-[#0d0d1a] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border border-white/10 max-h-[92vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button onClick={() => { setModal(null); setActivePostIndex(null); }} className="absolute top-3 right-3 z-30 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>

              {/* Arrow prev */}
              {activePostIndex > 0 && (
                <button onClick={() => setActivePostIndex(i => i - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white/60 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
              )}
              {/* Arrow next */}
              {activePostIndex < userPosts.length - 1 && (
                <button onClick={() => setActivePostIndex(i => i + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white/60 hover:text-white transition-colors">
                  <ChevronRight size={20} />
                </button>
              )}

              {/* Post image */}
              {activePost.img && (
                <div className="w-full bg-black flex items-center justify-center" style={{ maxHeight: '55vw', minHeight: '180px' }}>
                  <img src={activePost.img} alt="Post" style={{ maxHeight: '55vw', width: '100%', objectFit: 'contain', display: 'block' }} />
                </div>
              )}

              {/* Scrollable lower section */}
              <div className="flex flex-col overflow-y-auto custom-scrollbar" style={{ maxHeight: '55vh' }}>
                {/* Author + caption */}
                <div className="px-4 pt-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10">
                      <img
                        src={profileUser.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=7C3AED&color=fff`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        alt={profileUser.name}
                      />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-white leading-none">{profileUser.name}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{profileUser.university} · {timeAgo(activePost.createdAt)}</p>
                    </div>
                  </div>
                  {activePost.content && (
                    <p className="text-sm text-white/80 leading-relaxed">{activePost.content}</p>
                  )}
                  {/* Counts */}
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-white/40 font-bold">
                    <span>❤️ {activePost.likes} like{activePost.likes !== 1 ? 's' : ''}</span>
                    <span>💬 {activePost.comments.length} comment{activePost.comments.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Like & Comment action row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <button
                    onClick={toggleLike}
                    disabled={postLiking}
                    className={clsx(
                      "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                      activePost.isLiked
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                    )}
                  >
                    <Heart size={14} className={activePost.isLiked ? "fill-red-400 text-red-400" : ""} />
                    {activePost.isLiked ? "Liked" : "Like"}
                  </button>
                </div>

                {/* Comments list */}
                <div className="px-4 py-3 space-y-4 flex-1">
                  {activePost.comments.length === 0 && (
                    <p className="text-[11px] text-white/20 text-center py-4 font-bold">No comments yet. Be first! 💬</p>
                  )}
                  {activePost.comments.map(c => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-white/10 bg-white/5 mt-0.5">
                        {c.user?.profilePic ? (
                          <img src={c.user.profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white/60">
                            {(c.user?.name || "?").charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-black text-white/80">{c.user?.name || "Student"}</p>
                        <p className="text-[12px] text-white/70 mt-0.5 leading-snug">{c.text}</p>
                        <p className="text-[9px] text-white/30 mt-1">{timeAgo(c.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment input */}
                <div className="px-3 py-3 border-t border-white/5 bg-[#0d0d1a] flex items-center gap-2.5 sticky bottom-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                    {currentUser?.profilePic ? (
                      <img src={currentUser.profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div className="w-full h-full bg-purple-600 flex items-center justify-center text-[11px] font-black text-white">
                        {(currentUser?.name || "U").charAt(0)}
                      </div>
                    )}
                  </div>
                  <input
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                    placeholder="Add a comment..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-purple-400 transition-colors"
                  />
                  <button
                    onClick={submitComment}
                    disabled={!commentInput.trim() || commentSending}
                    className="p-2.5 gradient-bg rounded-2xl text-white disabled:opacity-30 hover:scale-105 transition-transform"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
