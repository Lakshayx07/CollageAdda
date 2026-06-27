 "use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { UserPlus, Search, Users, MessageCircle, Loader2, Heart, X, Sparkles, MapPin, Zap, Trophy, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import VerifiedBadge from "../../components/VerifiedBadge";
import clsx from "clsx";

const LAST_SEEN_KEY = "collegeadda_followers_last_seen";

export default function FriendsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [campusUsers, setCampusUsers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeSquadTab, setActiveSquadTab] = useState("find");
  const [leaderboardTab, setLeaderboardTab] = useState("my_campus");
  const [globalUsers, setGlobalUsers] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedProfileData, setSelectedProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [connectStatus, setConnectStatus] = useState("idle");

  useEffect(() => {
    if (selectedProfileId) setConnectStatus("idle");
  }, [selectedProfileId]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Notification state
  const [allFollowers, setAllFollowers] = useState([]);
  const [newFollowersCount, setNewFollowersCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [heartSeen, setHeartSeen] = useState(true);
  const notifRef = useRef(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const getToken = () => localStorage.getItem("collegeadda_token");

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
        setGlobalUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGlobalLoading(false);
    }
  }, [apiUrl, globalUsers.length]);

  const handleProfileClick = async (person, rank = null, topBadge = null) => {
    const targetId = person._id || person.id;
    if (!targetId) return;
    
    setSelectedProfileId(targetId);
    setProfileLoading(true);
    setSelectedProfileData({ ...person, rank, badgeTitle: topBadge?.label, postsCount: undefined });
    
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
        ...fullData, 
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
        const followers = await res.json();
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

    try {
      const [profileRes, suggestedRes] = await Promise.all([
        fetch(`${apiUrl}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/users/search/query?q=${encodeURIComponent(u.university || "")}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const statusMap = {};
        (profileData.following || []).forEach(id => {
          statusMap[id.toString ? id.toString() : id] = "connected";
        });
        setFollowStatus(statusMap);
      }

      if (suggestedRes.ok) {
        const data = await suggestedRes.json();
        const users = Array.isArray(data) ? data : [];
        setSuggestedUsers(users);
        setCampusUsers(users);
      }
    } catch (err) {
      console.error("Error loading friends data:", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, router]);

  useEffect(() => {
    loadData();
    fetchFollowerNotifications();
    const interval = setInterval(fetchFollowerNotifications, 30000);
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
    const stored = localStorage.getItem("collegeadda_user");
    const token = getToken();
    if (!token || !stored) return;

    let u;
    try {
      u = JSON.parse(stored);
    } catch (e) { return; }

    if (!u) return;

    if (!search.trim()) {
      setSearching(true);
      fetch(`${apiUrl}/api/users/search/query?q=${encodeURIComponent(u.university || "")}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : [])
        .then(data => {
          const users = Array.isArray(data) ? data : [];
          setSuggestedUsers(users);
          setCampusUsers(users);
        })
        .catch(console.error)
        .finally(() => setSearching(false));
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${apiUrl}/api/users/search/query?q=${encodeURIComponent(search)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestedUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, apiUrl]);

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
      }

      // 2. Get or Create Room
      const res = await fetch(`${apiUrl}/api/chat/rooms`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId: targetId })
      });

      if (res.ok) {
        const room = await res.json();
        router.push(`/messages?chat=${room._id}`);
      }
    } catch (err) {
      console.error("Error starting direct message:", err);
    }
  };

  const toggleFollow = async (targetId) => {
    const currentStatus = followStatus[targetId];
    const isConnecting = currentStatus !== "connected";
    setFollowStatus(prev => ({ ...prev, [targetId]: isConnecting ? "connected" : null }));
    
    const updateUsersList = (users) => users.map(u => {
        if (u._id === targetId || u.id === targetId) {
            let currentFollowers = Array.isArray(u.followers) ? u.followers : Array.from({length: Number(u.followers || 0)});
            if (isConnecting) {
                return { ...u, followers: [...currentFollowers, user._id || user.id] };
            } else {
                return { ...u, followers: currentFollowers.filter(id => id !== (user._id || user.id)).slice(0, Math.max(0, currentFollowers.length - 1)) };
            }
        }
        return u;
    });

    setCampusUsers(prev => updateUsersList(prev));
    setSuggestedUsers(prev => updateUsersList(prev));

    try {
      const token = getToken();
      await fetch(`${apiUrl}/api/users/${targetId}/follow`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
      setFollowStatus(prev => ({ ...prev, [targetId]: currentStatus }));
      
      // Revert if error
      const revertUsersList = (users) => users.map(u => {
        if (u._id === targetId || u.id === targetId) {
            let currentFollowers = Array.isArray(u.followers) ? u.followers : Array.from({length: Number(u.followers || 0)});
            if (!isConnecting) {
                return { ...u, followers: [...currentFollowers, user._id || user.id] };
            } else {
                return { ...u, followers: currentFollowers.filter(id => id !== (user._id || user.id)).slice(0, Math.max(0, currentFollowers.length - 1)) };
            }
        }
        return u;
      });
      setCampusUsers(prev => revertUsersList(prev));
      setSuggestedUsers(prev => revertUsersList(prev));
    }
  };

  const getSocialCount = (value) => Array.isArray(value) ? value.length : Number(value || 0);

  const leaderboardStudents = useMemo(() => {
    const source = activeSquadTab === "leaderboard" && leaderboardTab === "global_pulse" 
      ? globalUsers 
      : (campusUsers.length ? campusUsers : suggestedUsers);
    const unique = new Map();

    // Always include current user in the leaderboard
    if (user && (user._id || user.id)) {
      const id = user._id || user.id || user.email || user.name;
      unique.set(id, {
        ...user,
        followerCount: getSocialCount(user.followers),
        followingCount: getSocialCount(user.following),
      });
    }

    source.forEach((person) => {
      const id = person._id || person.id || person.email || person.name;
      if (!id || unique.has(id)) return;
      unique.set(id, {
        ...person,
        followerCount: getSocialCount(person.followers),
        followingCount: getSocialCount(person.following),
      });
    });

    return Array.from(unique.values())
      .map((person) => ({
        ...person,
        influenceScore: person.followerCount + person.followingCount,
      }))
      .sort((a, b) => b.influenceScore - a.influenceScore)
      .slice(0, 10);
  }, [campusUsers, suggestedUsers, globalUsers, activeSquadTab, leaderboardTab, user]);

  const topBadgeStyles = [
    { label: "Campus Star", className: "from-yellow-300 to-[#D4A843] text-black", icon: Trophy },
    { label: "Rising Icon", className: "from-slate-200 to-amber-300 text-slate-950", icon: Star },
    { label: "Squad Magnet", className: "from-amber-600 to-[#D4A843] text-[#1A1A1A]", icon: Star },
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
      {/* ============ ANIMATED BACKGROUND ============ */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Orb top-left */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-10%', left: '-10%',
            width: '700px', height: '700px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Orb top-right */}
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 50, 0], scale: [1, 0.85, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{
            position: 'absolute', top: '5%', right: '-10%',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Orb bottom */}
        <motion.div
          animate={{ x: [0, 40, -30, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
          style={{
            position: 'absolute', bottom: '0%', left: '25%',
            width: '600px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }} />
        {/* Top fade */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '350px',
          background: 'linear-gradient(180deg, rgba(124,58,237,0.07) 0%, transparent 100%)',
        }} />
      </div>

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
            <h1 className="text-xl font-black text-[#1A1A1A] tracking-tight">Squad</h1>
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
                            src={follower.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.name)}&background=7C3AED&color=fff`} 
                            className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0F]" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#1A1A1A] truncate">{follower.name}</p>
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

      <div className="max-w-6xl mx-auto px-4 py-6 relative z-10 sm:px-6 sm:py-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column (Search & Lists) */}
        <div className="flex-1 w-full space-y-6 sm:space-y-8 max-w-2xl">
        {/* Search Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">Find Your <span className="gradient-text">Campus Squad</span></h2>
            <p className="text-[#6B6B6B] text-sm font-medium">Connect with the coolest minds in your university</p>
          </div>

          <div className="flex items-center gap-6 border-b border-[#E8E6E0]">
            <button
              onClick={() => setActiveSquadTab("find")}
              className={clsx(
                "pb-3 text-[15px] font-black transition-colors relative",
                activeSquadTab === "find" ? "text-[#C8922A]" : "text-[#888888] hover:text-[#1A1A1A]"
              )}
            >
              Find Friends
              {activeSquadTab === "find" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8922A] rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveSquadTab("leaderboard")}
              className={clsx(
                "pb-3 text-[15px] font-black transition-colors relative",
                activeSquadTab === "leaderboard" ? "text-[#C8922A]" : "text-[#888888] hover:text-[#1A1A1A]"
              )}
            >
              Leaderboard
              {activeSquadTab === "leaderboard" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8922A] rounded-t-full" />}
            </button>
          </div>

          {activeSquadTab === "find" && (
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
              <button className="flex items-center gap-2 px-4 py-3 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl text-[12px] font-bold text-[#6B6B6B] hover:bg-[#F3F2EE] transition-colors shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                Filters
              </button>
            </div>
          )}
        </motion.div>

        {activeSquadTab === "leaderboard" ? (
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
                  fetchGlobalUsers();
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

            {loading || (leaderboardTab === "global_pulse" && globalLoading) ? (
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
                  const avatar = person.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=7C3AED&color=fff`;

                  if (leaderboardTab === "global_pulse" && rank === 1) {
                    return (
                      <motion.div
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
                            
                            <img src={avatar} className="relative w-28 h-28 rounded-[2.2rem] border-4 border-[#E8E6E0] object-cover shadow-2xl z-10 group-hover:scale-105 transition-transform duration-300" />
                            
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
                              <p className="text-2xl font-black text-[#1A1A1A] tracking-tight">{person.name}</p>
                              <VerifiedBadge user={person} size={20} />
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
                      key={person._id || person.id || person.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
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
                        <img src={avatar} className="h-14 w-14 rounded-2xl border border-[#E8E6E0] object-cover" />
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
                          <p className="truncate text-sm font-black text-[#1A1A1A]">{person.name}</p>
                          <VerifiedBadge user={person} size={14} />
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
              {search.trim() ? "Search Results" : "Verified Campus Peers"}
            </h3>
            <span className="text-[10px] bg-[#F9F8F5] border border-[#E8E6E0] px-3 py-1 rounded-full text-[#C8922A] font-bold border border-[#C8922A]/30">
              {suggestedUsers.length} peers
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-[#E8E6E0] border-t-purple-500 rounded-full animate-spin" />
              <p className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest">Scanning Campus...</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="grid gap-6"
            >
              {suggestedUsers.length === 0 ? (
                <div className="text-center py-20 app-panel rounded-[1.75rem] border-[#E8E6E0] border-dashed">
                  <p className="text-2xl font-black text-[#888888] mb-2">Squad Not Found 🛸</p>
                  <p className="text-sm text-[#888888] font-medium">Try searching for #Tech, #Design or a name</p>
                </div>
              ) : (
                suggestedUsers.map(person => {
                  const status = followStatus[person._id];
                  const avatar = person.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=7C3AED&color=fff`;

                  return (
                    <motion.div 
                      key={person._id}
                      onClick={() => handleProfileClick(person)}
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: { y: 0, opacity: 1 }
                      }}
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="bg-white p-6 rounded-[2.5rem] border border-[#E8E6E0] hover:border-purple-500/50 hover:shadow-lg transition-all group relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 gradient-bg opacity-[0.03] blur-3xl -rotate-45 translate-x-16 -translate-y-16" />
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                        <div className="relative shrink-0">
                          <div className="w-20 h-20 rounded-[2rem] p-[2px] gradient-bg shadow-2xl">
                            <img
                              src={avatar}
                              className="w-full h-full rounded-[1.9rem] object-cover border-4 border-[#0A0A0F]"
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-black text-xl text-[#1A1A1A] truncate tracking-tight">{person.name}</h4>
                              <VerifiedBadge user={person} size={16} />
                            </div>
                            <p className="text-[11px] text-[#C8922A] font-bold uppercase tracking-widest flex items-center mt-1">
                              <MapPin size={10} className="mr-1" />
                              {person.university} {person.year && `• ${person.year}`}
                            </p>
                          </div>

                          {person.bio && (
                            <p className="text-sm text-[#6B6B6B] line-clamp-1 font-medium italic">"{person.bio}"</p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {(person.interests || []).slice(0, 3).map(interest => (
                              <span key={interest} className="text-[10px] bg-[#F9F8F5] border border-[#E8E6E0] px-3 py-1 rounded-full text-[#6B6B6B] font-bold border border-[#E8E6E0] hover:border-[#C8922A]/30 hover:text-[#C8922A] transition-all">
                                #{interest}
                              </span>
                            ))}
                            <span className="text-[10px] bg-[#F9F8F5] border border-[#E8E6E0] px-3 py-1 rounded-full text-[#C8922A] font-bold border border-cyan-500/10 flex items-center">
                              <Users size={10} className="mr-1" /> 12 mutuals
                            </span>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center gap-3">
                          {status === "connected" ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); handleDirectMessage(person._id); }}
                              className="ca-btn-primary flex-1 md:w-32 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[0_4px_14px_rgba(200,146,42,0.15)]"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <MessageCircle size={14} /> 
                                Chat Now
                              </span>
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); toggleFollow(person._id); }}
                              className="ca-btn-primary flex-1 md:w-32 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <UserPlus size={14} /> 
                                Connect
                              </span>
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

        {/* Right Column (Build Your Squad) - inside flex row */}
        <div className="w-full md:w-[340px] xl:w-[400px] shrink-0 sticky top-24 space-y-6 hidden md:block">
          {/* Build Your Squad Card */}
          <div className="app-panel rounded-[1.6rem] p-6 text-center shadow-sm">
            <div className="flex justify-center -space-x-4 mb-5">
              <img src="https://ui-avatars.com/api/?name=A&background=F3D5B5&color=7C3D12" className="w-16 h-16 rounded-full border-4 border-white z-10 object-cover" alt="Avatar" />
              <img src="https://ui-avatars.com/api/?name=B&background=FDE68A&color=92400E" className="w-20 h-20 rounded-full border-4 border-white z-20 -translate-y-2 object-cover" alt="Avatar" />
              <img src="https://ui-avatars.com/api/?name=C&background=D1FAE5&color=065F46" className="w-16 h-16 rounded-full border-4 border-white z-10 object-cover" alt="Avatar" />
            </div>

            <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight mb-2">Build Your Squad</h3>
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

          {/* Your Squads Section */}
          <div className="px-1">
            <h4 className="text-[11px] font-black text-[#1A1A1A] mb-3 uppercase tracking-wider">Your Squads</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 app-panel rounded-2xl hover:bg-[#F3F2EE] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-sm font-bold shrink-0">D</div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">Design Squad</p>
                    <p className="text-[10px] text-[#6B6B6B]">9 members</p>
                  </div>
                </div>
                <div className="text-[#888888] group-hover:text-[#1A1A1A] transition-colors text-lg">›</div>
              </div>
              <div className="flex items-center justify-between p-3 app-panel rounded-2xl hover:bg-[#F3F2EE] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">T</div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">Tech Innovators</p>
                    <p className="text-[10px] text-[#6B6B6B]">12 members</p>
                  </div>
                </div>
                <div className="text-[#888888] group-hover:text-[#1A1A1A] transition-colors text-lg">›</div>
              </div>
              <div className="flex items-center justify-between p-3 app-panel rounded-2xl hover:bg-[#F3F2EE] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">S</div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">Snipe Fest Team</p>
                    <p className="text-[10px] text-[#6B6B6B]">6 members</p>
                  </div>
                </div>
                <div className="text-[#888888] group-hover:text-[#1A1A1A] transition-colors text-lg">›</div>
              </div>
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
                            src={selectedProfileData.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProfileData.name)}&background=7C3AED&color=fff`}
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
                        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">{selectedProfileData.name}</h2>
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
                        <motion.p variants={modalVars.fade2} className="text-sm text-[#6B6B6B] italic font-medium mt-4">"{selectedProfileData.bio}"</motion.p>
                      )}
                    </div>

                    {/* Stats Row */}
                    <motion.div variants={modalVars.statsContainer} className="grid grid-cols-4 gap-2 mt-6">
                      <motion.div variants={modalVars.statCard} whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.08)' }} className="bg-[#F9F8F5] border border-[#E8E6E0] p-3 rounded-2xl text-center border border-[#E8E6E0] flex flex-col justify-center transition-colors cursor-default">
                        <p className="text-lg font-black text-[#1A1A1A]">{selectedProfileData.followers !== undefined ? getSocialCount(selectedProfileData.followers) : "—"}</p>
                        <p className="text-[9px] uppercase tracking-wider text-[#6B6B6B] font-bold mt-1">Followers</p>
                      </motion.div>
                      <motion.div variants={modalVars.statCard} whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.08)' }} className="bg-[#F9F8F5] border border-[#E8E6E0] p-3 rounded-2xl text-center border border-[#E8E6E0] flex flex-col justify-center transition-colors cursor-default">
                        <p className="text-lg font-black text-[#1A1A1A]">{selectedProfileData.following !== undefined ? getSocialCount(selectedProfileData.following) : "—"}</p>
                        <p className="text-[9px] uppercase tracking-wider text-[#6B6B6B] font-bold mt-1">Following</p>
                      </motion.div>
                      <motion.div variants={modalVars.statCard} whileHover={{ y: -3, scale: 1.02 }} className="bg-[#F9F8F5] border border-[#E8E6E0] p-3 rounded-2xl text-center border border-[#E8E6E0] bg-gradient-to-br from-yellow-500/10 to-[#D4A843]/10 border-yellow-500/20 flex flex-col justify-center transition-transform cursor-default">
                        <p className="text-lg font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                          {(selectedProfileData.followers !== undefined && selectedProfileData.following !== undefined) ? getSocialCount(selectedProfileData.followers) + getSocialCount(selectedProfileData.following) : "—"}
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
                          <motion.button variants={modalVars.primaryButton} onClick={() => { handleDirectMessage(selectedProfileData._id); setSelectedProfileId(null); }} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl text-xs font-black text-[#1A1A1A] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
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
                            className="relative w-full py-4 gradient-bg rounded-2xl text-xs font-black text-[#1A1A1A] uppercase tracking-widest shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)] hover:scale-[1.02] transition-transform overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-[#F3F2EE] opacity-0 group-hover:opacity-100 transition-opacity" />
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
    </div>
    </Suspense>
  );
}

