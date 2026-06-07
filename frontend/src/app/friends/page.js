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
    setSelectedProfileData({ ...person, rank, badgeTitle: topBadge?.label });
    
    try {
      const token = getToken();
      const res = await fetch(`${apiUrl}/api/users/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const fullData = await res.json();
        setSelectedProfileData(prev => ({ ...prev, ...fullData }));
      }
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
    { label: "Campus Star", className: "from-yellow-300 to-orange-500 text-black", icon: Trophy },
    { label: "Rising Icon", className: "from-slate-200 to-cyan-300 text-slate-950", icon: Star },
    { label: "Squad Magnet", className: "from-amber-600 to-rose-500 text-white", icon: Star },
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
      {/* Background Noise & Glows */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/10 blur-[120px] rounded-full z-0" />

      {/* Header */}
      <header className="page-header sticky top-0 z-40 px-4 py-4 flex items-center justify-between sm:px-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Squad</h1>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Connect</p>
          </div>
        </motion.div>

        <div className="relative" ref={notifRef}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleHeartClick}
            className="p-3 glass rounded-2xl relative border border-white/10"
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
              <span className="absolute -top-1 -right-1 bg-[#EC4899] text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-[#0A0A0F]">
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
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles size={16} className="text-pink-500" />
                    New Followers
                  </h3>
                  <button onClick={() => setShowNotifPanel(false)} className="text-white/20 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2">
                  {(Array.isArray(allFollowers) ? allFollowers : []).length === 0 ? (
                    <div className="py-12 text-center text-white/20">
                      <Heart size={40} className="mx-auto mb-3 opacity-10" />
                      <p className="text-sm font-bold">No fans yet!</p>
                      <p className="text-[10px] mt-1 uppercase tracking-widest">Connect to get followers</p>
                    </div>
                  ) : (
                    (Array.isArray(allFollowers) ? allFollowers : []).map((follower) => (
                      <div
                        key={follower._id}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full p-[1.5px] gradient-bg shrink-0">
                          <img 
                            src={follower.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.name)}&background=7C3AED&color=fff`} 
                            className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0F]" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{follower.name}</p>
                          <p className="text-[10px] text-white/40 truncate flex items-center">
                            <MapPin size={8} className="mr-1" />
                            {follower.university}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDirectMessage(follower._id)}
                          className="p-2 rounded-xl glass hover:bg-purple-500/10 text-purple-400"
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

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8 relative z-10 sm:px-6 sm:py-8 sm:space-y-10">
        {/* Search Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl sm:tracking-tighter">Find Your <span className="gradient-text">Campus Squad</span></h2>
            <p className="text-white/40 text-sm font-medium">Connect with the coolest minds in your university</p>
          </div>

          <div className="app-panel grid grid-cols-2 gap-1 rounded-[1.35rem] p-1">
            <button
              onClick={() => setActiveSquadTab("find")}
              className={clsx(
                "rounded-[1.1rem] px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition-all",
                activeSquadTab === "find" ? "gradient-bg text-white shadow-lg shadow-purple-500/20" : "text-white/42 hover:text-white"
              )}
            >
              Find Friends
            </button>
            <button
              onClick={() => setActiveSquadTab("leaderboard")}
              className={clsx(
                "rounded-[1.1rem] px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition-all",
                activeSquadTab === "leaderboard" ? "gradient-bg text-white shadow-lg shadow-purple-500/20" : "text-white/42 hover:text-white"
              )}
            >
              Leaderboard
            </button>
          </div>

          {activeSquadTab === "find" && (
            <div className="relative group">
              <div className="absolute -inset-1 gradient-bg rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition-opacity pointer-events-none" />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors pointer-events-none" size={20} />
              {searching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-500 animate-spin" size={18} />}
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, university or #interest..."
                className="input-surface w-full rounded-[1.5rem] py-5 pl-14 pr-12 text-[15px] text-white placeholder:text-white/25"
              />
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
                  leaderboardTab === "my_campus" ? "gradient-bg text-white shadow-lg shadow-purple-500/20" : "text-white/42 hover:text-white"
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
                  leaderboardTab === "global_pulse" ? "gradient-bg text-white shadow-lg shadow-purple-500/20" : "text-white/42 hover:text-white"
                )}
              >
                Global Pulse
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center">
                <Trophy size={13} className="mr-2 text-yellow-400" />
                {leaderboardTab === "global_pulse" ? "Top 10 Worldwide" : "Top 10 Students"}
              </h3>
              <span className="text-[10px] glass px-3 py-1 rounded-full text-yellow-300 font-bold border border-yellow-500/10">
                followers + following
              </span>
            </div>

            {loading || (leaderboardTab === "global_pulse" && globalLoading) ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-white/5 border-t-yellow-400 rounded-full animate-spin" />
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Building leaderboard...</p>
              </div>
            ) : leaderboardStudents.length === 0 ? (
              <div className="text-center py-20 app-panel rounded-[1.75rem] border-white/5 border-dashed">
                <p className="text-2xl font-black text-white/10 mb-2">No rankings yet</p>
                <p className="text-sm text-white/20 font-medium">Connect with students to start the leaderboard.</p>
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
                        
                        <div className="relative bg-[#0A0A0F]/90 backdrop-blur-2xl rounded-[1.8rem] p-7 flex flex-col items-center text-center gap-5">
                          <div className="w-full flex justify-center">
                            <motion.span 
                              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              className="bg-[linear-gradient(45deg,#ff0095,#006aff,#00ff99,#ff0095)] bg-[length:300%_300%] text-white text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-[0_0_20px_rgba(0,106,255,0.4)] flex items-center gap-2"
                            >
                              🌍 Global Pulse Leader
                            </motion.span>
                          </div>
                          
                          <div className="relative mt-3">
                            {/* Pulse Ring Behind Avatar */}
                            <div className="absolute inset-0 rounded-[2.2rem] bg-gradient-to-tr from-cyan-400 to-purple-500 animate-ping opacity-30 blur-md" />
                            
                            <img src={avatar} className="relative w-28 h-28 rounded-[2.2rem] border-4 border-white/10 object-cover shadow-2xl z-10 group-hover:scale-105 transition-transform duration-300" />
                            
                            <motion.div 
                              animate={{ y: [0, -10, 0], rotate: [0, 15, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              className="absolute -top-6 -right-6 text-5xl drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] z-20"
                            >
                              👑
                            </motion.div>
                            
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-sm font-black px-4 py-1 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20">
                              #1
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center justify-center gap-2">
                              <p className="text-2xl font-black text-white tracking-tight">{person.name}</p>
                              <VerifiedBadge user={person} size={20} />
                            </div>
                            <p className="text-xs font-bold text-white/50 mt-1 flex items-center justify-center gap-1">
                              <MapPin size={12} className="text-purple-400" />
                              {person.university || "Campus Adda"}
                            </p>
                            <div className="mt-3 flex justify-center">
                               <span className="inline-flex rounded-full glass px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-300 border border-cyan-400/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                 {topBadge?.label || "Global Star"}
                               </span>
                            </div>
                          </div>
                          
                          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
                          
                          <div className="flex gap-8 w-full justify-center items-center">
                            <div className="text-center group-hover:scale-110 transition-transform">
                              <p className="text-3xl font-black bg-gradient-to-br from-yellow-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(250,204,21,0.2)]">{person.influenceScore}</p>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mt-1">Total Score</p>
                            </div>
                            <div className="w-[1px] h-10 bg-white/10" />
                            <div className="text-left flex flex-col justify-center gap-1">
                              <p className="text-xs font-bold text-white/80 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                                {person.followerCount} fans
                              </p>
                              <p className="text-xs font-bold text-white/60 flex items-center gap-2">
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
                        rank === 1 ? "bg-yellow-300 text-black" : rank === 2 ? "bg-slate-200 text-slate-950" : rank === 3 ? "bg-orange-500 text-white" : "bg-white/[0.06] text-white/55"
                      )}>
                        #{rank}
                      </div>

                      <div className="relative shrink-0">
                        <img src={avatar} className="h-14 w-14 rounded-2xl border border-white/10 object-cover" />
                        {rank <= 3 && (
                          <div className="absolute -bottom-2 -right-2 rounded-xl bg-background p-1">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${topBadge.className}`}>
                              <BadgeIcon size={13} fill="currentColor" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-black text-white">{person.name}</p>
                          <VerifiedBadge user={person} size={14} />
                        </div>
                        <p className="mt-1 truncate text-[11px] font-bold text-white/35">{person.university || "Campus Adda"}</p>
                        {rank <= 3 && (
                          <span className="mt-2 inline-flex rounded-full bg-yellow-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-200">
                            {topBadge.label}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-black text-white">{person.influenceScore}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/28">score</p>
                        <p className="mt-1 text-[10px] text-white/35">
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
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center">
              <Sparkles size={12} className="mr-2 text-yellow-500" />
              {search.trim() ? "Search Results" : "Verified Campus Peers"}
            </h3>
            <span className="text-[10px] glass px-3 py-1 rounded-full text-purple-400 font-bold border border-purple-500/10">
              {suggestedUsers.length} peers
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-white/5 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Scanning Campus...</p>
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
                <div className="text-center py-20 app-panel rounded-[1.75rem] border-white/5 border-dashed">
                  <p className="text-2xl font-black text-white/10 mb-2">Squad Not Found 🛸</p>
                  <p className="text-sm text-white/20 font-medium">Try searching for #Tech, #Design or a name</p>
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
                      className="glass-card p-6 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden cursor-pointer"
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
                              <h4 className="font-black text-xl text-white truncate tracking-tight">{person.name}</h4>
                              <VerifiedBadge user={person} size={16} />
                            </div>
                            <p className="text-[11px] text-purple-400 font-bold uppercase tracking-widest flex items-center mt-1">
                              <MapPin size={10} className="mr-1" />
                              {person.university} {person.year && `• ${person.year}`}
                            </p>
                          </div>

                          {person.bio && (
                            <p className="text-sm text-white/50 line-clamp-1 font-medium italic">"{person.bio}"</p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {(person.interests || []).slice(0, 3).map(interest => (
                              <span key={interest} className="text-[10px] glass px-3 py-1 rounded-full text-white/40 font-bold border border-white/5 hover:border-purple-500/30 hover:text-purple-400 transition-all">
                                #{interest}
                              </span>
                            ))}
                            <span className="text-[10px] glass px-3 py-1 rounded-full text-cyan-400 font-bold border border-cyan-500/10 flex items-center">
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
                              className="flex-1 md:w-32 py-3 gradient-bg rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-purple-500/20"
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
                              className="flex-1 md:w-32 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl"
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
      </div>

      {/* Profile Preview Modal */}
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
              className="w-full sm:max-w-md bg-[#0A0A0F]/95 backdrop-blur-2xl border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] relative flex flex-col max-h-[90vh]"
            >
              {/* Animated Gradient Border Layer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
              
              {/* Close button */}
              <button onClick={() => setSelectedProfileId(null)} className="absolute top-4 right-4 z-20 p-2 glass rounded-full text-white/50 hover:text-white hover:rotate-90 transition-all duration-300 border border-white/10 shadow-lg bg-black/40 backdrop-blur-md">
                <X size={20} />
              </button>

              {profileLoading || !selectedProfileData ? (
                <div className="p-8 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
                  <div className="w-12 h-12 border-4 border-white/5 border-t-cyan-400 rounded-full animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest text-white/30">Loading Profile...</p>
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
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0A0A0F]">
                          <img
                            src={selectedProfileData.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProfileData.name)}&background=7C3AED&color=fff`}
                            alt={selectedProfileData.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                          />
                        </div>
                      </div>
                      {selectedProfileData.rank && (
                        <div className="absolute z-20 -top-1 -right-1 bg-yellow-400 text-black text-[11px] font-black px-2 py-0.5 rounded-full border-2 border-[#0A0A0F] shadow-lg">#{selectedProfileData.rank}</div>
                      )}
                    </motion.div>

                    {/* Badge title pill */}
                    <motion.div variants={modalVars.slideUp2} className="flex justify-center mt-4 mb-2">
                      <span className="bg-white/5 text-cyan-300 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-cyan-500/20 shadow-sm hover:scale-105 transition-transform cursor-default">
                        {selectedProfileData.badgeTitle || "Verified Student"}
                      </span>
                    </motion.div>

                    {/* Name & Uni */}
                    <div className="text-center space-y-1.5">
                      <motion.div variants={modalVars.slideUp1} className="flex items-center justify-center gap-2">
                        <h2 className="text-2xl font-black text-white tracking-tight">{selectedProfileData.name}</h2>
                        <VerifiedBadge user={selectedProfileData} size={20} />
                      </motion.div>
                      <motion.p variants={modalVars.slideUp2} className="text-xs font-bold text-white/50 flex items-center justify-center gap-1">
                        <MapPin size={12} className="text-purple-400" />
                        {selectedProfileData.university || "Campus Adda"}
                      </motion.p>
                      <motion.p variants={modalVars.fade1} className="text-[11px] font-bold text-white/40 mt-1 uppercase tracking-wider">
                        {[selectedProfileData.course, selectedProfileData.studyYear || selectedProfileData.year, selectedProfileData.passOutBatch ? `Batch of ${selectedProfileData.passOutBatch}` : ""].filter(Boolean).join(" • ")}
                      </motion.p>
                      {selectedProfileData.bio && (
                        <motion.p variants={modalVars.fade2} className="text-sm text-white/60 italic font-medium mt-4">"{selectedProfileData.bio}"</motion.p>
                      )}
                    </div>

                    {/* Stats Row */}
                    <motion.div variants={modalVars.statsContainer} className="grid grid-cols-4 gap-2 mt-6">
                      <motion.div variants={modalVars.statCard} whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.08)' }} className="glass p-3 rounded-2xl text-center border border-white/5 flex flex-col justify-center transition-colors cursor-default">
                        <p className="text-lg font-black text-white">{getSocialCount(selectedProfileData.followers)}</p>
                        <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold mt-1">Followers</p>
                      </motion.div>
                      <motion.div variants={modalVars.statCard} whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.08)' }} className="glass p-3 rounded-2xl text-center border border-white/5 flex flex-col justify-center transition-colors cursor-default">
                        <p className="text-lg font-black text-white">{getSocialCount(selectedProfileData.following)}</p>
                        <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold mt-1">Following</p>
                      </motion.div>
                      <motion.div variants={modalVars.statCard} whileHover={{ y: -3, scale: 1.02 }} className="glass p-3 rounded-2xl text-center border border-white/5 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 flex flex-col justify-center transition-transform cursor-default">
                        <p className="text-lg font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                          {getSocialCount(selectedProfileData.followers) + getSocialCount(selectedProfileData.following)}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-yellow-500/60 font-bold mt-1">Score</p>
                      </motion.div>
                      <motion.div variants={modalVars.statCard} whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.08)' }} className="glass p-3 rounded-2xl text-center border border-white/5 flex flex-col justify-center transition-colors cursor-default">
                        <p className="text-lg font-black text-white">{selectedProfileData.postsCount || Math.floor(Math.random() * 15 + 2)}</p>
                        <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold mt-1">Posts</p>
                      </motion.div>
                    </motion.div>

                    {/* Interests */}
                    {selectedProfileData.interests && selectedProfileData.interests.length > 0 && (
                      <motion.div variants={modalVars.interestsContainer} className="mt-6">
                        <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center">✨ Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfileData.interests.map(int => (
                            <motion.span 
                              variants={modalVars.interestPill} 
                              whileHover={{ background: 'linear-gradient(45deg, rgba(168,85,247,0.8), rgba(236,72,153,0.8))', color: 'white' }}
                              key={int} 
                              className="bg-black/40 border border-white/10 text-white/70 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition-colors cursor-default"
                            >
                              💡 {int}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Activity Section */}
                    <motion.div variants={modalVars.activity} className="mt-6">
                      <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center">🔥 Campus Vibe</h3>
                      <div className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-default">
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                          <Zap size={18} className="text-white fill-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">Frequent Poster</p>
                          <p className="text-[10px] text-white/40 mt-0.5">Regularly posts on campus feed</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div variants={modalVars.buttonsContainer} className="mt-8 flex flex-col gap-3">
                      {user && (user._id === selectedProfileData._id || user.id === selectedProfileData._id) ? (
                        <>
                          <motion.button variants={modalVars.primaryButton} onClick={() => router.push('/profile')} className="w-full py-4 gradient-bg rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-xl border border-white/10 hover:scale-[1.02] transition-transform">
                            ✏️ Edit Profile
                          </motion.button>
                        </>
                      ) : followStatus[selectedProfileData._id] === "connected" ? (
                        <>
                          <motion.button variants={modalVars.primaryButton} onClick={() => { handleDirectMessage(selectedProfileData._id); setSelectedProfileId(null); }} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                            💬 Chat Now
                          </motion.button>
                          <motion.button variants={modalVars.buttonItem} onClick={() => { router.push(`/profile/${selectedProfileData._id}`); setSelectedProfileId(null); }} className="w-full py-4 glass rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-xl border border-white/10 hover:bg-white/5 transition-colors hover:scale-[1.02]">
                            🔗 View Full Profile
                          </motion.button>
                        </>
                      ) : followStatus[selectedProfileData._id] === "pending" ? (
                        <>
                          <motion.button variants={modalVars.primaryButton} disabled className="w-full py-4 bg-white/5 rounded-2xl text-xs font-black text-white/40 uppercase tracking-widest border border-white/10 cursor-not-allowed">
                            ⏳ Request Sent
                          </motion.button>
                          <motion.button variants={modalVars.buttonItem} onClick={() => { router.push(`/profile/${selectedProfileData._id}`); setSelectedProfileId(null); }} className="w-full py-4 glass rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-xl border border-white/10 hover:bg-white/5 transition-colors hover:scale-[1.02]">
                            🔗 View Full Profile
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button 
                            variants={modalVars.primaryButton}
                            onClick={() => handleConnectAction(selectedProfileData._id)}
                            disabled={connectStatus !== "idle"}
                            className="relative w-full py-4 gradient-bg rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {connectStatus === "idle" && <span className="relative z-10">⚡ Connect</span>}
                            {connectStatus === "connecting" && <span className="relative z-10 flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Connecting...</span>}
                            {connectStatus === "connected" && <span className="relative z-10">✓ Connected!</span>}
                          </motion.button>
                          <motion.button variants={modalVars.buttonItem} onClick={() => { router.push(`/profile/${selectedProfileData._id}`); setSelectedProfileId(null); }} className="w-full py-4 glass rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-xl border border-white/10 hover:bg-white/5 transition-colors hover:scale-[1.02]">
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
