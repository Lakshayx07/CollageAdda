"use client";
import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Users,
  MessageSquare,
  ChevronLeft,
  Heart,
  Share2,
  Plus,
  Check,
  Building2,
  Bookmark,
  Send,
  Zap,
  Flame,
  TrendingUp,
  Hand,
  GraduationCap,
  Smile,
  Library,
  FlaskConical,
  Trees,
  Compass,
  Trophy,
  Gamepad2,
  Swords,
  MonitorPlay,
  Target,
  Shield,
  Crosshair,
  Activity,
  Medal,
  Play,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApiQuery } from "../../utils/useApiQuery";
import { useQueryClient } from "@tanstack/react-query";
import VerifiedBadge from "@/components/VerifiedBadge";
import PlayerCard from "@/components/PlayerCard";
import PlayerCardForm from "@/components/PlayerCardForm";
import clsx from "clsx";


export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ExploreContent />
    </Suspense>
  );
}

function ExploreContent() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [exploreMode, setExploreMode] = useState("colleges"); // "colleges" | "arena"
  const [arenaCategory, setArenaCategory] = useState("esports"); // "esports" | "sports"
  const [arenaSportFilter, setArenaSportFilter] = useState("All");
  const [arenaTab, setArenaTab] = useState("posts"); // legacy fallback
  const [showPlayerCardForm, setShowPlayerCardForm] = useState(false);
  const [followed, setFollowed] = useState({});
  const [addedStudents, setAddedStudents] = useState({});
  const [likes, setLikes] = useState({});
  const [chatWithStudent, setChatWithStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [loadingCollegeId, setLoadingCollegeId] = useState(null);

  const [currentStudentIndices, setCurrentStudentIndices] = useState({});
  const [studentSearch, setStudentSearch] = useState("");
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'list'

  // ── Filter bar state ────────────────────────────────────────────────────────
  const [filterCity, setFilterCity] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStream, setFilterStream] = useState("All");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const queryClient = useQueryClient();
  const getToken = useCallback(() => typeof window !== "undefined" ? localStorage.getItem("collegeadda_token") : null, []);

  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [refreshCountdown, setRefreshCountdown] = useState("Auto-refreshes daily");
  const [discoveryConnectStatus, setDiscoveryConnectStatus] = useState({});

  // ── TanStack Query: Colleges ──────────────────────────────────────────────
  const { data: colleges = [], isLoading: collegesLoading } = useApiQuery(
    "explore-colleges",
    "/api/colleges",
    {
      enabled: isMounted && !!getToken(),
      staleTime: 5 * 60 * 1000,
    }
  );

  // ── TanStack Query: Following list ────────────────────────────────────────
  const { data: myFollowingRaw = [] } = useApiQuery(
    "explore-following",
    "/api/users/me/following",
    {
      enabled: isMounted && !!getToken(),
      staleTime: 2 * 60 * 1000,
    }
  );

  const [localFollowingIds, setLocalFollowingIds] = useState([]);
  const myFollowing = useMemo(() => {
    const apiIds = Array.isArray(myFollowingRaw) ? myFollowingRaw.map(u => u._id || u.id || u) : [];
    return [...new Set([...apiIds, ...localFollowingIds])];
  }, [myFollowingRaw, localFollowingIds]);

  const setMyFollowing = useCallback((updater) => {
    setLocalFollowingIds(prev => typeof updater === 'function' ? updater(prev) : updater);
  }, []);

  // ── TanStack Query: Daily Discovery ───────────────────────────────────────
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  const { data: dailyDiscoveryRaw = [], isLoading: dailyDiscoveryLoading } = useApiQuery(
    "explore-daily-discovery",
    "/api/users/daily-drop",
    {
      enabled: isMounted && !!getToken(),
      staleTime: TWELVE_HOURS,
      gcTime: TWELVE_HOURS,
    }
  );

  const dailyDiscovery = useMemo(() => {
    const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("collegeadda_user") || "{}") : {};
    const students = Array.isArray(dailyDiscoveryRaw) ? dailyDiscoveryRaw.slice(0, 3) : [];
    return students.map(u => {
      let tag = "Explore 🌐";
      if (u.university && currentUser.university && u.university === currentUser.university) {
        tag = "Same Campus 🏫";
      } else if (Array.isArray(u.interests) && Array.isArray(currentUser.interests)) {
        const shared = u.interests.filter(i => currentUser.interests.includes(i)).length;
        if (shared > 0) tag = `${shared} shared interests ✨`;
      }
      return { ...u, tag };
    });
  }, [dailyDiscoveryRaw]);

  const loading = !isMounted || collegesLoading;

  // Derive followed map from colleges data
  useEffect(() => {
    if (!colleges || colleges.length === 0) return;
    const me = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('collegeadda_user') || '{}') : {};
    const myId = me._id || me.id;
    const followedMap = {};
    colleges.forEach(c => {
      if (Array.isArray(c.followers)) {
        followedMap[c._id] = c.followers.some(f => (f._id || f) === myId);
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFollowed(prev => ({ ...prev, ...followedMap }));
  }, [colleges]);

  // Derive discovery connect status from following + discovery data
  useEffect(() => {
    if (!dailyDiscovery.length) return;
    const initStatus = {};
    dailyDiscovery.forEach(u => {
      const uid = u._id || u.id;
      initStatus[uid] = myFollowing.includes(uid) ? 'connected' : 'idle';
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDiscoveryConnectStatus(prev => {
      let isDifferent = false;
      for (const uid in initStatus) {
        if (prev[uid] !== initStatus[uid]) {
          isDifferent = true;
          break;
        }
      }
      return isDifferent ? { ...initStatus, ...prev } : prev;
    });
  }, [dailyDiscovery, myFollowing]);

  const handleDiscoveryConnect = async (student) => {
    const uid = student._id || student.id;
    setDiscoveryConnectStatus(prev => ({ ...prev, [uid]: 'pending' }));
    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/users/${uid}/follow`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiscoveryConnectStatus(prev => ({ ...prev, [uid]: 'connected' }));
      setMyFollowing(prev => [...prev, uid]);
      
      queryClient.invalidateQueries({ queryKey: ["squad-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["explore-following"] });
      queryClient.invalidateQueries({ queryKey: ["user-following"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["squad-suggested"] });
      queryClient.invalidateQueries({ queryKey: ["suggested"] });
    } catch (err) {
      console.error("Connect error:", err);
      setDiscoveryConnectStatus(prev => ({ ...prev, [uid]: 'idle' }));
    }
  };

  const toggleLike = async (postId) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const user = JSON.parse(localStorage.getItem('collegeadda_user') || '{}');
      const userId = user._id || user.id;

      // Optimistic update
      setSelectedCollege(prev => ({
        ...prev,
        postsData: prev.postsData.map(post => {
          if (post._id === postId) {
            const isLiked = post.likes?.includes(userId);
            const newLikes = isLiked
              ? post.likes.filter(id => id !== userId)
              : [...(post.likes || []), userId];
            return { ...post, likes: newLikes };
          }
          return post;
        })
      }));

      await fetch(`${apiUrl}/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    try {
      const token = localStorage.getItem("collegeadda_token");
      const user = JSON.parse(localStorage.getItem('collegeadda_user') || '{}');

      const res = await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        // The API might return the new comment or the whole post.
        // Based on chatController, it usually returns the created comment or similar.
        // But for Explore, let's just update the local state optimistically or re-fetch if needed.
        // Actually, let's just update local state with what we know.
        setSelectedCollege(prev => ({
          ...prev,
          postsData: prev.postsData.map(post => {
            if (post._id === postId) {
              const newComment = { _id: Date.now(), user: { name: user.name, profilePic: user.profilePic }, text };
              return {
                ...post,
                comments: [...(post.comments || []), newComment]
              };
            }
            return post;
          })
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const fetchCollegeDetails = async (id) => {
    if (!id) return;
    setLoadingCollegeId(id);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/colleges/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();

        // Sort: non-connections first, existing connections last. For non-connections, newest first.
        if (data.studentsData && data.studentsData.length > 0) {
          data.studentsData = [...data.studentsData].sort((a, b) => {
            const aFollowed = myFollowing.includes(a._id || a.id);
            const bFollowed = myFollowing.includes(b._id || b.id);
            if (aFollowed === bFollowed) {
              return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // newest first
            }
            return aFollowed ? 1 : -1; // already followed → go to end
          });
        }

        setSelectedCollege(data);
        setActiveTab("posts");
      }
    } catch (err) {
      console.error("Error fetching college details:", err);
    } finally {
      setLoadingCollegeId(null);
    }
  };

  useEffect(() => {
    const collegeId = searchParams.get('collegeId');
    if (collegeId) {
      fetchCollegeDetails(collegeId);
    } else {
      setSelectedCollege(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, myFollowing, apiUrl]);

  const handleSwipe = async (collegeId, direction, student) => {
    setSwipeDirection(direction);

    if (direction === 'right') {
      try {
        const token = localStorage.getItem("collegeadda_token");
        // Follow the user
        await fetch(`${apiUrl}/api/users/${student._id || student.id}/follow`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });

        const autoMessage = `Hey! just connected with you on Campus Adda! Say hi back`;

        setChatMessages(prev => ({
          ...prev,
          [student._id || student.id]: [...(prev[student._id || student.id] || []), { text: autoMessage, time: 'now' }]
        }));

        setToastMessage("Connected successfully! They'll see your message");
        toggleAddStudent(student._id || student.id);

        // Optimistically update following list
        setMyFollowing(prev => [...prev, student._id || student.id]);
        
        queryClient.invalidateQueries({ queryKey: ["squad-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["explore-following"] });
        queryClient.invalidateQueries({ queryKey: ["user-following"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["squad-suggested"] });
        queryClient.invalidateQueries({ queryKey: ["suggested"] });
      } catch (err) {
        console.error("Error connecting with user:", err);
      }
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage("Skipped! Next up");
      setTimeout(() => setToastMessage(null), 2000);
    }

    setTimeout(() => {
      setCurrentStudentIndices(prev => ({
        ...prev,
        [collegeId]: (prev[collegeId] || 0) + 1
      }));
      setSwipeDirection(null);
      setDragX(0);
    }, 300);
  };

  // ── Category → Stream mapping ────────────────────────────────────────────
  const STREAM_MAP = {
    IIT: "Engineering",
    NIT: "Engineering",
    Engineering: "Engineering",
    General: "Engineering",
    Medical: "Medicine",
    Law: "Law",
    Design: "Design & Architecture",
  };
  const STREAM_OPTIONS = ["All", "Engineering", "Medicine", "Law", "Design & Architecture"];
  const CATEGORY_OPTIONS = ["All", "IIT", "NIT", "Engineering", "Medical", "Law", "Design", "General"];

  // ── Dynamic city list derived from all colleges ──────────────────────────
  // Excludes placeholder / TBD values so they never pollute the dropdown
  const cityOptions = useMemo(() => {
    const cities = [
      ...new Set(
        colleges
          .map(c => c.location)
          .filter(loc => loc && loc !== "Location TBD" && !loc.toLowerCase().startsWith("tbd"))
      )
    ].sort((a, b) => a.localeCompare(b));
    return ["All", ...cities];
  }, [colleges]);

  // ── Filtered + sorted colleges ───────────────────────────────────────────
  const filteredColleges = useMemo(() => {
    let result = colleges.filter(c => {
      // Search bar
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      // City filter
      if (filterCity !== "All" && c.location !== filterCity) return false;
      // Category filter
      if (filterCategory !== "All" && (c.category || "General") !== filterCategory) return false;
      // Stream filter (derived from category)
      if (filterStream !== "All") {
        const collegeStream = STREAM_MAP[c.category || "General"] || "Engineering";
        if (collegeStream !== filterStream) return false;
      }
      return true;
    });
    // Always sort A→Z, case-insensitive
    result = [...result].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
    return result;
  }, [search, colleges, filterCity, filterCategory, filterStream]);

  const hasActiveFilters = filterCity !== "All" || filterCategory !== "All" || filterStream !== "All";

  const clearFilters = () => {
    setFilterCity("All");
    setFilterCategory("All");
    setFilterStream("All");
  };

  const toggleFollow = async (id) => {
    try {
      const token = localStorage.getItem('collegeadda_token');
      const res = await fetch(`${apiUrl}/api/colleges/${id}/follow`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json(); // { following: bool, followersCount: number }
        setFollowed(prev => ({ ...prev, [id]: data.following }));
        setSelectedCollege(curr => {
          if (!curr) return curr;
          return { ...curr, followersCount: data.followersCount };
        });
        // Also update the college in the grid list
        setColleges(prev => prev.map(c =>
          (c._id === id || c.id === id) ? { ...c, followersCount: data.followersCount } : c
        ));
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const toggleAddStudent = (id) => {
    setAddedStudents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConnect = async (student) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const userId = student._id || student.id;

      if (!myFollowing.includes(userId)) {
        await fetch(`${apiUrl}/api/users/${userId}/follow`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyFollowing(prev => [...prev, userId]);
        setToastMessage("Connected! You can now chat.");
        
        queryClient.invalidateQueries({ queryKey: ["squad-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["explore-following"] });
        queryClient.invalidateQueries({ queryKey: ["user-following"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["squad-suggested"] });
        queryClient.invalidateQueries({ queryKey: ["suggested"] });
        
        setTimeout(() => setToastMessage(null), 2000);
      }
    } catch (err) {
      console.error("Error connecting:", err);
    }
  };

  const handleDirectMessage = async (student) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const userId = student._id || student.id;

      setToastMessage("Opening chat...");
      router.push(`/messages?userId=${userId}`);
      setTimeout(() => setToastMessage(null), 2000);
    } catch (err) {
      console.error("Error starting direct message:", err);
    }
  };



  return (
    <div className="page-shell flex flex-col overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!selectedCollege ? (
          /* --- EXPLORE GRID VIEW --- */
          <motion.div
            key="explore"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <header className="page-header sticky top-0 z-40 px-5 py-4">
              <div className="mx-auto flex w-full max-w-6xl flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={clsx("icon-tile h-11 w-11", exploreMode === "colleges" ? "text-primary" : "gradient-bg")}>
                    {exploreMode === "colleges" ? <Building2 className="text-primary" size={20} /> : <Trophy className="text-[#1A1A1A]" size={20} />}
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-foreground">
                    {exploreMode === "colleges" ? "Explore Colleges" : "Campus Arena"}
                  </h1>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-1/2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      type="text"
                      placeholder={exploreMode === "colleges" ? "Search college..." : "Search players..."}
                      className="ca-input w-full py-3 pl-10 pr-4 text-sm"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setExploreMode(exploreMode === "colleges" ? "arena" : "colleges");
                      setSearch("");
                    }}
                    className={clsx(
                      "flex w-full items-center justify-center space-x-2 rounded-2xl border px-4 py-3 text-sm font-black shadow-lg transition-all sm:w-1/2",
                      exploreMode === "colleges"
                        ? "bg-gradient-to-r from-[#C8922A] via-[#D4A843] to-[#C8922A] text-[#1A1A1A] border-transparent shadow-[0_4px_14px_rgba(200,146,42,0.15)] hover:shadow-[#C8922A]/50"
                        : "bg-[#F9F8F5] border border-[#E8E6E0] border-border/50 text-foreground hover:bg-surface-hover"
                    )}
                  >
                    {exploreMode === "colleges" ? (
                      <>
                        <Trophy size={18} className="text-yellow-300 drop-shadow-md" />
                        <span className="tracking-widest uppercase text-[10px] sm:text-xs">Arena</span>
                      </>
                    ) : (
                      <>
                        <Building2 size={18} className="text-primary" />
                        <span className="tracking-widest uppercase text-[10px] sm:text-xs">Colleges</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {exploreMode === "arena" && (
                  <div className="flex overflow-x-auto space-x-2 pb-2 custom-scrollbar no-scrollbar -mx-4 px-4">
                    <button
                      onClick={() => setArenaSportFilter("All")}
                      className={clsx(
                        "shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                        arenaSportFilter === "All"
                          ? "ca-nav-active"
                          : "ca-nav-inactive"
                      )}
                    >
                      All Sports
                    </button>
                    {["🎮 Esports", "🏸 Badminton", "⚽ Football", "🏀 Basketball", "🏐 Volleyball", "🏏 Cricket", "🎾 Tennis", "🏊 Swimming", "🏅 Athletics"].map(sport => (
                      <button
                        key={sport}
                        onClick={() => setArenaSportFilter(sport)}
                        className={clsx(
                          "shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                          arenaSportFilter === sport
                            ? "ca-nav-active"
                            : "ca-nav-inactive"
                        )}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {exploreMode === "colleges" ? (
              <>

                {/* ── Filter Bar ────────────────────────────────────────────── */}
                <section className="mx-auto w-full max-w-6xl px-4 pt-3 pb-1 sm:px-5">
                  <div className="app-panel rounded-[1.4rem] px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* City filter */}
                      <div className="flex-1 min-w-[140px]">
                        <label className="block text-[9px] font-black uppercase tracking-[0.18em] text-[#6B6B6B] mb-1.5 pl-1">🌍 City</label>
                        <select
                          value={filterCity}
                          onChange={e => setFilterCity(e.target.value)}
                          aria-label="Filter by city"
                          className="ca-input w-full py-2.5 px-3 text-xs appearance-none cursor-pointer"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                        >
                          {cityOptions.map(city => (
                            <option key={city} value={city}>{city === "All" ? "All Cities" : city}</option>
                          ))}
                        </select>
                      </div>

                      {/* Category filter */}
                      <div className="flex-1 min-w-[130px]">
                        <label className="block text-[9px] font-black uppercase tracking-[0.18em] text-[#6B6B6B] mb-1.5 pl-1">🏛️ Category</label>
                        <select
                          value={filterCategory}
                          onChange={e => setFilterCategory(e.target.value)}
                          aria-label="Filter by category"
                          className="ca-input w-full py-2.5 px-3 text-xs appearance-none cursor-pointer"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                        >
                          {CATEGORY_OPTIONS.map(cat => (
                            <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Stream filter */}
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-[9px] font-black uppercase tracking-[0.18em] text-[#6B6B6B] mb-1.5 pl-1">📚 Stream</label>
                        <select
                          value={filterStream}
                          onChange={e => setFilterStream(e.target.value)}
                          aria-label="Filter by stream"
                          className="ca-input w-full py-2.5 px-3 text-xs appearance-none cursor-pointer"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                        >
                          {STREAM_OPTIONS.map(s => (
                            <option key={s} value={s}>{s === "All" ? "All Courses" : s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Clear filters */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="shrink-0 self-end mb-0.5 flex items-center gap-1.5 rounded-full border border-[#E8E6E0] bg-[#F3F2EE] px-3.5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B] transition-all hover:bg-[#F3F2EE] hover:text-[#4A4A4A] hover:border-[#E8E6E0] active:scale-95"
                          aria-label="Clear all filters"
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>

                    {/* Active filter summary + college count */}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[10px] text-[#888888] font-medium">
                        {!loading && (
                          <>
                            Showing <span className="text-[#6B6B6B] font-black">{filteredColleges.length}</span> college{filteredColleges.length !== 1 ? "s" : ""}
                            {hasActiveFilters && <span className="text-[#888888]"> (filtered)</span>}
                          </>
                        )}
                      </p>
                      {hasActiveFilters && (
                        <div className="flex flex-wrap gap-1.5">
                          {filterCategory !== "All" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#C8922A]/20 to-[#C8922A]/20 border border-[#C8922A]/30 px-2.5 py-1 text-[9px] font-black text-[#C8922A] uppercase tracking-wider">
                              {filterCategory}
                            </span>
                          )}
                          {filterStream !== "All" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#D4A843]/20 to-[#C8922A]/20 border border-cyan-500/30 px-2.5 py-1 text-[9px] font-black text-[#C8922A] uppercase tracking-wider">
                              {filterStream}
                            </span>
                          )}
                          {filterCity !== "All" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 px-2.5 py-1 text-[9px] font-black text-emerald-300 uppercase tracking-wider">
                              📍 {filterCity}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-5 xl:grid-cols-3">
              {loading && (
                <div className="col-span-2 flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                </div>
              )}

              {filteredColleges.map(college => (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  key={college._id || college.id}
                  onClick={() => fetchCollegeDetails(college)}
                  className="relative flex flex-col rounded-[1.5rem] overflow-hidden text-left group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                  style={{ height: '420px' }}
                >
                  {/* Full-bleed background image */}
                  <img
                    src={college.banner}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={college.name}
                  />

                  {/* Dark gradient overlay — stronger at bottom */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)' }} />

                  {/* Content overlaid on image */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 space-y-3">
                    {/* College name + followers badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base leading-snug line-clamp-2 flex-1" style={{ color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                        {college.name}
                      </h3>
                      {(college.followersCount ?? 0) > 0 && (
                        <div className="flex items-center gap-1 shrink-0 bg-black/40 rounded-full px-2 py-0.5">
                          <Users size={10} color="white" />
                          <span className="text-[10px] font-bold" style={{ color: 'white' }}>
                            {college.followersCount}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Location & students pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                        <MapPin size={11} color="white" />
                        <span className="text-[11px] font-semibold truncate max-w-[120px]" style={{ color: 'white' }}>{college.location}</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                        <Users size={11} color="white" />
                        <span className="text-[11px] font-semibold" style={{ color: 'white' }}>{college.students} Students</span>
                      </div>
                    </div>

                    {/* Explore Now button */}
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        router.push(`/explore?collegeId=${college._id || college.id}`);
                      }}
                      disabled={loadingCollegeId === (college._id || college.id)}
                      className="w-full bg-white rounded-2xl py-3 flex items-center justify-center text-sm font-bold text-[#1A1A1A] shadow-lg group-hover:bg-[#FFF8EC] transition-colors disabled:opacity-80"
                    >
                      {loadingCollegeId === (college._id || college.id) ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Explore Now"
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}

            </div>

            {!loading && filteredColleges.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="app-panel mx-auto max-w-sm rounded-[1.6rem] p-8 flex flex-col items-center gap-4">
                  <span className="text-4xl">🔍</span>
                  <div>
                    <p className="text-sm font-black text-[#4A4A4A] mb-1">
                      {hasActiveFilters
                        ? "No colleges match these filters"
                        : `No colleges found matching "${search}"`}
                    </p>
                    <p className="text-xs text-[#6B6B6B]">
                      {hasActiveFilters
                        ? "Try adjusting or clearing your filters."
                        : "Try a different search term."}
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-1 rounded-xl bg-gradient-to-r from-[#C8922A] to-[#C8922A] px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#1A1A1A] shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)] hover:opacity-90 active:scale-95 transition-all"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            )}
              </>
            ) : (
              /* --- ARENA VIEW --- */
              <div className="flex flex-col flex-1 relative bg-transparent">
                {/* Top Toggle: Esports vs Sports */}
                <div className="px-4 py-3 flex space-x-2 bg-[#FAFAF8]/80 backdrop-blur-md sticky top-0 z-30 border-b border-[#E8E6E0]">
                  <button
                    onClick={() => setArenaCategory("esports")}
                    className={clsx(
                      "flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                      arenaCategory === "esports" ? "ca-btn-primary" : "ca-btn-secondary"
                    )}
                  >
                    🎮 Esports
                  </button>
                  <button
                    onClick={() => setArenaCategory("sports")}
                    className={clsx(
                      "flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                      arenaCategory === "sports" ? "ca-btn-primary" : "ca-btn-secondary"
                    )}
                  >
                    ⚽ Sports
                  </button>
                </div>

                {/* Arena Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 pb-20">
                  <AnimatePresence mode="wait">
                    {arenaCategory === "esports" ? (
                      <motion.div
                        key="esports"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                      >
                        {/* Action Bar */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowPlayerCardForm(true)}
                            className="ca-btn-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition"
                          >
                            + Create My Card
                          </button>
                        </div>
                        {/* Esports Teams */}
                        <section>
                          <h3 className="text-[#1A1A1A] font-black uppercase tracking-wider mb-3 flex items-center text-sm">
                            <Swords className="mr-2 text-[#C8922A]" size={16} /> Esports Squads
                          </h3>
                          <div className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar -mx-4 px-4">
                            {['BGMI', 'Valorant', 'FIFA'].map(game => (
                              <button
                                key={game}
                                onClick={() => router.push(`/arena/sport/${game.toLowerCase()}`)}
                                className="app-panel min-w-[120px] h-24 rounded-2xl hover:border-primary/30 transition flex flex-col items-center justify-center relative overflow-hidden group"
                              >
                                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎮</span>
                                <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">{game}</span>
                              </button>
                            ))}
                          </div>
                        </section>

                        {/* Player Profile Card (FIFA Style) */}
                        <section>
                          <h3 className="text-[#1A1A1A] font-black uppercase tracking-wider mb-3 flex items-center text-sm">
                            <Target className="mr-2 text-pink-500" size={16} /> Top Players
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* We will map real data here soon */}
                            {/* {realEsportsPlayers.map(player => ( ... ))} */}
                          </div>
                          <div className="text-center py-10">
                            <p className="text-[#6B6B6B] text-xs font-bold uppercase tracking-widest">No players yet. Create your card!</p>
                          </div>
                        </section>
                      </motion.div>
                    ) : (
                      /* ================= SPORTS SECTION ================= */
                      <motion.div
                        key="sports"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        {/* Action Bar */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowPlayerCardForm(true)}
                            className="bg-gradient-to-r from-orange-500 to-red-600 text-[#1A1A1A] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-105 transition"
                          >
                            + Create My Card
                          </button>
                        </div>
                        {/* Sports Teams */}
                        <section>
                          <h3 className="text-[#1A1A1A] font-black uppercase tracking-wider mb-3 flex items-center text-sm">
                            <Flame className="mr-2 text-orange-400" size={16} /> Campus Teams
                          </h3>
                          <div className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar -mx-4 px-4">
                            {[
                              { name: 'Volleyball', icon: '🏐' },
                              { name: 'Football', icon: '⚽' },
                              { name: 'Badminton', icon: '🏸' },
                              { name: 'Basketball', icon: '🏀' },
                              { name: 'Cricket', icon: '🏏' },
                              { name: 'Tennis', icon: '🎾' },
                              { name: 'Swimming', icon: '🏊' }
                            ].map(sport => (
                              <button
                                key={sport.name}
                                onClick={() => router.push(`/arena/sport/${sport.name.toLowerCase()}`)}
                                className="app-panel min-w-[120px] h-24 rounded-2xl hover:border-primary/30 transition flex flex-col items-center justify-center relative overflow-hidden group"
                              >
                                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{sport.icon}</span>
                                <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">{sport.name}</span>
                              </button>
                            ))}
                          </div>
                        </section>

                        {/* Player Cards (Sports) */}
                        <section>
                          <h3 className="text-[#1A1A1A] font-black uppercase tracking-wider mb-3 flex items-center text-sm">
                            <Users className="mr-2 text-orange-400" size={16} /> Top Athletes
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* We will map real data here soon */}
                            {/* {realSportsPlayers.map(player => ( ... ))} */}
                          </div>
                          <div className="text-center py-10">
                            <p className="text-[#6B6B6B] text-xs font-bold uppercase tracking-widest">No athletes yet. Create your card!</p>
                          </div>
                        </section>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Form Overlay */}
                <AnimatePresence>
                  {showPlayerCardForm && (
                    <PlayerCardForm
                      initialCategory={arenaCategory}
                      onClose={() => setShowPlayerCardForm(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ) : (
          /* --- COLLEGE PROFILE VIEW --- */
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col"
          >
            {/* Profile Header */}
            <div className="relative">
              <div className="h-64 w-full bg-surface relative">
                <img src={selectedCollege.banner} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Back Button */}
                <button
                  onClick={() => router.push('/explore')}
                  className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-[#1A1A1A] hover:bg-black/60 transition-colors z-20"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>

                {/* College Info on Banner */}
                <div className="absolute bottom-6 left-4 right-4 flex items-center space-x-4 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#F3F2EE] backdrop-blur-md border border-[#E8E6E0] flex items-center justify-center shadow-2xl">
                    <Building2 size={32} className="text-[#1A1A1A]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white drop-shadow-md leading-tight">{selectedCollege.name}</h2>
                    <p className="text-sm text-white/80 flex items-center mt-1 drop-shadow-sm">
                      <MapPin size={14} className="mr-1" /> {selectedCollege.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 px-4 flex items-center justify-between">
              <div className="flex space-x-6 text-center">
                <div>
                  <p className="font-bold text-foreground">
                    {selectedCollege.realStudentCount ?? selectedCollege.students}
                  </p>
                  <p className="text-[10px] text-muted uppercase">Students</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {selectedCollege.realPostCount ?? selectedCollege.posts}
                  </p>
                  <p className="text-[10px] text-muted uppercase">Posts</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{selectedCollege.departments}</p>
                  <p className="text-[10px] text-muted uppercase">Depts</p>
                </div>
              </div>

              {/* Follower count + Follow toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-3 py-1.5">
                  <Users size={13} className="text-[#6B6B6B]" />
                  <span className="text-sm font-bold text-[#1A1A1A]">
                    {selectedCollege.followersCount ?? 0}
                  </span>
                </div>
                <button
                  onClick={() => toggleFollow(selectedCollege._id || selectedCollege.id)}
                  className={clsx(
                    "px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95",
                    followed[selectedCollege._id || selectedCollege.id]
                      ? "bg-[#F3F2EE] text-[#6B6B6B] border border-[#E8E6E0]"
                      : "text-white shadow-lg"
                  )}
                  style={!followed[selectedCollege._id || selectedCollege.id] ? { backgroundColor: selectedCollege.accent, boxShadow: `0 10px 15px -3px ${selectedCollege.accent}30` } : {}}
                >
                  {followed[selectedCollege._id || selectedCollege.id] ? "✓ Following" : "Follow"}
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="mt-8 px-4 flex border-b border-border/50">
              {["posts", "students", "memories"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "flex-1 py-3 text-sm font-bold capitalize transition-all relative",
                    activeTab === tab ? "text-foreground" : "text-muted"
                  )}
                  style={activeTab === tab ? { color: selectedCollege.accent } : {}}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: selectedCollege.accent }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                {activeTab === "posts" && (
                  <motion.div
                    key="posts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {!selectedCollege.postsData || selectedCollege.postsData.length === 0 ? (
                      <div className="text-center py-10 text-muted">No posts from {selectedCollege.name} yet.</div>
                    ) : (
                      selectedCollege.postsData.map(post => (
                        <div key={post._id} className="bg-surface border border-border/50 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-border/50 bg-muted">
                              <img src={post.author?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=6366f1&color=fff`} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-foreground leading-none flex items-center">
                                {post.author?.name || 'Student'}
                                <VerifiedBadge user={post.author} size={14} />
                              </p>
                              <p className="text-[10px] text-muted mt-1">{new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          </div>
                          <p className="text-sm text-foreground/90">{post.content}</p>
                          {post.mediaUrl && (
                            <div className="rounded-xl overflow-hidden border border-border/50 mt-2">
                              {post.mediaType === 'video' ? (
                                <video src={post.mediaUrl} controls className="w-full h-auto" />
                              ) : (
                                <img src={post.mediaUrl} className="w-full h-auto" alt="" />
                              )}
                            </div>
                          )}
                          <div className="flex flex-col space-y-3 pt-2">
                            <div className="flex items-center justify-between border-t border-border/10 pt-3">
                              <div className="flex items-center space-x-6">
                                <button
                                  onClick={() => toggleLike(post._id)}
                                  className={clsx(
                                    "flex items-center space-x-1.5 transition-colors group",
                                    post.likes?.includes(JSON.parse(localStorage.getItem('collegeadda_user') || '{}')._id) ? "text-pink-500" : "text-muted hover:text-pink-500"
                                  )}
                                >
                                  <Heart
                                    size={20}
                                    className={clsx(
                                      "transition-transform group-active:scale-75",
                                      post.likes?.includes(JSON.parse(localStorage.getItem('collegeadda_user') || '{}')._id) && "fill-pink-500"
                                    )}
                                  />
                                  <span className="text-xs font-bold">{post.likes?.length || 0}</span>
                                </button>
                                <button
                                  onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                                  className="flex items-center space-x-1.5 text-muted hover:text-blue-500 transition-colors group"
                                >
                                  <MessageSquare size={20} className="transition-transform group-active:scale-75" />
                                  <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                                </button>
                              </div>
                              <button
                                onClick={() => window.open(`https://wa.me/?text=Check out this post from ${selectedCollege.name} on CollageAdda: ${encodeURIComponent(post.content)}`, '_blank')}
                                className="text-muted hover:text-green-500 transition-colors"
                              >
                                <Share2 size={20} />
                              </button>
                            </div>

                            {/* Comment Section */}
                            {activeCommentPost === post._id && (
                              <div className="space-y-3 animate-fade-in">
                                {post.comments?.length > 0 && (
                                  <div className="bg-surface-hover/50 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto">
                                    {post.comments.map((comment, i) => (
                                      <div key={i} className="flex space-x-2 text-xs">
                                        <span className="font-bold text-foreground">{comment.user?.name || "Student"}:</span>
                                        <span className="text-muted">{comment.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <input
                                    value={commentInputs[post._id] || ""}
                                    onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                    onKeyPress={e => e.key === "Enter" && handleComment(post._id)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-surface-hover border border-border/30 rounded-full px-4 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                                  />
                                  <button
                                    onClick={() => handleComment(post._id)}
                                    className="bg-primary text-[#1A1A1A] p-2 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                                  >
                                    <Send size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === "students" && (
                  <motion.div
                    key="students"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center"
                  >
                    {/* Top Bar */}
                    <div className="w-full flex items-center justify-between mb-6">
                      <div className="flex flex-col">
                        <h4 className="text-sm font-bold text-foreground">
                          {viewMode === 'cards' ? 'Discover Students' : 'Student Directory'}
                        </h4>
                        <p className="text-[10px] text-muted font-medium mt-0.5">
                          {selectedCollege.studentsData.length} students found
                        </p>
                      </div>
                      <div className="flex bg-surface-hover p-1 rounded-xl border border-border/50">
                        <button
                          onClick={() => setViewMode('cards')}
                          className={clsx(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                            viewMode === 'cards' ? "bg-primary text-[#1A1A1A] shadow-sm" : "text-muted hover:text-foreground"
                          )}
                        >
                          Cards
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={clsx(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                            viewMode === 'list' ? "bg-primary text-[#1A1A1A] shadow-sm" : "text-muted hover:text-foreground"
                          )}
                        >
                          List
                        </button>
                      </div>
                    </div>

                    {viewMode === 'list' && (
                      <div className="w-full mb-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                        <input
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="Search students by name or interest..."
                          className="w-full bg-surface-hover border border-border/50 rounded-xl py-2 pl-9 pr-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                    )}

                    {/* Toast Notification */}
                    <AnimatePresence>
                      {toastMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          className="app-panel fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-sm font-bold flex items-center text-foreground"
                        >
                          {toastMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tinder Card Stack */}
                    {viewMode === 'cards' ? (
                      <div className="relative w-full max-w-[340px] aspect-[4/5] flex items-center justify-center overflow-hidden mb-10">
                        {/* Empty State */}
                        {(currentStudentIndices[selectedCollege.id] || 0) >= selectedCollege.studentsData.length && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center p-6 space-y-5 bg-surface rounded-[32px] w-full h-full border border-border/50 shadow-lg"
                          >
                            <div className="bg-primary/10 p-5 rounded-full mb-2">
                              <GraduationCap size={48} className="text-primary" />
                            </div>
                            <h3 className="font-bold text-foreground text-xl">You've seen everyone at {selectedCollege.name}!</h3>
                            <div className="space-y-3 w-full mt-4">
                              <button onClick={() => setViewMode('list')} className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors shadow-sm flex items-center justify-center space-x-2">
                                <span>Switch to List View</span>
                                <Users size={16} />
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Cards */}
                        <AnimatePresence>
                          {selectedCollege.studentsData.map((student, idx) => {
                            const currentIndex = currentStudentIndices[selectedCollege.id] || 0;
                            if (idx < currentIndex) return null;
                            if (idx > currentIndex + 2) return null; // Only render top 3 cards

                            const isTop = idx === currentIndex;
                            const offset = idx - currentIndex;

                            return (
                              <motion.div
                                key={student._id || student.id}
                                drag={isTop ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                onDrag={(e, info) => isTop && setDragX(info.offset.x)}
                                onDragEnd={(e, info) => {
                                  if (!isTop) return;
                                  setDragX(0);
                                  if (info.offset.x > 100) handleSwipe(selectedCollege.id, 'right', student);
                                  else if (info.offset.x < -100) handleSwipe(selectedCollege.id, 'left', student);
                                }}
                                initial={false}
                                animate={{
                                  scale: isTop ? 1 : 1 - offset * 0.06,
                                  y: isTop ? 0 : offset * 25,
                                  zIndex: 10 - offset,
                                  rotate: isTop && swipeDirection === 'right' ? 15 : isTop && swipeDirection === 'left' ? -15 : isTop ? dragX * 0.05 : 0,
                                  x: isTop && swipeDirection === 'right' ? 400 : isTop && swipeDirection === 'left' ? -400 : isTop ? dragX : 0,
                                  opacity: isTop && swipeDirection ? 0 : 1
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="absolute w-full h-full bg-surface border border-border/50 rounded-[32px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col cursor-grab active:cursor-grabbing"
                              >
                                {/* Student Profile Photo Area - always shown */}
                                <div className="relative w-full bg-muted pointer-events-none" style={{ height: isTop ? '50%' : '100%' }}>
                                  <img src={student.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6366f1&color=fff`} alt={student.name} className="w-full h-full object-cover" />
                                  {!isTop && <div className="absolute inset-0 bg-black/30" />}
                                </div>

                                {/* Details Area - only for top card */}
                                {isTop && (
                                  <div className="flex-1 p-5 space-y-4 bg-[#FAFAF8]/70 overflow-y-auto custom-scrollbar flex flex-col relative z-10">
                                    <div>
                                      <h2 className="text-2xl font-black text-foreground flex items-center gap-2 tracking-tight line-clamp-1">
                                        {student.name}
                                        <VerifiedBadge user={student} size={20} />
                                      </h2>
                                      <div className="flex flex-col mt-2 space-y-1.5">
                                        <div className="flex items-center text-foreground/80 text-[12px] font-medium">
                                          <Building2 size={12} className="mr-2 text-secondary" /> {student.university || selectedCollege.name}
                                        </div>
                                        {myFollowing.includes(student._id || student.id) && (
                                          <div className="mt-1 inline-flex bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider self-start items-center gap-2 shadow-sm">
                                            <Users size={12} /> Already Friends
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-[13px] text-foreground/80 italic leading-relaxed font-medium bg-surface-hover p-3 rounded-xl border border-border/50">
                                      "{student.bio || "No bio yet."}"
                                    </p>
                                    <div className="pt-2 mt-auto">
                                      {myFollowing.includes(student._id || student.id) ? (
                                        <motion.button
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() => handleDirectMessage(student)}
                                          className="w-full py-4 gradient-bg rounded-2xl text-xs font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl flex items-center justify-center space-x-2"
                                        >
                                          <MessageSquare size={16} />
                                          <span>Chat Now</span>
                                        </motion.button>
                                      ) : (
                                        <motion.button
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() => handleConnect(student)}
                                          className="w-full py-4 bg-[#F3F2EE] hover:bg-[#F3F2EE] border border-[#E8E6E0] rounded-2xl text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center justify-center space-x-2"
                                        >
                                          <Plus size={16} />
                                          <span>Connect</span>
                                        </motion.button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            );
                          }).reverse()}
                        </AnimatePresence>
                      </div>
                    ) : (
                      /* --- LIST VIEW --- */
                      <div className="w-full space-y-3 pb-10">
                        {selectedCollege.studentsData
                          .filter(s =>
                            s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                            s.interests?.some(i => i.toLowerCase().includes(studentSearch.toLowerCase()))
                          )
                          .map((student) => (
                          <motion.div
                            key={student._id || student.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface border border-border/50 p-4 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                                <img src={student.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6366f1&color=fff`} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 truncate">
                                  {student.name}
                                  <VerifiedBadge user={student} size={14} />
                                </h4>
                                <p className="text-[11px] text-muted truncate mt-0.5">{student.university || selectedCollege.name}</p>
                                <p className="text-[11px] text-muted/60 truncate mt-0.5 italic">"{student.bio?.substring(0, 30) || "Campus student"}..."</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {myFollowing.includes(student._id || student.id) ? (
                                <button
                                  onClick={() => handleDirectMessage(student)}
                                  className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-[#1A1A1A] transition-all shadow-sm"
                                  title="Message"
                                >
                                  <MessageSquare size={18} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleConnect(student)}
                                  className="p-2.5 bg-surface-hover text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-border/30"
                                  title="Connect"
                                >
                                  <Plus size={18} />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons - Only show in Card View and if not finished */}
                    {viewMode === 'cards' && (currentStudentIndices[selectedCollege?._id || selectedCollege?.id] || 0) < (selectedCollege?.studentsData?.length || 0) && (
                      <div className="flex items-center justify-center space-x-8 mt-8 w-full">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSwipe(selectedCollege?._id || selectedCollege?.id, 'left', selectedCollege.studentsData[currentStudentIndices[selectedCollege?._id || selectedCollege?.id] || 0])}
                          className="w-[70px] h-[70px] rounded-full bg-surface border-2 border-orange-500/20 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-shadow"
                        >
                          <div className="text-orange-500 hover:text-orange-600 transition-colors">
                            <Smile size={40} strokeWidth={2.5} />
                          </div>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSwipe(selectedCollege?._id || selectedCollege?.id, 'right', selectedCollege.studentsData[currentStudentIndices[selectedCollege?._id || selectedCollege?.id] || 0])}
                          className="w-[84px] h-[84px] rounded-full bg-surface border-2 border-pink-500/20 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(236,72,153,0.2)] hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] transition-shadow"
                        >
                          <div className="text-pink-500 hover:text-pink-600 transition-colors">
                            <Heart size={44} fill="currentColor" strokeWidth={0} />
                          </div>
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "memories" && (
                  <motion.div
                    key="memories"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full"
                  >
                    {selectedCollege.postsData && selectedCollege.postsData.filter(p => p.image).length > 0 ? (
                      <div className="grid grid-cols-3 gap-1 md:gap-2 p-2">
                        {selectedCollege.postsData.filter(p => p.image).map((post, i) => (
                          <div key={post._id || i} className="aspect-square relative group overflow-hidden bg-[#F3F2EE] rounded-lg">
                            <img src={post.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-muted">
                        <Bookmark size={48} className="mb-4 opacity-20" />
                        <p>No campus memories shared yet. Be the first!</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Chat Drawer */}
      <AnimatePresence>
        {chatWithStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatWithStudent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[#FAFAF8] z-[101] shadow-2xl flex flex-col"
            >
              <header className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#1A1A1A] font-bold"
                    style={{ background: `linear-gradient(135deg, ${selectedCollege.accent}, #a5b4fc)` }}
                  >
                    {chatWithStudent.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{chatWithStudent.name}</h3>
                    <p className="text-[10px] text-muted">{selectedCollege.name}</p>
                  </div>
                </div>
                <button onClick={() => setChatWithStudent(null)} className="p-2 text-muted hover:text-foreground">
                  <Plus className="rotate-45" size={20} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex justify-center my-4">
                  <span className="text-[10px] bg-surface-hover px-4 py-1.5 rounded-full text-muted border border-border/20">
                    Say hi to {chatWithStudent.name}! You are now connected.
                  </span>
                </div>

                {(chatMessages[chatWithStudent.id] || []).map((msg, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i}
                    className="flex justify-end"
                  >
                    <div
                      className="p-3 rounded-2xl rounded-tr-none text-sm text-[#1A1A1A] shadow-lg"
                      style={{ backgroundColor: selectedCollege.accent }}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 border-t border-border/50 bg-surface">
                <div className="flex items-center space-x-2">
                  <input
                    id="chatInput"
                    type="text"
                    placeholder={`Message ${chatWithStudent.name}...`}
                    className="flex-1 bg-surface-hover border border-border/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary transition-all"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.target.value;
                        if (!val.trim()) return;
                        setChatMessages(prev => ({
                          ...prev,
                          [chatWithStudent.id]: [...(prev[chatWithStudent.id] || []), { text: val, time: 'now' }]
                        }));
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById('chatInput');
                      const val = el.value;
                      if (!val.trim()) return;
                      setChatMessages(prev => ({
                        ...prev,
                        [chatWithStudent.id]: [...(prev[chatWithStudent.id] || []), { text: val, time: 'now' }]
                      }));
                      el.value = '';
                    }}
                    className="p-3 rounded-xl text-[#1A1A1A] shadow-lg active:scale-95 transition-all"
                    style={{ backgroundColor: selectedCollege.accent }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
