"use client";
import { useState, useEffect, useCallback } from "react";
import { UserPlus, UserCheck, UserX, Search, Users, MessageCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FriendsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const getToken = () => localStorage.getItem("collegeadda_token");

  // Load current user, suggested people (from the same university), and incoming requests
  const loadData = useCallback(async () => {
    const stored = localStorage.getItem("collegeadda_user");
    const token = getToken();
    if (!stored || !token) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);

    try {
      // Fetch the user's own profile to get their following list for status check
      const [profileRes, suggestedRes] = await Promise.all([
        fetch(`${apiUrl}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/users/search/query?q=${encodeURIComponent(u.university || "")}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        // Build a followStatus map from the following list
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
    // Mark friend notifications as viewed
    localStorage.setItem("collegeadda_friends_viewed", "true");
  }, [loadData]);

  // Search users by name or university
  useEffect(() => {
    if (!search.trim()) {
      // Re-load suggested (university matches) when search is cleared
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

  const toggleFollow = async (targetId) => {
    const currentStatus = followStatus[targetId];
    // Optimistic update
    setFollowStatus(prev => ({ ...prev, [targetId]: currentStatus === "connected" ? null : "connected" }));

    try {
      const token = getToken();
      await fetch(`${apiUrl}/api/users/${targetId}/follow`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
      // Revert on failure
      setFollowStatus(prev => ({ ...prev, [targetId]: currentStatus }));
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex items-center space-x-3">
        <Users size={22} style={{ color: "#e1306c" }} />
        <h1 className="text-xl font-bold text-foreground">Friends</h1>
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
