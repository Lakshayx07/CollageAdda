"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { UserPlus, UserCheck, Search, Users, MessageCircle, Loader2, Heart, X } from "lucide-react";
import { useRouter } from "next/navigation";

const LAST_SEEN_KEY = "collegeadda_followers_last_seen";

export default function FriendsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

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
        // Count followers whose account was created after last seen timestamp
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
    const u = JSON.parse(stored);
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
        setSuggestedUsers(data);
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

    // Poll for new followers every 30 seconds
    const interval = setInterval(fetchFollowerNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadData, fetchFollowerNotifications]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!search.trim()) {
      const token = getToken();
      const stored = localStorage.getItem("collegeadda_user");
      if (!token || !stored) return;
      const u = JSON.parse(stored);
      setSearching(true);
      fetch(`${apiUrl}/api/users/search/query?q=${encodeURIComponent(u.university || "")}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : [])
        .then(data => setSuggestedUsers(data))
        .catch(console.error)
        .finally(() => setSearching(false));
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const token = getToken();
        const res = await fetch(`${apiUrl}/api/users/search/query?q=${encodeURIComponent(search)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestedUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, apiUrl]);

  const handleHeartClick = () => {
    setShowNotifPanel(prev => !prev);
    if (!heartSeen) {
      // Mark as seen — save current timestamp
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

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header with Heart Notification */}
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users size={22} style={{ color: "#e1306c" }} />
          <h1 className="text-xl font-bold text-foreground">Friends</h1>
        </div>

        {/* Heart Notification Icon */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleHeartClick}
            className="relative p-2 rounded-full transition-all active:scale-90"
            aria-label="Follower notifications"
          >
            <Heart
              size={26}
              className="transition-all duration-300"
              style={{
                fill: heartSeen ? "none" : "#ef4444",
                stroke: heartSeen ? (showNotifPanel ? "#ec4899" : "#9ca3af") : "#ef4444",
                filter: !heartSeen ? "drop-shadow(0 0 6px #ef444488)" : "none"
              }}
            />
            {/* Red badge */}
            {newFollowersCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-lg animate-bounce">
                {newFollowersCount > 9 ? "9+" : newFollowersCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {showNotifPanel && (
            <div className="absolute right-0 top-12 w-80 max-h-[70vh] overflow-y-auto bg-surface border border-border/50 rounded-2xl shadow-2xl z-50 animate-fade-in">
              <div className="sticky top-0 bg-surface/95 backdrop-blur-sm flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Heart size={16} className="text-pink-500 fill-pink-500" />
                  Your Followers
                </h3>
                <button onClick={() => setShowNotifPanel(false)} className="text-muted hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              {allFollowers.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted">
                  <Heart size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-semibold">No followers yet</p>
                  <p className="text-xs mt-1">When someone follows you, they'll appear here 💕</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {allFollowers.map((follower) => {
                    const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || "0");
                    const isNew = follower.createdAt && new Date(follower.createdAt).getTime() > lastSeen;
                    const avatar = follower.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.name)}&background=6366f1&color=fff`;

                    return (
                      <div
                        key={follower._id}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors ${isNew ? "bg-pink-500/5" : ""}`}
                      >
                        <img src={avatar} alt={follower.name} className="w-10 h-10 rounded-full object-cover border-2 border-background" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{follower.name}</p>
                          <p className="text-[11px] text-muted truncate">{follower.university}</p>
                        </div>
                        {isNew && (
                          <span className="text-[10px] bg-pink-500/20 text-pink-500 font-bold px-2 py-0.5 rounded-full shrink-0">New</span>
                        )}
                        <button
                          onClick={() => router.push(`/messages?userId=${follower._id}`)}
                          className="p-1.5 rounded-xl bg-surface-hover text-primary hover:bg-primary/10 transition-all shrink-0"
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin" size={16} />}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or university..."
            className="w-full bg-surface-hover border border-border/50 rounded-xl py-3 pl-10 pr-10 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        )}

        {/* People You May Know */}
        {!loading && (
          <div>
            <h2 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
              {search.trim() ? "Search Results" : "People You May Know"}
            </h2>
            {suggestedUsers.length === 0 && (
              <div className="text-center py-10 text-muted">
                <p className="text-lg font-semibold">No users found 🔍</p>
                <p className="text-sm mt-1">Try a different name or university.</p>
              </div>
            )}
            <div className="space-y-4">
              {suggestedUsers.map(person => {
                const status = followStatus[person._id];
                const avatar = person.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=6366f1&color=fff`;

                return (
                  <div key={person._id} className="glass-panel p-5 rounded-3xl transition-all hover:border-primary/20 group">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <img
                          src={avatar}
                          alt={person.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-background shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-foreground text-base truncate">{person.name}</p>
                            {person.year && (
                              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{person.year}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleFollow(person._id)}
                              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                                status === "connected"
                                  ? "bg-green-500/20 text-green-400"
                                  : "text-white hover:scale-[1.05] active:scale-95 shadow-primary/20"
                              }`}
                              style={!status ? { background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" } : {}}
                            >
                              {status === "connected" ? (
                                <><UserCheck size={14} /><span>Following</span></>
                              ) : (
                                <><UserPlus size={14} /><span>Follow</span></>
                              )}
                            </button>
                            {status === "connected" && (
                              <button
                                onClick={() => router.push(`/messages?userId=${person._id}`)}
                                className="p-2.5 rounded-xl bg-surface-hover text-primary hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all shadow-sm"
                              >
                                <MessageCircle size={20} />
                              </button>
                            )}
                          </div>
                        </div>

                        {person.bio && (
                          <p className="text-xs text-muted mt-2 line-clamp-2 italic">"{person.bio}"</p>
                        )}

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(person.interests || []).slice(0, 3).map(i => (
                            <span key={i} className="text-[9px] bg-primary/5 text-primary/80 px-2 py-0.5 rounded-lg border border-primary/10 font-medium">
                              #{i}
                            </span>
                          ))}
                          <span className="text-[9px] text-muted flex items-center ml-auto">
                            <Users size={10} className="mr-1" />
                            {person.university}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
