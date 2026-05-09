"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { UserPlus, UserCheck, Search, Users, MessageCircle, Loader2, Heart, X, Sparkles, MapPin, Zap } from "lucide-react";
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
  const [followStatus, setFollowStatus] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

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
        setSuggestedUsers(Array.isArray(data) ? data : []);
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
        .then(data => setSuggestedUsers(Array.isArray(data) ? data : []))
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

  const toggleFollow = async (targetId) => {
    const currentStatus = followStatus[targetId];
    setFollowStatus(prev => ({ ...prev, [targetId]: currentStatus === "connected" ? null : "connected" }));
    try {
      const token = getToken();
      await fetch(`${apiUrl}/api/users/${targetId}/follow`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
      setFollowStatus(prev => ({ ...prev, [targetId]: currentStatus }));
    }
  };

  if (!isMounted || !user) return null;

  return (
    <Suspense fallback={null}>
    <div className="min-h-screen bg-[#0A0A0F] pb-24 relative overflow-hidden">
      {/* Background Noise & Glows */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/10 blur-[120px] rounded-full z-0" />

      {/* Header */}
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
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
                className="absolute right-0 top-16 w-[320px] glass-card border border-white/10 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
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
                          onClick={() => router.push(`/messages?userId=${follower._id}`)}
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

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-10 relative z-10">
        {/* Search Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter">Find Your <span className="gradient-text">Campus Squad</span></h2>
            <p className="text-white/40 text-sm font-medium">Connect with the coolest minds in your university</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 gradient-bg rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition-opacity pointer-events-none" />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors pointer-events-none" size={20} />
            {searching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-500 animate-spin" size={18} />}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, university or #interest..."
              className="w-full bg-transparent glass-card border border-white/10 rounded-[2rem] py-5 pl-14 pr-12 text-[15px] text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all shadow-2xl"
            />
          </div>
        </motion.div>

        {/* Suggested Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center">
              <Sparkles size={12} className="mr-2 text-yellow-500" />
              {search.trim() ? "Search Results" : "Verified Campus Peers"}
            </h3>
            <span className="text-[10px] glass px-3 py-1 rounded-full text-purple-400 font-bold border border-purple-500/10">
              {suggestedUsers.length} online
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
                <div className="text-center py-20 glass-card rounded-[3rem] border-white/5 border-dashed">
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
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: { y: 0, opacity: 1 }
                      }}
                      className="glass-card p-6 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden"
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
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#0A0A0F] rounded-full animate-pulse-glow" />
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
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleFollow(person._id)}
                            className={clsx(
                              "flex-1 md:w-32 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl",
                              status === "connected"
                                ? "glass text-white/40 border-white/10"
                                : "gradient-bg text-white shadow-purple-500/20"
                            )}
                          >
                            {status === "connected" ? (
                              <span className="flex items-center justify-center gap-2"><UserCheck size={14} /> Squad</span>
                            ) : (
                              <span className="flex items-center justify-center gap-2"><UserPlus size={14} /> Connect</span>
                            )}
                          </motion.button>
                          
                          {status === "connected" && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => router.push(`/messages?userId=${person._id}`)}
                              className="p-3.5 rounded-2xl glass text-purple-400 hover:text-white hover:bg-purple-500/20 transition-all border border-white/10"
                            >
                              <MessageCircle size={20} />
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
      </div>
    </div>
    </Suspense>
  );
}
