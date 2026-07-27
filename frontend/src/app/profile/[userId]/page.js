"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Grid, Heart, MessageCircle, Share2, MapPin,
  Zap, Code, Trophy, Ghost, Briefcase, Loader2, Image as ImageIcon, X,
  Send
} from "lucide-react";

import VerifiedBadge from "@/components/VerifiedBadge";
import UniversityBadges from "@/components/UniversityBadges";
import { extractInstagramUsername, extractGenericUsername } from "@/utils/socials";
import { getAvatarSrc } from "@/utils/defaultAvatars";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";

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

  const [connectStatus, setConnectStatus] = useState("idle");
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);

  // modal: null | "followers" | "following" | "post"
  const [modal, setModal] = useState(null);
  const [activePostIndex, setActivePostIndex] = useState(null);

  // Post lightbox state
  const [postLiking, setPostLiking] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentSending, setCommentSending] = useState(false);

  // Memories: photo posts only (skip text-only / book-icon placeholders)
  const memoryPosts = userPosts.filter((p) => !!p.img);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  /* ─────────────────────────── init ─────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    const mapPosts = (posts, me) => (posts || []).map((p) => ({
      id: p._id,
      img: p.mediaUrl || "",
      content: p.content || "",
      author: p.author,
      createdAt: p.createdAt,
      likes: typeof p.likesCount === "number" ? p.likesCount : (p.likes?.length || 0),
      isLiked: typeof p.likedByMe === "boolean"
        ? p.likedByMe
        : !!(p.likes?.includes?.(me._id || me.id)),
      likeIds: Array.isArray(p.likes) ? p.likes : [],
      comments: (p.comments || []).map((c) => ({
        id: c._id || Math.random().toString(),
        user: c.user,
        text: c.text,
        createdAt: c.createdAt
      })),
    }));

    const init = async () => {
      const stored = localStorage.getItem("collegeadda_user");
      const token = localStorage.getItem("collegeadda_token");
      if (!stored || !token) { router.push("/login"); return; }
      const me = JSON.parse(stored);
      setCurrentUser(me);
      setLoading(true);
      setLoadingPosts(true);
      setUserPosts([]);
      setError(null);

      try {
        // 1) Paint profile card as soon as user data arrives
        const userRes = await fetch(`${apiUrl}/api/users/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!userRes.ok) {
          if (!cancelled) {
            setError("User not found");
            setLoading(false);
            setLoadingPosts(false);
          }
          return;
        }

        const userData = await userRes.json();
        if (cancelled) return;

        setProfileUser(userData);
        setFollowers(userData.followers || []);
        setFollowing(userData.following || []);
        setLoading(false);

        if (me._id === userData._id || me.id === userData._id) {
          setConnectStatus("self");
        } else {
          // Non-blocking connect status
          fetch(`${apiUrl}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((myData) => {
              if (cancelled || !myData) return;
              if (myData.following && myData.following.includes(userData._id)) {
                setConnectStatus("connected");
              } else if (userData.connectionRequests && userData.connectionRequests.includes(me._id || me.id)) {
                setConnectStatus("pending");
              } else {
                setConnectStatus("idle");
              }
            })
            .catch(() => {});
        }

        // 2) Load only this author's posts (not the full campus feed)
        const postsRes = await fetch(
          `${apiUrl}/api/posts?author=${encodeURIComponent(targetUserId)}&limit=12`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cancelled) return;
        if (postsRes.ok) {
          const authorPosts = await postsRes.json();
          setUserPosts(mapPosts(authorPosts, me));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Error loading profile");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingPosts(false);
        }
      }
    };

    init();
    return () => { cancelled = true; };
  }, [targetUserId, router, apiUrl]);

  /* ─────────────────────── keyboard shortcuts ─────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (modal !== "post") return;
      if (e.key === "Escape") { setModal(null); setActivePostIndex(null); }
      if (e.key === "ArrowRight") setActivePostIndex(i => Math.min(i + 1, memoryPosts.length - 1));
      if (e.key === "ArrowLeft")  setActivePostIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, memoryPosts.length]);

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
        
        queryClient.invalidateQueries({ queryKey: ["network-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["explore-following"] });
        queryClient.invalidateQueries({ queryKey: ["user-following"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["network-suggested"] });
        queryClient.invalidateQueries({ queryKey: ["suggested"] });
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
    const post = memoryPosts[activePostIndex];
    if (!post) return;

    const prevLiked = post.isLiked;
    const prevLikes = post.likes;

    // Optimistic update
    setUserPosts(prev => prev.map((p) => {
      if (p.id !== post.id) return p;
      return { ...p, isLiked: !prevLiked, likes: prevLiked ? prevLikes - 1 : prevLikes + 1 };
    }));

    setPostLiking(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/posts/${post.id}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Like failed");
      const data = await res.json();
      setUserPosts(prev => prev.map((p) => {
        if (p.id !== post.id) return p;
        return {
          ...p,
          isLiked: typeof data.liked === "boolean" ? data.liked : !prevLiked,
          likes: typeof data.likes === "number" ? data.likes : (prevLiked ? prevLikes - 1 : prevLikes + 1),
        };
      }));
    } catch (err) {
      // Revert on failure
      setUserPosts(prev => prev.map((p) => {
        if (p.id !== post.id) return p;
        return { ...p, isLiked: prevLiked, likes: prevLikes };
      }));
    } finally {
      setPostLiking(false);
    }
  };

  const submitComment = async () => {
    if (!commentInput.trim() || commentSending || activePostIndex === null) return;
    const post = memoryPosts[activePostIndex];
    if (!post) return;
    const text = commentInput.trim();
    const tempComment = {
      id: Date.now().toString(),
      user: { name: currentUser?.name, profilePic: currentUser?.profilePic },
      text,
      createdAt: new Date().toISOString()
    };

    // Optimistic
    setUserPosts(prev => prev.map((p) => {
      if (p.id !== post.id) return p;
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
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="animate-spin text-[#C8922A]" />
        <p className="text-xs font-black uppercase tracking-widest text-[#6B6B6B]">Loading Profile...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-[#F3F2EE] rounded-full flex items-center justify-center text-[#6B6B6B]">
          <Ghost size={30} />
        </div>
        <p className="text-sm font-bold text-[#6B6B6B]">{error || "User not found"}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-white border border-[#E8E6E0] rounded-full text-xs font-black uppercase text-[#1A1A1A] hover:bg-[#F3F2EE] transition-colors shadow-sm">
          Go Back
        </button>
      </div>
    );
  }

  const isSelf = connectStatus === "self";
  const activePost = activePostIndex !== null ? memoryPosts[activePostIndex] : null;

  /* ──────────────────────────── render ─────────────────────────── */
  return (
    <div className="min-h-screen bg-[#FAFAF8] relative overflow-x-hidden pb-24">
      {/* Soft ambient wash */}
      <div className="fixed top-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#C8922A]/8 blur-[140px] rounded-full z-0 pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[45%] h-[45%] bg-[#D4A843]/6 blur-[140px] rounded-full z-0 pointer-events-none" />

      {/* Back button — offset past sidebar on desktop */}
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className="fixed top-4 z-50 left-4 lg:left-[calc(var(--sidebar-width,80px)+1rem)] p-3 bg-white border border-[#E8E6E0] rounded-full text-[#1A1A1A] hover:bg-[#FFF8EC] transition-colors shadow-md"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="max-w-xl mx-auto relative z-10 px-3 sm:px-4 pt-16 lg:pt-8 space-y-6">

        {/* ── PROFILE CARD ── */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] bg-white shadow-sm">
          {/* Banner */}
          <div className="relative h-[140px] md:h-[170px] w-full bg-gradient-to-br from-[#C8922A] via-pink-500 to-[#D4A843]">
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Avatar */}
          <div className="relative flex justify-center -mt-14">
            <div className="relative">
              <div className="w-[112px] h-[112px] rounded-full p-[3px] shadow-xl bg-white" style={{ background: 'linear-gradient(135deg, #C8922A, #06b6d4)' }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-[#F3F2EE] border-[3px] border-white">
                  <img
                    src={getAvatarSrc(profileUser.profilePic, profileUser.name, profileUser._id || profileUser.id)}
                    alt={profileUser.name}
                    className="w-full h-full object-cover object-center block"
                  />
                </div>
              </div>
              {profileUser.rank && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[12px] font-black px-2.5 py-0.5 rounded-full border-[3px] border-white shadow-md">
                  #{profileUser.rank}
                </div>
              )}
            </div>
          </div>

          {/* Identity */}
          <div className="px-5 sm:px-6 pt-4 pb-2 text-center space-y-2">
            <div className="flex justify-center">
              <span className="bg-[#FFF8EC] text-[#C8922A] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#C8922A]/20 cursor-default inline-block">
                {profileUser.badgeTitle || "Verified Student"}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tighter">{profileUser.name}</h2>
              <VerifiedBadge user={profileUser} size={22} />
            </div>
            {profileUser.bio && (
              <p className="text-sm text-[#6B6B6B] italic font-medium max-w-sm mx-auto">"{profileUser.bio}"</p>
            )}
            <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider flex items-center justify-center gap-1 pt-0.5">
              <MapPin size={12} className="text-[#C8922A]" />
              {profileUser.university || "Campus Adda"}
            </p>
            {(profileUser.course || profileUser.studyYear || profileUser.year || profileUser.passOutBatch) && (
              <p className="text-[11px] font-bold text-[#C8922A] uppercase tracking-wider">
                {[profileUser.course, profileUser.studyYear || profileUser.year, profileUser.passOutBatch ? `Batch of ${profileUser.passOutBatch}` : ""].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>

          {/* Course / year / batch / campus */}
          <div className="px-5 sm:px-6 mt-4">
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#E8E6E0] bg-[#F9F8F5] p-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#888888]">Course</p>
                <p className="mt-1 text-sm font-bold text-[#1A1A1A]">{profileUser.course || "Not added"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#888888]">Year</p>
                <p className="mt-1 text-sm font-bold text-[#1A1A1A]">{profileUser.studyYear || profileUser.year || "—"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#888888]">Batch</p>
                <p className="mt-1 text-sm font-bold text-[#1A1A1A]">{profileUser.passOutBatch ? `Batch of ${profileUser.passOutBatch}` : "—"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#888888]">Campus</p>
                <p className="mt-1 text-sm font-bold text-[#1A1A1A] truncate">{profileUser.university || "—"}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-5 sm:px-6 mt-4">
            <div className="grid grid-cols-3 gap-2.5 w-full">
              <div className="bg-[#F9F8F5] border border-[#E8E6E0] p-3.5 rounded-2xl text-center cursor-default">
                <p className="text-2xl font-black text-[#1A1A1A] tracking-tighter">{userPosts.length > 0 ? userPosts.length : (profileUser.postsCount || 0)}</p>
                <p className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest mt-1">Posts</p>
              </div>
              <button onClick={() => setModal("followers")} className="bg-[#F9F8F5] border border-[#E8E6E0] p-3.5 rounded-2xl text-center hover:bg-[#FFF8EC] hover:border-[#C8922A]/30 transition-colors">
                <p className="text-2xl font-black text-[#1A1A1A] tracking-tighter">{followers.length}</p>
                <p className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest mt-1">Followers</p>
              </button>
              <button onClick={() => setModal("following")} className="bg-[#F9F8F5] border border-[#E8E6E0] p-3.5 rounded-2xl text-center hover:bg-[#FFF8EC] hover:border-[#C8922A]/30 transition-colors">
                <p className="text-2xl font-black text-[#1A1A1A] tracking-tighter">{following.length}</p>
                <p className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest mt-1">Following</p>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 sm:px-6 mt-4 pb-5 flex gap-3">
            {isSelf ? (
              <>
                <button onClick={() => router.push('/profile')} className="flex-1 gradient-bg py-3.5 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-md hover:scale-[1.01] transition-transform">
                  Edit Profile
                </button>
                <button onClick={() => navigator.share ? navigator.share({ title: 'Campus Adda', url: window.location.href }) : alert(window.location.href)} className="p-3.5 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                  <Share2 size={18} />
                </button>
              </>
            ) : connectStatus === "connected" ? (
              <>
                <button onClick={handleDirectMessage} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 py-3.5 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-md shadow-emerald-500/20 hover:scale-[1.01] transition-transform">
                  Chat Now
                </button>
                <div className="flex-1 bg-[#F9F8F5] border border-[#E8E6E0] py-3.5 rounded-2xl text-[11px] font-black text-[#6B6B6B] uppercase tracking-widest text-center flex items-center justify-center cursor-default">
                  Network ✓
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleConnectAction}
                  disabled={connectStatus !== "idle"}
                  className={clsx("flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                    connectStatus === "pending" ? "bg-[#F3F2EE] text-[#6B6B6B] border border-[#E8E6E0] cursor-not-allowed" : "gradient-bg text-white shadow-md shadow-[0_4px_14px_rgba(200,146,42,0.2)] hover:scale-[1.01]"
                  )}
                >
                  {connectStatus === "idle" && "Connect"}
                  {connectStatus === "connecting" && <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> ...</span>}
                  {connectStatus === "pending" && "Request Sent"}
                </button>
                <button onClick={() => navigator.share ? navigator.share({ title: `Campus Adda: ${profileUser.name}`, url: window.location.href }) : alert(window.location.href)} className="p-3.5 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors hover:scale-[1.01]">
                  <Share2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── SECTION 5: CAMPUS SOCIALS ── */}
        {(profileUser.instagram || profileUser.linkedin || profileUser.github || profileUser.snapchat) && (
          <div className="rounded-[1.75rem] border border-[#E8E6E0] bg-white shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Campus Socials</h3>
              <UniversityBadges userId={profileUser._id} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {profileUser.instagram && (
                <a href={profileUser.instagram.includes('http') ? profileUser.instagram : `https://instagram.com/${profileUser.instagram}`} target="_blank" rel="noopener noreferrer" className="bg-[#F9F8F5] border border-[#E8E6E0] p-4 rounded-2xl flex items-center space-x-3 hover:-translate-y-0.5 transition-transform">
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-2xl flex items-center justify-center text-white shrink-0"><InstagramIcon size={20} /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#6B6B6B] font-bold uppercase tracking-widest">Instagram</p>
                    <p className="text-[13px] font-black text-[#1A1A1A] truncate leading-none mt-0.5">{extractInstagramUsername(profileUser.instagram)}</p>
                  </div>
                </a>
              )}
              {profileUser.linkedin && (
                <a href={profileUser.linkedin} target="_blank" rel="noopener noreferrer" className="bg-[#F9F8F5] border border-[#E8E6E0] p-4 rounded-2xl flex items-center space-x-3 hover:-translate-y-0.5 transition-transform">
                  <div className="w-10 h-10 bg-[#0A66C2] rounded-2xl flex items-center justify-center text-white shrink-0"><Briefcase size={18} /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#6B6B6B] font-bold uppercase tracking-widest">LinkedIn</p>
                    <p className="text-[13px] font-black text-[#1A1A1A] truncate leading-none mt-0.5">View Profile →</p>
                  </div>
                </a>
              )}
              {profileUser.github && (
                <a href={profileUser.github} target="_blank" rel="noopener noreferrer" className="bg-[#F9F8F5] border border-[#E8E6E0] p-4 rounded-2xl flex items-center space-x-3 hover:-translate-y-0.5 transition-transform">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-white shrink-0"><Code size={18} /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#6B6B6B] font-bold uppercase tracking-widest">GitHub</p>
                    <p className="text-[13px] font-black text-[#1A1A1A] truncate leading-none mt-0.5">{extractGenericUsername(profileUser.github, 'github.com') || 'Profile →'}</p>
                  </div>
                </a>
              )}
              {profileUser.snapchat && (
                <a href={`https://snapchat.com/add/${profileUser.snapchat}`} target="_blank" rel="noopener noreferrer" className="bg-[#F9F8F5] border border-[#E8E6E0] p-4 rounded-2xl flex items-center space-x-3 hover:-translate-y-0.5 transition-transform">
                  <div className="w-10 h-10 bg-[#FFFC00] rounded-2xl flex items-center justify-center text-black shrink-0"><Ghost size={20} /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#6B6B6B] font-bold uppercase tracking-widest">Snapchat</p>
                    <p className="text-[13px] font-black text-[#1A1A1A] truncate leading-none mt-0.5">{profileUser.snapchat}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 6: INTERESTS & SPORTS ── */}
        {((profileUser.interests?.length > 0) || (profileUser.sports?.length > 0)) && (
          <div className="rounded-[1.75rem] border border-[#E8E6E0] bg-white shadow-sm p-5 sm:p-6">
            <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] mb-4">Interests & Sports</h3>
            <div className="flex flex-wrap gap-2.5">
              {(profileUser.interests || []).map(int => (
                <span key={int} className="bg-[#F9F8F5] border border-[#E8E6E0] px-4 py-2 rounded-full text-[11px] font-bold text-[#4A4A4A] flex items-center gap-1.5 hover:border-[#C8922A]/30 hover:text-[#C8922A] transition-colors cursor-default">
                  {int}
                </span>
              ))}
              {(profileUser.sports || []).map(sport => (
                <span key={sport} className="bg-[#FFF8EC] text-[#C8922A] border border-[#C8922A]/20 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-default">
                  <Trophy size={11} /> {sport}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 8: CAMPUS VIBE ── */}
        {userPosts.length > 5 && (
          <div className="rounded-[1.75rem] border border-[#E8E6E0] bg-white shadow-sm p-5 sm:p-6">
            <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] mb-4">Campus Vibe</h3>
            <div className="bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl p-4 flex items-center gap-4 cursor-default">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0 shadow-md shadow-[0_4px_14px_rgba(200,146,42,0.15)]">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#1A1A1A]">Frequent Poster</p>
                <p className="text-[11px] text-[#6B6B6B] mt-1">Regularly posts on campus feed and engages with peers.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 7: MEMORIES / POSTS GRID ── */}
        <div className="rounded-[1.75rem] border border-[#E8E6E0] bg-white shadow-sm p-5 sm:p-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Memories</h3>
            <Grid size={16} className="text-[#888888]" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {loadingPosts ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="aspect-square rounded-[1rem] bg-[#F3F2EE] animate-pulse border border-[#E8E6E0]" />
              ))
            ) : memoryPosts.length === 0 ? (
              <div className="col-span-3 py-14 bg-[#F9F8F5] border border-dashed border-[#E8E6E0] rounded-2xl text-center">
                <ImageIcon size={30} className="mx-auto text-[#888888] mb-3" />
                <p className="text-[13px] font-black text-[#6B6B6B]">No memories yet</p>
                <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-1">Check back later</p>
              </div>
            ) : (
              memoryPosts.map((post, idx) => (
                <div
                  key={post.id}
                  onClick={() => { setActivePostIndex(idx); setModal("post"); setCommentInput(""); }}
                  className="aspect-square rounded-[1rem] overflow-hidden relative group cursor-pointer border border-[#E8E6E0] bg-[#F3F2EE]"
                >
                  <img src={post.img} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
                    <span className="flex items-center text-white text-[11px] font-black"><Heart size={13} className="fill-white mr-1" /> {post.likes}</span>
                    <span className="flex items-center text-white text-[11px] font-black"><MessageCircle size={13} className="fill-white mr-1" /> {post.comments?.length || 0}</span>
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
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 100, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 100, scale: 0.95 }}
              className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-[#E8E6E0] bg-white shadow-xl sm:rounded-[2.5rem]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-[#E8E6E0] flex items-center justify-between">
                <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-widest">{modal}</h3>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F3F2EE] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"><X size={16} /></button>
              </div>
              <div className="p-10 text-center text-[#6B6B6B]">
                <p className="text-xs font-bold">List hidden for privacy</p>
                <p className="text-[10px] mt-1">Connect first to view.</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── POST LIGHTBOX ── */}
        {modal === "post" && activePost && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 backdrop-blur-md p-3 sm:p-4"
            onClick={() => { setModal(null); setActivePostIndex(null); }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] overflow-hidden flex flex-col shadow-2xl shadow-black/20 border border-[#E8E6E0] max-h-[92vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => { setModal(null); setActivePostIndex(null); }}
                aria-label="Close"
                className="absolute top-3 right-3 z-30 p-2 bg-white border border-[#E8E6E0] rounded-full text-[#1A1A1A] shadow-md hover:bg-[#F9F8F5] transition-colors"
              >
                <X size={18} />
              </button>

              {/* Arrow prev */}
              {activePostIndex > 0 && (
                <button
                  onClick={() => setActivePostIndex(i => i - 1)}
                  aria-label="Previous post"
                  className="absolute left-3 top-[22%] sm:top-[28%] -translate-y-1/2 z-30 p-2 bg-white border border-[#E8E6E0] rounded-full text-[#1A1A1A] shadow-md hover:bg-[#F9F8F5] transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {/* Arrow next */}
              {activePostIndex < memoryPosts.length - 1 && (
                <button
                  onClick={() => setActivePostIndex(i => i + 1)}
                  aria-label="Next post"
                  className="absolute right-3 top-[22%] sm:top-[28%] -translate-y-1/2 z-30 p-2 bg-white border border-[#E8E6E0] rounded-full text-[#1A1A1A] shadow-md hover:bg-[#F9F8F5] transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              {/* Post image */}
              {activePost.img && (
                <div className="w-full bg-black flex items-center justify-center max-h-[42vh] min-h-[160px]">
                  <img
                    src={activePost.img}
                    alt="Post"
                    className="w-full max-h-[42vh] object-contain block"
                  />
                </div>
              )}

              {/* Scrollable lower section */}
              <div className="flex flex-col overflow-y-auto custom-scrollbar bg-white" style={{ maxHeight: '48vh' }}>
                {/* Author + caption */}
                <div className="px-5 pt-4 pb-3 border-b border-[#E8E6E0]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#E8E6E0] bg-[#F3F2EE]">
                      <img
                        src={getAvatarSrc(profileUser.profilePic, profileUser.name, profileUser._id || profileUser.id)}
                        className="w-full h-full object-cover block"
                        alt={profileUser.name}
                      />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-[#1A1A1A] leading-none">{profileUser.name}</p>
                      <p className="text-[10px] text-[#6B6B6B] mt-0.5 font-medium">{profileUser.university} · {timeAgo(activePost.createdAt)}</p>
                    </div>
                  </div>
                  {activePost.content && (
                    <p className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap">{activePost.content}</p>
                  )}
                  {/* Counts */}
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-[#6B6B6B] font-bold">
                    <span>{activePost.likes} like{activePost.likes !== 1 ? 's' : ''}</span>
                    <span>{activePost.comments.length} comment{activePost.comments.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Like action row */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-[#E8E6E0]">
                  <button
                    onClick={toggleLike}
                    disabled={postLiking}
                    aria-label={activePost.isLiked ? "Unlike" : "Like"}
                    className={clsx(
                      "p-2.5 rounded-xl transition-all",
                      activePost.isLiked
                        ? "bg-red-50 text-red-500 border border-red-200"
                        : "bg-[#F9F8F5] text-[#6B6B6B] border border-[#E8E6E0] hover:bg-[#FFF8EC] hover:border-[#C8922A]/30 hover:text-red-500"
                    )}
                  >
                    <Heart size={18} className={activePost.isLiked ? "fill-red-500 text-red-500" : ""} />
                  </button>
                </div>

                {/* Comments list */}
                <div className="px-5 py-3 space-y-4 flex-1">
                  {activePost.comments.length === 0 && (
                    <p className="text-[11px] text-[#888888] text-center py-4 font-bold">No comments yet. Be first!</p>
                  )}
                  {activePost.comments.map(c => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#E8E6E0] bg-[#F3F2EE] mt-0.5">
                        <img
                          src={getAvatarSrc(c.user?.profilePic, c.user?.name, c.user?._id || c.user?.id)}
                          className="w-full h-full object-cover block"
                          alt={c.user?.name || "Student"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-[#1A1A1A]">{c.user?.name || "Student"}</p>
                        <p className="text-[12px] text-[#4A4A4A] mt-0.5 leading-snug">{c.text}</p>
                        <p className="text-[9px] text-[#888888] mt-1 font-medium">{timeAgo(c.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment input */}
                <div className="px-3 py-3 border-t border-[#E8E6E0] bg-[#F9F8F5] flex items-center gap-2.5 sticky bottom-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#E8E6E0] bg-[#F3F2EE]">
                    <img
                      src={getAvatarSrc(currentUser?.profilePic, currentUser?.name, currentUser?._id || currentUser?.id)}
                      className="w-full h-full object-cover block"
                      alt={currentUser?.name || "You"}
                    />
                  </div>
                  <input
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                    placeholder="Add a comment..."
                    className="flex-1 bg-white border border-[#E8E6E0] rounded-2xl px-4 py-2 text-sm text-[#1A1A1A] placeholder:text-[#888888] outline-none focus:border-[#C8922A] transition-colors"
                  />
                  <button
                    onClick={submitComment}
                    disabled={!commentInput.trim() || commentSending}
                    aria-label="Send comment"
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
