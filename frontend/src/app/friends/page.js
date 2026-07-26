"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { UserPlus, Search, Users, MessageCircle, Loader2, Heart, X, Sparkles, MapPin, Zap, Trophy, Star, Globe, Plus, CheckCircle2, Users2, ChevronRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import VerifiedBadge from "@/components/VerifiedBadge";
import NameWithTick from '../../components/NameWithTick';
import clsx from "clsx";
import { supabase } from "../../utils/supabase";
import { getAuthenticatedSupabaseClient } from "../../utils/supabaseAuthUser";
import { LOGIN_STREAK_UPDATED_EVENT, getDisplayStreak } from "../../utils/loginStreak";
import { useApiQuery } from "@/utils/useApiQuery";
import { useQueryClient } from "@tanstack/react-query";
import { getAvatarSrc, getDefaultAvatar } from "@/utils/defaultAvatars";

const LAST_SEEN_KEY = "collegeadda_followers_last_seen";
const NETWORK_PROFILE_PHOTO_VERSION = "profile-pictures-v3";

const ConfettiSparkles = ({ active }) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPieces([]);
      return;
    }

    const colors = [
      '#C8922A', // Theme Amber Gold
      '#7C3AED', // Theme Purple
      '#10B981', // Emerald
      '#EC4899', // Pink
      '#3B82F6', // Blue
      '#FBBF24', // Yellow
    ];

    const newPieces = Array.from({ length: 80 }).map((_, i) => {
      const isSparkle = Math.random() > 0.5;
      return {
        id: i,
        x: Math.random() * 100, // percentage
        color: colors[Math.floor(Math.random() * colors.length)],
        size: isSparkle ? Math.random() * 8 + 6 : Math.random() * 12 + 6,
        height: isSparkle ? null : Math.random() * 8 + 10,
        isSparkle,
        delay: Math.random() * 1.5,
        duration: Math.random() * 2.5 + 2.5,
        sway: Math.random() * 80 - 40,
        rotateSpeed: Math.random() * 720 + 360,
      };
    });

    setPieces(newPieces);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ 
            x: `${p.x}vw`, 
            y: "-10vh", 
            rotate: 0,
            opacity: 1 
          }}
          animate={{
            y: "110vh",
            x: `${p.x + (p.sway / 10)}vw`,
            rotate: p.rotateSpeed,
            opacity: [1, 1, 0.8, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.isSparkle ? p.size : p.height,
            backgroundColor: p.isSparkle ? "transparent" : p.color,
            borderRadius: p.isSparkle ? "50%" : "2px",
            backgroundImage: p.isSparkle 
              ? `radial-gradient(circle, ${p.color} 20%, transparent 60%)`
              : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {p.isSparkle && (
            <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: p.color }}>
              <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default function FriendsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [campusUsers, setCampusUsers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const [activeNetworkTab, setActiveNetworkTab] = useState("find");
  const [leaderboardTab, setLeaderboardTab] = useState("my_campus");
  const [globalUsers, setGlobalUsers] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedProfileData, setSelectedProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [connectStatus, setConnectStatus] = useState("idle");
  const [filter, setFilter] = useState("all");
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  // Community States
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [communityTags, setCommunityTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [communityPrivacy, setCommunityPrivacy] = useState("public");
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [membershipSet, setMembershipSet] = useState(new Set());
  const [joiningCommunityId, setJoiningCommunityId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "leaderboard") {
        setActiveNetworkTab("leaderboard");
      }
    }
  }, []);
  const [communityToast, setCommunityToast] = useState(null);
 // { type: 'success'|'error', msg }

  const popularTags = ["Cultural", "Sports", "Hackathons", "Design", "Academics", "Gaming", "Music", "Startups"];

  // Gradient palette for community avatars based on id hash
  const communityGradients = [
    "from-amber-400 to-orange-500",
    "from-violet-500 to-purple-600",
    "from-teal-400 to-cyan-500",
    "from-rose-400 to-pink-500",
    "from-emerald-400 to-green-500",
    "from-blue-400 to-indigo-500",
  ];
  const getCommunityGradient = (id) => {
    if (!id) return communityGradients[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
    return communityGradients[Math.abs(hash) % communityGradients.length];
  };

  const showCommunityToast = (type, msg) => {
    setCommunityToast({ type, msg });
    setTimeout(() => setCommunityToast(null), 3500);
  };

  const handleTagToggle = (tag) => {
    if (communityTags.includes(tag)) {
      setCommunityTags(communityTags.filter(t => t !== tag));
    } else {
      if (communityTags.length < 3) {
        setCommunityTags([...communityTags, tag]);
      }
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const cleanTag = customTag.trim().replace(/^#/, '');
    if (!cleanTag) return;
    if (communityTags.includes(cleanTag)) { setCustomTag(""); return; }
    if (communityTags.length >= 3) {
      showCommunityToast('error', 'You can select up to 3 tags only!');
      return;
    }
    setCommunityTags([...communityTags, cleanTag]);
    setCustomTag("");
  };

  const fetchCommunities = async () => {
    if (!supabase) return;
    try {
      const { client: authSupabase } = await getAuthenticatedSupabaseClient();
      const { data, error } = await authSupabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (!error && data) setCommunities(data);
    } catch (err) {
      console.error("Error fetching communities:", err);
    }
  };

  const fetchMemberships = async () => {
    if (!supabase) return;
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const { data, error } = await authSupabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", authUser.id);
      if (!error && data) {
        setMembershipSet(new Set(data.map(m => m.community_id)));
      }
    } catch (err) {
      console.error("Error fetching memberships:", err);
    }
  };

  const handleJoinCommunity = async (community) => {
    if (!supabase) { showCommunityToast('error', 'Supabase not configured.'); return; }
    const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
    const currentUserId = authUser.id;
    if (!currentUserId) return;
    if (membershipSet.has(community.id)) return;
    setJoiningCommunityId(community.id);
    try {
      // Insert member
      const { error: memberError } = await authSupabase
        .from("community_members")
        .insert([{ community_id: community.id, user_id: currentUserId, role: 'member' }]);
      if (memberError && memberError.code !== '23505') { // ignore duplicate
        throw memberError;
      }
      // Increment member_count
      await authSupabase
        .from("communities")
        .update({ member_count: (community.member_count || 1) + 1 })
        .eq("id", community.id);
      // Optimistic update
      setMembershipSet(prev => new Set([...prev, community.id]));
      setCommunities(prev => prev.map(c =>
        c.id === community.id ? { ...c, member_count: (c.member_count || 1) + 1 } : c
      ));
      if (community.privacy === 'invite_only') {
        showCommunityToast('success', 'Request sent! 🎉');
      } else {
        showCommunityToast('success', `Joined ${community.name}! 🎉`);
      }
    } catch (err) {
      console.error("Error joining community:", err);
      showCommunityToast('error', err.message || 'Failed to join community.');
    } finally {
      setJoiningCommunityId(null);
    }
  };

  const handleCreateCommunitySubmit = async (e) => {
    e.preventDefault();
    if (!communityName.trim()) return;
    if (!supabase) {
      showCommunityToast('error', 'Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
      return;
    }
    setCreatingCommunity(true);
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const communityPayload = {
        name: communityName.trim(),
        description: communityDescription.trim(),
        tags: communityTags,
        privacy: communityPrivacy,
        created_by: authUser.id,
        member_count: 1
      };

      if (!communityPayload.created_by) {
        throw new Error("Community creation payload is missing created_by");
      }

      const { data: inserted, error } = await authSupabase
        .from("communities")
        .insert(communityPayload)
        .select()
        .single();

      if (error) {
        console.error("Community creation failed:", error);
        showCommunityToast('error', error.message || 'Failed to create community.');
        return;
      }

      // Insert creator as owner in community_members
      if (inserted?.id) {
        await authSupabase.from("community_members").insert([{
          community_id: inserted.id,
          user_id: authUser.id,
          role: 'owner'
        }]);
        // Optimistic: add new community to list + membership
        setCommunities(prev => [inserted, ...prev].slice(0, 5));
        setMembershipSet(prev => new Set([...prev, inserted.id]));
      }

      setCommunityName("");
      setCommunityDescription("");
      setCommunityTags([]);
      setCommunityPrivacy("public");
      setShowCreateCommunityModal(false);
      showCommunityToast('success', 'Community created! 🎉');
    } catch (error) {
      console.error("Community creation failed:", error);
      showCommunityToast('error', error.message || 'Network error — please try again.');
    } finally {
      setCreatingCommunity(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedProfileId) setConnectStatus("idle");
  }, [selectedProfileId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

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

  // Notification state
  const [allFollowers, setAllFollowers] = useState([]);
  const [newFollowersCount, setNewFollowersCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [heartSeen, setHeartSeen] = useState(true);
  const notifRef = useRef(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const getToken = () => localStorage.getItem("collegeadda_token");
  const buildSearchUrl = useCallback((query = "") => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    return `${apiUrl}/api/users/search/query${qs ? `?${qs}` : ""}`;
  }, [apiUrl, filter]);

  const { data: profileData } = useApiQuery(
    "network-profile",
    "/api/users/profile",
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );

  const { data: suggestedData, isFetching: suggestedFetching } = useApiQuery(
    ["network-suggested", NETWORK_PROFILE_PHOTO_VERSION, debouncedSearch, activeNetworkTab, filter],
    buildSearchUrl(debouncedSearch).replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', ''),
    {
      enabled: !!user,
      staleTime: 30 * 1000
    }
  );

  const { data: serverLeaderboard, isFetching: leaderboardFetching } = useApiQuery(
    ["network-leaderboard", leaderboardTab],
    `/api/users/network/leaderboard?filter=${leaderboardTab}`,
    {
      enabled: !!user && activeNetworkTab === "leaderboard",
      staleTime: 0,
      refetchInterval: 3000
    }
  );

  const searching = search !== debouncedSearch || suggestedFetching;

  const normalizeUserAvatar = useCallback((person) => {
    if (!person) return person;
    const userId = person._id || person.id;
    const avatarUrl = userId
      ? `${apiUrl}/api/users/${encodeURIComponent(userId)}/avatar?v=${NETWORK_PROFILE_PHOTO_VERSION}`
      : person.profilePic;
    return {
      ...person,
      profilePic: getAvatarSrc(avatarUrl, person.name, userId),
    };
  }, [apiUrl]);

  useEffect(() => {
    if (profileData) {
      const statusMap = {};
      (profileData.following || []).forEach(id => {
        statusMap[id.toString ? id.toString() : id] = "connected";
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFollowStatus(statusMap);
    }
  }, [profileData]);

  useEffect(() => {
    if (suggestedData) {
      const usersList = Array.isArray(suggestedData) ? suggestedData : (suggestedData.users || []);
      
      const usersByUni = {};
      usersList.forEach(u => {
        if (!u.university) return;
        if (!usersByUni[u.university]) usersByUni[u.university] = [];
        usersByUni[u.university].push(u);
      });

      Object.values(usersByUni).forEach(uniGroup => {
        uniGroup.sort((a, b) => {
          const scoreA = (a.followersCount ?? (a.followers?.length || 0)) + (a.followingCount ?? (a.following?.length || 0));
          const scoreB = (b.followersCount ?? (b.followers?.length || 0)) + (b.followingCount ?? (b.following?.length || 0));
          return scoreB - scoreA;
        });
      });

      const users = usersList.map(u => {
        const normalized = normalizeUserAvatar(u);
        let localRank = 1;
        
        if (u.university && usersByUni[u.university]) {
          const myScore = (u.followersCount ?? (u.followers?.length || 0)) + (u.followingCount ?? (u.following?.length || 0));
          for (const su of usersByUni[u.university]) {
            const suScore = (su.followersCount ?? (su.followers?.length || 0)) + (su.followingCount ?? (su.following?.length || 0));
            if (suScore > myScore) localRank++;
            else break;
          }
        }
        
        return {
          ...normalized,
          localRank
        };
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestedUsers(users);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCampusUsers(users);
    }
  }, [suggestedData, normalizeUserAvatar]);


  const fetchGlobalUsers = useCallback(async () => {
    if (globalUsers.length > 0) return;
    const token = getToken();
    if (!token) return;
    setGlobalLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/users/search/query?q=`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const usersList = data?.users || (Array.isArray(data) ? data : []);
        setGlobalUsers(usersList.map(normalizeUserAvatar));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGlobalLoading(false);
    }
  }, [apiUrl, globalUsers.length, normalizeUserAvatar]);

  const handleProfileClick = async (person, rank = null, topBadge = null) => {
    const targetId = person._id || person.id;
    if (!targetId) return;

    setSelectedProfileId(targetId);
    setProfileLoading(true);
    setSelectedProfileData({ ...normalizeUserAvatar(person), rank, badgeTitle: topBadge?.label, postsCount: undefined });

    try {
      const token = getToken();

      const [res, postsRes] = await Promise.all([
        fetch(`${apiUrl}/api/users/${targetId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/posts`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      let fullData = {};
      if (res.ok) {
        fullData = await res.json();
      }

      let realPostCount = 0;
      if (postsRes.ok) {
        const allPosts = await postsRes.json();
        const pPosts = allPosts.filter(p => p.author?._id === targetId || p.author?.id === targetId);
        realPostCount = pPosts.length;
      }

      setSelectedProfileData(prev => ({
        ...prev,
        ...normalizeUserAvatar(fullData),
        postsCount: fullData.postsCount ?? fullData.posts?.length ?? realPostCount
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleConnectAction = async (targetId) => {
    setConnectStatus("connecting");
    await new Promise(r => setTimeout(r, 600)); // Cinematic delay
    await toggleFollow(targetId);
    setConnectStatus("connected");
    setTimeout(() => setSelectedProfileId(null), 1000);
  };

  // Fetch followers and compare against last seen
  const fetchFollowerNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/users/me/followers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const followers = (await res.json()).map(normalizeUserAvatar);
        setAllFollowers(followers);

        const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || "0");
        const newOnes = followers.filter(f => {
          if (!f.createdAt) return false;
          return new Date(f.createdAt).getTime() > lastSeen;
        });
        setNewFollowersCount(newOnes.length);
        setHeartSeen(newOnes.length === 0);
      }
    } catch (err) {
      console.error("Error fetching follower notifications:", err);
    }
  }, [apiUrl]);

  const loadData = useCallback(async () => {
    const stored = localStorage.getItem("collegeadda_user");
    const token = getToken();
    if (!stored || !token) { router.push("/login"); return; }

    let u;
    try {
      u = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse user data", e);
      router.push("/login");
      return;
    }

    if (!u) { router.push("/login"); return; }
    setUser(u);

    // Load communities and memberships
    fetchCommunities();
    fetchMemberships();
    
    setLoading(false);
  }, [apiUrl, router, buildSearchUrl]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    fetchFollowerNotifications();
    const interval = setInterval(fetchFollowerNotifications, 120000);
    return () => clearInterval(interval);
  }, [loadData, fetchFollowerNotifications]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleHeartClick = () => {
    setShowNotifPanel(prev => !prev);
    if (!heartSeen) {
      localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
      setNewFollowersCount(0);
      setHeartSeen(true);
    }
  };

  const handleDirectMessage = async (targetId) => {
    try {
      const token = getToken();

      // 1. Follow if not already followed
      if (followStatus[targetId] !== "connected") {
        await fetch(`${apiUrl}/api/users/${targetId}/follow`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });
        setFollowStatus(prev => ({ ...prev, [targetId]: "connected" }));
        
        // Invalidate queries so subsequent visits get fresh following states
        queryClient.invalidateQueries({ queryKey: ["network-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["explore-following"] });
        queryClient.invalidateQueries({ queryKey: ["user-following"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["network-suggested"] });
        queryClient.invalidateQueries({ queryKey: ["suggested"] });
      }

      // 2. Redirect to messages page to handle chat creation/selection
      router.push(`/messages?userId=${targetId}`);
    } catch (err) {
      console.error("Error starting direct message:", err);
    }
  };

  const toggleFollow = async (targetId) => {
    const currentStatus = followStatus[targetId];
    const isConnecting = currentStatus !== "connected";
    if (isConnecting) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    setFollowStatus(prev => ({ ...prev, [targetId]: isConnecting ? "connected" : null }));

    const updateUsersList = (users) => {
      const updated = users.map(u => {
        if (u._id === targetId || u.id === targetId) {
          const currentCount = u.followersCount ?? (Array.isArray(u.followers) ? u.followers.length : Number(u.followers || 0));
          return { 
            ...u, 
            followersCount: isConnecting ? currentCount + 1 : Math.max(0, currentCount - 1),
            xp: isConnecting ? (u.xp || 0) + 10 : (u.xp || 0)
          };
        }
        return u;
      });

      const usersByUni = {};
      updated.forEach(u => {
        if (!u.university) return;
        if (!usersByUni[u.university]) usersByUni[u.university] = [];
        usersByUni[u.university].push(u);
      });

      Object.values(usersByUni).forEach(uniGroup => {
        uniGroup.sort((a, b) => {
          const scoreA = (a.followersCount ?? (a.followers?.length || 0)) + (a.followingCount ?? (a.following?.length || 0));
          const scoreB = (b.followersCount ?? (b.followers?.length || 0)) + (b.followingCount ?? (b.following?.length || 0));
          return scoreB - scoreA;
        });
      });

      return updated.map(u => {
        if (!u.university || !usersByUni[u.university]) return u;
        let localRank = 1;
        const myScore = (u.followersCount ?? (u.followers?.length || 0)) + (u.followingCount ?? (u.following?.length || 0));
        for (const su of usersByUni[u.university]) {
          const suScore = (su.followersCount ?? (su.followers?.length || 0)) + (su.followingCount ?? (su.following?.length || 0));
          if (suScore > myScore) localRank++;
          else break;
        }
        return { ...u, localRank };
      });
    };

    setCampusUsers(prev => updateUsersList(prev));
    setSuggestedUsers(prev => updateUsersList(prev));

    try {
      const token = getToken();
      await fetch(`${apiUrl}/api/users/${targetId}/follow`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      queryClient.invalidateQueries({ queryKey: ["network-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["explore-following"] });
      queryClient.invalidateQueries({ queryKey: ["user-following"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["network-suggested"] });
      queryClient.invalidateQueries({ queryKey: ["suggested"] });
    } catch (err) {
      console.error(err);
      setFollowStatus(prev => ({ ...prev, [targetId]: currentStatus }));

      // Revert if error
      const revertUsersList = (users) => users.map(u => {
        if (u._id === targetId || u.id === targetId) {
          const currentCount = u.followersCount ?? (Array.isArray(u.followers) ? u.followers.length : Number(u.followers || 0));
          return { ...u, followersCount: !isConnecting ? currentCount + 1 : Math.max(0, currentCount - 1) };
        }
        return u;
      });
      setCampusUsers(prev => revertUsersList(prev));
      setSuggestedUsers(prev => revertUsersList(prev));
    }
  };

  const getSocialCount = (value) => {
    if (typeof value === 'number') return value;
    if (Array.isArray(value)) return value.length;
    return Number(value || 0);
  };

  const leaderboardStudents = useMemo(() => {
    return (Array.isArray(serverLeaderboard) ? serverLeaderboard : [])
      .map(normalizeUserAvatar)
      .map((person) => ({
        ...person,
        followerCount: person.followersCount ?? 0,
        followingCount: person.followingCount ?? 0,
        influenceScore: (person.followersCount ?? 0) + (person.followingCount ?? 0),
      }))
      .sort((a, b) => b.influenceScore - a.influenceScore)
      .map((person, index) => ({ ...person, rank: index + 1 }));
  }, [serverLeaderboard, normalizeUserAvatar]);

  const topBadgeStyles = [
    { label: "Campus Star", className: "from-yellow-300 to-[#D4A843] text-black", icon: Trophy },
    { label: "Rising Icon", className: "from-slate-200 to-amber-300 text-slate-950", icon: Star },
    { label: "Network Magnet", className: "from-amber-600 to-[#D4A843] text-[#1A1A1A]", icon: Star },
  ];

  const animSpring = [0.34, 1.56, 0.64, 1];
  const modalVars = {
    backdrop: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
      exit: { opacity: 0, transition: { duration: 0.25, ease: "easeIn", delay: 0.1 } }
    },
    modal: {
      hidden: { y: 60, opacity: 0, scale: 0.95 },
      visible: { y: 0, opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.35, ease: animSpring } },
      exit: { y: 60, opacity: 0, scale: 0.95, transition: { duration: 0.25, ease: "easeIn" } }
    },
    banner: {
      hidden: { clipPath: "inset(0 100% 0 0)" },
      visible: { clipPath: "inset(0 0% 0 0)", transition: { delay: 0.2, duration: 0.4, ease: "easeOut" } }
    },
    profilePic: {
      hidden: { y: -30, scale: 0.5, opacity: 0 },
      visible: { y: 0, scale: 1, opacity: 1, transition: { delay: 0.3, duration: 0.5, ease: animSpring } }
    },
    slideUp1: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.3, ease: "easeOut" } }
    },
    slideUp2: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { delay: 0.5, duration: 0.3, ease: "easeOut" } }
    },
    fade1: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { delay: 0.6, duration: 0.25, ease: "easeOut" } }
    },
    fade2: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { delay: 0.7, duration: 0.25, ease: "easeOut" } }
    },
    statsContainer: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { delayChildren: 0.8, staggerChildren: 0.08 } }
    },
    statCard: {
      hidden: { scale: 0.7, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
    },
    interestsContainer: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { delayChildren: 1.0, staggerChildren: 0.06 } }
    },
    interestPill: {
      hidden: { x: -20, opacity: 0 },
      visible: { x: 0, opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }
    },
    activity: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { delay: 1.2, duration: 0.3, ease: "easeOut" } }
    },
    buttonsContainer: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { delayChildren: 1.4, staggerChildren: 0.1 } }
    },
    buttonItem: {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
    },
    primaryButton: {
      hidden: { scale: 0.8, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        boxShadow: [
          "0px 0px 0px 0px rgba(168,85,247,0)",
          "0px 0px 20px 5px rgba(168,85,247,0.6)",
          "0px 0px 0px 0px rgba(168,85,247,0)",
          "0px 0px 20px 5px rgba(168,85,247,0.6)",
          "0px 0px 0px 0px rgba(168,85,247,0.2)"
        ],
        transition: {
          scale: { type: "spring", stiffness: 300, damping: 20 },
          boxShadow: { delay: 1.8, duration: 1.5, ease: "easeInOut" }
        }
      }
    }
  };

  if (!isMounted || !user) return null;

  return (
    <Suspense fallback={null}>
      <div className="page-shell relative overflow-x-hidden">


        {/* Header */}
        <header className="page-header sticky top-0 z-40 px-4 py-4 flex items-center justify-between sm:px-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)]">
              <Zap size={20} className="text-[#1A1A1A] fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1A1A1A] tracking-tight">Network</h1>
              <p className="text-[10px] text-[#C8922A] font-bold uppercase tracking-widest">Connect</p>
            </div>
          </motion.div>

          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleHeartClick}
              className="p-3 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl relative border border-[#E8E6E0]"
            >
              <Heart
                size={24}
                className="transition-all duration-300"
                style={{
                  fill: heartSeen ? "none" : "#EC4899",
                  stroke: heartSeen ? "#9ca3af" : "#EC4899",
                  filter: !heartSeen ? "drop-shadow(0 0 8px #EC489988)" : "none"
                }}
              />
              {newFollowersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#EC4899] text-[#1A1A1A] text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-[#0A0A0F]">
                  {newFollowersCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="app-panel absolute right-0 top-16 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem]"
                >
                  <div className="p-5 border-b border-[#E8E6E0] flex items-center justify-between">
                    <h3 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
                      <Sparkles size={16} className="text-pink-500" />
                      New Followers
                    </h3>
                    <button onClick={() => setShowNotifPanel(false)} className="text-[#888888] hover:text-[#1A1A1A]">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2">
                    {(Array.isArray(allFollowers) ? allFollowers : []).length === 0 ? (
                      <div className="py-12 text-center text-[#888888]">
                        <Heart size={40} className="mx-auto mb-3 opacity-10" />
                        <p className="text-sm font-bold">No fans yet!</p>
                        <p className="text-[10px] mt-1 uppercase tracking-widest">Connect to get followers</p>
                      </div>
                    ) : (
                      (Array.isArray(allFollowers) ? allFollowers : []).map((follower) => (
                        <div
                          key={follower._id}
                          className="flex items-center gap-3 p-3 hover:bg-[#F3F2EE] rounded-2xl transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full p-[1.5px] gradient-bg shrink-0">
                            <img
                              src={getAvatarSrc(follower.profilePic, follower.name, follower._id)}
                              className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0F]"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1A1A1A] truncate"><NameWithTick name={follower.name} tick={follower.currentTick} user={follower} /></p>
                            <p className="text-[10px] text-[#6B6B6B] truncate flex items-center">
                              <MapPin size={8} className="mr-1" />
                              {follower.university}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDirectMessage(follower._id)}
                            className="p-2 rounded-xl bg-[#F9F8F5] border border-[#E8E6E0] hover:bg-[#C8922A]/10 text-[#C8922A]"
                          >
                            <MessageCircle size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-8 px-4 py-6 relative z-10 sm:px-6 sm:py-8 md:flex-row md:justify-center lg:gap-10">
          {/* Left Column (Search & Lists) */}
          <div className="w-full max-w-[760px] space-y-6 sm:space-y-8">
            {/* Search Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">Find Your <span className="gradient-text">Campus Network</span></h2>
                <p className="text-[#6B6B6B] text-sm font-medium">Connect with the coolest minds in your university</p>
              </div>

              <div className="flex items-center gap-6 border-b border-[#E8E6E0]">
                <button
                  onClick={() => setActiveNetworkTab("find")}
                  className={clsx(
                    "pb-3 text-[15px] font-black transition-colors relative",
                    activeNetworkTab === "find" ? "text-[#C8922A]" : "text-[#888888] hover:text-[#1A1A1A]"
                  )}
                >
                  Find Friends
                  {activeNetworkTab === "find" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8922A] rounded-t-full" />}
                </button>
                <button
                  onClick={() => setActiveNetworkTab("leaderboard")}
                  className={clsx(
                    "pb-3 text-[15px] font-black transition-colors relative",
                    activeNetworkTab === "leaderboard" ? "text-[#C8922A]" : "text-[#888888] hover:text-[#1A1A1A]"
                  )}
                >
                  Leaderboard
                  {activeNetworkTab === "leaderboard" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8922A] rounded-t-full" />}
                </button>
              </div>

              {activeNetworkTab === "find" && (
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888888] group-focus-within:text-[#C8922A] transition-colors" size={18} />
                    {searching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C8922A] animate-spin" size={18} />}
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by name, university or #interest..."
                      className="w-full bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl py-4 pl-13 pr-12 text-[15px] font-medium text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#C8922A] transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-3 border rounded-xl text-[12px] font-bold transition-all shrink-0 cursor-pointer h-full",
                        filter !== "all"
                          ? "bg-[#C8922A]/10 border-[#C8922A] text-[#C8922A]"
                          : "bg-[#F9F8F5] border-[#E8E6E0] text-[#6B6B6B] hover:bg-[#F3F2EE]"
                      )}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                      {filter === "all" && "All Campuses"}
                      {filter === "same_campus" && "Same Campus"}
                      {filter === "same_interest" && "Same Interest"}
                      {filter === "other_campus" && "Other Campus"}
                      {filter !== "all" && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilter("all");
                            setShowFiltersDropdown(false);
                          }}
                          className="ml-1 p-0.5 hover:bg-[#C8922A]/20 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                        >
                          <X size={12} />
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {showFiltersDropdown && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowFiltersDropdown(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute right-0 mt-2 w-52 bg-white border border-[#E8E6E0] rounded-xl shadow-xl z-20 py-1.5 overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                setFilter("all");
                                setShowFiltersDropdown(false);
                              }}
                              className={clsx(
                                "w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer",
                                filter === "all"
                                  ? "bg-[#C8922A]/10 text-[#C8922A]"
                                  : "text-[#6B6B6B] hover:bg-[#F9F8F5] hover:text-[#1A1A1A]"
                              )}
                            >
                              <Globe size={14} />
                              All Campuses
                            </button>
                            <button
                              onClick={() => {
                                setFilter(filter === "same_campus" ? "all" : "same_campus");
                                setShowFiltersDropdown(false);
                              }}
                              className={clsx(
                                "w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer",
                                filter === "same_campus"
                                  ? "bg-[#C8922A]/10 text-[#C8922A]"
                                  : "text-[#6B6B6B] hover:bg-[#F9F8F5] hover:text-[#1A1A1A]"
                              )}
                            >
                              <MapPin size={14} />
                              Same Campus
                            </button>
                            <button
                              onClick={() => {
                                setFilter(filter === "same_interest" ? "all" : "same_interest");
                                setShowFiltersDropdown(false);
                              }}
                              className={clsx(
                                "w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer",
                                filter === "same_interest"
                                  ? "bg-[#C8922A]/10 text-[#C8922A]"
                                  : "text-[#6B6B6B] hover:bg-[#F9F8F5] hover:text-[#1A1A1A]"
                              )}
                            >
                              <Sparkles size={14} />
                              Same Interest
                            </button>
                            <button
                              onClick={() => {
                                setFilter(filter === "other_campus" ? "all" : "other_campus");
                                setShowFiltersDropdown(false);
                              }}
                              className={clsx(
                                "w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer",
                                filter === "other_campus"
                                  ? "bg-[#C8922A]/10 text-[#C8922A]"
                                  : "text-[#6B6B6B] hover:bg-[#F9F8F5] hover:text-[#1A1A1A]"
                              )}
                            >
                              <Users size={14} />
                              Other Campus
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>

            {activeNetworkTab === "leaderboard" ? (
              <div className="space-y-5">
                {/* Inner Tabs for Leaderboard */}
                <div className="app-panel grid grid-cols-2 gap-1 rounded-[1.35rem] p-1 mb-2">
                  <button
                    onClick={() => setLeaderboardTab("my_campus")}
                    className={clsx(
                      "rounded-[1.1rem] px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition-all",
                      leaderboardTab === "my_campus" ? "gradient-bg text-[#1A1A1A] shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)]" : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                    )}
                  >
                    My Campus
                  </button>
                  <button
                    onClick={() => {
                      setLeaderboardTab("global_pulse");
                    }}
                    className={clsx(
                      "rounded-[1.1rem] px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition-all",
                      leaderboardTab === "global_pulse" ? "gradient-bg text-[#1A1A1A] shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)]" : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                    )}
                  >
                    Global Pulse
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] flex items-center">
                    <Trophy size={13} className="mr-2 text-yellow-400" />
                    {leaderboardTab === "global_pulse" ? "Top 10 Worldwide" : "Top 10 Students"}
                  </h3>
                  <span className="text-[10px] bg-[#F9F8F5] border border-[#E8E6E0] px-3 py-1 rounded-full text-yellow-300 font-bold border border-yellow-500/10">
                    followers + following
                  </span>
                </div>

                {loading || (!serverLeaderboard && leaderboardFetching) ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-[#E8E6E0] border-t-yellow-400 rounded-full animate-spin" />
                    <p className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest">Building leaderboard...</p>
                  </div>
                ) : leaderboardStudents.length === 0 ? (
                  <div className="text-center py-20 app-panel rounded-[1.75rem] border-[#E8E6E0] border-dashed">
                    <p className="text-2xl font-black text-[#888888] mb-2">No rankings yet</p>
                    <p className="text-sm text-[#888888] font-medium">Connect with students to start the leaderboard.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboardStudents.map((person, idx) => {
                      const rank = idx + 1;
                      const topBadge = topBadgeStyles[idx];
                      const BadgeIcon = topBadge?.icon;
                      const avatar = getAvatarSrc(person.profilePic, person.name, person._id || person.id);

                      if (leaderboardTab === "global_pulse" && rank === 1) {
                        return (
                          <motion.div
                            layout
                            key={person._id || person.id || person.name}
                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 280, damping: 20 }}
                            whileHover={{ scale: 1.02, rotate: 1 }}
                            onClick={() => handleProfileClick(person, rank, topBadge)}
                            className="relative p-[3px] rounded-[2rem] overflow-hidden mb-8 group cursor-pointer shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                          >
                            {/* Rotating Holographic Border */}
                            <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,#ff4545,#00ff99,#006aff,#ff0095,#ff4545)] animate-[spin_4s_linear_infinite] opacity-80" />

                            <div className="relative app-panel backdrop-blur-2xl rounded-[1.8rem] p-7 flex flex-col items-center text-center gap-5">
                              <div className="w-full flex justify-center">
                                <motion.span
                                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                  className="bg-[linear-gradient(45deg,#ff0095,#006aff,#00ff99,#ff0095)] bg-[length:300%_300%] text-[#1A1A1A] text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-[0_0_20px_rgba(0,106,255,0.4)] flex items-center gap-2"
                                >
                                  🌍 Global Pulse Leader
                                </motion.span>
                              </div>

                              <div className="relative mt-3">
                                {/* Pulse Ring Behind Avatar */}
                                <div className="absolute inset-0 rounded-[2.2rem] bg-gradient-to-tr from-[#D4A843] to-[#D4A843] animate-ping opacity-30 blur-md" />

                                <img
                                  src={avatar}
                                  className="relative w-28 h-28 rounded-[2.2rem] border-4 border-[#E8E6E0] object-cover shadow-2xl z-10 group-hover:scale-105 transition-transform duration-300"
                                  alt={person.name}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = getDefaultAvatar(person.name, person._id || person.id);
                                  }}
                                />

                                <motion.div
                                  animate={{ y: [0, -10, 0], rotate: [0, 15, -10, 0] }}
                                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                  className="absolute -top-6 -right-6 text-5xl drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] z-20"
                                >
                                  👑
                                </motion.div>

                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-sm font-black px-4 py-1 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20" style={{ color: '#000000' }}>
                                  #1
                                </div>
                              </div>

                              <div className="mt-3">
                                <div className="flex items-center justify-center gap-2">
                                  <p className="text-2xl font-black text-[#1A1A1A] tracking-tight"><NameWithTick name={person.name} tick={person.currentTick} user={person} /></p>
                                </div>
                                <p className="text-xs font-bold text-[#6B6B6B] mt-1 flex items-center justify-center gap-1">
                                  <MapPin size={12} className="text-[#C8922A]" />
                                  {person.university || "Campus Adda"}
                                </p>
                                <div className="mt-3 flex justify-center">
                                  <span className="inline-flex rounded-full bg-[#F9F8F5] border border-[#E8E6E0] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#C8922A] border border-[#E8E6E0] shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                    {topBadge?.label || "Global Star"}
                                  </span>
                                </div>
                              </div>

                              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />

                              <div className="flex gap-8 w-full justify-center items-center">
                                <div className="text-center group-hover:scale-110 transition-transform">
                                  <p className="text-3xl font-black bg-gradient-to-br from-yellow-300 to-[#D4A843] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(250,204,21,0.2)]" style={{ WebkitTextFillColor: 'transparent', color: 'transparent' }}>{person.influenceScore}</p>
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] font-bold mt-1">Total Score</p>
                                </div>
                                <div className="w-[1px] h-10 bg-[#F3F2EE]" />
                                <div className="text-left flex flex-col justify-center gap-1">
                                  <p className="text-xs font-bold text-[#4A4A4A] flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                                    {person.followerCount} fans
                                  </p>
                                  <p className="text-xs font-bold text-[#6B6B6B] flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                                    {person.followingCount} following
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div
                          layout
                          key={person._id || person.id || person.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03, layout: { type: "spring", stiffness: 300, damping: 30 } }}
                          onClick={() => handleProfileClick(person, rank, topBadge)}
                          className={clsx(
                            "app-panel flex items-center gap-3 rounded-[1.5rem] p-4 transition-all cursor-pointer",
                            rank <= 3 ? "border-yellow-400/20" : "hover:border-white/15"
                          )}
                        >
                          <div className={clsx(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black",
                            rank === 1 ? "bg-yellow-300" : rank === 2 ? "bg-slate-200" : rank === 3 ? "bg-orange-500" : "bg-[#F3F2EE] text-[#888888]5"
                          )} style={rank === 1 ? { color: '#000000' } : rank === 2 ? { color: '#020617' } : rank === 3 ? { color: '#ffffff' } : {}}>
                            #{rank}
                          </div>

                          <div className="relative shrink-0">
                            <img
                              src={avatar}
                              className="h-14 w-14 rounded-2xl border border-[#E8E6E0] object-cover"
                              alt={person.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getDefaultAvatar(person.name, person._id || person.id);
                              }}
                            />
                            {rank <= 3 && (
                              <div className="absolute -bottom-2 -right-2 rounded-xl bg-[#FAFAF8] p-1">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${topBadge.className}`}>
                                  <BadgeIcon size={13} fill="currentColor" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-black text-[#1A1A1A]"><NameWithTick name={person.name} tick={person.currentTick} user={person} /></p>
                            </div>
                            <p className="mt-1 truncate text-[11px] font-bold text-[#888888]">{person.university || "Campus Adda"}</p>
                            {rank <= 3 && (
                              <span className="mt-2 inline-flex rounded-full bg-yellow-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-200">
                                {topBadge.label}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-black text-[#1A1A1A]">{person.influenceScore}</p>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#888888]">score</p>
                            <p className="mt-1 text-[10px] text-[#888888]">
                              {person.followerCount} fans • {person.followingCount} following
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] flex items-center">
                    <Sparkles size={12} className="mr-2 text-yellow-500" />
                    {search.trim() ? "Search Results" : (
                      filter === "same_interest" ? "Same Interest Peers" :
                      filter === "other_campus" ? "Other Campus Peers" :
                      filter === "same_campus" ? "Verified Campus Peers" :
                      "All Campus Peers"
                    )}
                  </h3>
                  <span className="text-[10px] bg-[#F9F8F5] border border-[#E8E6E0] px-3 py-1 rounded-full text-[#C8922A] font-bold border border-[#C8922A]/30">
                    {suggestedData?.totalCount ?? suggestedUsers.length} peers
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-[#E8E6E0] border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest">
                      {filter === "other_campus" ? "Scanning Other Campuses..." : filter === "same_campus" ? "Scanning Campus..." : "Scanning All Campuses..."}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    {suggestedUsers.length === 0 ? (
                      <div className="text-center py-20 col-span-full flex flex-col items-center space-y-4">
                        <div className="flex space-x-1.5">
                          <div className="w-2.5 h-2.5 bg-[#C8922A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2.5 h-2.5 bg-[#C8922A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2.5 h-2.5 bg-[#C8922A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <p className="text-lg font-black text-[#1A1A1A] tracking-tight">
                          Finding the best peers for you...
                        </p>
                        <p className="text-sm text-[#888888] font-medium">
                          Matching you with minds from your campus ✨
                        </p>
                      </div>
                    ) : (
                      suggestedUsers.map(person => {
                        const status = followStatus[person._id];
                        const avatar = getAvatarSrc(person.profilePic, person.name, person._id || person.id);

                          return (
                            <motion.div
                              key={person._id}
                              onClick={() => handleProfileClick(person)}
                              variants={{
                                hidden: { y: 20, opacity: 0 },
                                visible: { y: 0, opacity: 1 }
                              }}
                              whileHover={{ 
                                y: -6,
                                rotateX: 2.5,
                                rotateY: -2.5,
                                transition: { duration: 0.25, ease: "easeOut" }
                              }}
                              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                              className="rounded-[2rem] border border-white/70 bg-white/62 p-4 shadow-[0_18px_48px_rgba(26,26,26,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl hover:border-white hover:shadow-[0_24px_58px_rgba(124,58,237,0.16),inset_0_1px_0_rgba(255,255,255,0.8)] transition-all group cursor-default relative overflow-hidden"
                            >
                              <div className="relative h-[220px] overflow-hidden rounded-[1.5rem] border border-white/55 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
                                <img
                                  src={avatar}
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:rotate-[0.35deg]"
                                  alt={person.name}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = getDefaultAvatar(person.name, person._id || person.id);
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/8 pointer-events-none" />
                                {/* Glossy shine sweep effect */}
                                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-[850ms] ease-out pointer-events-none" />
                              </div>

                              {/* Top section: Profile pic and Details */}
                              <div className="mt-4 rounded-[1.45rem] border border-white/70 bg-white/82 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl space-y-2.5">
                                {/* Name and Verified Badge */}
                                <div className="space-y-0.5">
                                  <div className="flex items-center space-x-1.5">
                                    <h4 className="font-black text-[18px] text-[#1A1A1A] truncate tracking-tight leading-tight"><NameWithTick name={person.name} tick={person.currentTick} user={person} /></h4>
                                    <VerifiedBadge user={person} size={15} />
                                  </div>
                                  <p className="text-[9.5px] text-[#1A1A1A]/80 font-black uppercase tracking-widest flex items-center">
                                    <MapPin size={8.5} className="mr-0.5" />
                                    {person.university} {person.year && `• ${person.year}`}
                                  </p>
                                </div>

                                {/* Bio */}
                                {person.bio ? (
                                  <p className="text-[12px] leading-snug text-[#1A1A1A]/82 line-clamp-2 font-semibold">
                                    {person.bio}
                                  </p>
                                ) : (
                                  <p className="text-[12px] leading-snug text-[#4A4A4A] italic font-medium">
                                    No bio added yet.
                                  </p>
                                )}

                                {/* Interests */}
                                <div className="flex flex-wrap gap-1.5">
                                  {(person.interests || []).slice(0, 3).map(interest => (
                                    <span key={interest} className="text-[9px] bg-white/75 border border-[#E8E6E0] px-2.5 py-0.5 rounded-full text-[#1A1A1A] font-bold shadow-sm hover:border-[#C8922A]/30 hover:text-[#C8922A] transition-all">
                                      #{interest}
                                    </span>
                                  ))}
                                </div>

                                {/* Stats Section (divided in 3) */}
                              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#E8E6E0] bg-white/72 px-2 py-2.5 text-center items-center">
                                <div>
                                  <p className="text-base font-black text-[#1A1A1A] flex items-center justify-center gap-1">
                                    <span className="text-[14px]">🏆</span> {person.rank || person.campusRank || person.localRank || '-'}
                                  </p>
                                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#4A4A4A] mt-0.5">Campus Rank</p>
                                </div>
                                <div className="border-l border-r border-[#D8D5CE]">
                                  <p className="text-base font-black text-[#1A1A1A] flex items-center justify-center gap-1">
                                    <span className="text-[14px]">🫂</span> {(person.followersCount ?? getSocialCount(person.followers)) + (person.followingCount ?? getSocialCount(person.following))}
                                  </p>
                                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#4A4A4A] mt-0.5">Network</p>
                                </div>
                                <div>
                                  <p className="text-base font-black text-[#1A1A1A] flex items-center justify-center gap-1">
                                    <span className="text-[14px]">✨</span> {person.xp || 0}
                                  </p>
                                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#4A4A4A] mt-0.5">XP</p>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div>
                                {status === "connected" ? (
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => { e.stopPropagation(); handleDirectMessage(person._id); }}
                                    className="w-full bg-white hover:bg-[#F8FAFC] text-[#374151] border border-[#D6D3D1] py-3 rounded-full text-[12px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                                  >
                                    <MessageCircle size={13} />
                                    Chat Now
                                  </motion.button>
                                ) : (
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => { e.stopPropagation(); toggleFollow(person._id); }}
                                    className="w-full bg-blue-500 hover:bg-blue-600 !text-white border border-transparent py-3 rounded-full text-[12px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                                  >
                                    <UserPlus size={13} />
                                    Connect +
                                  </motion.button>
                                )}
                              </div>
                              </div>
                            </motion.div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div> {/* End Left Column */}

          {/* Right Column (Build Your Network + Community) */}
          <div className="hidden w-full shrink-0 space-y-6 sticky top-24 md:flex md:w-[300px] md:flex-col xl:w-[320px]">
            {/* Build Your Network Card */}
            <div className="app-panel rounded-[1.6rem] p-6 text-center shadow-sm">
              <div className="flex justify-center -space-x-4 mb-5">
                <img src={getDefaultAvatar("Priya", "p1")} className="w-16 h-16 rounded-full border-4 border-white z-10 object-cover" alt="Avatar" />
                <img src={getDefaultAvatar("Rahul", "r1")} className="w-20 h-20 rounded-full border-4 border-white z-20 -translate-y-2 object-cover" alt="Avatar" />
                <img src={getDefaultAvatar("Aman", "a1")} className="w-16 h-16 rounded-full border-4 border-white z-10 object-cover" alt="Avatar" />
              </div>

              <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight mb-2">Build Your Network</h3>
              <p className="text-sm text-[#6B6B6B] mb-6 font-medium px-4">
                Connect with amazing people from your campus.
              </p>

              <button
                onClick={() => {
                  const text = encodeURIComponent("Hey! Join me on Campus Adda — the student social network! 🎓\n\nConnect with peers, find campus events & more.\n\nJoin now 👇\nhttps://campusadda.social/");
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
                className="w-full gradient-bg text-[#1A1A1A] py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                Invite Friends
              </button>
            </div>

            {/* Community Section */}
            <div className="px-1">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-wider">COMMUNITY</h4>
                <button onClick={() => router.push('/community')} className="text-[10px] font-bold text-[#C8922A] hover:underline flex items-center gap-0.5 cursor-pointer">View All <ChevronRight size={10} /></button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-amber-100 flex flex-col gap-4">
                {/* Header row with 3D tilt globe icon */}
                <div className="flex gap-3 items-start">
                  <motion.div
                    whileHover={{ rotateY: 8, rotateX: -4, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20 cursor-default"
                  >
                    <Globe size={22} />
                  </motion.div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-base text-[#1A1A1A] leading-tight">Join the Community</h5>
                    <p className="text-xs text-[#6B6B6B] mt-0.5 leading-snug">Connect with students across all campuses.</p>
                  </div>
                </div>

                {/* Create Community Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreateCommunityModal(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider shadow-md shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                >
                  <Plus size={16} />
                  Create Community
                </motion.button>

                {/* Live community list */}
                {communities.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1 border-t border-[#F3F2EE]">
                    <AnimatePresence>
                      {communities.map((comm, idx) => {
                        const isMember = membershipSet.has(comm.id);
                        const isJoining = joiningCommunityId === comm.id;
                        const grad = getCommunityGradient(comm.id);
                        return (
                          <motion.div
                            key={comm.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="flex items-center gap-2.5 group"
                          >
                            {/* Avatar */}
                            <button
                              onClick={() => router.push(`/community/${comm.id}`)}
                              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm hover:scale-105 transition-transform cursor-pointer`}
                            >
                              {comm.name.charAt(0).toUpperCase()}
                            </button>
                            {/* Info */}
                            <button onClick={() => router.push(`/community/${comm.id}`)} className="flex-1 min-w-0 text-left cursor-pointer">
                              <p className="text-[13px] font-bold text-[#1A1A1A] truncate leading-tight">{comm.name}</p>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                <span className="text-[10px] text-[#888888]">{comm.member_count} member{comm.member_count !== 1 ? 's' : ''}</span>
                                {(comm.tags || []).slice(0, 2).map(tag => (
                                  <span key={tag} className="text-[9px] bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">#{tag}</span>
                                ))}
                              </div>
                            </button>
                            {/* Join / Joined */}
                            {isMember ? (
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg shrink-0"
                              >
                                <CheckCircle2 size={11} />
                                Joined
                              </motion.div>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleJoinCommunity(comm)}
                                disabled={isJoining}
                                className="text-[10px] font-bold text-[#C8922A] border border-[#C8922A] hover:bg-amber-50 px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-all disabled:opacity-50"
                              >
                                {isJoining ? <Loader2 size={10} className="animate-spin" /> : (comm.privacy === 'invite_only' ? 'Request' : 'Join')}
                              </motion.button>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}

                {/* Empty state if no communities yet */}
                {communities.length === 0 && (
                  <p className="text-[11px] text-[#888888] text-center py-2">No communities yet — be the first!</p>
                )}
              </div>
            </div>
          </div>


        </div> {/* End main flex row */}

        {/* Profile Preview Modal - fixed overlay, outside flex row */}
        <AnimatePresence>
          {selectedProfileId && (
            <motion.div
              variants={modalVars.backdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setSelectedProfileId(null)}
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            >
              <motion.div
                variants={modalVars.modal}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md app-panel backdrop-blur-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] relative flex flex-col max-h-[90vh]"
              >
                {/* Animated Gradient Border Layer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#C8922A]/10 via-transparent to-[#C8922A]/10 pointer-events-none" />

                {/* Close button */}
                <button onClick={() => setSelectedProfileId(null)} className="absolute top-4 right-4 z-20 p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] hover:rotate-90 transition-all duration-300 border border-[#E8E6E0] shadow-lg bg-black/40 backdrop-blur-md">
                  <X size={20} />
                </button>

                {profileLoading || !selectedProfileData ? (
                  <div className="p-8 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-[#E8E6E0] border-t-cyan-400 rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-[#6B6B6B]">Loading Profile...</p>
                  </div>
                ) : (
                  <div className="flex flex-col overflow-y-auto custom-scrollbar relative z-10 pb-6">
                    {/* Banner */}
                    <motion.div variants={modalVars.banner} className="h-[70px] w-full gradient-bg relative">
                      <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
                    </motion.div>

                    <div className="px-6 relative flex-1 flex flex-col">
                      {/* Photo — sits BELOW banner, never overlapping */}
                      <motion.div variants={modalVars.profilePic} className="mt-4 relative w-[100px] h-[100px] mx-auto shrink-0">
                        {/* Gradient border ring */}
                        <div className="absolute inset-0 rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                          <div className="w-full h-full rounded-full overflow-hidden app-panel">
                            <img
                              src={getAvatarSrc(selectedProfileData.profilePic, selectedProfileData.name, selectedProfileData._id || selectedProfileData.id)}
                              alt={selectedProfileData.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                            />
                          </div>
                        </div>
                        {selectedProfileData.rank && (
                          <div className="absolute z-20 -top-1 -right-1 bg-yellow-400 text-[11px] font-black px-2 py-0.5 rounded-full border-2 border-transparent shadow-lg" style={{ color: '#000000' }}>#{selectedProfileData.rank}</div>
                        )}
                      </motion.div>

                      {/* Badge title pill */}
                      <motion.div variants={modalVars.slideUp2} className="flex justify-center mt-4 mb-2">
                        <span className="bg-[#F3F2EE] text-[#C8922A] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#E8E6E0] shadow-sm hover:scale-105 transition-transform cursor-default">
                          {selectedProfileData.badgeTitle || "Verified Student"}
                        </span>
                      </motion.div>

                      {/* Name & Uni */}
                      <div className="text-center space-y-1.5">
                        <motion.div variants={modalVars.slideUp1} className="flex items-center justify-center gap-2">
                          <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight"><NameWithTick name={selectedProfileData.name} tick={selectedProfileData.currentTick} user={selectedProfileData} /></h2>
                          <VerifiedBadge user={selectedProfileData} size={20} />
                        </motion.div>
                        <motion.p variants={modalVars.slideUp2} className="text-xs font-bold text-[#6B6B6B] flex items-center justify-center gap-1">
                          <MapPin size={12} className="text-[#C8922A]" />
                          {selectedProfileData.university || "Campus Adda"}
                        </motion.p>
                        <motion.p variants={modalVars.fade1} className="text-[11px] font-bold text-[#6B6B6B] mt-1 uppercase tracking-wider">
                          {[selectedProfileData.course, selectedProfileData.studyYear || selectedProfileData.year, selectedProfileData.passOutBatch ? `Batch of ${selectedProfileData.passOutBatch}` : ""].filter(Boolean).join(" • ")}
                        </motion.p>
                        {selectedProfileData.bio && (
                          <motion.p variants={modalVars.fade2} className="text-sm text-[#6B6B6B] italic font-medium mt-4">&ldquo;{selectedProfileData.bio}&rdquo;</motion.p>
                        )}
                      </div>

                      {/* Stats Row */}
                      <motion.div variants={modalVars.statsContainer} className="grid grid-cols-4 gap-2 mt-6">
                        <motion.div variants={modalVars.statCard} whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.08)' }} className="bg-[#F9F8F5] border border-[#E8E6E0] p-3 rounded-2xl text-center border border-[#E8E6E0] flex flex-col justify-center transition-colors cursor-default">
                          <p className="text-lg font-black text-[#1A1A1A]">{(selectedProfileData.followersCount ?? (selectedProfileData.followers !== undefined ? getSocialCount(selectedProfileData.followers) : undefined)) !== undefined ? (selectedProfileData.followersCount ?? getSocialCount(selectedProfileData.followers)) : "—"}</p>
                          <p className="text-[9px] uppercase tracking-wider text-[#6B6B6B] font-bold mt-1">Followers</p>
                        </motion.div>
                        <motion.div variants={modalVars.statCard} whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.08)' }} className="bg-[#F9F8F5] border border-[#E8E6E0] p-3 rounded-2xl text-center border border-[#E8E6E0] flex flex-col justify-center transition-colors cursor-default">
                          <p className="text-lg font-black text-[#1A1A1A]">{(selectedProfileData.followingCount ?? (selectedProfileData.following !== undefined ? getSocialCount(selectedProfileData.following) : undefined)) !== undefined ? (selectedProfileData.followingCount ?? getSocialCount(selectedProfileData.following)) : "—"}</p>
                          <p className="text-[9px] uppercase tracking-wider text-[#6B6B6B] font-bold mt-1">Following</p>
                        </motion.div>
                        <motion.div variants={modalVars.statCard} whileHover={{ y: -3, scale: 1.02 }} className="bg-[#F9F8F5] border border-[#E8E6E0] p-3 rounded-2xl text-center border border-[#E8E6E0] bg-gradient-to-br from-yellow-500/10 to-[#D4A843]/10 border-yellow-500/20 flex flex-col justify-center transition-transform cursor-default">
                          <p className="text-lg font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                            {(selectedProfileData.followersCount ?? selectedProfileData.followers) !== undefined && (selectedProfileData.followingCount ?? selectedProfileData.following) !== undefined ? (selectedProfileData.followersCount ?? getSocialCount(selectedProfileData.followers)) + (selectedProfileData.followingCount ?? getSocialCount(selectedProfileData.following)) : "—"}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-yellow-500/60 font-bold mt-1">Score</p>
                        </motion.div>
                        <motion.div variants={modalVars.statCard} whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.08)' }} className="bg-[#F9F8F5] border border-[#E8E6E0] p-3 rounded-2xl text-center border border-[#E8E6E0] flex flex-col justify-center transition-colors cursor-default">
                          <p className="text-lg font-black text-[#1A1A1A]">{selectedProfileData.postsCount !== undefined ? selectedProfileData.postsCount : "—"}</p>
                          <p className="text-[9px] uppercase tracking-wider text-[#6B6B6B] font-bold mt-1">Posts</p>
                        </motion.div>
                      </motion.div>

                      {/* Interests */}
                      {selectedProfileData.interests && selectedProfileData.interests.length > 0 && (
                        <motion.div variants={modalVars.interestsContainer} className="mt-6">
                          <h3 className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] mb-3 flex items-center">✨ Interests</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProfileData.interests.map(int => (
                              <motion.span
                                variants={modalVars.interestPill}
                                whileHover={{ background: 'linear-gradient(45deg, rgba(168,85,247,0.8), rgba(236,72,153,0.8))', color: 'white' }}
                                key={int}
                                className="bg-black/40 border border-[#E8E6E0] text-[#4A4A4A] text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition-colors cursor-default"
                              >
                                💡 {int}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Activity Section */}
                      <motion.div variants={modalVars.activity} className="mt-6">
                        <h3 className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] mb-3 flex items-center">🔥 Campus Vibe</h3>
                        <div className="bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl p-4 border border-[#E8E6E0] flex items-center gap-4 hover:bg-[#F3F2EE] transition-colors cursor-default">
                          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0 shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)]">
                            <Zap size={18} className="text-[#1A1A1A] fill-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-[#1A1A1A]">Frequent Poster</p>
                            <p className="text-[10px] text-[#6B6B6B] mt-0.5">Regularly posts on campus feed</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Action Buttons */}
                      <motion.div variants={modalVars.buttonsContainer} className="mt-8 flex flex-col gap-3">
                        {user && (user._id === selectedProfileData._id || user.id === selectedProfileData._id) ? (
                          <>
                            <motion.button variants={modalVars.primaryButton} onClick={() => router.push('/profile')} className="w-full py-4 gradient-bg rounded-2xl text-xs font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl border border-[#E8E6E0] hover:scale-[1.02] transition-transform">
                              ✏️ Edit Profile
                            </motion.button>
                          </>
                        ) : followStatus[selectedProfileData._id] === "connected" ? (
                          <>
                            <motion.button variants={modalVars.primaryButton} onClick={() => { handleDirectMessage(selectedProfileData._id); setSelectedProfileId(null); }} className="w-full py-4 bg-white border border-[#D6D3D1] rounded-2xl text-xs font-black text-[#374151] uppercase tracking-widest shadow-sm hover:bg-[#F8FAFC] hover:scale-[1.02] transition-all">
                              💬 Chat Now
                            </motion.button>
                            <motion.button variants={modalVars.buttonItem} onClick={() => { router.push(`/profile/${selectedProfileData._id}`); setSelectedProfileId(null); }} className="w-full py-4 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl text-xs font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl border border-[#E8E6E0] hover:bg-[#F3F2EE] transition-colors hover:scale-[1.02]">
                              🔗 View Full Profile
                            </motion.button>
                          </>
                        ) : followStatus[selectedProfileData._id] === "pending" ? (
                          <>
                            <motion.button variants={modalVars.primaryButton} disabled className="w-full py-4 bg-[#F3F2EE] rounded-2xl text-xs font-black text-[#6B6B6B] uppercase tracking-widest border border-[#E8E6E0] cursor-not-allowed">
                              ⏳ Request Sent
                            </motion.button>
                            <motion.button variants={modalVars.buttonItem} onClick={() => { router.push(`/profile/${selectedProfileData._id}`); setSelectedProfileId(null); }} className="w-full py-4 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl text-xs font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl border border-[#E8E6E0] hover:bg-[#F3F2EE] transition-colors hover:scale-[1.02]">
                              🔗 View Full Profile
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button
                              variants={modalVars.primaryButton}
                              onClick={() => handleConnectAction(selectedProfileData._id)}
                              disabled={connectStatus !== "idle"}
                              className="relative w-full py-4 bg-blue-500 border border-transparent rounded-2xl text-xs font-black !text-white uppercase tracking-widest shadow-md hover:bg-blue-600 hover:scale-[1.02] transition-all overflow-hidden"
                            >
                              {connectStatus === "idle" && <span className="relative z-10">⚡ Connect</span>}
                              {connectStatus === "connecting" && <span className="relative z-10 flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Connecting...</span>}
                              {connectStatus === "connected" && <span className="relative z-10">✓ Connected!</span>}
                            </motion.button>
                            <motion.button variants={modalVars.buttonItem} onClick={() => { router.push(`/profile/${selectedProfileData._id}`); setSelectedProfileId(null); }} className="w-full py-4 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl text-xs font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl border border-[#E8E6E0] hover:bg-[#F3F2EE] transition-colors hover:scale-[1.02]">
                              🔗 View Full Profile
                            </motion.button>
                          </>
                        )}
                      </motion.div>

                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Community Modal */}
        <AnimatePresence>
          {showCreateCommunityModal && (
            <motion.div
              variants={modalVars.backdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowCreateCommunityModal(false)}
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            >
              <motion.div
                variants={modalVars.modal}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(200,146,42,0.15)] border border-[#E8E6E0] relative flex flex-col max-h-[90vh] p-6"
              >
                {/* Close button */}
                <button
                  onClick={() => setShowCreateCommunityModal(false)}
                  className="absolute top-4 right-4 z-20 p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] hover:rotate-90 transition-all duration-300 shadow-md cursor-pointer"
                >
                  <X size={16} />
                </button>

                <h3 className="text-xl font-black text-[#1A1A1A] mb-1">Create a Community</h3>
                <p className="text-xs text-[#888888] mb-6">Build a space for students to connect, collaborate, and share.</p>

                <form onSubmit={handleCreateCommunitySubmit} className="space-y-4 overflow-y-auto pr-1">
                  {/* Community Name */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#6B6B6B] mb-1.5">Community Name</label>
                    <input
                      type="text"
                      required
                      value={communityName}
                      onChange={e => setCommunityName(e.target.value)}
                      placeholder="e.g. Web Dev Club, Chess Masters"
                      className="w-full bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl px-4 py-3 text-sm font-medium text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#C8922A] transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#6B6B6B] mb-1.5">Short Description</label>
                    <textarea
                      required
                      rows={3}
                      value={communityDescription}
                      onChange={e => setCommunityDescription(e.target.value)}
                      placeholder="What is this community about? Keep it short & sweet."
                      className="w-full bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl px-4 py-3 text-sm font-medium text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#C8922A] transition-colors resize-none"
                    />
                  </div>

                  {/* Tags Selector */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                      Category Tags (Select up to 3)
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {popularTags.map(tag => {
                        const isSelected = communityTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={clsx(
                              "text-[10px] px-3 py-1 rounded-full font-bold border transition-all cursor-pointer",
                              isSelected
                                ? "bg-[#C8922A]/10 border-[#C8922A] text-[#C8922A]"
                                : "bg-[#F9F8F5] border-[#E8E6E0] text-[#6B6B6B] hover:bg-[#F3F2EE]"
                            )}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                    {/* Add Custom Tag */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customTag}
                        onChange={e => setCustomTag(e.target.value)}
                        placeholder="Add custom tag..."
                        className="flex-1 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl px-3 py-2 text-xs font-medium text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#C8922A] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTag}
                        className="px-3 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl text-xs font-bold text-[#6B6B6B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {communityTags.filter(t => !popularTags.includes(t)).map(tag => (
                        <span
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className="text-[10px] bg-[#C8922A]/10 border border-[#C8922A] px-3 py-1 rounded-full text-[#C8922A] font-bold cursor-pointer flex items-center gap-1"
                        >
                          #{tag}
                          <X size={10} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Toggle */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#6B6B6B] mb-2">Privacy</label>
                    <div className="grid grid-cols-2 gap-2 bg-[#F9F8F5] p-1.5 rounded-xl border border-[#E8E6E0]">
                      <button
                        type="button"
                        onClick={() => setCommunityPrivacy("public")}
                        className={clsx(
                          "py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center",
                          communityPrivacy === "public"
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
                            : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                        )}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommunityPrivacy("invite_only")}
                        className={clsx(
                          "py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center",
                          communityPrivacy === "invite_only"
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
                            : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                        )}
                      >
                        Invite Only
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={creatingCommunity}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {creatingCommunity ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Creating...
                        </>
                      ) : "Create Community"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Community Toast Notification */}
        <AnimatePresence>
          {communityToast && (
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${communityToast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
            >
              {communityToast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {communityToast.msg}
            </motion.div>
          )}
        </AnimatePresence>
        <ConfettiSparkles active={showConfetti} />
      </div>
    </Suspense>
  );
}
