"use client";

import { useEffect, useState, use, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Grid, Heart, MessageCircle, Share2, MapPin,
  Zap, Code, Trophy, Ghost, Briefcase, Loader2, Image as ImageIcon, X,
  Send, Building2, Crown, Users, CalendarDays, Check, TrendingUp, Award,
  Globe, Star, Camera, Lock
} from "lucide-react";

import VerifiedBadge from "@/components/VerifiedBadge";
import UniversityBadges from "@/components/UniversityBadges";
import NameWithTick from "@/components/NameWithTick";
import { extractInstagramUsername, extractGenericUsername } from "@/utils/socials";
import { getAvatarSrc } from "@/utils/defaultAvatars";
import { getDisplayStreak } from "@/utils/loginStreak";
import { useApiQuery } from "@/utils/useApiQuery";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const XP_TIERS = [
  { id: "silver", label: "Silver Tick", icon: "/ticks/silver.png", xp: 500 },
  { id: "purple", label: "Purple Tick", icon: "/ticks/purple.png", xp: 1500 },
  { id: "orange", label: "Orange Tick", icon: "/ticks/orange.png", xp: 3000 },
  { id: "gold", label: "Gold Tick", icon: "/ticks/gold.png", xp: 5000 },
];

const XP_ACTIONS = [
  { action: "Post on Explore", xp: "+15 XP", icon: <ImageIcon size={16} />, iconBg: "bg-amber-50 group-hover:bg-amber-100", iconColor: "text-amber-500 group-hover:text-amber-600", xpBg: "bg-amber-50 border-amber-100", xpText: "text-amber-600", borderHover: "hover:border-amber-200", shadowHover: "hover:shadow-[0_8px_24px_rgba(245,158,11,0.12)]" },
  { action: "Create a Post", xp: "+10 XP", icon: <Grid size={16} />, iconBg: "bg-purple-50 group-hover:bg-purple-100", iconColor: "text-purple-500 group-hover:text-purple-600", xpBg: "bg-purple-50 border-purple-100", xpText: "text-purple-600", borderHover: "hover:border-purple-200", shadowHover: "hover:shadow-[0_8px_24px_rgba(168,85,247,0.12)]" },
  { action: "Connect with User", xp: "+5 XP", icon: <Users size={16} />, iconBg: "bg-blue-50 group-hover:bg-blue-100", iconColor: "text-blue-500 group-hover:text-blue-600", xpBg: "bg-blue-50 border-blue-100", xpText: "text-blue-600", borderHover: "hover:border-blue-200", shadowHover: "hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)]" },
  { action: "Join a Community", xp: "+5 XP", icon: <Building2 size={16} />, iconBg: "bg-orange-50 group-hover:bg-orange-100", iconColor: "text-orange-500 group-hover:text-orange-600", xpBg: "bg-orange-50 border-orange-100", xpText: "text-orange-600", borderHover: "hover:border-orange-200", shadowHover: "hover:shadow-[0_8px_24px_rgba(249,115,22,0.12)]" },
  { action: "Comment on a post", xp: "+2 XP", icon: <MessageCircle size={16} />, iconBg: "bg-emerald-50 group-hover:bg-emerald-100", iconColor: "text-emerald-500 group-hover:text-emerald-600", xpBg: "bg-emerald-50 border-emerald-100", xpText: "text-emerald-600", borderHover: "hover:border-emerald-200", shadowHover: "hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)]" },
  { action: "Like a post", xp: "+1 XP", icon: <Heart size={16} />, iconBg: "bg-pink-50 group-hover:bg-pink-100", iconColor: "text-pink-500 group-hover:text-pink-600", xpBg: "bg-pink-50 border-pink-100", xpText: "text-pink-600", borderHover: "hover:border-pink-200", shadowHover: "hover:shadow-[0_8px_24px_rgba(236,72,153,0.12)]" },
  { action: "Create 1st post", xp: "+5 XP", icon: <Star size={16} />, iconBg: "bg-cyan-50 group-hover:bg-cyan-100", iconColor: "text-cyan-500 group-hover:text-cyan-600", xpBg: "bg-cyan-50 border-cyan-100", xpText: "text-cyan-600", borderHover: "hover:border-cyan-200", shadowHover: "hover:shadow-[0_8px_24px_rgba(6,182,212,0.12)]" },
  { action: "Create 1st story", xp: "+5 XP", icon: <Camera size={16} />, iconBg: "bg-indigo-50 group-hover:bg-indigo-100", iconColor: "text-indigo-500 group-hover:text-indigo-600", xpBg: "bg-indigo-50 border-indigo-100", xpText: "text-indigo-600", borderHover: "hover:border-indigo-200", shadowHover: "hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)]" },
];

const ACHIEVEMENT_BADGES = [
  { id: "weekly-poster", name: "Weekly Poster", condition: "15 posts in a week", icon: "📝", image: "/badges/posts-week.png", stat: "postsThisWeek", target: 15, glow: "rgba(37, 139, 255, 0.18)" },
  { id: "story-streak", name: "Story Streak", condition: "15 stories in a week", icon: "🖼️", image: "/badges/stories-week.png", stat: "storiesThisWeek", target: 15, glow: "rgba(185, 78, 255, 0.18)" },
  { id: "conversationalist", name: "Conversationalist", condition: "30 comments in a week", icon: "💬", image: "/badges/comments-week.png", stat: "commentsThisWeek", target: 30, glow: "rgba(20, 184, 166, 0.18)" },
  { id: "crowd-favorite", name: "Crowd Favorite", condition: "Receive 100 likes in a month", icon: "🧡", image: "/badges/likes-month.png", stat: "likesThisMonth", target: 100, glow: "rgba(239, 68, 68, 0.16)" },
  { id: "networker", name: "Networker", condition: "Make 15 new connections in a week", icon: "🤝", image: "/badges/connections-week.png", stat: "connectionsThisWeek", target: 15, glow: "rgba(14, 165, 233, 0.18)" },
  { id: "prolific-poster", name: "Prolific Poster", condition: "50 posts in a month", icon: "📝", image: "/badges/posts-month.png", stat: "postsThisMonth", target: 50, glow: "rgba(245, 158, 11, 0.2)" },
  { id: "fan-favorite", name: "Fan Favorite", condition: "1,000 likes received overall", icon: "👍", image: "/badges/likes-lifetime.png", stat: "likesLifetime", target: 1000, glow: "rgba(59, 130, 246, 0.18)" },
  { id: "veteran-poster", name: "Veteran Poster", condition: "500 lifetime posts", icon: "🛡️", image: "/badges/posts-lifetime.png", stat: "postsLifetime", target: 500, glow: "rgba(168, 85, 247, 0.18)" },
  { id: "storyteller", name: "Storyteller", condition: "500 lifetime stories", icon: "📖", image: "/badges/stories-lifetime.png", stat: "storiesLifetime", target: 500, glow: "rgba(16, 185, 129, 0.18)" },
];

const networkUserId = (item) => {
  if (!item) return "";
  if (typeof item === "object") return String(item._id || item.id || item.userId || "");
  return String(item);
};

const hasNetworkUserDetails = (item) => (
  item &&
  typeof item === "object" &&
  Boolean(item.name || item.fullName || item.username)
);

const isValidNetworkUserId = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));
const hasCachedNetworkUser = (map, id) => Object.prototype.hasOwnProperty.call(map, id);

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
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [activeTab, setActiveTab] = useState("badges");
  const [showAllXpActions, setShowAllXpActions] = useState(false);
  const [activeXpDot, setActiveXpDot] = useState(0);
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Cache map for network user details
  const [networkUsersMap, setNetworkUsersMap] = useState({});
  const [networkLoading, setNetworkLoading] = useState(false);

  // Post lightbox state
  const [postLiking, setPostLiking] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentSending, setCommentSending] = useState(false);

  // Memories: photo posts only (skip text-only / book-icon placeholders)
  const memoryPosts = userPosts.filter((p) => !!p.img);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  const profileUniversity = profileUser?.university || "";

  const hasDetailedNetworkList = (type) => {
    const list = type === "followers" ? followers : following;
    return list.length > 0 && list.every(hasNetworkUserDetails);
  };

  const loadPublicNetworkList = useCallback(async (type, { showLoading = true } = {}) => {
    if (type !== "followers" && type !== "following") return;
    const token = typeof window !== "undefined" ? localStorage.getItem("collegeadda_token") : null;
    if (!token || !targetUserId) return;

    if (showLoading) setNetworkLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/users/${targetUserId}/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;

      const users = await res.json();
      const list = Array.isArray(users) ? users : [];
      if (type === "followers") setFollowers(list);
      else setFollowing(list);

      setNetworkUsersMap(prev => ({
        ...prev,
        ...Object.fromEntries(
          list
            .map(user => [networkUserId(user), user])
            .filter(([id]) => id)
        )
      }));
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
    } finally {
      if (showLoading) setNetworkLoading(false);
    }
  }, [apiUrl, targetUserId]);

  const openNetworkModal = (type) => {
    setModal(type);
    loadPublicNetworkList(type, { showLoading: !hasDetailedNetworkList(type) });
  };


  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("collegeadda_token") : null;
    if (!token || (modal !== "followers" && modal !== "following")) return;

    const sourceList = modal === "followers" ? followers : following;
    const idsToFetch = [...new Set(sourceList
      .map(networkUserId)
      .filter(Boolean)
      .filter(isValidNetworkUserId)
      .filter(id => !hasCachedNetworkUser(networkUsersMap, id))
      .filter(id => id !== networkUserId(currentUser))
    )];

    if (idsToFetch.length === 0) return;

    let cancelled = false;

    const hydrateNetworkUsers = async () => {
      setNetworkLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/users/network/lookup?ids=${encodeURIComponent(idsToFetch.join(','))}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const users = await res.json();

        if (cancelled) return;

        const hydrated = Object.fromEntries(
          (Array.isArray(users) ? users : [])
            .map(user => [networkUserId(user), user])
            .filter(([id]) => id)
        );
        const returnedIds = new Set(Object.keys(hydrated));
        const missing = Object.fromEntries(idsToFetch.filter(id => !returnedIds.has(id)).map(id => [id, null]));
        setNetworkUsersMap(prev => ({ ...prev, ...missing, ...hydrated }));
      } finally {
        setNetworkLoading(false);
      }
    };

    hydrateNetworkUsers();

    return () => { cancelled = true; };
  }, [apiUrl, currentUser, followers, following, modal, networkUsersMap]);

  const activeNetworkList = useMemo(() => {
    if (modal !== "followers" && modal !== "following") return [];

    const rawList = modal === "followers" ? followers : following;
    const seen = new Set();

    return rawList
      .filter(Boolean)
      .map((item) => {
        const id = networkUserId(item);
        if (!isValidNetworkUserId(id) || seen.has(id)) return null;
        seen.add(id);

        const userDetails = hasNetworkUserDetails(item)
          ? item
          : networkUsersMap[id] || (id === networkUserId(currentUser) ? currentUser : null);

        if (!userDetails) return null;

        return {
          _id: id,
          id,
          name: userDetails.name || userDetails.fullName || userDetails.username,
          university: userDetails.university || userDetails.course || "",
          profilePic: userDetails?.profilePic,
          isVerified: userDetails?.isVerified,
          currentTick: userDetails?.currentTick,
          xp: userDetails?.xp,
          points: userDetails?.points,
        };
      })
      .filter(Boolean);
  }, [currentUser, followers, following, modal, networkUsersMap]);

  // -- TanStack Query: Colleges (for banner image) --
  const { data: colleges = [] } = useApiQuery(
    "profile-colleges",
    "/api/colleges",
    { staleTime: 30 * 60 * 1000 }
  );

  // Derived: college banner from user's university
  const collegeBanner = useMemo(() => {
    if (!colleges?.length || !profileUniversity) return null;
    const match = colleges.find(c =>
      c.name?.toLowerCase().trim() === profileUniversity.toLowerCase().trim()
    );
    return match?.banner || null;
  }, [colleges, profileUniversity]);

  // Derived: college location
  const collegeLocation = useMemo(() => {
    if (!colleges?.length || !profileUniversity) return null;
    const match = colleges.find(c =>
      c.name?.toLowerCase().trim() === profileUniversity.toLowerCase().trim()
    );
    return match?.location || null;
  }, [colleges, profileUniversity]);

  const campusRank = useMemo(() => {
    return profileUser?.campusRank || profileUser?.rank || 1;
  }, [profileUser]);

  const totalXp = useMemo(() => {
    const storedXp = Number(profileUser?.xp ?? profileUser?.points);
    if (!Number.isNaN(storedXp) && storedXp > 0) return storedXp;
    return 0;
  }, [profileUser]);

  const profileActivityStats = useMemo(() => {
    const postCount = userPosts.length;
    const likesReceived = userPosts.reduce((total, post) => total + (post.likes || 0), 0);
    const commentsReceived = userPosts.reduce((total, post) => total + (post.comments?.length || 0), 0);
    const connectionsCount = (profileUser?.followersCount ?? followers.length) + (profileUser?.followingCount ?? following.length);

    return {
      postsThisWeek: Number(profileUser?.postsThisWeek ?? postCount),
      postsThisMonth: Number(profileUser?.postsThisMonth ?? postCount),
      postsLifetime: Number(profileUser?.postsLifetime ?? postCount),
      storiesThisWeek: Number(profileUser?.storiesThisWeek ?? 0),
      storiesLifetime: Number(profileUser?.storiesLifetime ?? 0),
      commentsThisWeek: Number(profileUser?.commentsThisWeek ?? commentsReceived),
      likesThisMonth: Number(profileUser?.likesThisMonth ?? likesReceived),
      likesLifetime: Number(profileUser?.likesReceived ?? profileUser?.likesLifetime ?? likesReceived),
      connectionsThisWeek: Number(profileUser?.connectionsThisWeek ?? connectionsCount),
    };
  }, [followers.length, following.length, profileUser, userPosts]);

  const earnedBadges = useMemo(() => {
    const unlocked = profileUser?.unlockedBadges || [];
    const explicitBadges = new Set([
      ...unlocked.map(b => b.badgeId || b),
      ...(profileUser?.badgesEarned || []).map(id => id.replace('-', '_')),
      ...(profileUser?.badgesEarned || [])
    ]);

    const mappedBadges = ACHIEVEMENT_BADGES.map((badge) => {
      const apiBadgeId = badge.id.replace('-', '_');
      const oldProgress = profileActivityStats[badge.stat] || 0;

      return {
        ...badge,
        progress: oldProgress,
        earned: explicitBadges.has(apiBadgeId) || explicitBadges.has(badge.id) || oldProgress >= badge.target,
      };
    });

    return mappedBadges.sort((a, b) => {
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      return 0;
    });
  }, [profileUser, profileActivityStats]);

  const currentTick = useMemo(() => {
    return [...XP_TIERS].reverse().find(tier => totalXp >= tier.xp) || null;
  }, [totalXp]);

  const nextTick = useMemo(() => {
    return XP_TIERS.find(tier => totalXp < tier.xp) || null;
  }, [totalXp]);

  const nextTickProgress = nextTick
    ? Math.min(100, Math.round((totalXp / nextTick.xp) * 100))
    : 100;

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
        loadPublicNetworkList("followers", { showLoading: false });
        loadPublicNetworkList("following", { showLoading: false });

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
            .catch(() => { });
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
  }, [targetUserId, router, apiUrl, loadPublicNetworkList]);

  /* ─────────────────────── keyboard shortcuts ─────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (modal !== "post") return;
      if (e.key === "Escape") { setModal(null); setActivePostIndex(null); }
      if (e.key === "ArrowRight") setActivePostIndex(i => Math.min(i + 1, memoryPosts.length - 1));
      if (e.key === "ArrowLeft") setActivePostIndex(i => Math.max(i - 1, 0));
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
        setFollowers(prev => [...prev, currentUser]);

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

  const toggleLike = async (targetPost) => {
    const post = (targetPost && targetPost.id) ? targetPost : activePost;
    if (!post || !post.id || postLiking) return;

    const prevLiked = post.isLiked;
    const prevLikes = post.likes;

    // Optimistic update
    setUserPosts(prev => prev.map((p) => {
      if (p.id !== post.id) return p;
      return { ...p, isLiked: !prevLiked, likes: prevLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1 };
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
          likes: typeof data.likes === "number" ? data.likes : (prevLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1),
        };
      }));

      // Invalidate global queries so likes update everywhere
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
      queryClient.invalidateQueries({ queryKey: ["home-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
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

  const submitComment = async (targetPost) => {
    const post = (targetPost && targetPost.id) ? targetPost : activePost;
    if (!commentInput.trim() || commentSending || !post || !post.id) return;
    const text = commentInput.trim();
    const tempComment = {
      id: Date.now().toString(),
      user: {
        _id: currentUser?._id || currentUser?.id,
        name: currentUser?.name || "Student",
        profilePic: currentUser?.profilePic,
        university: currentUser?.university
      },
      text,
      createdAt: new Date().toISOString()
    };

    // Optimistic update
    setUserPosts(prev => prev.map((p) => {
      if (p.id !== post.id) return p;
      return { ...p, comments: [...(p.comments || []), tempComment] };
    }));
    setCommentInput("");
    setCommentSending(true);

    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        if (updatedPost && (updatedPost.comments || updatedPost._id)) {
          setUserPosts(prev => prev.map((p) => {
            if (p.id !== post.id) return p;
            return {
              ...p,
              comments: (updatedPost.comments || []).map(c => ({
                id: c._id || c.id || Math.random().toString(),
                user: c.user,
                text: c.text,
                createdAt: c.createdAt
              }))
            };
          }));
        }
      }

      // Invalidate global queries so comments update everywhere
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
      queryClient.invalidateQueries({ queryKey: ["home-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
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
        <p className="text-xs font-bold text-[#888888]">Loading profile...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center space-y-4">
        <p className="text-[#888888] font-black">{error || "User not found"}</p>
        <button onClick={() => router.back()} className="px-5 py-2.5 bg-[#0A0A0F] text-white rounded-full text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const isSelf = connectStatus === "self";
  const activePost = activePostIndex !== null ? userPosts[activePostIndex] : null;

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

      <div className="max-w-4xl mx-auto relative z-10 space-y-0 pb-16 pt-16 lg:pt-8">

        {/* ===== BANNER + PROFILE HEADER CARD ===== */}
        <div className="relative z-10 rounded-t-[1.75rem] overflow-hidden bg-white border border-[#E8E6E0] border-b-0">

          {/* Banner Image */}
          <div className="relative w-full h-44 md:h-52 bg-gradient-to-br from-[#D4A843]/20 to-[#F9F8F5] overflow-hidden">
            {collegeBanner ? (
              <img
                src={collegeBanner}
                alt={profileUser.university}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#C8922A]/15 via-[#F3F2EE] to-[#D4A843]/10 flex items-center justify-center">
                <Building2 size={48} className="text-[#C8922A]/30" />
              </div>
            )}
          </div>

          {/* Profile Pic — overlapping banner */}
          <div className="px-6 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-16">

              {/* Avatar */}
              <div className="relative shrink-0 z-10">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-[3px] gradient-bg shadow-xl z-20 border-4 border-white">
                  <div className="w-full h-full rounded-full bg-[#FAFAF8] flex items-center justify-center overflow-hidden">
                    <img
                      src={getAvatarSrc(profileUser.profilePic, profileUser.name, profileUser._id || profileUser.id)}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = getAvatarSrc("", profileUser.name, profileUser._id || profileUser.id); }}
                      alt={profileUser.name}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons (top-right of card) */}
              <div className="flex items-center gap-2 self-start sm:self-auto pt-1">
                {isSelf ? (
                  <>
                    <button onClick={() => router.push('/profile')} className="px-5 py-2 gradient-bg rounded-xl text-xs font-bold text-white shadow-sm hover:scale-[1.01] transition-transform">
                      Edit Profile
                    </button>
                    <button onClick={() => navigator.share ? navigator.share({ title: 'Campus Adda', url: window.location.href }) : alert(window.location.href)} className="p-2 bg-white border border-[#E8E6E0] rounded-xl text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors shadow-sm">
                      <Share2 size={16} />
                    </button>
                  </>
                ) : connectStatus === "connected" ? (
                  <>
                    <div className="px-4 py-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl text-xs font-bold text-[#6B6B6B] flex items-center gap-1 cursor-default">
                      Network <Check size={14} className="text-emerald-500" />
                    </div>
                    <button
                      onClick={handleDirectMessage}
                      title="Chat Now"
                      className="p-2 bg-white border border-[#E8E6E0] rounded-xl text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#FFF8EC] transition-colors shadow-sm"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleConnectAction}
                      disabled={connectStatus !== "idle"}
                      className={clsx("px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5",
                        connectStatus === "pending" ? "bg-[#F3F2EE] text-[#6B6B6B] border border-[#E8E6E0] cursor-not-allowed" : "gradient-bg text-white hover:scale-[1.01]"
                      )}
                    >
                      {connectStatus === "idle" && "Connect"}
                      {connectStatus === "connecting" && <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> ...</span>}
                      {connectStatus === "pending" && "Request Sent"}
                    </button>
                    <button onClick={() => navigator.share ? navigator.share({ title: `Campus Adda: ${profileUser.name}`, url: window.location.href }) : alert(window.location.href)} className="p-2 bg-white border border-[#E8E6E0] rounded-xl text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors shadow-sm">
                      <Share2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name & Verified */}
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
                  <NameWithTick name={profileUser.name} tick={profileUser.currentTick} user={profileUser} />
                </h2>
                <VerifiedBadge user={profileUser} size={18} />
              </div>

              {profileUser.bio && (
                <p className="text-sm text-[#4A4A4A] font-medium leading-relaxed max-w-lg">{profileUser.bio}</p>
              )}

              {/* University / Course / Class / Location row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 text-[13px] text-[#1A1A1A] font-semibold mt-4 mb-4">
                {profileUser.university && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base shrink-0">🏫</span>
                    {profileUser.university}
                  </span>
                )}
                {(profileUser.course || profileUser.branch) && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base shrink-0">👨🏻‍🎓</span>
                    {[profileUser.course, profileUser.branch].filter(Boolean).join(' • ')}
                  </span>
                )}
                {profileUser.passOutBatch && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base shrink-0">🏛️</span>
                    Class of {profileUser.passOutBatch}
                  </span>
                )}
                {(profileUser.hometownState || collegeLocation || profileUser.studyYear || profileUser.year) && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base shrink-0">📌</span>
                    {profileUser.hometownState ? `${profileUser.hometownState}${profileUser.hometownDistrict ? `, ${profileUser.hometownDistrict}` : ''}` : collegeLocation || profileUser.studyYear || profileUser.year}
                  </span>
                )}
              </div>

              {/* Pills row: Streak + Campus Rank + Joined */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Streak pill */}
                  <span className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-200 shadow-sm hover:shadow-[0_4px_12px_rgba(249,115,22,0.15)] hover:-translate-y-0.5 transition-all cursor-default">
                    <span className="text-sm drop-shadow-sm group-hover:scale-110 transition-transform">🔥</span>
                    <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">{getDisplayStreak(profileUser)} Day Streak</span>
                  </span>

                  {/* Campus Rank pill */}
                  {campusRank && (
                    <span className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 shadow-sm hover:shadow-[0_4px_12px_rgba(245,158,11,0.15)] hover:-translate-y-0.5 transition-all cursor-default">
                      <span className="text-sm drop-shadow-sm group-hover:scale-110 transition-transform">🏆</span>
                      <span className="bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">Campus Rank #{campusRank}</span>
                    </span>
                  )}
                </div>

                {/* Joined date */}
                {profileUser.createdAt && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#888888] font-semibold">
                    <CalendarDays size={12} className="text-[#888888]" />
                    Since {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== STATS ROW ===== */}
        <div className="grid grid-cols-5 gap-0 bg-white border border-[#E8E6E0] border-t shadow-sm rounded-b-[1.75rem] overflow-hidden relative z-0 mb-6">
          {[
            {
              icon: <Grid size={18} className="text-emerald-500" />,
              iconBg: "bg-emerald-50",
              label: "Posts",
              value: userPosts.length > 0 ? userPosts.length : (profileUser?.postsCount || 0),
              action: () => setActiveTab("posts")
            },
            {
              icon: <Users size={18} className="text-blue-500" />,
              iconBg: "bg-blue-50",
              label: "Followers",
              value: profileUser?.followersCount ?? followers.length,
              action: () => openNetworkModal("followers")
            },
            {
              icon: <Users size={18} className="text-indigo-500" />,
              iconBg: "bg-indigo-50",
              label: "Following",
              value: profileUser?.followingCount ?? following.length,
              action: () => openNetworkModal("following")
            },
            {
              icon: <Crown size={18} className="text-purple-500" />,
              iconBg: "bg-purple-50",
              label: "Campus Rank",
              value: campusRank ? `#${campusRank}` : "—",
              action: null
            },
            {
              icon: <Zap size={18} className="text-amber-500" />,
              iconBg: "bg-amber-50",
              label: "XP",
              value: totalXp.toLocaleString(),
              action: () => setActiveTab("badges")
            },
          ].map((stat, idx, arr) => (
            <button
              key={stat.label}
              onClick={stat.action}
              disabled={!stat.action}
              className={`flex flex-col items-center py-5 px-2 gap-1.5 transition-colors group ${stat.action ? 'hover:bg-[#F9F8F5] cursor-pointer' : 'cursor-default'} ${idx < arr.length - 1 ? 'border-r border-[#E8E6E0]' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                {stat.icon}
              </div>
              <span className="text-lg font-black text-[#1A1A1A] tracking-tight leading-none mt-1">{stat.value}</span>
              <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">{stat.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Navigation + Content */}
        <div className="px-4 md:px-0 pt-2 pb-10 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#F3F2EE] gap-8 text-sm font-semibold">
            {["badges", "posts", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "pb-3 pt-1 capitalize relative transition-all",
                  activeTab === tab
                    ? "text-[#C8922A] font-bold"
                    : "text-[#888888] hover:text-[#4A4A4A]"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8922A]" />
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: BADGES */}
          {activeTab === "badges" && (
            <div className="space-y-12 pb-14 pt-4">
              {/* 1. Performance Snapshot */}
              <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h3 className="text-[17px] font-black text-[#1A1A1A] flex items-center gap-2 mb-1">
                      <TrendingUp size={18} className="text-amber-500" /> Performance Snapshot
                    </h3>
                    <p className="text-[12px] font-semibold text-slate-500">
                      Recent activity highlights.
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-gradient-to-r from-white to-red-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-red-600 shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* XP Earned */}
                  <div className="group flex items-center gap-5 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-amber-100/60 to-orange-50 p-6 shadow-sm transition-all hover:shadow-[0_8px_24px_rgba(245,158,11,0.2)] hover:-translate-y-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-sm text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
                      ✨
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-amber-700 mb-1">XP Earned</p>
                      <p className="text-3xl font-black text-slate-900 leading-none mb-1.5">{totalXp.toLocaleString()}</p>
                      <p className="text-[11px] font-bold text-amber-600">Total XP</p>
                    </div>
                  </div>
                  {/* Streaks */}
                  <div className="group flex items-center gap-5 rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-red-100/60 to-rose-50 p-6 shadow-sm transition-all hover:shadow-[0_8px_24px_rgba(239,68,68,0.2)] hover:-translate-y-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-sm text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
                      🔥
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-red-700 mb-1">Streaks</p>
                      <p className="text-3xl font-black text-slate-900 leading-none mb-1.5">{getDisplayStreak(profileUser)}</p>
                      <p className="text-[11px] font-bold text-red-600">Days in a row</p>
                    </div>
                  </div>
                  {/* Network */}
                  <div className="group flex items-center gap-5 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-blue-100/60 to-sky-50 p-6 shadow-sm transition-all hover:shadow-[0_8px_24px_rgba(59,130,246,0.2)] hover:-translate-y-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-sm text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
                      🫂
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-blue-700 mb-1">Network</p>
                      <p className="text-3xl font-black text-slate-900 leading-none mb-1.5">{((profileUser?.followersCount ?? followers.length) + (profileUser?.followingCount ?? following.length)).toLocaleString()}</p>
                      <p className="text-[11px] font-bold text-blue-600">Total Network</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Badges Overview Hero */}
              <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-[#FFFAF0] via-white to-[#F0F7FF] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-[60px]" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-300/10 blur-[60px]" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-[17px] font-black text-[#1A1A1A] flex items-center gap-2 mb-1.5">
                      <span className="text-xl">🎖️</span> Badges Overview
                    </h2>
                    <p className="text-[12px] font-semibold text-slate-500">
                      Achievements that make {profileUser.name} stand out.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-amber-200/50 bg-white/80 backdrop-blur-md px-4 py-2 shadow-sm">
                    <Trophy size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">
                      {earnedBadges.filter(b => b.earned).length} / {earnedBadges.length} UNLOCKED
                    </span>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-8 mb-6">
                  {/* Featured Badge */}
                  {(() => {
                    const featuredBadge = earnedBadges.find(b => b.earned) || earnedBadges[0];
                    return (
                      <div className="group flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:w-1/2 p-4 rounded-[1.5rem] bg-white/40 border border-white/50 backdrop-blur-xl transition-all duration-300 hover:bg-white/60 hover:shadow-lg">
                        <div className="relative shrink-0 flex items-center justify-center h-40 w-40 rounded-[2rem] bg-gradient-to-br from-[#0A1128] to-[#1a2b5e] border-[3px] border-amber-400/30 shadow-[0_8px_20px_rgba(10,17,40,0.3)] p-4 transition-transform duration-500 group-hover:scale-105">
                          <img src={featuredBadge.image} alt={featuredBadge.name} className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]" />
                        </div>
                        <div className="flex flex-col justify-center h-full w-full max-w-[200px] text-center sm:text-left">
                          <h3 className="text-[17px] font-black text-slate-800 mb-1.5">{featuredBadge.name}</h3>
                          <p className="text-[11px] font-bold text-slate-500 mb-5 leading-relaxed">{featuredBadge.condition}</p>

                          <div className="flex flex-col gap-2 mb-5">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
                              <div
                                className={clsx("h-full rounded-full transition-all duration-1000", featuredBadge.earned ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-slate-300")}
                                style={{ width: `${Math.min(100, (featuredBadge.progress / featuredBadge.target) * 100)}%` }}
                              />
                            </div>
                            <p className="text-right text-[11px] font-black text-slate-700">{Math.min(featuredBadge.progress, featuredBadge.target)} / {featuredBadge.target}</p>
                          </div>

                          <div className="self-center sm:self-start inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600">
                            <Check size={12} strokeWidth={3} /> {featuredBadge.earned ? "UNLOCKED" : "LOCKED"}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Mini Badges Grid */}
                  <div className="grid grid-cols-4 gap-3 lg:w-1/2">
                    {earnedBadges.slice(1, 9).map((badge, idx) => (
                      <div
                        key={idx}
                        className={clsx(
                          "group flex flex-col items-center justify-center h-[80px] rounded-[1.2rem] border transition-all duration-300",
                          badge.earned
                            ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/30 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-amber-300"
                            : "border-slate-200/60 bg-white/50 backdrop-blur-sm opacity-90 hover:opacity-100"
                        )}
                      >
                        {badge.earned ? (
                          <img src={badge.image} alt={badge.name} className="h-9 w-9 object-contain mb-1.5 filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                          <div className="flex items-center justify-center text-slate-300 mb-1.5 transition-transform duration-300 group-hover:scale-110">
                            <Lock size={16} />
                          </div>
                        )}
                        <span className={clsx("text-[9px] font-bold uppercase tracking-wider transition-colors", badge.earned ? "text-amber-600 group-hover:text-amber-700" : "text-slate-400 group-hover:text-slate-500")}>
                          {badge.earned ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 3, 4 & 5. How XP Works, Achievements & Badges, XP Tiers (Only shown for own profile) */}
              {isSelf && (
                <>
                  {/* 3. How XP Works */}
                  <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <div>
                        <h3 className="text-[17px] font-black text-[#1A1A1A] flex items-center gap-2 mb-1">
                          <span className="text-xl">⚡️</span> How XP Works
                        </h3>
                        <p className="text-[12px] font-semibold text-slate-500">
                          Complete actions and earn XP to level up faster.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAllXpActions(!showAllXpActions)}
                        className="flex items-center gap-1.5 rounded-full border border-amber-200/50 bg-white px-4 py-2 text-[11px] font-black text-slate-700 shadow-sm transition-all hover:scale-105 hover:bg-amber-50"
                      >
                        See All <ChevronRight size={14} className={clsx("transition-transform duration-300", showAllXpActions ? "-rotate-90 text-amber-500" : "rotate-90")} />
                      </button>
                    </div>
                    <div id="xp-actions-container"
                      onScroll={(e) => {
                        if (!showAllXpActions) {
                          const scrollLeft = e.target.scrollLeft;
                          const newIndex = Math.round(scrollLeft / 296);
                          if (newIndex !== activeXpDot && newIndex >= 0 && newIndex <= 2) {
                            setActiveXpDot(newIndex);
                          }
                        }
                      }}
                      className={clsx(
                        "gap-5",
                        showAllXpActions
                          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
                          : "flex overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      )}>
                      {(showAllXpActions ? XP_ACTIONS : XP_ACTIONS.slice(0, 4)).map((item) => (
                        <div
                          key={item.action}
                          className={clsx(
                            "group flex flex-col rounded-[1.5rem] border border-slate-200/60 bg-gradient-to-b from-white to-slate-50/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-200",
                            !showAllXpActions && "w-[280px] shrink-0 snap-start"
                          )}
                        >
                          <div className="flex items-start justify-between mb-8">
                            <div className={clsx("flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6", item.iconBg)}>
                              {item.icon}
                            </div>
                            <span className={clsx("inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-black shadow-sm border", item.xpBg, item.xpText)}>
                              {item.xp}
                            </span>
                          </div>
                          <p className="text-[15px] font-black text-slate-800 mb-2 transition-colors group-hover:text-amber-600">{item.action}</p>
                          <p className="text-[12px] font-semibold text-slate-500 leading-relaxed">
                            {item.action === "Post on Explore" ? "Share a picture on Explore page" :
                              item.action === "Create a Post" ? "Create a post on the home page" :
                                item.action === "Connect with User" ? "Send a connection request" :
                                  "Become a part of any community"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 4. Achievements & Badges */}
                  <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <div>
                        <h3 className="text-[17px] font-black text-[#1A1A1A] flex items-center gap-2 mb-1">
                          <span className="text-xl">🏆</span> Achievements & Badges
                        </h3>
                        <p className="text-[12px] font-semibold text-slate-500">
                          Exclusive profile badges earned by participating in the community.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-amber-200/50 bg-white px-4 py-2 shadow-sm">
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                          PROGRESS <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-0.5 text-white shadow-sm">{earnedBadges.filter(badge => badge.earned).length} / {earnedBadges.length}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1">
                      {(showAllBadges ? earnedBadges : earnedBadges.slice(0, 4)).map((badge) => (
                        <div
                          key={badge.id}
                          className={clsx(
                            "group relative w-[280px] shrink-0 snap-start overflow-hidden rounded-[1.5rem] border p-6 transition-all duration-300",
                            badge.earned
                              ? "border-amber-200 bg-gradient-to-br from-white to-amber-50/30 shadow-[0_4px_20px_rgba(251,191,36,0.08)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(251,191,36,0.15)]"
                              : "border-slate-200/70 bg-white/40 backdrop-blur-md opacity-90 hover:opacity-100"
                          )}
                        >
                          <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-start gap-4 mb-5">
                              <div className={clsx(
                                "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] transition-transform duration-500 group-hover:scale-110",
                                badge.earned ? "bg-gradient-to-br from-[#0A1128] to-[#1a2b5e] border-[3px] border-amber-400/30 p-2 shadow-md" : "bg-[#0A1128] border-2 border-slate-700/50 p-2 grayscale opacity-70"
                              )}>
                                <img
                                  src={badge.image}
                                  alt={badge.name}
                                  className={clsx("h-full w-full object-contain filter", badge.earned && "drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]")}
                                />
                              </div>
                              <div className="min-w-0 flex-1 flex flex-col items-end">
                                <span className={clsx(
                                  "rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm mb-2 transition-colors",
                                  badge.earned ? "bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:bg-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                                )}>
                                  {badge.earned ? "UNLOCKED" : "LOCKED"}
                                </span>
                              </div>
                            </div>

                            <div className="mb-5">
                              <p className={clsx("font-black truncate text-[15px] mb-1.5 transition-colors", badge.earned ? "text-slate-800 group-hover:text-amber-600" : "text-slate-500")}>{badge.name}</p>
                              <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">{badge.condition}</p>
                            </div>

                            <div className="mt-auto">
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 mb-2 shadow-inner">
                                <div
                                  className={clsx("h-full rounded-full transition-all duration-1000", badge.earned ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-slate-300")}
                                  style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-end">
                                <span className="text-[11px] font-black text-slate-500">{Math.min(badge.progress, badge.target).toLocaleString()} / {badge.target.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center mt-2">
                      <button
                        onClick={() => setShowAllBadges(!showAllBadges)}
                        className="flex items-center gap-2 rounded-full border border-[#E8E6E0] bg-[#FFFAF0] px-5 py-2 text-[11px] font-black text-[#1A1A1A] transition-colors hover:bg-amber-50"
                      >
                        View All Achievements <ChevronRight size={14} />
                      </button>
                    </div>
                  </section>

                  {/* 5. XP Tiers */}
                  <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <div>
                        <h3 className="text-[17px] font-black text-[#1A1A1A] flex items-center gap-2 mb-1">
                          <span className="text-xl">👑</span> XP Tiers
                        </h3>
                        <p className="text-[12px] font-semibold text-slate-500">
                          Climb the tiers and unlock new rewards.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50/50 px-4 py-1.5 shadow-sm">
                        <span className="text-[11px] font-black text-amber-700">
                          Current: <span className="text-amber-600">{totalXp.toLocaleString()} XP</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {XP_TIERS.map((tier) => {
                        const reached = totalXp >= tier.xp;
                        const inProgress = nextTick?.id === tier.id;

                        let tierStyles = {
                          gradient: "from-amber-200/40 to-yellow-400/40 border-amber-300 shadow-[0_4px_15px_rgba(251,191,36,0.15)]",
                          text: "text-amber-700",
                          progressBg: "bg-gradient-to-r from-amber-400 to-yellow-500",
                          iconRing: "border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]",
                          inProgressGradient: "from-amber-50 to-white border-amber-200"
                        };

                        if (tier.id === "silver") {
                          tierStyles = {
                            gradient: "from-slate-200/60 to-slate-300/60 border-slate-300 shadow-[0_4px_15px_rgba(148,163,184,0.15)]",
                            text: "text-slate-700",
                            progressBg: "bg-gradient-to-r from-slate-400 to-slate-500",
                            iconRing: "border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.3)]",
                            inProgressGradient: "from-slate-50 to-white border-slate-200"
                          };
                        } else if (tier.id === "purple") {
                          tierStyles = {
                            gradient: "from-purple-200/40 to-purple-300/40 border-purple-300 shadow-[0_4px_15px_rgba(168,85,247,0.15)]",
                            text: "text-purple-700",
                            progressBg: "bg-gradient-to-r from-purple-400 to-purple-500",
                            iconRing: "border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
                            inProgressGradient: "from-purple-50 to-white border-purple-200"
                          };
                        } else if (tier.id === "orange") {
                          tierStyles = {
                            gradient: "from-orange-200/40 to-orange-300/40 border-orange-300 shadow-[0_4px_15px_rgba(249,115,22,0.15)]",
                            text: "text-orange-700",
                            progressBg: "bg-gradient-to-r from-orange-400 to-orange-500",
                            iconRing: "border-orange-400/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]",
                            inProgressGradient: "from-orange-50 to-white border-orange-200"
                          };
                        } else if (tier.id === "gold") {
                          tierStyles = {
                            gradient: "from-amber-200/60 to-yellow-400/60 border-yellow-400 shadow-[0_4px_20px_rgba(234,179,8,0.2)]",
                            text: "text-yellow-700",
                            progressBg: "bg-gradient-to-r from-amber-400 to-yellow-500",
                            iconRing: "border-yellow-400/60 shadow-[0_0_20px_rgba(234,179,8,0.4)]",
                            inProgressGradient: "from-yellow-50 to-white border-yellow-200"
                          };
                        }

                        return (
                          <div
                            key={tier.id}
                            className={clsx(
                              "group relative flex flex-col overflow-hidden rounded-[1.5rem] border p-6 transition-all duration-500",
                              reached ? `bg-gradient-to-br ${tierStyles.gradient}`
                                : inProgress ? `bg-gradient-to-br ${tierStyles.inProgressGradient} shadow-sm`
                                  : "border-slate-200/60 bg-white/40 backdrop-blur-sm opacity-80"
                            )}
                          >
                            <div className="flex items-center gap-4 mb-6">
                              <div className={clsx(
                                "flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] transition-all duration-500 overflow-hidden",
                                reached ? `bg-[#0A1128] border-[3px] ${tierStyles.iconRing}`
                                  : inProgress ? "bg-[#0A1128] border-[3px] border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                                    : "bg-[#0A1128] border-2 border-slate-700/50 grayscale opacity-60"
                              )}>
                                <img src={tier.icon} alt={tier.label} className={clsx("w-full h-full object-contain filter scale-[1.25]", reached && "drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]")} />
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col items-start gap-1">
                                  <div className="flex items-center justify-between w-full">
                                    <p className={clsx("text-[15px] font-black leading-none", reached ? tierStyles.text : inProgress ? "text-slate-800" : "text-slate-500")}>{tier.label}</p>
                                  </div>
                                  <p className={clsx("text-[10px] font-bold uppercase tracking-widest", reached ? "text-slate-600/80" : "text-slate-400")}>{tier.xp.toLocaleString()} XP REQ</p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-auto">
                              {reached ? (
                                <>
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/50 mb-2 shadow-inner">
                                    <div className={`h-full w-full rounded-full ${tierStyles.progressBg}`}></div>
                                  </div>
                                  <p className={clsx("text-[11px] font-black text-center", tierStyles.text)}>COMPLETED</p>
                                </>
                              ) : inProgress ? (
                                <>
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 mb-2 shadow-inner">
                                    <div
                                      className={clsx("h-full rounded-full transition-all duration-1000", tierStyles.progressBg)}
                                      style={{ width: `${nextTickProgress}%` }}
                                    />
                                  </div>
                                  <p className="text-[11px] font-black text-slate-600 text-center">{totalXp.toLocaleString()} / {tier.xp.toLocaleString()} XP</p>
                                </>
                              ) : (
                                <div className="flex justify-center mt-2">
                                  <Lock size={18} className="text-slate-300" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {/* TAB 2: POSTS */}
          {activeTab === "posts" && (
            <div className="space-y-6 pb-10 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userPosts.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 py-20 bg-white border border-[#E8E6E0] shadow-sm rounded-[2.5rem] border-dashed text-center">
                    <p className="text-xl font-black text-[#888888]">No Posts Yet</p>
                    <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-2">Check back later</p>
                  </div>
                ) : (
                  userPosts.map((post, idx) => (
                    <div
                      key={post.id}
                      className="bg-white border border-[#E8E6E0] rounded-[2rem] p-5 shadow-sm flex flex-col relative"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img src={getAvatarSrc(profileUser.profilePic, profileUser.name, profileUser._id || profileUser.id)} alt={profileUser.name} className="w-10 h-10 rounded-full object-cover border border-[#E8E6E0]" />
                          <div>
                            <p className="text-sm font-black text-[#1A1A1A]"><NameWithTick name={profileUser.name} tick={profileUser.currentTick} user={profileUser} /></p>
                            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">POST • {post.createdAt ? timeAgo(post.createdAt) : 'recently'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div onClick={() => { setSelectedPostId(post.id); setActivePostIndex(idx); setModal("post"); setCommentInput(""); }} className="cursor-pointer flex-1 flex flex-col">
                        {post.content && (
                          <p className="text-sm text-[#4A4A4A] mb-4 whitespace-pre-wrap leading-relaxed font-medium line-clamp-3">
                            {post.content}
                          </p>
                        )}
                        {post.img && (
                          <div className="rounded-[1.5rem] overflow-hidden mb-4 bg-[#F9F8F5]">
                            <img src={post.img} className="w-full object-cover max-h-[300px]" alt="" />
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#E8E6E0]/50 mt-auto">
                        <div className="flex space-x-6">
                          <div className="flex items-center space-x-2">
                            <Heart size={20} onClick={(e) => { e.stopPropagation(); toggleLike(post); }} className={clsx("cursor-pointer transition-all", post.isLiked ? "text-red-500 fill-red-500" : "text-[#6B6B6B] hover:text-red-500")} />
                            <span className="text-xs font-bold text-[#6B6B6B]">{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageCircle size={20} onClick={(e) => { e.stopPropagation(); setSelectedPostId(post.id); setActivePostIndex(idx); setModal("post"); setCommentInput(""); }} className="cursor-pointer text-[#6B6B6B] hover:text-[#C8922A]" />
                            <span className="text-xs font-bold text-[#6B6B6B]">{post.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT */}
          {activeTab === "about" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 pb-10">
              {/* Left Column: Details */}
              <div className="lg:col-span-2">
                <div className="bg-[#FFFDF8] rounded-[2.5rem] border border-[#F3F2EE] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF9E6] border-4 border-white shadow-sm flex items-center justify-center shrink-0">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <h3 className="text-2xl font-black text-[#1A1A1A]">About <span className="text-[#C8922A]">{profileUser.name}</span></h3>
                  </div>

                  <p className="text-[#4A4A4A] font-medium leading-relaxed mb-8 relative z-10">
                    {profileUser.bio || "No description provided."}
                  </p>

                  <div className="mt-auto space-y-3 relative z-10">
                    {profileUser.university && (
                      <div className="bg-white rounded-2xl p-4 border border-[#F3F2EE] flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] flex items-center justify-center text-lg">🏫</div>
                          <span className="text-sm font-semibold text-[#1A1A1A]">{profileUser.university}</span>
                        </div>
                      </div>
                    )}
                    {(profileUser.course || profileUser.branch) && (
                      <div className="bg-white rounded-2xl p-4 border border-[#F3F2EE] flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#FFF5F5] flex items-center justify-center text-lg">👨🏻‍🎓</div>
                          <span className="text-sm font-semibold text-[#1A1A1A]">{[profileUser.course, profileUser.branch, profileUser.studyYear || profileUser.year].filter(Boolean).join(" · ")}</span>
                        </div>
                      </div>
                    )}
                    {(profileUser.hometownState || collegeLocation) && (
                      <div className="bg-white rounded-2xl p-4 border border-[#F3F2EE] flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#F5F8FF] flex items-center justify-center text-lg">📌</div>
                          <span className="text-sm font-semibold text-[#1A1A1A]">
                            {profileUser.hometownState ? `${profileUser.hometownState}${profileUser.hometownDistrict ? `, ${profileUser.hometownDistrict}` : ''}` : collegeLocation}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Badges, Socials, Interests */}
              <div className="lg:col-span-1 space-y-6">
                {/* Badges */}
                <div className="bg-white rounded-[2rem] border border-[#F3F2EE] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-[#FFF9E6] flex items-center justify-center text-[#C8922A]">
                      <Award size={16} className="text-[#C8922A] fill-[#C8922A]" />
                    </div>
                    <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">Badges</h4>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <UniversityBadges userId={profileUser._id} />
                    <span className="ca-badge bg-[#FFF9E6] text-[#C8922A] border border-[#C8922A]/20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold">
                      🔥 {getDisplayStreak(profileUser)}
                    </span>
                    {profileUser.isVerified && (
                      <span className="ca-badge bg-[#FFF9E6] text-[#C8922A] border border-[#C8922A]/20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold">
                        🏅 Verified User
                      </span>
                    )}
                  </div>
                </div>

                {/* User Socials */}
                <div className="bg-white rounded-[2rem] border border-[#F3F2EE] p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-5 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#F5F8FF] flex items-center justify-center text-[#4A7DFF]">
                      <Users size={16} className="text-[#4A7DFF] fill-[#4A7DFF]" />
                    </div>
                    <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">User Socials</h4>
                  </div>
                  <div className="flex items-center gap-3 relative z-10">
                    {profileUser.instagram && (
                      <a href={profileUser.instagram.includes('http') ? profileUser.instagram : `https://instagram.com/${profileUser.instagram}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#FCF8F9] flex items-center justify-center text-[#E1306C] border border-[#E1306C]/10">
                        <InstagramIcon size={18} />
                      </a>
                    )}
                    {profileUser.linkedin && (
                      <a href={profileUser.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#F3F8FC] flex items-center justify-center text-[#229ED9] border border-[#229ED9]/10">
                        <Briefcase size={16} />
                      </a>
                    )}
                    {profileUser.github && (
                      <a href={profileUser.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#F5F8FF] flex items-center justify-center text-[#4A7DFF] border border-[#4A7DFF]/10">
                        <Code size={16} />
                      </a>
                    )}
                    {profileUser.snapchat && (
                      <a href={`https://snapchat.com/add/${profileUser.snapchat}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#F5F8FF] flex items-center justify-center text-[#4A7DFF] border border-[#4A7DFF]/10">
                        <Ghost size={18} />
                      </a>
                    )}
                    {!profileUser.instagram && !profileUser.linkedin && !profileUser.github && !profileUser.snapchat && (
                      <span className="text-xs text-[#888888]">No social links added.</span>
                    )}
                  </div>
                </div>

                {/* Interests & Sports */}
                <div className="bg-white rounded-[2rem] border border-[#F3F2EE] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-[#FBF5FF] flex items-center justify-center text-[#A855F7]">
                      <Heart size={16} className="text-[#A855F7] fill-[#A855F7]" />
                    </div>
                    <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">Interests & Sports</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(profileUser.interests || []).map((i, idx) => (
                      <span key={idx} className="bg-[#F5F8FF] px-4 py-2 rounded-full text-xs font-semibold text-[#4A7DFF] cursor-default">
                        {i}
                      </span>
                    ))}
                    {(profileUser.sports || []).map((s, idx) => (
                      <span key={idx} className="bg-[#FFF9E6] px-4 py-2 rounded-full text-xs font-semibold text-[#C8922A] cursor-default">
                        {s}
                      </span>
                    ))}
                    {(profileUser.interests || []).length === 0 && (profileUser.sports || []).length === 0 && (
                      <span className="text-xs text-[#888888]">No interests or sports added.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>

        {/* ── Followers / Following list (Identical to main profile) ── */}
        {(modal === "followers" || modal === "following") && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] bg-white shadow-sm sm:rounded-[3rem]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E8E6E0] flex items-center justify-between">
                <h3 className="text-lg font-black text-[#1A1A1A] capitalize">{modal}</h3>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"><X size={20} /></button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {networkLoading && activeNetworkList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                      <Loader2 size={22} className="animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#1A1A1A]">Showing users</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#888888]">Please wait...</p>
                    </div>
                  </div>
                ) : activeNetworkList.length === 0 ? (
                  <div className="py-10 text-center text-[#888888] font-bold uppercase tracking-widest text-[10px]">No {modal} found</div>
                ) : (
                  activeNetworkList.map((f, i) => {
                    const targetId = f._id || f.id;

                    return (
                      <div
                        key={targetId ? `${targetId}-${i}` : i}
                        onClick={() => {
                          setModal(null);
                          if (targetId) router.push(`/profile/${targetId}`);
                        }}
                        className="flex items-center justify-between p-3.5 sm:p-4 rounded-[1.5rem] border border-[#E8E6E0] bg-white hover:bg-[#FFF9E6] hover:border-[#C8922A]/30 shadow-sm transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-full p-[1.5px] gradient-bg shrink-0">
                            <img
                              src={getAvatarSrc(f.profilePic, f.name, targetId)}
                              className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0F]"
                              onError={(e) => { e.target.src = getAvatarSrc("", f.name, targetId); }}
                              alt={f.name}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-[#1A1A1A] flex items-center truncate">
                              <span className="truncate">{f.name}</span> <VerifiedBadge user={f} size={14} className="ml-1 shrink-0" />
                            </p>
                            <p className="text-[10px] text-[#6B6B6B] font-bold uppercase truncate mt-0.5">{f.university}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-[#888888] shrink-0 ml-2 group-hover:text-[#1A1A1A] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    );
                  })
                )}
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
                    onClick={() => toggleLike(activePost)}
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
