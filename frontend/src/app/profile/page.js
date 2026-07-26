"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { LogOut, Edit3, X, Check, Plus, Grid, Heart, MessageCircle, Send, ChevronLeft, ChevronRight, Share2, Ghost, MapPin, Zap, Star, Camera, Clock, Image as ImageIcon, Music, Code, Palette, Plane, Gamepad2, Book, Dumbbell, Film, Utensils, Trophy, Briefcase, Users, Crown, CalendarDays, GraduationCap, Flame, Building2, TrendingUp, Award } from "lucide-react";
import { getAuthenticatedSupabaseClient } from "@/utils/supabaseAuthUser";

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

  const [editData, setEditData] = useState({
    name: "",
    bio: "",
    profilePic: "",
    passOutBatch: "",
    course: "",
    branch: "",
    studyYear: "",
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Token helper
  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("collegeadda_token") : null;

  // Set user from localStorage initially
  useEffect(() => {
    const stored = localStorage.getItem("collegeadda_user");
    if (stored) {
      setUser(JSON.parse(stored));
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
      setEditData({ 
        name: profileData.name || "",
        bio: profileData.bio || "",
        profilePic: profileData.profilePic || "",
        passOutBatch: profileData.passOutBatch || "",
        course: profileData.course || "",
        branch: profileData.branch || "",
        studyYear: profileData.studyYear || profileData.year || "",
        phone: profileData.phone || "",
        phonePrivacy: profileData.phonePrivacy || "private",
        linkedin: profileData.linkedin || "",
        github: profileData.github || "",
        instaId: profileData.instagram || "", 
        snapId: profileData.snapchat || "", 
        interests: profileData.interests || [], 
        sports: profileData.sports || [] 
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

  // -- TanStack Query: My Posts --
  const { data: myPostsRaw = [] } = useApiQuery(
    ["user-posts", user?._id || user?.id],
    `/api/posts?author=${user?._id || user?.id}&limit=100`,
    {
      enabled: !!getToken() && !!(user?._id || user?.id),
      staleTime: 2 * 60 * 1000,
    }
  );

  const userPosts = useMemo(() => {
    if (!user) return [];
    const filtered = myPostsRaw.filter(p => p.author?._id === user._id || p.author?._id === user.id);
    return filtered.map(p => ({
      id: p._id,
      img: p.mediaUrl || "https://picsum.photos/seed/fallback/300/300",
      content: p.content,
      likes: p.likes?.length || 0,
      isLiked: p.likes?.includes(user._id || user.id),
      comments: p.comments?.length || 0,
      commentsList: p.comments?.map(c => ({
        id: c._id || Math.random().toString(),
        author: c.user?.name || "Student",
        text: c.text
      })) || []
    }));
  }, [myPostsRaw, user]);

  // -- TanStack Query: Followers --
  const { data: followers = [] } = useApiQuery(
    "user-followers",
    "/api/users/me/followers",
    {
      enabled: !!getToken(),
      staleTime: 2 * 60 * 1000,
    }
  );

  // -- TanStack Query: Following --
  const { data: following = [] } = useApiQuery(
    "user-following",
    "/api/users/me/following",
    {
      enabled: !!getToken(),
      staleTime: 2 * 60 * 1000,
    }
  );

  const networksCount = followers.filter(f => following.some(fol => fol._id === f._id || fol.id === f._id)).length;

  // -- TanStack Query: Colleges (for banner image) --
  const { data: colleges = [] } = useApiQuery(
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

    return ACHIEVEMENT_BADGES.map((badge) => {
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
        <div className="relative rounded-none md:rounded-[1.75rem] overflow-hidden bg-white border border-[#E8E6E0] shadow-sm">

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
                <button
                  onClick={() => setModal("edit")}
                  className={clsx(
                    "px-5 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm",
                    !user.isVerified 
                      ? "bg-green-500 border-green-600 text-white hover:bg-green-600" 
                      : "bg-white border-[#E8E6E0] text-[#1A1A1A] hover:bg-[#F9F8F5]"
                  )}
                >
                  {!user.isVerified ? "Verify Now" : "Edit Profile"}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-white border border-red-200 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
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
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#6B6B6B] font-semibold">
                {user.university && (
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-[#C8922A] shrink-0" />
                    {user.university}
                  </span>
                )}
                {(user.course || user.branch) && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-[#C8922A] shrink-0" />
                    {[user.course, user.branch].filter(Boolean).join(' • ')}
                  </span>
                )}
                {user.passOutBatch && (
                  <span className="flex items-center gap-1.5">
                    <Users size={13} className="text-[#C8922A] shrink-0" />
                    Class of {user.passOutBatch}
                  </span>
                )}
                {(collegeLocation || user.studyYear) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#C8922A] shrink-0" />
                    {collegeLocation || user.studyYear}
                  </span>
                )}
              </div>

              {/* Pills row: Streak + Campus Rank + Joined */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
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
        <div className="grid grid-cols-5 gap-0 bg-white border-x border-b border-[#E8E6E0] shadow-sm md:rounded-b-[1.75rem] overflow-hidden">
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
              className={`flex flex-col items-center py-5 px-2 gap-1.5 transition-colors group ${
                stat.action ? 'hover:bg-[#F9F8F5] cursor-pointer' : 'cursor-default'
              } ${
                i < arr.length - 1 ? 'border-r border-[#F3F2EE]' : ''
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
          <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-10">
            {/* Left Column: Details */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">About</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  {user.bio || "No description provided."}
                </p>
              </div>
              
              <div className="space-y-3.5 pt-4 border-t border-[#F3F2EE] text-sm text-[#4A4A4A]">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏫</span>
                  <span>{user.university || "CampusAdda Member"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📍</span>
                  <span>{[user.course, user.branch].filter(Boolean).join(" · ") || "Student"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📅</span>
                  <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently"}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📞</span>
                    <span>
                      {user.phonePrivacy === 'private' 
                        ? `${user.phone.substring(0,3)}... (Private)`
                        : user.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Badges, Socials, Interests */}
            <div className="space-y-8">
              {/* Badges */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#888888] uppercase tracking-wider">Badges</h4>
                <div className="flex items-center gap-2">
                  <UniversityBadges userId={user.id || user.email} />
                  <span className="ca-badge bg-[#FFF8EC] text-[#C8922A] border border-[#C8922A]/20">
                    🔥 {getDisplayStreak(user)}
                  </span>
                  {user.isVerified && (
                    <span className="ca-badge bg-[#FFF8EC] text-[#C8922A] border border-[#C8922A]/20">Verified User</span>
                  )}
                </div>
              </div>

              {/* Campus Socials */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#888888] uppercase tracking-wider">Campus Socials</h4>
                <div className="flex items-center gap-3">
                  {user.instagram && (
                    <a 
                      href={user.instagram.includes('http') ? user.instagram : `https://instagram.com/${user.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#F3F2EE] flex items-center justify-center text-[#4A4A4A] hover:bg-[#FFF8EC] hover:text-[#C8922A] transition-all"
                    >
                      <InstagramIcon size={18} />
                    </a>
                  )}
                  {user.linkedin && (
                    <a 
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#F3F2EE] flex items-center justify-center text-[#4A4A4A] hover:bg-[#FFF8EC] hover:text-[#C8922A] transition-all"
                    >
                      <Send size={16} />
                    </a>
                  )}
                  {user.github && (
                    <a 
                      href={user.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#F3F2EE] flex items-center justify-center text-[#4A4A4A] hover:bg-[#FFF8EC] hover:text-[#C8922A] transition-all"
                    >
                      <Code size={16} />
                    </a>
                  )}
                  {user.snapchat && (
                    <a 
                      href={`https://snapchat.com/add/${user.snapchat}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#F3F2EE] flex items-center justify-center text-[#4A4A4A] hover:bg-[#FFF8EC] hover:text-[#C8922A] transition-all"
                    >
                      <Ghost size={18} />
                    </a>
                  )}
                  {!user.instagram && !user.linkedin && !user.github && !user.snapchat && (
                    <span className="text-xs text-[#888888]">No social links added.</span>
                  )}
                </div>
              </div>

              {/* Interests & Sports */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#888888] uppercase tracking-wider">Interests & Sports</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(user.interests || []).map((i, idx) => (
                    <span key={idx} className="bg-[#F3F2EE] px-3 py-1.5 rounded-full text-xs font-semibold text-[#6B6B6B] border border-transparent hover:border-[#C8922A]/20 transition-all">
                      {i}
                    </span>
                  ))}
                  {(user.sports || []).map((s, idx) => (
                    <span key={idx} className="bg-[#FFF8EC] px-3 py-1.5 rounded-full text-xs font-semibold text-[#C8922A] border border-[#C8922A]/10">
                      {s}
                    </span>
                  ))}
                  {(user.interests || []).length === 0 && (user.sports || []).length === 0 && (
                    <span className="text-xs text-[#888888]">No interests or sports added.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div className="space-y-6 pb-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
              className="grid grid-cols-3 gap-2"
            >
              {userPosts.length === 0 ? (
                <div className="col-span-3 py-20 bg-white border border-[#E8E6E0] shadow-sm rounded-[2.5rem] border-dashed text-center">
                  <p className="text-xl font-black text-[#888888]">No Posts Yet</p>
                  <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-2">Your story starts here</p>
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
                    className="aspect-square rounded-[1.5rem] overflow-hidden relative group cursor-pointer border border-[#E8E6E0]"
                  >
                    <img src={post.img} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-[#C8922A]/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-4">
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
        )}

        {activeTab === "badges" && (
          <div className="space-y-6 pb-10">
            <section className="relative overflow-hidden rounded-[2rem] border border-[#E8E6E0] bg-white p-5 shadow-sm sm:p-6">
              <div className="pointer-events-none absolute -right-12 -top-20 h-44 w-44 rounded-full bg-[#FFD166]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#7DD3FC]/10 blur-3xl" />
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="relative">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1A1A]">Badges Earned</h3>
                  <p className="mt-1 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                    {earnedBadges.filter(badge => badge.earned).length > 0
                      ? "Your unlocked achievement badges show here."
                      : "Earn an achievement to unlock badge artwork here."}
                  </p>
                </div>
                <span className="relative rounded-full border border-[#E8E6E0] bg-[#F9F8F5] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] shadow-sm">
                  {earnedBadges.filter(badge => badge.earned).length}/{earnedBadges.length} unlocked
                </span>
              </div>

              {earnedBadges.filter(badge => badge.earned).length > 0 ? (
                <div className="relative mt-5 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar">
                  {earnedBadges.filter(badge => badge.earned).map((badge) => (
                    <motion.div
                      key={badge.id}
                      whileHover={{ y: -6, scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group relative w-36 shrink-0 snap-start rounded-[1.35rem] border border-[#E8E6E0] bg-white p-3 shadow-sm hover:shadow-[0_12px_30px_rgba(200,146,42,0.12)] transition-shadow overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative mx-auto aspect-[3/4] max-h-52 overflow-hidden rounded-[1rem] bg-gradient-to-b from-[#F9F8F5] to-white shadow-inner border border-[#E8E6E0]/50">
                        <img
                          src={badge.image}
                          alt={badge.name}
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <p className="relative mt-3 truncate text-center text-xs font-black text-[#1A1A1A] group-hover:text-[#C8922A] transition-colors">{badge.name}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="relative mt-5 rounded-[1.35rem] border border-dashed border-[#E2B84D] bg-white/60 px-4 py-8 text-center text-sm font-bold text-[#9A6A10]">
                  No badges earned yet.
                </div>
              )}
            </section>


            {/* Performance Stats Placeholder */}
            <section className="rounded-[2rem] border border-[#E8E6E0] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-500" /> Performance Stats
                  </h3>
                  <p className="mt-1 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">Weekly / Monthly totals</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-[#F9F8F5] p-1 border border-[#E8E6E0]">
                  <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-600 shadow-sm border border-red-200 hover:bg-red-100 transition-colors cursor-default">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                    </span>
                    Live
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center transition-all hover:bg-amber-100 hover:shadow-[0_4px_12px_rgba(245,158,11,0.15)] hover:-translate-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1.5">XP Earned</p>
                  <p className="text-2xl font-black text-amber-700 tracking-tight">✨ {totalXp.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center transition-all hover:bg-rose-100 hover:shadow-[0_4px_12px_rgba(244,63,94,0.15)] hover:-translate-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1.5">Strikes</p>
                  <p className="text-2xl font-black text-rose-600 tracking-tight">🔥 {getDisplayStreak(user)}</p>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center transition-all hover:bg-blue-100 hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)] hover:-translate-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1.5">Network</p>
                  <p className="text-2xl font-black text-blue-600 tracking-tight">🫂 {((user?.followers?.length ?? followers.length) + (user?.following?.length ?? following.length)).toLocaleString()}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#E8E6E0] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8F9FA_100%)] p-5 shadow-sm sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-100/60 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" /> How XP Works
                  </h3>
                  <span className="flex h-6 items-center rounded-full bg-amber-50 px-2.5 text-[10px] font-black text-amber-600 border border-amber-200/50">Level Up Fast</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {XP_ACTIONS.map((item) => (
                    <div key={item.action} className={clsx("group flex flex-col justify-between rounded-[1.25rem] border border-[#E8E6E0] bg-white p-4 transition-all hover:-translate-y-0.5", item.borderHover, item.shadowHover)}>
                      <div className="flex items-start justify-between mb-3">
                        <span className={clsx("flex h-10 w-10 items-center justify-center rounded-xl transition-colors", item.iconBg, item.iconColor)}>
                          {item.icon}
                        </span>
                        <span className={clsx("inline-flex items-center rounded-lg px-2 py-1 text-xs font-black shadow-sm border", item.xpBg, item.xpText)}>{item.xp}</span>
                      </div>
                      <p className="text-sm font-bold text-[#1A1A1A] leading-tight">{item.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#D9B45D]/30 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF9EF_100%)] p-5 shadow-[0_8px_30px_rgba(200,146,42,0.06)] sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                    <Trophy size={16} className="text-[#C8922A]" /> Achievements & Badges
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-[#6B6B6B]">Unlock exclusive profile badges by participating in the community.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-white border border-[#E8E6E0] rounded-full p-1 pl-3 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">
                    Progress
                  </span>
                  <span className="rounded-full bg-[#C8922A] px-2.5 py-1 text-[10px] font-black text-white">
                    {earnedBadges.filter(badge => badge.earned).length} / {earnedBadges.length}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    title={badge.condition}
                    className={clsx(
                      "group relative overflow-hidden rounded-[1.5rem] border p-4 transition-all duration-300",
                      badge.earned
                        ? "border-[#D9B45D]/40 bg-white shadow-[0_10px_30px_rgba(200,146,42,0.12)] hover:shadow-[0_14px_40px_rgba(200,146,42,0.2)] hover:-translate-y-1 z-10"
                        : "border-[#E8E6E0] bg-white/60 opacity-80 hover:opacity-100 hover:bg-white"
                    )}
                  >
                    {badge.earned && (
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C8922A]/10 blur-2xl transition-all group-hover:bg-[#C8922A]/20" />
                    )}
                    <div className="relative z-10 flex items-start gap-4">
                      <div className={clsx(
                        "h-16 w-16 shrink-0 overflow-hidden rounded-[1.25rem] border-[3px] bg-[#111827] shadow-sm transition-transform duration-300 group-hover:scale-[1.03]",
                        badge.earned ? "border-[#D9B45D]/40" : "border-[#E8E6E0] grayscale opacity-50"
                      )}>
                        <img
                          src={badge.image}
                          alt={badge.name}
                          className={clsx("h-full w-full object-cover", !badge.earned && "opacity-40")}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={clsx("font-black truncate text-sm", badge.earned ? "text-[#1A1A1A]" : "text-[#4A4A4A]")}>{badge.name}</p>
                          <span className={clsx(
                            "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 shadow-sm",
                            badge.earned ? "bg-gradient-to-r from-amber-100 to-emerald-50 text-emerald-700 border border-emerald-200/50" : "bg-[#F3F2EE] text-[#888888] border border-[#E8E6E0]"
                          )}>
                            {badge.earned ? "Unlocked" : "Locked"}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#6B6B6B] leading-tight mb-3">{badge.condition}</p>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className={badge.earned ? "text-[#C8922A]" : "text-[#888888]"}>Progress</span>
                            <span className="text-[#1A1A1A]">{Math.min(badge.progress, badge.target).toLocaleString()} / {badge.target.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F2EE]">
                            <div 
                              className={clsx("h-full rounded-full transition-all duration-1000", badge.earned ? "bg-gradient-to-r from-[#C8922A] to-amber-400" : "bg-[#D1D1D1]")}
                              style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#D9B45D]/30 bg-white p-5 shadow-sm sm:p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                    <Award size={16} className="text-[#C8922A]" /> XP Tiers
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 items-center rounded-full bg-[#FFF8EC] px-3 text-[10px] font-black text-[#C8922A] border border-[#D9B45D]/30 shadow-sm">
                      Current: {totalXp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {XP_TIERS.map((tier) => {
                    const reached = totalXp >= tier.xp;
                    const inProgress = nextTick?.id === tier.id;
                    return (
                      <div 
                        key={tier.id} 
                        className={clsx(
                          "group relative overflow-hidden rounded-[1.25rem] border p-4 transition-all duration-300",
                          reached ? "border-[#D9B45D]/50 bg-white shadow-md hover:-translate-y-0.5 hover:shadow-lg" : inProgress ? "border-[#D9B45D]/30 bg-[#F9F8F5] shadow-sm hover:bg-white" : "border-[#E8E6E0] bg-[#F9F8F5] opacity-80 grayscale hover:grayscale-0 hover:opacity-100"
                        )}
                      >
                        {reached && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-amber-500/20"></div>
                        )}
                        <div className="relative z-10 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={clsx(
                                "flex h-16 w-16 shrink-0 overflow-hidden items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg",
                                reached ? "border-2 border-[#D9B45D]/50 bg-black/5" : inProgress ? "border border-[#E8E6E0] bg-black/5" : "opacity-40 grayscale"
                              )}>
                                <img src={tier.icon} alt={tier.label} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className={clsx("text-sm font-black leading-tight mb-0.5", reached ? "text-[#1A1A1A]" : "text-[#4A4A4A]")}>{tier.label}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#888888]">{tier.xp.toLocaleString()} XP required</p>
                              </div>
                            </div>
                            {reached ? (
                              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 shadow-sm border border-emerald-200">
                                <Check size={12} strokeWidth={4} />
                              </span>
                            ) : inProgress ? (
                              <span className="rounded-full bg-[#FFF8EC] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#C8922A] border border-[#D9B45D]/30 shadow-sm">
                                In Progress
                              </span>
                            ) : (
                              <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#888888] border border-[#E8E6E0]">
                                Locked
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-1.5 mt-2">
                            <div className="h-1.5 overflow-hidden rounded-full bg-[#F3F2EE]">
                              <div
                                className={clsx(
                                  "h-full rounded-full transition-all duration-1000", 
                                  reached ? "bg-emerald-500" : "bg-gradient-to-r from-amber-400 to-amber-500"
                                )}
                                style={{ width: `${reached ? 100 : inProgress ? nextTickProgress : 0}%` }}
                              />
                            </div>
                            {inProgress && (
                              <p className="text-right text-[9px] font-bold uppercase tracking-widest text-[#888888]">
                                {totalXp.toLocaleString()} / {tier.xp.toLocaleString()} XP
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                  (modal === "followers" ? followers : following).map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-[#F3F2EE] rounded-[2rem] transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full p-[1.5px] gradient-bg">
                          <img 
                            src={getAvatarSrc(f.profilePic, f.name, f._id || f.id)} 
                            className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0F]" 
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#1A1A1A] flex items-center">{f.name} <VerifiedBadge user={f} size={14} className="ml-1" /></p>
                          <p className="text-[10px] text-[#6B6B6B] font-bold uppercase">{f.university}</p>
                        </div>
                      </div>
                      {modal === "following" && (
                        <button 
                          onClick={() => handleUnfollow(f._id)}
                          disabled={unfollowingId === f._id}
                          className="px-4 py-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl text-[10px] font-black uppercase text-red-400 border border-red-500/10 disabled:opacity-50"
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
                      <img src={editData.profilePic} alt="Avatar" className="w-full h-full object-cover" />
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
                  <input
                    maxLength={100}
                    value={editData.bio}
                    onChange={e => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="Final year CSE | Dev | CAT 2025 Aspirant"
                  />
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
                        onClick={() => setEditData({...editData, phonePrivacy: 'public'})}
                        className={`px-5 py-2 text-xs font-black rounded-xl border transition-all ${editData.phonePrivacy === 'public' ? 'bg-green-500 border-green-600 text-white shadow-md' : 'bg-white border-[#E8E6E0] text-[#1A1A1A] hover:bg-[#F9F8F5]'}`}
                      >
                        PUBLIC
                      </button>
                      <button 
                        onClick={() => setEditData({...editData, phonePrivacy: 'private'})}
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
                    <p className="text-[10px] text-[#6B6B6B] font-bold uppercase">Memories</p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={20} /></button>
              </div>

              {/* Post Image */}
              <div className="relative aspect-square">
                 <img src={userPosts[activePostIndex].img} className="w-full h-full object-cover" />
                 {/* Navigation buttons */}
                 <div className="absolute inset-y-0 left-0 flex items-center px-2">
                   <button onClick={(e) => { e.stopPropagation(); if(activePostIndex > 0) setActivePostIndex(activePostIndex-1); }} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A]"><ChevronLeft size={20}/></button>
                 </div>
                 <div className="absolute inset-y-0 right-0 flex items-center px-2">
                   <button onClick={(e) => { e.stopPropagation(); if(activePostIndex < userPosts.length-1) setActivePostIndex(activePostIndex+1); }} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A]"><ChevronRight size={20}/></button>
                 </div>
              </div>

              {/* Post Actions */}
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Heart size={24} className={clsx("cursor-pointer transition-all", userPosts[activePostIndex].isLiked ? "text-red-500 fill-red-500 scale-110" : "text-[#6B6B6B] hover:text-red-500")} />
                    <MessageCircle size={24} className="text-[#6B6B6B] hover:text-[#C8922A]" />
                    <Send size={24} className="text-[#6B6B6B] hover:text-[#C8922A]" />
                  </div>
                  <div className="text-xs font-black text-[#6B6B6B] uppercase tracking-widest">{userPosts[activePostIndex].likes} Vibes</div>
                </div>
                
                <div className="space-y-4">
                   <p className="text-sm text-[#4A4A4A] leading-relaxed font-medium">
                     <span className="font-black mr-2"><NameWithTick name={user.name} tick={user.currentTick} user={user} /></span>
                     {userPosts[activePostIndex].content || "No caption provided."}
                   </p>
                   
                   <div className="space-y-3 pt-4 border-t border-[#E8E6E0]">
                      {userPosts[activePostIndex].commentsList.map(c => (
                        <div key={c.id} className="flex items-start space-x-2 text-sm">
                          <span className="font-black text-[#1A1A1A] whitespace-nowrap">{c.author}</span>
                          <span className="text-[#6B6B6B]">{c.text}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Add Comment Input */}
              <div className="p-4 bg-[#F9F8F5] border border-[#E8E6E0]-panel border-t border-[#E8E6E0] flex items-center space-x-3">
                 <input 
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder="Drop a vibe..."
                  className="flex-1 bg-transparent text-sm text-[#1A1A1A] focus:outline-none font-medium"
                 />
                 <button className="text-[#C8922A] font-black uppercase text-[10px] tracking-widest">Post</button>
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
                      {Math.round((Date.now() - activeStories[viewingStoryIndex]?.createdAt) / 60000)}m ago · expires in {Math.round((24 * 60 - (Date.now() - activeStories[viewingStoryIndex]?.createdAt) / 60000))}m
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

      </AnimatePresence>
    </div>
  );
}
