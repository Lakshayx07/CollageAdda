"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { LogOut, Edit3, X, Check, Plus, Grid, Heart, MessageCircle, Send, ChevronLeft, ChevronRight, Share2, Ghost, MapPin, Zap, Star, Camera, Clock, Image as ImageIcon, Music, Code, Palette, Plane, Gamepad2, Book, Dumbbell, Film, Utensils, Trophy, Briefcase, Users, Crown, CalendarDays, GraduationCap, Flame, Building2, TrendingUp, Award, User, MoreVertical, Globe, Sparkles, Users2, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getAuthenticatedSupabaseClient } from "@/utils/supabaseAuthUser";
import { renderTextWithLinks } from "@/utils/linkify";
import { isUserUnverifiedOrIncomplete } from "@/utils/verificationCheck";

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
import XpTick from '../../components/XpTick';
import NameWithTick from '../../components/NameWithTick';
import UniversityBadges from "@/components/UniversityBadges";
import VerifiedBadge from "@/components/VerifiedBadge";
import clsx from "clsx";
import { extractInstagramUsername } from "@/utils/socials";
import { LOGIN_STREAK_UPDATED_EVENT, getDisplayStreak } from "@/utils/loginStreak";
import { saveProfileAvatarUrl, uploadAvatar } from "@/utils/supabaseUploads";
import { getAvatarSrc } from "@/utils/defaultAvatars";
import { useApiQuery } from "../../utils/useApiQuery";
import { useQueryClient } from "@tanstack/react-query";
import { indiaStatesDistricts } from "@/utils/indiaStatesDistricts";
import { getInterestEmoji } from "@/utils/emojis";

const INTEREST_OPTIONS = [
  { name: "Hackathons", icon: <Trophy size={12} /> },
  { name: "Music", icon: <Music size={12} /> },
  { name: "Coding", icon: <Code size={12} /> },
  { name: "Design", icon: <Palette size={12} /> },
  { name: "Gaming", icon: <Gamepad2 size={12} /> },
  { name: "Sports", icon: <Trophy size={12} /> },
  { name: "Placements", icon: <Briefcase size={12} /> },
  { name: "Startups", icon: <Zap size={12} /> },
  { name: "Content Creation", icon: <Film size={12} /> },
  { name: "Photography", icon: <Camera size={12} /> },
  { name: "Reading", icon: <Book size={12} /> },
  { name: "Cultural Events", icon: <Music size={12} /> }
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

const XP_TIERS = [
  { id: "silver", label: "Silver Tick", icon: "/ticks/silver.png", xp: 500 },
  { id: "purple", label: "Purple Tick", icon: "/ticks/purple.png", xp: 1500 },
  { id: "orange", label: "Orange Tick", icon: "/ticks/orange.png", xp: 3000 },
  { id: "gold", label: "Gold Tick", icon: "/ticks/gold.png", xp: 5000 },
];

const XP_ACTIONS = [
  {
    action: "Post a picture on explore",
    xp: "+15 XP",
    icon: <ImageIcon size={16} />,
    iconBg: "bg-amber-50 group-hover:bg-amber-100",
    iconColor: "text-amber-500 group-hover:text-amber-600",
    xpBg: "bg-amber-50 border-amber-100",
    xpText: "text-amber-600",
    borderHover: "hover:border-amber-200",
    shadowHover: "hover:shadow-[0_8px_24px_rgba(245,158,11,0.12)]"
  },
  {
    action: "Create a post on the home page",
    xp: "+10 XP",
    icon: <Grid size={16} />,
    iconBg: "bg-purple-50 group-hover:bg-purple-100",
    iconColor: "text-purple-500 group-hover:text-purple-600",
    xpBg: "bg-purple-50 border-purple-100",
    xpText: "text-purple-600",
    borderHover: "hover:border-purple-200",
    shadowHover: "hover:shadow-[0_8px_24px_rgba(168,85,247,0.12)]"
  },
  {
    action: "Connect with another user",
    xp: "+5 XP",
    icon: <Users size={16} />,
    iconBg: "bg-blue-50 group-hover:bg-blue-100",
    iconColor: "text-blue-500 group-hover:text-blue-600",
    xpBg: "bg-blue-50 border-blue-100",
    xpText: "text-blue-600",
    borderHover: "hover:border-blue-200",
    shadowHover: "hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)]"
  },
  {
    action: "Join a community",
    xp: "+5 XP",
    icon: <Building2 size={16} />,
    iconBg: "bg-orange-50 group-hover:bg-orange-100",
    iconColor: "text-orange-500 group-hover:text-orange-600",
    xpBg: "bg-orange-50 border-orange-100",
    xpText: "text-orange-600",
    borderHover: "hover:border-orange-200",
    shadowHover: "hover:shadow-[0_8px_24px_rgba(249,115,22,0.12)]"
  },
  {
    action: "Comment on a post",
    xp: "+2 XP",
    icon: <MessageCircle size={16} />,
    iconBg: "bg-emerald-50 group-hover:bg-emerald-100",
    iconColor: "text-emerald-500 group-hover:text-emerald-600",
    xpBg: "bg-emerald-50 border-emerald-100",
    xpText: "text-emerald-600",
    borderHover: "hover:border-emerald-200",
    shadowHover: "hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)]"
  },
  {
    action: "Like a post",
    xp: "+1 XP",
    icon: <Heart size={16} />,
    iconBg: "bg-pink-50 group-hover:bg-pink-100",
    iconColor: "text-pink-500 group-hover:text-pink-600",
    xpBg: "bg-pink-50 border-pink-100",
    xpText: "text-pink-600",
    borderHover: "hover:border-pink-200",
    shadowHover: "hover:shadow-[0_8px_24px_rgba(236,72,153,0.12)]"
  },
  {
    action: "Create 1st post",
    xp: "+5 XP",
    icon: <Star size={16} />,
    iconBg: "bg-cyan-50 group-hover:bg-cyan-100",
    iconColor: "text-cyan-500 group-hover:text-cyan-600",
    xpBg: "bg-cyan-50 border-cyan-100",
    xpText: "text-cyan-600",
    borderHover: "hover:border-cyan-200",
    shadowHover: "hover:shadow-[0_8px_24px_rgba(6,182,212,0.12)]"
  },
  {
    action: "Create 1st story",
    xp: "+5 XP",
    icon: <Camera size={16} />,
    iconBg: "bg-indigo-50 group-hover:bg-indigo-100",
    iconColor: "text-indigo-500 group-hover:text-indigo-600",
    xpBg: "bg-indigo-50 border-indigo-100",
    xpText: "text-indigo-600",
    borderHover: "hover:border-indigo-200",
    shadowHover: "hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)]"
  },
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

const EMPTY_ARRAY = [];


export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null);
  const [activePostIndex, setActivePostIndex] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [userStories, setUserStories] = useState([]);
  const [activeStories, setActiveStories] = useState([]);
  const [storyInput, setStoryInput] = useState({ imageUrl: "", caption: "" });
  const [storyUploading, setStoryUploading] = useState(false);
  const [viewingStoryIndex, setViewingStoryIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const [editData, setEditData] = useState({
    name: "",
    bio: "",
    profilePic: "",
    passOutBatch: "",
    course: "",
    branch: "",
    studyYear: "",
    hometownState: "",
    hometownDistrict: "",
    phone: "",
    phonePrivacy: "private",
    linkedin: "",
    github: "",
    instaId: "",
    snapId: "",
    interests: [],
    sports: []
  });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [unfollowingId, setUnfollowingId] = useState(null);
  const [activeTab, setActiveTab] = useState("badges");
  const [communitiesCount, setCommunitiesCount] = useState(0);
  const [campusUsers, setCampusUsers] = useState([]);
  const [showAllXpActions, setShowAllXpActions] = useState(false);
  const [activeXpDot, setActiveXpDot] = useState(0);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [postLiking, setPostLiking] = useState(false);
  const [commentSending, setCommentSending] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [shareModalPost, setShareModalPost] = useState(null);
  const [shareSending, setShareSending] = useState({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Token helper
  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("collegeadda_token") : null;

  // Set user from localStorage initially
  useEffect(() => {
    const stored = localStorage.getItem("collegeadda_user");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      setEditData({
        name: parsedUser.name || "",
        bio: parsedUser.bio || "",
        profilePic: parsedUser.profilePic || "",
        passOutBatch: parsedUser.passOutBatch || "",
        course: parsedUser.course || "",
        branch: parsedUser.branch || "",
        studyYear: parsedUser.studyYear || parsedUser.year || "",
        hometownState: parsedUser.hometownState || "",
        hometownDistrict: parsedUser.hometownDistrict || "",
        phone: parsedUser.phone || "",
        phonePrivacy: parsedUser.phonePrivacy || "private",
        linkedin: parsedUser.linkedin || "",
        github: parsedUser.github || "",
        instaId: parsedUser.instagram || "",
        snapId: parsedUser.snapchat || "",
        interests: parsedUser.interests || [],
        sports: parsedUser.sports || [],
        customCourse: ""
      });
    } else {
      router.push("/login");
    }
  }, [router]);

  // -- TanStack Query: Profile Data --
  const { data: profileData } = useApiQuery(
    "user-profile",
    "/api/users/profile",
    {
      enabled: !!getToken(),
      staleTime: 0,
      refetchInterval: 3000
    }
  );

  const { data: xpData } = useApiQuery(
    "user-xp-progress",
    "/api/users/me/xp-progress",
    {
      enabled: !!getToken(),
      staleTime: 60 * 1000,
    }
  );

  useEffect(() => {
    if (profileData && user) {
      const mergedProfileData = {
        ...profileData,
        streak_count: user.streak_count ?? profileData.streak_count,
      };
      // Only update if something changed to prevent infinite loops, or just rely on Query
      setUser(mergedProfileData);
      localStorage.setItem("collegeadda_user", JSON.stringify(mergedProfileData));

      // Prevent resetting editData if the user is currently editing (modal is open)
      if (!modal) {
        setEditData({
          name: profileData.name || "",
          bio: profileData.bio || "",
          profilePic: profileData.profilePic || "",
          passOutBatch: profileData.passOutBatch || "",
          course: profileData.course || "",
          branch: profileData.branch || "",
          studyYear: profileData.studyYear || profileData.year || "",
          hometownState: profileData.hometownState || "",
          hometownDistrict: profileData.hometownDistrict || "",
          phone: profileData.phone || "",
          phonePrivacy: profileData.phonePrivacy || "private",
          linkedin: profileData.linkedin || "",
          github: profileData.github || "",
          instaId: profileData.instagram || "",
          snapId: profileData.snapchat || "",
          interests: profileData.interests || [],
          sports: profileData.sports || [],
          customCourse: ""
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData, modal]);

  // -- TanStack Query: My Posts --
  const { data: myPostsRaw = EMPTY_ARRAY } = useApiQuery(
    ["user-posts", user?._id || user?.id],
    `/api/posts?author=${user?._id || user?.id}&limit=100`,
    {
      enabled: !!getToken() && !!(user?._id || user?.id),
      staleTime: 2 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (!user || !myPostsRaw) return;
    const filtered = myPostsRaw.filter(p => p.author?._id === user._id || p.author?._id === user.id);
    setUserPosts(filtered.map(p => ({
      id: p._id,
      img: p.mediaUrl || null,
      content: p.content,
      createdAt: p.createdAt,
      mediaType: p.mediaType,
      likes: p.likesCount || 0,
      isLiked: p.likedByMe || false,
      comments: p.commentsCount || 0,
      commentsList: (p.comments || []).map(c => ({
        id: c._id || Math.random().toString(),
        author: c.user?.name || "Student",
        profilePic: c.user?.profilePic || null,
        createdAt: c.createdAt || new Date().toISOString(),
        text: c.text
      }))
    })));
  }, [myPostsRaw, user]);

  const handlePostLike = async () => {
    if (activePostIndex === null || postLiking) return;
    const post = userPosts[activePostIndex];
    if (!post) return;

    const prevLiked = post.isLiked;
    const prevLikes = post.likes;

    setUserPosts(prev => prev.map(p => p.id === post.id ? { ...p, isLiked: !prevLiked, likes: prevLiked ? prevLikes - 1 : prevLikes + 1 } : p));
    setPostLiking(true);

    try {
      const res = await fetch(`${apiUrl}/api/posts/${post.id}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Like failed");
      const data = await res.json();
      setUserPosts(prev => prev.map(p => p.id === post.id ? {
        ...p,
        isLiked: typeof data.liked === "boolean" ? data.liked : !prevLiked,
        likes: typeof data.likes === "number" ? data.likes : (prevLiked ? prevLikes - 1 : prevLikes + 1),
      } : p));
    } catch (err) {
      setUserPosts(prev => prev.map(p => p.id === post.id ? { ...p, isLiked: prevLiked, likes: prevLikes } : p));
    } finally {
      setPostLiking(false);
    }
  };

  const submitPostComment = async () => {
    if (!commentInput.trim() || commentSending || activePostIndex === null) return;
    const post = userPosts[activePostIndex];
    if (!post) return;

    const text = commentInput.trim();
    const tempComment = {
      id: Date.now().toString(),
      author: user?.name || "Student",
      text
    };

    setUserPosts(prev => prev.map(p => p.id === post.id ? { ...p, commentsList: [...p.commentsList, tempComment] } : p));
    setCommentInput("");
    setCommentSending(true);

    try {
      await fetch(`${apiUrl}/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
    } catch (err) { } finally {
      setCommentSending(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setUserPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await fetch(`${apiUrl}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareToConnection = async (conn, post) => {
    const connId = conn._id || conn.id;
    setShareSending(prev => ({ ...prev, [connId]: true }));
    try {
      const token = getToken();
      const roomRes = await fetch(`${apiUrl}/api/chat/rooms`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: connId })
      });
      if (!roomRes.ok) throw new Error("Failed to get room");
      const room = await roomRes.json();

      const text = `Check out this post: ${window.location.origin}/post/${post.id}`;
      await fetch(`${apiUrl}/api/chat/rooms/${room._id}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      setToastMsg(`Shared to ${conn.name}`);
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to share.");
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  const handlePostShare = () => {
    if (activePostIndex === null) return;
    setShareModalPost(userPosts[activePostIndex]);
  };

  // -- TanStack Query: Followers --
  const { data: followers = EMPTY_ARRAY } = useApiQuery(
    "user-followers",
    "/api/users/me/followers",
    {
      enabled: !!getToken(),
      staleTime: 2 * 60 * 1000,
    }
  );

  // -- TanStack Query: Following --
  const { data: following = EMPTY_ARRAY } = useApiQuery(
    "user-following",
    "/api/users/me/following",
    {
      enabled: !!getToken(),
      staleTime: 2 * 60 * 1000,
    }
  );

  const connections = followers.filter(f => following.some(fol => fol._id === f._id || fol.id === f._id));
  const networksCount = connections.length;

  // -- TanStack Query: Colleges (for banner image) --
  const { data: colleges = EMPTY_ARRAY } = useApiQuery(
    "profile-colleges",
    "/api/colleges",
    { staleTime: 30 * 60 * 1000 }
  );



  // Fetch communities count from Supabase
  useEffect(() => {
    const loadCommunitiesCount = async () => {
      try {
        const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
        const { data, error } = await authSupabase
          .from("community_members")
          .select("community_id")
          .eq("user_id", authUser.id);
        if (!error && data) setCommunitiesCount(data.length);
      } catch (err) {
        console.error("Error fetching communities count:", err);
      }
    };
    loadCommunitiesCount();
  }, []);

  // Derived: college banner from user's university
  const collegeBanner = useMemo(() => {
    if (!colleges.length || !user?.university) return null;
    const match = colleges.find(c =>
      c.name?.toLowerCase().trim() === user.university?.toLowerCase().trim()
    );
    return match?.banner || null;
  }, [colleges, user?.university]);

  // Derived: college location
  const collegeLocation = useMemo(() => {
    if (!colleges.length || !user?.university) return null;
    const match = colleges.find(c =>
      c.name?.toLowerCase().trim() === user.university?.toLowerCase().trim()
    );
    return match?.location || null;
  }, [colleges, user?.university]);

  // Derived: true campus rank from backend
  const campusRank = useMemo(() => {
    return user?.campusRank || 1;
  }, [user]);

  const profileActivityStats = useMemo(() => {
    const postCount = userPosts.length;
    const likesReceived = userPosts.reduce((total, post) => total + (post.likes || 0), 0);
    const commentsReceived = userPosts.reduce((total, post) => total + (post.comments || 0), 0);
    const connections = followers.length + following.length;
    const storyCount = userStories.length;

    return {
      postsThisWeek: Number(user?.postsThisWeek ?? postCount),
      postsThisMonth: Number(user?.postsThisMonth ?? postCount),
      postsLifetime: Number(user?.postsLifetime ?? postCount),
      storiesThisWeek: Number(user?.storiesThisWeek ?? storyCount),
      storiesLifetime: Number(user?.storiesLifetime ?? storyCount),
      commentsThisWeek: Number(user?.commentsThisWeek ?? commentsReceived),
      likesThisMonth: Number(user?.likesThisMonth ?? likesReceived),
      likesLifetime: Number(user?.likesReceived ?? user?.likesLifetime ?? likesReceived),
      connectionsThisWeek: Number(user?.connectionsThisWeek ?? connections),
    };
  }, [followers.length, following.length, user, userPosts, userStories.length]);

  const totalXp = useMemo(() => {
    if (xpData) return (xpData.xp || 0) + (xpData.points || 0);
    const storedXp = Number(user?.xp ?? user?.points);
    if (!Number.isNaN(storedXp) && storedXp > 0) return storedXp + (user?.points || 0);
    return 0;
  }, [xpData, user?.xp, user?.points]);

  const currentTick = useMemo(() => {
    return [...XP_TIERS].reverse().find(tier => totalXp >= tier.xp) || null;
  }, [totalXp]);

  const nextTick = useMemo(() => {
    return XP_TIERS.find(tier => totalXp < tier.xp) || null;
  }, [totalXp]);

  const nextTickProgress = nextTick
    ? Math.min(100, Math.round((totalXp / nextTick.xp) * 100))
    : 100;

  const earnedBadges = useMemo(() => {
    const unlocked = xpData?.unlockedBadges || user?.unlockedBadges || [];
    const explicitBadges = new Set([
      ...unlocked.map(b => b.badgeId || b),
      ...(user?.badgesEarned || []).map(id => id.replace('-', '_')),
      ...(user?.badgesEarned || [])
    ]);

    const mappedBadges = ACHIEVEMENT_BADGES.map((badge) => {
      const apiBadgeId = badge.id.replace('-', '_');
      const newProgress = xpData?.progress?.[apiBadgeId]?.current || 0;
      const oldProgress = profileActivityStats[badge.stat] || 0;
      const progress = Math.max(newProgress, oldProgress);

      return {
        ...badge,
        progress,
        earned: explicitBadges.has(apiBadgeId) || explicitBadges.has(badge.id) || progress >= badge.target,
      };
    });

    return mappedBadges.sort((a, b) => {
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      return 0;
    });
  }, [xpData, user?.unlockedBadges, user?.badgesEarned, profileActivityStats]);


  useEffect(() => {
    const handleStreakUpdate = (event) => {
      const streakCount = event.detail?.streak_count;
      if (!streakCount) return;
      setUser((currentUser) => (
        currentUser ? { ...currentUser, streak_count: streakCount } : currentUser
      ));
    };

    window.addEventListener(LOGIN_STREAK_UPDATED_EVENT, handleStreakUpdate);
    return () => window.removeEventListener(LOGIN_STREAK_UPDATED_EVENT, handleStreakUpdate);
  }, []);

  useEffect(() => {
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/");
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
        queryClient.setQueryData(["user-following"], (prev) => (prev || []).filter(f => f._id !== targetUserId));
        queryClient.setQueryData(["user-followers"], (prev) => (prev || []).filter(f => f._id !== targetUserId));

        queryClient.invalidateQueries({ queryKey: ["network-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["explore-following"] });
        queryClient.invalidateQueries({ queryKey: ["user-following"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["network-suggested"] });
        queryClient.invalidateQueries({ queryKey: ["suggested"] });

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

    const finalCourse = editData.course === "Other" && editData.customCourse ? editData.customCourse : editData.course;

    if (!user.isVerified) {
      if (!editData.name?.trim()) return alert("Full Name is required for verification.");
      if (!editData.profilePic?.trim()) return alert("Profile Photo is required for verification.");
      if (!editData.passOutBatch) return alert("Pass Out Batch is required for verification.");
      if (!editData.studyYear) return alert("Year of Study is required for verification.");
      if (!finalCourse) return alert("Course is required for verification.");
      if (!editData.branch?.trim()) return alert("Branch is required for verification.");
      if (!editData.bio || editData.bio.trim().split(/\s+/).length < 10) {
        return alert("Bio must be at least 10 words for verification.");
      }
    }

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
          name: editData.name,
          bio: editData.bio,
          profilePic: editData.profilePic,
          passOutBatch: editData.passOutBatch,
          course: finalCourse,
          branch: editData.branch,
          studyYear: editData.studyYear,
          hometownState: editData.hometownState,
          hometownDistrict: editData.hometownDistrict,
          phone: editData.phone,
          phonePrivacy: editData.phonePrivacy,
          linkedin: editData.linkedin,
          github: editData.github,
          instagram: editData.instaId,
          snapchat: editData.snapId,
          interests: editData.interests,
          sports: editData.sports
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        await saveProfileAvatarUrl({
          userId: updatedUser._id || updatedUser.id,
          avatarUrl: updatedUser.profilePic,
          name: updatedUser.name,
          university: updatedUser.university
        });
        setUser(updatedUser);
        localStorage.setItem("collegeadda_user", JSON.stringify(updatedUser));
        queryClient.setQueryData(["user-profile"], updatedUser);
        [
          ["user-posts"],
          ["posts", updatedUser._id || updatedUser.id],
          ["friends"],
          ["suggested"],
          ["network-suggested"],
          ["network-profile"],
          ["user-followers"],
          ["user-following"],
          ["chat-rooms"],
          ["stories"],
        ].forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
        setSaved(true);
        setTimeout(() => { setSaved(false); setModal(null); }, 1200);
        if (updatedUser.warning) {
          setTimeout(() => alert(updatedUser.warning), 100);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to update profile: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAvatarUploading(true);
    try {
      const userId = user?._id || user?.id;
      const { publicUrl } = await uploadAvatar(file, userId);
      await saveProfileAvatarUrl({
        userId,
        avatarUrl: publicUrl,
        name: editData.name || user?.name,
        university: user?.university
      });
      setEditData(prev => ({ ...prev, profilePic: publicUrl }));
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      alert(error.message || "Could not upload the profile picture.");
    } finally {
      setIsAvatarUploading(false);
      event.target.value = "";
    }
  };

  const toggleInterest = (interestName) => {
    setEditData(prev => ({
      ...prev,
      interests: (prev.interests || []).includes(interestName)
        ? (prev.interests || []).filter(i => i !== interestName)
        : [...(prev.interests || []), interestName]
    }));
  };

  const toggleSport = (sportName) => {
    setEditData(prev => ({
      ...prev,
      sports: (prev.sports || []).includes(sportName)
        ? (prev.sports || []).filter(s => s !== sportName)
        : [...(prev.sports || []), sportName]
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
    <div className="page-shell profile-page relative overflow-x-hidden">


      {/* Header - only show on mobile, sidebar handles desktop nav */}
      <header className="lg:hidden page-header sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-xl font-black text-[#1A1A1A] tracking-tight"
        >
          {user.name?.split(" ")[0]}<span className="text-[#C8922A]">.</span>
        </motion.h1>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2.5 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl text-red-500/50 hover:text-red-500 border border-[#E8E6E0]"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto relative z-10 space-y-0 pb-20 lg:pt-6">

        {/* ===== BANNER + PROFILE HEADER CARD ===== */}
        <div className="relative z-10 rounded-none md:rounded-t-[1.75rem] overflow-hidden bg-white border border-[#E8E6E0] border-b-0">

          {/* Banner Image */}
          <div className="relative w-full h-44 md:h-52 bg-gradient-to-br from-[#D4A843]/20 to-[#F9F8F5] overflow-hidden">
            {collegeBanner ? (
              <img
                src={collegeBanner}
                alt={user.university}
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
                {hasActiveStory && (
                  <div className="absolute -inset-1.5 rounded-full p-[3px] z-10 pointer-events-none"
                    style={{ background: "conic-gradient(from 0deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #a855f7, #7c3aed, #f09433)" }}
                  >
                    <div className="w-full h-full rounded-full bg-white" />
                  </div>
                )}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-[3px] gradient-bg shadow-xl z-20 border-4 border-white">
                  <div
                    onClick={() => hasActiveStory ? setModal("viewStory") : null}
                    className={`w-full h-full rounded-full bg-[#FAFAF8] flex items-center justify-center overflow-hidden ${hasActiveStory ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
                  >
                    <img
                      src={getAvatarSrc(user.profilePic, user.name, user._id || user.id)}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = getAvatarSrc("", user.name, user._id || user.id); }}
                      alt={user.name}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setModal("uploadChoice")}
                    className="absolute -bottom-1 -right-1 w-8 h-8 gradient-bg rounded-xl border-2 border-white flex items-center justify-center text-white shadow-md z-30"
                  >
                    <Plus size={15} strokeWidth={3} />
                  </motion.button>
                </div>
              </div>

              {/* Action Buttons (top-right of card) */}
              <div className="flex items-center gap-2 self-start sm:self-auto pt-1">
                {isUserUnverifiedOrIncomplete(user) ? (
                  <motion.button
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    onClick={() => setModal("edit")}
                    className="px-5 py-2 border rounded-xl text-xs font-black transition-all shadow-md bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Verify Now</span>
                    <Sparkles size={14} className="animate-pulse" />
                  </motion.button>
                ) : (
                  <button
                    onClick={() => setModal("edit")}
                    className="px-5 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm bg-white border-[#E8E6E0] text-[#1A1A1A] hover:bg-[#F9F8F5] cursor-pointer"
                  >
                    Edit Profile
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex p-2 bg-white border border-red-200 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>

            {/* Name & Verified */}
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
                  <NameWithTick name={user.name} tick={user.currentTick} user={user} />
                </h2>
                <VerifiedBadge user={user} size={18} />
              </div>

              {user.bio && (
                <p className="text-sm text-[#4A4A4A] font-medium leading-relaxed max-w-lg">{user.bio}</p>
              )}

              {/* University / Course / Class / Location row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 text-[13px] text-[#1A1A1A] font-semibold mt-4 mb-4">
                {user.university && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base shrink-0">🏫</span>
                    {user.university}
                  </span>
                )}
                {(user.course || user.branch) && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base shrink-0">👨🏻‍🎓</span>
                    {[user.course, user.branch].filter(Boolean).join(' • ')}
                  </span>
                )}
                {user.passOutBatch && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base shrink-0">🏛️</span>
                    Class of {user.passOutBatch}
                  </span>
                )}
                {(user.hometownState || collegeLocation || user.studyYear) && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base shrink-0">📌</span>
                    {user.hometownState ? `${user.hometownState}${user.hometownDistrict ? `, ${user.hometownDistrict}` : ''}` : collegeLocation || user.studyYear}
                  </span>
                )}
              </div>

              {/* Pills row: Streak + Campus Rank + Joined */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Streak pill */}
                  <span className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-200 shadow-sm hover:shadow-[0_4px_12px_rgba(249,115,22,0.15)] hover:-translate-y-0.5 transition-all cursor-default">
                    <span className="text-sm drop-shadow-sm group-hover:scale-110 transition-transform">🔥</span>
                    <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">{getDisplayStreak(user)} Day Streak</span>
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
                {user.createdAt && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#888888] font-semibold">
                    <CalendarDays size={12} className="text-[#888888]" />
                    Since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== STATS ROW ===== */}
        <div className="grid grid-cols-5 gap-0 bg-white border border-[#E8E6E0] border-t shadow-sm md:rounded-b-[1.75rem] overflow-hidden relative z-0">
          {[
            { icon: <Grid size={18} className="text-emerald-500" />, iconBg: "bg-emerald-50", label: "Posts", value: userPosts.length > 0 ? userPosts.length : (user?.postsCount || 0), action: () => { setActiveTab("posts"); window.scrollTo({ top: 500, behavior: "smooth" }); } },
            { icon: <Users size={18} className="text-blue-500" />, iconBg: "bg-blue-50", label: "Followers", value: user?.followers?.length ?? followers.length, action: () => setModal("followers") },
            { icon: <Users size={18} className="text-indigo-500" />, iconBg: "bg-indigo-50", label: "Following", value: user?.following?.length ?? following.length, action: () => setModal("following") },
            { icon: <Crown size={18} className="text-purple-500" />, iconBg: "bg-purple-50", label: "Campus Rank", value: campusRank ? `#${campusRank}` : "—", action: () => router.push("/friends?tab=leaderboard") },
            { icon: <Zap size={18} className="text-amber-500" />, iconBg: "bg-amber-50", label: "XP", value: totalXp.toLocaleString(), action: () => { setActiveTab("badges"); window.scrollTo({ top: 500, behavior: "smooth" }); } },
          ].map((stat, i, arr) => (
            <button
              key={stat.label}
              onClick={stat.action}
              disabled={!stat.action}
              className={`flex flex-col items-center py-5 px-2 gap-1.5 transition-colors group ${stat.action ? 'hover:bg-[#F9F8F5] cursor-pointer' : 'cursor-default'
                } ${i < arr.length - 1 ? 'border-r border-[#E8E6E0]' : ''
                }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-lg font-black text-[#1A1A1A] leading-none">{stat.value}</span>
              <span className="text-[10px] text-[#888888] font-semibold uppercase tracking-wide">{stat.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Navigation + Content */}
        <div className="px-4 md:px-0 pt-6 pb-10 space-y-6">
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

          {/* Tab Contents */}
          {activeTab === "about" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 pt-4 pb-10"
            >
              {/* Bio Card - Hero Style */}
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FFFDF8] via-white to-[#F5F8FF] border border-[#F3F2EE] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 rounded-full bg-[#C8922A]/10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-64 h-64 rounded-full bg-[#4A7DFF]/10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-white border border-[#F3F2EE] shadow-sm flex items-center justify-center shrink-0 mb-6 rotate-3 hover:rotate-0 transition-all duration-300">
                    <span className="text-4xl">👋</span>
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight text-[#1A1A1A]">
                    About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8922A] to-[#E6A835]">{user.name}</span>
                  </h3>
                  <p className="text-lg font-bold leading-relaxed text-[#4A4A4A] max-w-3xl">
                    {user.bio || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Academic Info */}
                <div className="bg-white rounded-[2rem] p-6 border border-[#F3F2EE] shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🎓
                    </div>
                    <h4 className="font-black text-[#1A1A1A] text-lg tracking-wide">Academics</h4>
                  </div>
                  <div className="space-y-4">
                    {user.university && (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest mb-1">University</span>
                        <span className="text-sm font-semibold text-[#1A1A1A]">{user.university}</span>
                      </div>
                    )}
                    {(user.course || user.branch) && (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest mb-1">Course</span>
                        <span className="text-sm font-semibold text-[#1A1A1A]">{[user.course, user.branch, user.studyYear].filter(Boolean).join(" · ")}</span>
                      </div>
                    )}
                    {!user.university && !user.course && !user.branch && (
                      <span className="text-sm font-medium text-gray-400 italic">No academic details added.</span>
                    )}
                  </div>
                </div>

                {/* Personal Info */}
                <div className="bg-white rounded-[2rem] p-6 border border-[#F3F2EE] shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F8FF] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      📍
                    </div>
                    <h4 className="font-black text-[#1A1A1A] text-lg tracking-wide">Personal</h4>
                  </div>
                  <div className="space-y-4">
                    {(user.hometownState || collegeLocation) && (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest mb-1">Location</span>
                        <span className="text-sm font-semibold text-[#1A1A1A]">
                          {user.hometownState ? `${user.hometownState}${user.hometownDistrict ? `, ${user.hometownDistrict}` : ''}` : collegeLocation}
                        </span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest mb-1">Phone</span>
                        <span className="text-sm font-semibold text-[#1A1A1A]">
                          {user.phonePrivacy === 'private' ? `${user.phone.substring(0, 3)}... (Private)` : user.phone}
                        </span>
                      </div>
                    )}
                    {!user.hometownState && !collegeLocation && !user.phone && (
                      <span className="text-sm font-medium text-gray-400 italic">No personal details added.</span>
                    )}
                  </div>
                </div>

                {/* Badges & Highlights */}
                <div className="bg-white rounded-[2rem] p-6 border border-[#F3F2EE] shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Award size={24} className="text-[#C8922A] fill-[#C8922A]" />
                    </div>
                    <h4 className="font-black text-[#1A1A1A] text-lg tracking-wide">Highlights</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">

                    <span className="ca-badge bg-[#FFF9E6] text-[#C8922A] border border-[#C8922A]/20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold">
                      🔥 {getDisplayStreak(user)}
                    </span>
                    {user.isVerified && (
                      <span className="ca-badge bg-[#F5F8FF] text-[#4A7DFF] border border-[#4A7DFF]/20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold">
                        🏅 Verified User
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Socials */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-[#F3F2EE] shadow-sm relative overflow-hidden group">
                  <div className="absolute right-0 top-0 -mr-10 -mt-10 w-40 h-40 bg-[#F5F8FF] rounded-full blur-3xl opacity-60 group-hover:bg-[#E0E7FF] transition-colors"></div>
                  <h4 className="font-black text-[#1A1A1A] text-xl tracking-wide mb-6 relative z-10 flex items-center gap-3">
                    <Globe size={24} className="text-[#4A7DFF]" /> Let's Connect
                  </h4>
                  <div className="flex items-center gap-4 relative z-10">
                    {user.instagram && (
                      <a href={user.instagram.includes('http') ? user.instagram : `https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#FCF8F9] flex items-center justify-center text-[#E1306C] border border-[#E1306C]/10 hover:scale-110 transition-transform">
                        <InstagramIcon size={22} />
                      </a>
                    )}
                    {user.linkedin && (
                      <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#F3F8FC] flex items-center justify-center text-[#229ED9] border border-[#229ED9]/10 hover:scale-110 transition-transform">
                        <Briefcase size={20} />
                      </a>
                    )}
                    {user.github && (
                      <a href={user.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#F5F8FF] flex items-center justify-center text-[#4A7DFF] border border-[#4A7DFF]/10 hover:scale-110 transition-transform">
                        <Code size={20} />
                      </a>
                    )}
                    {user.snapchat && (
                      <a href={`https://snapchat.com/add/${user.snapchat}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#FFFDE6] flex items-center justify-center text-[#D4B500] border border-[#D4B500]/10 hover:scale-110 transition-transform">
                        <Ghost size={22} />
                      </a>
                    )}
                    {!user.instagram && !user.linkedin && !user.github && !user.snapchat && (
                      <span className="text-sm font-medium text-gray-400 italic">No social links added.</span>
                    )}
                  </div>
                </div>

                {/* Interests */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-[#F3F2EE] shadow-sm relative overflow-hidden group">
                  <div className="absolute right-0 top-0 -mr-10 -mt-10 w-40 h-40 bg-[#FBF5FF] rounded-full blur-3xl opacity-60 group-hover:bg-[#F3E8FF] transition-colors"></div>
                  <h4 className="font-black text-[#1A1A1A] text-xl tracking-wide mb-6 relative z-10 flex items-center gap-3">
                    <Heart size={24} className="text-[#A855F7] fill-[#A855F7]" /> Interests & Vibes
                  </h4>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {(user.interests || []).length > 0 || (user.sports || []).length > 0 ? (
                      <>
                        {user.interests?.map((interest, i) => (
                          <span key={`int-${i}`} className="px-4 py-2 bg-[#FBF5FF] text-[#A855F7] rounded-xl text-sm font-bold shadow-sm border border-[#F3E8FF] flex items-center gap-1.5">
                            <span>{getInterestEmoji(interest)}</span>
                            <span>{interest}</span>
                          </span>
                        ))}
                        {user.sports?.map((sport, i) => (
                          <span key={`spt-${i}`} className="px-4 py-2 bg-[#F5F8FF] text-[#4A7DFF] rounded-xl text-sm font-bold shadow-sm border border-[#E0E7FF] flex items-center gap-1.5">
                            <span>{getInterestEmoji(sport)}</span>
                            <span>{sport}</span>
                          </span>
                        ))}
                      </>
                    ) : (
                      <span className="text-sm font-medium text-gray-400 italic">No interests added.</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "posts" && (
            <div className="space-y-6 pb-10">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {userPosts.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 py-20 bg-white border border-[#E8E6E0] shadow-sm rounded-[2.5rem] border-dashed text-center">
                    <p className="text-xl font-black text-[#888888]">No Posts Yet</p>
                    <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-2">Your story starts here</p>
                  </div>
                ) : (
                  userPosts.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      variants={{
                        hidden: { scale: 0.95, opacity: 0 },
                        visible: { scale: 1, opacity: 1 }
                      }}
                      className="bg-white border border-[#E8E6E0] rounded-[2rem] p-5 shadow-sm flex flex-col relative"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img src={getAvatarSrc(user.profilePic, user.name, user._id || user.id)} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[#E8E6E0]" />
                          <div>
                            <p className="text-sm font-black text-[#1A1A1A]"><NameWithTick name={user.name} tick={user.currentTick} user={user} /></p>
                            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">MEMORIES • {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'recently'}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === post.id ? null : post.id); }} className="p-2 text-[#888888] hover:text-[#1A1A1A] transition-colors">
                            <MoreVertical size={16} />
                          </button>
                          <AnimatePresence>
                            {activeDropdown === post.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-lg border border-[#E8E6E0] z-10 overflow-hidden"
                              >
                                <button onClick={() => { setActiveDropdown(null); handleDeletePost(post.id); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                                  Delete Post
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Content (Clickable to open modal) */}
                      <div onClick={() => { setActivePostIndex(idx); setModal("post"); }} className="cursor-pointer flex-1 flex flex-col">
                        {post.content && (
                          <p className="text-[#0F172A] font-medium text-[15px] sm:text-base mb-5 leading-relaxed whitespace-pre-wrap">
                            {renderTextWithLinks(post.content)}
                          </p>
                        )}

                        {post.img && post.mediaType !== 'none' && (
                          <div className="rounded-[1.5rem] overflow-hidden mb-4 bg-[#F9F8F5]">
                            <img src={post.img} className="w-full object-cover max-h-[300px]" alt="" />
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#E8E6E0]/50 mt-auto">
                        <div className="flex space-x-6">
                          <div className="flex items-center space-x-2">
                            <Heart size={20} onClick={() => { setActivePostIndex(idx); setTimeout(handlePostLike, 0); }} className={clsx("cursor-pointer transition-all", post.isLiked ? "text-red-500 fill-red-500" : "text-[#6B6B6B] hover:text-red-500")} />
                            <span className="text-xs font-bold text-[#6B6B6B]">{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageCircle size={20} onClick={() => { setActivePostIndex(idx); setModal("post"); }} className="cursor-pointer text-[#6B6B6B] hover:text-[#C8922A]" />
                            <span className="text-xs font-bold text-[#6B6B6B]">{post.comments}</span>
                          </div>
                        </div>
                        <Send size={20} onClick={() => { setActivePostIndex(idx); handlePostShare(); }} className="cursor-pointer text-[#6B6B6B] hover:text-[#C8922A]" />
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>
          )}

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
                      Your recent activity highlights.
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-gradient-to-r from-white to-red-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-red-600 shadow-sm transition-transform hover:scale-105">
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
                      <p className="text-[11px] font-bold text-amber-600">This Month</p>
                    </div>
                  </div>
                  {/* Streaks */}
                  <div className="group flex items-center gap-5 rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-red-100/60 to-rose-50 p-6 shadow-sm transition-all hover:shadow-[0_8px_24px_rgba(239,68,68,0.2)] hover:-translate-y-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-sm text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
                      🔥
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-red-700 mb-1">Streaks</p>
                      <p className="text-3xl font-black text-slate-900 leading-none mb-1.5">{getDisplayStreak(user)}</p>
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
                      <p className="text-3xl font-black text-slate-900 leading-none mb-1.5">{((user?.followers?.length ?? followers.length) + (user?.following?.length ?? following.length)).toLocaleString()}</p>
                      <p className="text-[11px] font-bold text-blue-600">Total Network</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Badges Overview Hero (Premium) */}
              <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-[#FFFAF0] via-white to-[#F0F7FF] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-[60px]" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-300/10 blur-[60px]" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-[17px] font-black text-[#1A1A1A] flex items-center gap-2 mb-1.5">
                      <span className="text-xl">🎖️</span> Badges Overview
                    </h2>
                    <p className="text-[12px] font-semibold text-slate-500">
                      Your achievements that make you stand out.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-amber-200/50 bg-white/80 backdrop-blur-md px-4 py-2 shadow-sm transition-transform hover:scale-105">
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
                          <div className="absolute inset-0 rounded-[2rem] bg-amber-400/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <img src={featuredBadge.image} alt={featuredBadge.name} className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all duration-500 group-hover:drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]" />
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

                <div className="flex justify-center mt-2">
                  <button
                    onClick={() => {
                      document.getElementById('achievements-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setShowAllBadges(true);
                    }}
                    className="flex items-center gap-2 rounded-full border border-[#E8E6E0] bg-[#FFFAF0] px-5 py-2 text-[11px] font-black text-[#1A1A1A] transition-colors hover:bg-amber-50"
                  >
                    View All Badges <ChevronRight size={14} />
                  </button>
                </div>
              </section>

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
                {!showAllXpActions && (
                  <div className="flex justify-center gap-2 pt-2">
                    {[0, 1, 2].map((dotIndex) => (
                      <button
                        key={dotIndex}
                        onClick={() => {
                          const container = document.getElementById('xp-actions-container');
                          if (container) {
                            // Scroll by approximately one card width
                            const scrollAmount = 296 * dotIndex; // 280px width + 16px gap
                            container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                          }
                        }}
                        className={clsx(
                          "h-2.5 w-2.5 rounded-full transition-all duration-300 shadow-sm hover:scale-110",
                          activeXpDot === dotIndex
                            ? "bg-amber-500 w-6" // Widen the active dot for a cool shifting animation
                            : "bg-amber-200 hover:bg-amber-400 focus:bg-amber-400"
                        )}
                        aria-label={`Scroll to page ${dotIndex + 1}`}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* 4. Achievements & Badges */}
              <section id="achievements-section" className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h3 className="text-[17px] font-black text-[#1A1A1A] flex items-center gap-2 mb-1">
                      <span className="text-xl">🏆</span> Achievements & Badges
                    </h3>
                    <p className="text-[12px] font-semibold text-slate-500">
                      Unlock exclusive profile badges by participating in the community.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-amber-200/50 bg-white px-4 py-2 shadow-sm transition-transform hover:scale-105">
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
                  <div className="flex items-center gap-2 rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50/50 px-4 py-1.5 shadow-sm transition-transform hover:scale-105">
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
                          reached ? `bg-gradient-to-br ${tierStyles.gradient} hover:-translate-y-1 hover:scale-[1.02]`
                            : inProgress ? `bg-gradient-to-br ${tierStyles.inProgressGradient} shadow-sm hover:-translate-y-1`
                              : "border-slate-200/60 bg-white/40 backdrop-blur-sm opacity-80 hover:opacity-100"
                        )}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className={clsx(
                            "flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] transition-all duration-500 overflow-hidden",
                            reached ? `bg-[#0A1128] border-[3px] ${tierStyles.iconRing} group-hover:rotate-[10deg]` 
                              : inProgress ? "bg-[#0A1128] border-[3px] border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.3)] group-hover:scale-110" 
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
                            <div className="flex justify-center mt-2 group-hover:scale-110 transition-transform duration-300">
                              <Lock size={18} className="text-slate-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </div>{/* end Tab Navigation + Content */}
      </div>{/* end max-w-4xl */}



      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-[#F3F2EE] backdrop-blur-xl border border-[#E8E6E0] shadow-xl px-6 py-3 rounded-full text-sm font-bold text-[#1A1A1A]"
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
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] bg-white border border-[#E8E6E0] shadow-sm sm:rounded-[3rem]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E8E6E0] flex items-center justify-between">
                <h3 className="text-lg font-black text-[#1A1A1A] capitalize">{modal}</h3>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={20} /></button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {(modal === "followers" ? followers : following).length === 0 ? (
                  <div className="py-10 text-center text-[#888888] font-bold uppercase tracking-widest text-[10px]">No connections yet</div>
                ) : (
                  (modal === "followers" ? followers : following).map((f, i) => {
                    const targetId = f._id || f.id;
                    return (
                      <div
                        key={targetId ? `${targetId}-${i}` : i}
                        onClick={() => {
                          setModal(null);
                          if (targetId) {
                            router.push(`/profile/${targetId}`);
                          }
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
                        {modal === "following" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnfollow(f._id);
                            }}
                            disabled={unfollowingId === f._id}
                            className="px-4 py-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50 shrink-0 ml-2"
                          >
                            {unfollowingId === f._id ? "..." : "Unfollow"}
                          </button>
                        ) : (
                          <ChevronRight size={18} className="text-[#888888] shrink-0 ml-2 group-hover:text-[#1A1A1A] group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    );
                  })
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
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] bg-white border border-[#E8E6E0] shadow-sm sm:rounded-[3rem]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E8E6E0] flex items-center justify-between">
                <h3 className="text-lg font-black text-[#1A1A1A]">Edit Vibe</h3>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={20} /></button>
              </div>
              <div className="max-h-[72dvh] space-y-6 overflow-y-auto p-5 custom-scrollbar sm:max-h-[70vh] sm:p-6">

                <div className="flex flex-col items-center justify-center space-y-4 mb-4 mt-2">
                  <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#F9F8F5]">
                    {editData.profilePic ? (
                      <img src={getAvatarSrc(editData.profilePic, editData.name || user?.name, user?._id || user?.id)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] bg-[#E8E6E0]/30">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <div className="px-5 py-2.5 bg-white border-2 border-[#E8E6E0] text-[#1A1A1A] rounded-xl text-xs font-black shadow-sm hover:border-[#C8922A] transition-all">
                      {isAvatarUploading ? "UPLOADING..." : "ADD PROFILE PIC 👨🏻‍🎓"}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setIsAvatarUploading(true);
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setEditData({ ...editData, profilePic: ev.target.result });
                          setIsAvatarUploading(false);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }} />
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Full Name</label>
                  <input
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-3 hidden">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Profile Photo URL</label>
                  <input
                    value={editData.profilePic}
                    onChange={e => setEditData({ ...editData, profilePic: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="Image URL or uploaded avatar data"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Bio</label>
                  <textarea
                    maxLength={500}
                    rows={3}
                    value={editData.bio}
                    onChange={e => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A] resize-none"
                    placeholder="Final year CSE | Dev | CAT 2025 Aspirant"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                    <MapPin size={16} className="text-[#C8922A]" />
                    Where are you from? (Hometown)
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={editData.hometownState}
                      onChange={e => setEditData({ ...editData, hometownState: e.target.value, hometownDistrict: "" })}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    >
                      <option value="" className="bg-[#0A0A0F]">Select State</option>
                      {Object.keys(indiaStatesDistricts).sort().map(state => (
                        <option key={state} value={state} className="bg-[#0A0A0F]">{state}</option>
                      ))}
                    </select>

                    <select
                      value={editData.hometownDistrict}
                      onChange={e => setEditData({ ...editData, hometownDistrict: e.target.value })}
                      disabled={!editData.hometownState}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A] disabled:opacity-50"
                    >
                      <option value="" className="bg-[#0A0A0F]">Select District</option>
                      {editData.hometownState && indiaStatesDistricts[editData.hometownState]
                        ? indiaStatesDistricts[editData.hometownState].sort().map(dist => (
                          <option key={dist} value={dist} className="bg-[#0A0A0F]">{dist}</option>
                        ))
                        : null}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Pass Out Batch</label>
                    <select
                      value={editData.passOutBatch}
                      onChange={e => setEditData({ ...editData, passOutBatch: e.target.value })}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    >
                      <option value="" className="bg-[#0A0A0F]">Select batch</option>
                      {["2024", "2025", "2026", "2027", "2028", "2029", "2030"].map(year => <option key={year} value={year} className="bg-[#0A0A0F]">{year}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Year of Study</label>
                    <select
                      value={editData.studyYear}
                      onChange={e => setEditData({ ...editData, studyYear: e.target.value })}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    >
                      <option value="" className="bg-[#0A0A0F]">Select year</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"].map(year => <option key={year} value={year} className="bg-[#0A0A0F]">{year}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Course</label>
                    <select
                      value={editData.course}
                      onChange={e => setEditData({ ...editData, course: e.target.value })}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    >
                      <option value="" className="bg-[#0A0A0F]">Select course</option>
                      {["B.Tech", "BCA", "MCA", "MBA", "B.Sc", "M.Tech", "B.Com", "BA", "Other"].map(course => <option key={course} value={course} className="bg-[#0A0A0F]">{course}</option>)}
                    </select>
                    {editData.course === "Other" && (
                      <input
                        value={editData.customCourse || ''}
                        onChange={e => setEditData({ ...editData, customCourse: e.target.value })}
                        className="w-full mt-2 rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                        placeholder="Type your course"
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Branch</label>
                    <input
                      value={editData.branch}
                      onChange={e => setEditData({ ...editData, branch: e.target.value })}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                      placeholder="Computer Science, ECE, Marketing"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Private Phone</label>
                  <div className="flex rounded-2xl border border-[#E8E6E0] bg-white overflow-hidden">
                    <span className="border-r border-[#E8E6E0] bg-[#F9F8F5] px-4 py-3 text-sm font-black text-[#6B6B6B]">+91</span>
                    <input
                      value={editData.phone}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none"
                      placeholder="Optional"
                      maxLength={10}
                    />
                  </div>
                  {editData.phone && editData.phone.length >= 10 && (
                    <div className="flex justify-center gap-3 mt-3">
                      <button
                        onClick={() => setEditData({ ...editData, phonePrivacy: 'public' })}
                        className={`px-5 py-2 text-xs font-black rounded-xl border transition-all ${editData.phonePrivacy === 'public' ? 'bg-green-500 border-green-600 text-white shadow-md' : 'bg-white border-[#E8E6E0] text-[#1A1A1A] hover:bg-[#F9F8F5]'}`}
                      >
                        PUBLIC
                      </button>
                      <button
                        onClick={() => setEditData({ ...editData, phonePrivacy: 'private' })}
                        className={`px-5 py-2 text-xs font-black rounded-xl border transition-all ${editData.phonePrivacy === 'private' ? 'bg-green-500 border-green-600 text-white shadow-md' : 'bg-white border-[#E8E6E0] text-[#1A1A1A] hover:bg-[#F9F8F5]'}`}
                      >
                        PRIVATE
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  <input
                    value={editData.linkedin}
                    onChange={e => setEditData({ ...editData, linkedin: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="LinkedIn URL"
                  />
                  <input
                    value={editData.github}
                    onChange={e => setEditData({ ...editData, github: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="GitHub URL"
                  />
                  <input
                    value={editData.instaId}
                    onChange={e => setEditData({ ...editData, instaId: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="Instagram username"
                  />
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(i => (
                      <button
                        key={i.name}
                        onClick={() => toggleInterest(i.name)}
                        className={clsx(
                          "px-4 py-2 rounded-full text-[10px] font-bold transition-all border flex items-center space-x-2",
                          (editData.interests || []).includes(i.name) ? "gradient-bg text-[#1A1A1A] border-transparent" : "bg-[#F9F8F5] border border-[#E8E6E0] text-[#6B6B6B] border-[#E8E6E0]"
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
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Sports</label>
                  <div className="flex flex-wrap gap-2">
                    {SPORT_OPTIONS.map(s => (
                      <button
                        key={s.name}
                        onClick={() => toggleSport(s.name)}
                        className={clsx(
                          "px-4 py-2 rounded-full text-[10px] font-bold transition-all border flex items-center space-x-2",
                          (editData.sports || []).includes(s.name) ? "bg-yellow-500 text-black border-transparent font-black" : "bg-[#F9F8F5] border border-[#E8E6E0] text-[#6B6B6B] border-[#E8E6E0]"
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
                  className="w-full gradient-bg py-5 rounded-[2rem] text-sm font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl shadow-[0_4px_14px_rgba(200,146,42,0.15)] disabled:opacity-50 flex justify-center items-center h-16"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-[#E8E6E0] border-t-white rounded-full animate-spin" />
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
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/95 p-3 backdrop-blur-xl sm:items-center sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] bg-white border border-[#E8E6E0] shadow-sm sm:max-h-[90vh] sm:rounded-[3rem]"
              onClick={e => e.stopPropagation()}
            >
              {/* Post Header */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl p-[1.5px] gradient-bg">
                    <img src={getAvatarSrc(user.profilePic, user.name, user._id || user.id)} className="w-full h-full rounded-[0.9rem] object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1A1A1A]"><NameWithTick name={user.name} tick={user.currentTick} user={user} /></p>
                    <p className="text-[10px] text-[#6B6B6B] font-bold uppercase">POST</p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={20} /></button>
              </div>

              {/* Media or Text Content */}
              <div className="relative flex-1 bg-[#F9F8F5] min-h-[300px] overflow-y-auto custom-scrollbar flex flex-col">
                {userPosts[activePostIndex].mediaType !== 'none' && userPosts[activePostIndex].img ? (
                  <div className="flex-1 flex items-center justify-center">
                    <img src={userPosts[activePostIndex].img} className="w-full h-full object-cover max-h-[60vh]" />
                  </div>
                ) : (
                  <div className="p-8 text-center w-full flex-1 flex flex-col min-h-full">
                    <p className="text-2xl sm:text-3xl font-black text-[#1A1A1A] leading-relaxed break-words my-auto">
                      {userPosts[activePostIndex].content}
                    </p>
                  </div>
                )}
                {/* Navigation buttons */}
                <div className="absolute inset-y-0 left-0 flex items-center px-2">
                  <button onClick={(e) => { e.stopPropagation(); if (activePostIndex > 0) setActivePostIndex(activePostIndex - 1); }} className="p-2 bg-white/80 backdrop-blur border border-[#E8E6E0] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A]"><ChevronLeft size={20} /></button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center px-2">
                  <button onClick={(e) => { e.stopPropagation(); if (activePostIndex < userPosts.length - 1) setActivePostIndex(activePostIndex + 1); }} className="p-2 bg-white/80 backdrop-blur border border-[#E8E6E0] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A]"><ChevronRight size={20} /></button>
                </div>
              </div>

              {/* Post Actions */}
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Heart size={24} onClick={handlePostLike} className={clsx("cursor-pointer transition-all", userPosts[activePostIndex].isLiked ? "text-red-500 fill-red-500 scale-110" : "text-[#6B6B6B] hover:text-red-500")} />
                    <MessageCircle size={24} onClick={() => document.getElementById('comment-input').focus()} className="cursor-pointer text-[#6B6B6B] hover:text-[#C8922A]" />
                    <Send size={24} onClick={() => { setModal(null); setShareModalPost(userPosts[activePostIndex]); }} className="cursor-pointer text-[#6B6B6B] hover:text-[#C8922A]" />
                  </div>
                  <div className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">{userPosts[activePostIndex].likes} Vibes</div>
                </div>

                <div className="space-y-4">
                  {!!userPosts[activePostIndex].img && userPosts[activePostIndex].content && (
                    <p className="text-sm text-[#4A4A4A] leading-relaxed font-medium">
                      <span className="font-black mr-2"><NameWithTick name={user.name} tick={user.currentTick} user={user} /></span>
                      {userPosts[activePostIndex].content}
                    </p>
                  )}
                  {/* Comments Section Header */}
                  <div className="flex items-center justify-between pt-6 border-t border-[#E8E6E0]/50">
                    <h4 className="text-sm font-black text-[#1A1A1A]">Comments ({userPosts[activePostIndex].commentsList.length})</h4>
                    <button className="flex items-center space-x-1 text-[10px] font-bold text-[#6B6B6B]">
                      <span>Latest</span>
                      <ChevronRight size={12} className="rotate-90" />
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {userPosts[activePostIndex].commentsList.map(c => (
                      <div key={c.id} className="flex items-start space-x-3">
                        <img src={c.profilePic || getAvatarSrc(null, c.author, c.id)} className="w-8 h-8 rounded-full object-cover border border-[#E8E6E0]" alt="" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="bg-[#F5F5F5] rounded-2xl rounded-tl-none px-4 py-3 relative max-w-[90%]">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-black text-[#1A1A1A] text-xs">{c.author}</span>
                                <span className="text-[10px] font-medium text-[#888888]">
                                  {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : 'just now'}
                                </span>
                              </div>
                              <p className="text-[#1A1A1A] text-xs font-medium leading-relaxed">{c.text}</p>
                            </div>
                            <button className="p-2 text-[#888888] hover:text-[#1A1A1A]"><MoreVertical size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Comment Input */}
              <div className="p-4 bg-white border-t border-[#E8E6E0]/50 flex items-center space-x-3">
                <div className="flex-1 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full flex items-center px-4 py-2">
                  <input
                    id="comment-input"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitPostComment()}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent text-sm text-[#1A1A1A] focus:outline-none font-medium placeholder:text-[#888888]"
                  />
                </div>
                <button onClick={submitPostComment} disabled={!commentInput.trim()} className="bg-[#C8922A] text-white px-5 py-2 rounded-full font-black text-xs hover:bg-[#B07B1E] disabled:opacity-50 transition-colors">Post</button>
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
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md space-y-4 rounded-[1.75rem] border border-[#E8E6E0] bg-white p-5 sm:rounded-[2.5rem] sm:p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-center text-lg font-black text-[#1A1A1A] tracking-tight mb-2">Update Profile Picture 📸</h3>
              <button
                onClick={() => setModal("editPic")}
                className="w-full flex items-center space-x-4 p-5 bg-white border border-[#E8E6E0] shadow-sm rounded-2xl hover:border-[#C8922A]/30 transition-all group"
              >
                <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-[#1A1A1A] shadow-lg">
                  <Camera size={22} />
                </div>
                <div className="text-left">
                  <p className="font-black text-[#1A1A1A] text-sm">Profile Picture</p>
                  <p className="text-[11px] text-[#6B6B6B] font-medium mt-0.5">Visible to everyone, always</p>
                </div>
              </button>
              <button onClick={() => setModal(null)} className="w-full py-3 text-[#6B6B6B] text-sm font-bold">Cancel</button>
            </motion.div>
          </motion.div>
        )}

        {/* ====== EDIT PROFILE PIC MODAL ====== */}
        {modal === "editPic" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md space-y-4 rounded-[1.75rem] border border-[#E8E6E0] bg-[#111118] p-5 sm:rounded-[2.5rem] sm:p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-[#1A1A1A]">Update Profile Picture</h3>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={18} /></button>
              </div>
              {editData.profilePic && (
                <div className="flex justify-center">
                  <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-2 border-purple-500/50 shadow-xl">
                    <img src={getAvatarSrc(editData.profilePic, editData.name || user?.name, user?._id || user?.id)} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                </div>
              )}
              {/* File picker button */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureFile}
                />
                <div className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed border-[#C8922A]/30 bg-purple-500/5 hover:bg-[#C8922A]/10 transition-all">
                  <Camera size={32} className="text-[#C8922A]" />
                  <p className="text-sm font-black text-[#6B6B6B]">Tap to choose from gallery</p>
                  <p className="text-[10px] text-[#6B6B6B]">JPG, PNG, WEBP — visible to everyone</p>
                </div>
              </label>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={saveProfile}
                disabled={!editData.profilePic || isAvatarUploading || isSaving}
                className="w-full gradient-bg py-4 rounded-2xl text-sm font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl shadow-[0_4px_14px_rgba(200,146,42,0.15)] disabled:opacity-40"
              >
                {isAvatarUploading ? "Uploading..." : saved ? "Saved! ✅" : "Save Picture"}
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
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-h-[92dvh] w-full max-w-md space-y-4 overflow-y-auto rounded-[1.75rem] border border-[#E8E6E0] bg-[#111118] p-5 custom-scrollbar sm:rounded-[2.5rem] sm:p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#1A1A1A]">Add Story</h3>
                  <p className="text-[11px] text-[#6B6B6B] font-medium flex items-center gap-1 mt-0.5"><Clock size={10} /> Visible for 24 hours only</p>
                </div>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={18} /></button>
              </div>
              {/* Preview */}
              {storyInput.imageUrl && (
                <div className="relative w-full aspect-[9/16] max-h-64 rounded-2xl overflow-hidden border border-[#E8E6E0]">
                  <img src={storyInput.imageUrl} className="w-full h-full object-cover" />
                  {storyInput.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[#1A1A1A] text-sm font-bold text-center">{storyInput.caption}</p>
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
                    <p className="text-sm font-black text-[#6B6B6B]">Tap to choose from gallery</p>
                    <p className="text-[10px] text-[#6B6B6B]">JPG, PNG, WEBP — disappears in 24h</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-pink-400 text-center font-bold">Tap to change photo</p>
                )}
              </label>
              <div className="space-y-1">
                <label className="text-[11px] text-[#6B6B6B] font-bold uppercase tracking-widest">Caption (optional)</label>
                <input
                  value={storyInput.caption}
                  onChange={e => setStoryInput(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Write something..."
                  className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-pink-500/50 transition-colors placeholder-white/20"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddStory}
                disabled={storyUploading || !storyInput.imageUrl.trim()}
                className="w-full py-4 rounded-2xl text-sm font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl disabled:opacity-40"
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
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black p-0 sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative flex h-[100dvh] w-full max-w-sm flex-col sm:h-full sm:max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Progress bars */}
              <div className="absolute top-4 left-4 right-4 z-20 flex space-x-1">
                {activeStories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-[#F3F2EE] overflow-hidden">
                    <div className={`h-full bg-white rounded-full transition-all duration-300 ${i < viewingStoryIndex ? 'w-full' : i === viewingStoryIndex ? 'w-1/2' : 'w-0'}`} />
                  </div>
                ))}
              </div>
              {/* Header */}
              <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white">
                    <img src={getAvatarSrc(user.profilePic, user.name, user._id || user.id)} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[#1A1A1A] font-black text-sm"><NameWithTick name={user.name} tick={user.currentTick} user={user} /></p>
                    <p className="text-[#6B6B6B] text-[10px] flex items-center gap-1">
                      <Clock size={9} />
                      {Math.round((currentTime - activeStories[viewingStoryIndex]?.createdAt) / 60000)}m ago · expires in {Math.round((24 * 60 - (currentTime - activeStories[viewingStoryIndex]?.createdAt) / 60000))}m
                    </p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F3F2EE] rounded-full text-[#1A1A1A]"><X size={18} /></button>
              </div>
              {/* Story Image */}
              <div className="relative h-full w-full overflow-hidden sm:rounded-3xl">
                <img src={activeStories[viewingStoryIndex]?.imageUrl} className="w-full h-full object-cover" />
                {activeStories[viewingStoryIndex]?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[#1A1A1A] font-bold text-center text-base">{activeStories[viewingStoryIndex].caption}</p>
                  </div>
                )}
                {/* Tap zones */}
                <button className="absolute left-0 top-0 w-1/3 h-full" onClick={() => setViewingStoryIndex(Math.max(0, viewingStoryIndex - 1))} />
                <button className="absolute right-0 top-0 w-1/3 h-full" onClick={() => viewingStoryIndex < activeStories.length - 1 ? setViewingStoryIndex(viewingStoryIndex + 1) : setModal(null)} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Share Modal */}
        {shareModalPost && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShareModalPost(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-[#E8E6E0] flex justify-between items-center">
                <h3 className="text-lg font-black text-[#1A1A1A]">Share with Connection</h3>
                <button onClick={() => setShareModalPost(null)} className="p-2 bg-[#F9F8F5] rounded-full text-[#6B6B6B]"><X size={20} /></button>
              </div>
              <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                {connections.length === 0 ? (
                  <p className="text-center text-sm font-bold text-[#888888] py-8">No connections found to share with.</p>
                ) : (
                  connections.map(conn => (
                    <div key={conn._id || conn.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={conn.profilePic || getAvatarSrc(conn)} className="w-10 h-10 rounded-full object-cover border border-[#E8E6E0]" />
                        <span className="text-sm font-black text-[#1A1A1A]"><NameWithTick name={conn.name} tick={conn.currentTick} user={conn} /></span>
                      </div>
                      <button
                        onClick={() => handleShareToConnection(conn, shareModalPost)}
                        disabled={shareSending[conn._id || conn.id]}
                        className="px-4 py-2 bg-[#C8922A] text-white rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        {shareSending[conn._id || conn.id] ? "Sent" : "Send"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
