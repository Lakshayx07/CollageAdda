"use client";
import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Users,
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Check,
  Building2,
  Bookmark,
  Send,
  Zap,
  TrendingUp,
  Hand,
  GraduationCap,
  Smile,
  Library,
  FlaskConical,
  Trees,
  Compass,
  Trophy,
  Swords,
  MonitorPlay,
  Target,
  Shield,
  Crosshair,
  Activity,
  Medal,
  Play,
  Loader2,
  Gamepad2,
  Globe,
  Landmark,
  BookOpen,
  SearchX,
  X,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApiQuery } from "../../utils/useApiQuery";
import { useQueryClient } from "@tanstack/react-query";
import { getAvatarSrc, getDefaultAvatar } from "@/utils/defaultAvatars";
import VerifiedBadge from "@/components/VerifiedBadge";
import PlayerCard from "@/components/PlayerCard";
import PlayerCardForm from "@/components/PlayerCardForm";
import clsx from "clsx";
import { getExploreColleges, getExploreCollegePool } from "@/config/exploreColleges";

const COLLEGE_BANNER_FALLBACK =
  "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80";

const ESPORTS_NETWORKS = [
  { name: "BGMI", key: "bgmi", icon: Gamepad2, accent: "#39FF82" },
  { name: "Valorant", key: "valorant", icon: Crosshair, accent: "#FF4655" },
  { name: "FIFA", key: "fifa", icon: Trophy, accent: "#00A3FF" },
  { name: "Chess", key: "chess", icon: Medal, accent: "#C8922A" },
];

const handleBannerError = (event) => {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied === "1") return;
  img.dataset.fallbackApplied = "1";
  img.src = COLLEGE_BANNER_FALLBACK;
};

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
  const arenaCategory = "esports";
  const [arenaSportFilter, setArenaSportFilter] = useState("All");
  const [arenaTab, setArenaTab] = useState("posts"); // legacy fallback
  const [showPlayerCardForm, setShowPlayerCardForm] = useState(false);
  const [followed, setFollowed] = useState({});
  const [addedStudents, setAddedStudents] = useState({});
  const [likes, setLikes] = useState({});
  const [chatWithStudent, setChatWithStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [loadingCollegeId, setLoadingCollegeId] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [currentStudentIndices, setCurrentStudentIndices] = useState({});
  const [studentSearch, setStudentSearch] = useState("");
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'list'
  const [selectedMemoryPhoto, setSelectedMemoryPhoto] = useState(null);

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
  const [spinRotation, setSpinRotation] = useState(0);
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

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const user = JSON.parse(localStorage.getItem("collegeadda_user") || "{}");
      return user._id || user.id || null;
    } catch {
      return null;
    }
  }, [isMounted]);

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

      queryClient.invalidateQueries({ queryKey: ["network-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["explore-following"] });
      queryClient.invalidateQueries({ queryKey: ["user-following"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["network-suggested"] });
      queryClient.invalidateQueries({ queryKey: ["suggested"] });
    } catch (err) {
      console.error("Connect error:", err);
      setDiscoveryConnectStatus(prev => ({ ...prev, [uid]: 'idle' }));
    }
  };

  const toggleLike = async (postId) => {
    try {
      const token = localStorage.getItem("collegeadda_token");

      // Optimistic update (supports slim likesCount/likedByMe and legacy likes[])
      setSelectedCollege(prev => ({
        ...prev,
        postsData: (prev.postsData || []).map(post => {
          if (post._id !== postId) return post;
          const wasLiked = typeof post.likedByMe === "boolean"
            ? post.likedByMe
            : !!(currentUserId && post.likes?.some((id) => String(id) === String(currentUserId)));
          const prevCount = typeof post.likesCount === "number"
            ? post.likesCount
            : (post.likes?.length || 0);
          return {
            ...post,
            likedByMe: !wasLiked,
            likesCount: wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1,
          };
        })
      }));

      const res = await fetch(`${apiUrl}/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCollege(prev => ({
          ...prev,
          postsData: (prev.postsData || []).map(post => {
            if (post._id !== postId) return post;
            return {
              ...post,
              likedByMe: typeof data.liked === "boolean" ? data.liked : post.likedByMe,
              likesCount: typeof data.likes === "number" ? data.likes : post.likesCount,
            };
          })
        }));
        queryClient.setQueryData(["college-detail", collegeIdParam], (old) => {
          if (!old?.postsData) return old;
          return {
            ...old,
            postsData: old.postsData.map((post) => {
              if (post._id !== postId) return post;
              return {
                ...post,
                likedByMe: typeof data.liked === "boolean" ? data.liked : post.likedByMe,
                likesCount: typeof data.likes === "number" ? data.likes : post.likesCount,
              };
            }),
          };
        });
      }
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
        setSelectedCollege(prev => ({
          ...prev,
          postsData: (prev.postsData || []).map(post => {
            if (post._id !== postId) return post;
            const newComment = {
              _id: Date.now(),
              user: { name: user.name, profilePic: user.profilePic, _id: user._id || user.id },
              text,
            };
            const nextComments = [...(post.comments || []), newComment];
            return {
              ...post,
              comments: nextComments,
              commentsCount: (typeof post.commentsCount === "number" ? post.commentsCount : (post.comments?.length || 0)) + 1,
            };
          })
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const sortStudentsByFollowing = useCallback((students) => {
    if (!Array.isArray(students) || students.length === 0) return students || [];
    return [...students].sort((a, b) => {
      const aFollowed = myFollowing.includes(a._id || a.id);
      const bFollowed = myFollowing.includes(b._id || b.id);
      if (aFollowed === bFollowed) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return aFollowed ? 1 : -1;
    });
  }, [myFollowing]);

  const collegeIdParam = searchParams.get("collegeId");

  // Cached college detail (slim posts) — avoids re-downloading on reopen
  const {
    data: collegeDetail,
    isLoading: collegeDetailLoading,
    isFetching: collegeDetailFetching,
  } = useApiQuery(
    ["college-detail", collegeIdParam],
    collegeIdParam ? `/api/colleges/${collegeIdParam}` : null,
    {
      enabled: isMounted && !!getToken() && !!collegeIdParam,
      staleTime: 3 * 60 * 1000,
    }
  );

  // Optimistic shell from colleges list while detail loads
  useEffect(() => {
    if (!collegeIdParam) {
      setSelectedCollege(null);
      setLoadingCollegeId(null);
      return;
    }

    setActiveTab("posts");
    const listMatch =
      colleges.find((c) => String(c._id || c.id) === String(collegeIdParam)) || null;

    setSelectedCollege((prev) => {
      const prevId = prev?._id || prev?.id;
      if (prevId && String(prevId) === String(collegeIdParam) && prev.postsData?.length) {
        return prev;
      }
      if (!listMatch) return prev;
      return {
        ...listMatch,
        studentsData: listMatch.studentsData || [],
        postsData: listMatch.postsData || [],
      };
    });
  }, [collegeIdParam, colleges]);

  // Merge fetched detail into selected college (preserve lazy-loaded students)
  useEffect(() => {
    if (!collegeDetail || !collegeIdParam) return;
    if (String(collegeDetail._id || collegeDetail.id) !== String(collegeIdParam)) return;

    setSelectedCollege((prev) => {
      const sameCollege =
        prev &&
        String(prev._id || prev.id) === String(collegeDetail._id || collegeDetail.id);
      if (sameCollege && prev.studentsData?.length && !collegeDetail.studentsData?.length) {
        return { ...collegeDetail, studentsData: prev.studentsData };
      }
      return collegeDetail;
    });
  }, [collegeDetail, collegeIdParam]);

  useEffect(() => {
    if (!collegeIdParam) {
      setLoadingCollegeId(null);
      return;
    }
    const waitingForPosts =
      (collegeDetailLoading || collegeDetailFetching) &&
      !(collegeDetail?.postsData?.length > 0) &&
      !(selectedCollege?.postsData?.length > 0 &&
        String(selectedCollege?._id || selectedCollege?.id) === String(collegeIdParam));
    setLoadingCollegeId(waitingForPosts ? collegeIdParam : null);
  }, [
    collegeIdParam,
    collegeDetailLoading,
    collegeDetailFetching,
    collegeDetail,
    selectedCollege,
  ]);

  // Lazy-load students only when the Students tab is opened (keeps Posts fast)
  useEffect(() => {
    if (activeTab !== "students" || !selectedCollege) return;
    const collegeId = selectedCollege._id || selectedCollege.id;
    if (!collegeId) return;
    if (selectedCollege.studentsData?.length > 0) return;

    let cancelled = false;
    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const token = localStorage.getItem("collegeadda_token");
        const res = await fetch(`${apiUrl}/api/colleges/${collegeId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setSelectedCollege((prev) => {
          if (!prev || String(prev._id || prev.id) !== String(collegeId)) return prev;
          return {
            ...prev,
            studentsData: sortStudentsByFollowing(data.studentsData || []),
            realStudentCount: data.realStudentCount ?? prev.realStudentCount,
          };
        });
      } catch (err) {
        console.error("Error fetching college students:", err);
      } finally {
        if (!cancelled) setLoadingStudents(false);
      }
    };
    loadStudents();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedCollege?._id, selectedCollege?.id, apiUrl]);

  // Re-sort students when following list changes — do not re-fetch college details
  useEffect(() => {
    setSelectedCollege((prev) => {
      if (!prev?.studentsData?.length) return prev;
      return { ...prev, studentsData: sortStudentsByFollowing(prev.studentsData) };
    });
  }, [myFollowing, sortStudentsByFollowing]);

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

        queryClient.invalidateQueries({ queryKey: ["network-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["explore-following"] });
        queryClient.invalidateQueries({ queryKey: ["user-following"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["network-suggested"] });
        queryClient.invalidateQueries({ queryKey: ["suggested"] });
      } catch (err) {
        console.log("Error connecting with user:", err.message);
      }
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage("Skipped! Next up");
      setTimeout(() => setToastMessage(null), 2000);
    }

    // Instantly increment index and trigger 1 full smooth clockwise spin (+360 deg)
    setSpinRotation(prev => prev + 360);
    setCurrentStudentIndices(prev => ({
      ...prev,
      [collegeId]: (prev[collegeId] || 0) + 1
    }));
    setSwipeDirection(null);
    setDragX(0);
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
  const exploreCollegePool = useMemo(
    () => getExploreCollegePool(colleges),
    [colleges]
  );

  const cityOptions = useMemo(() => {
    const cities = [
      ...new Set(
        exploreCollegePool
          .map(c => c.location)
          .filter(loc => loc && loc !== "Location TBD" && !loc.toLowerCase().startsWith("tbd"))
      )
    ].sort((a, b) => a.localeCompare(b));
    return ["All", ...cities];
  }, [exploreCollegePool]);

  // ── Filtered curated colleges (max 20, priority order) ───────────────────
  const filteredColleges = useMemo(
    () =>
      getExploreColleges(colleges, {
        search,
        filterCity,
        filterCategory,
        filterStream,
        streamMap: STREAM_MAP,
      }),
    [search, colleges, filterCity, filterCategory, filterStream]
  );

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

        queryClient.invalidateQueries({ queryKey: ["network-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["explore-following"] });
        queryClient.invalidateQueries({ queryKey: ["user-following"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["network-suggested"] });
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
            <header className="page-header sticky top-0 z-40 px-5 py-4 backdrop-blur-md">
              <div className="mx-auto flex w-full max-w-6xl flex-col space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative h-12 w-12 shrink-0">
                      <div
                        className="absolute inset-0 rounded-2xl opacity-45 blur-md"
                        style={{ background: "linear-gradient(135deg, #C8922A, #E8B84B)" }}
                      />
                      <div className="relative h-12 w-12 rounded-2xl brand-mark flex items-center justify-center shadow-[0_6px_18px_rgba(200,146,42,0.3)] ring-1 ring-white/45">
                        {exploreMode === "colleges" ? (
                          <Building2 size={21} className="text-white" strokeWidth={2.25} />
                        ) : (
                          <Swords size={21} className="text-white" strokeWidth={2.25} />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-[1.35rem] sm:text-2xl font-black tracking-tight text-[#1A1A1A] truncate leading-tight">
                        {exploreMode === "colleges" ? "Explore Colleges" : "Campus Arena"}
                      </h1>
                      <p className="text-[12px] font-medium text-[#6B6B6B] mt-0.5 tracking-wide">
                        {exploreMode === "colleges"
                          ? "Discover campuses near you"
                          : "Esports networks & campus battles"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="explore-control-row flex w-full flex-col gap-2.5 sm:flex-row sm:items-stretch">
                  <div className="relative w-full sm:flex-1 group">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] transition-colors group-focus-within:text-[#C8922A]"
                      size={17}
                      strokeWidth={2.25}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      type="text"
                      placeholder={exploreMode === "colleges" ? "Search college..." : "Search players..."}
                      className="explore-search-input ca-input w-full py-3.5 pl-11 pr-4 text-sm font-medium rounded-[1.15rem]"
                    />
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ y: -1 }}
                    onClick={() => {
                      setExploreMode(exploreMode === "colleges" ? "arena" : "colleges");
                      setSearch("");
                      setArenaSportFilter("All");
                    }}
                    className={clsx(
                      "explore-mode-switch flex w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 rounded-[1.15rem] border px-6 py-3.5 font-black transition-all cursor-pointer",
                      exploreMode === "colleges"
                        ? "explore-mode-switch--arena bg-gradient-to-r from-[#C8922A] to-[#D4A843] border-transparent shadow-[0_6px_18px_rgba(200,146,42,0.32)] hover:shadow-[0_8px_22px_rgba(200,146,42,0.4)]"
                        : "explore-mode-switch--colleges bg-white border-[#E8E6E0] shadow-sm hover:border-[#C8922A]/55 hover:bg-[#FFF8EC]"
                    )}
                  >
                    {exploreMode === "colleges" ? (
                      <>
                        <Swords size={17} strokeWidth={2.4} />
                        <span className="tracking-[0.16em] uppercase text-[11px] sm:text-xs">Arena</span>
                      </>
                    ) : (
                      <>
                        <Building2 size={17} strokeWidth={2.4} />
                        <span className="tracking-[0.16em] uppercase text-[11px] sm:text-xs">Colleges</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {exploreMode === "arena" && (
                  <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar -mx-1 px-1">
                    {[
                      { id: "All", label: "All Games" },
                      { id: "BGMI", label: "BGMI" },
                      { id: "Valorant", label: "Valorant" },
                      { id: "FIFA", label: "FIFA" },
                      { id: "Chess", label: "Chess" },
                    ].map((game) => {
                      const active = arenaSportFilter === game.id;
                      return (
                        <button
                          key={game.id}
                          type="button"
                          onClick={() => setArenaSportFilter(game.id)}
                          className={clsx(
                            "explore-arena-chip shrink-0 px-3.5 py-1.5 rounded-full font-bold tracking-wide transition-all cursor-pointer border",
                            active
                              ? "explore-arena-chip--active bg-gradient-to-r from-[#C8922A] to-[#D4A843] border-transparent shadow-sm"
                              : "explore-arena-chip--idle bg-[#F9F8F5] border-[#E8E6E0] hover:border-[#C8922A]/40"
                          )}
                        >
                          <span className="uppercase" style={{ fontSize: 11 }}>
                            {game.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </header>

            {exploreMode === "colleges" ? (
              <>

                {/* ── Filter Bar ────────────────────────────────────────────── */}
                <section className="mx-auto w-full max-w-6xl px-4 pt-3 pb-1 sm:px-5">
                  <div className="explore-filter-panel app-panel rounded-[1.5rem] px-4 py-4 sm:px-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3.5">
                      {/* City filter */}
                      <div className="min-w-0">
                        <label className="mb-2 flex items-center gap-1.5 pl-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#6B6B6B]">
                          <Globe size={12} strokeWidth={2.4} className="text-[#C8922A]" />
                          City
                        </label>
                        <select
                          value={filterCity}
                          onChange={e => setFilterCity(e.target.value)}
                          aria-label="Filter by city"
                          className="explore-filter-select ca-input w-full py-2.5 pl-3.5 pr-9 text-xs font-semibold appearance-none cursor-pointer rounded-xl"
                        >
                          {cityOptions.map(city => (
                            <option key={city} value={city}>{city === "All" ? "All Cities" : city}</option>
                          ))}
                        </select>
                      </div>

                      {/* Category filter */}
                      <div className="min-w-0">
                        <label className="mb-2 flex items-center gap-1.5 pl-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#6B6B6B]">
                          <Landmark size={12} strokeWidth={2.4} className="text-[#C8922A]" />
                          Category
                        </label>
                        <select
                          value={filterCategory}
                          onChange={e => setFilterCategory(e.target.value)}
                          aria-label="Filter by category"
                          className="explore-filter-select ca-input w-full py-2.5 pl-3.5 pr-9 text-xs font-semibold appearance-none cursor-pointer rounded-xl"
                        >
                          {CATEGORY_OPTIONS.map(cat => (
                            <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Stream filter */}
                      <div className="min-w-0">
                        <label className="mb-2 flex items-center gap-1.5 pl-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#6B6B6B]">
                          <BookOpen size={12} strokeWidth={2.4} className="text-[#C8922A]" />
                          Stream
                        </label>
                        <select
                          value={filterStream}
                          onChange={e => setFilterStream(e.target.value)}
                          aria-label="Filter by stream"
                          className="explore-filter-select ca-input w-full py-2.5 pl-3.5 pr-9 text-xs font-semibold appearance-none cursor-pointer rounded-xl"
                        >
                          {STREAM_OPTIONS.map(s => (
                            <option key={s} value={s}>{s === "All" ? "All Streams" : s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Active filter summary + college count */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#EFEDE6] pt-3">
                      <p className="text-[11px] text-[#6B6B6B] font-medium">
                        {!loading && (
                          <>
                            Showing{" "}
                            <span className="font-black text-[#1A1A1A] tabular-nums">{filteredColleges.length}</span>
                            {" "}college{filteredColleges.length !== 1 ? "s" : ""}
                            {hasActiveFilters && (
                              <span className="ml-1.5 inline-flex items-center rounded-full bg-[#FFF8EC] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#B07D20]">
                                Filtered
                              </span>
                            )}
                          </>
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {hasActiveFilters && (
                          <>
                            {filterCity !== "All" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8EC] border border-[#E8D9B0] px-2.5 py-1 text-[9px] font-black text-[#B07D20] uppercase tracking-wider">
                                <MapPin size={10} strokeWidth={2.5} />
                                {filterCity}
                              </span>
                            )}
                            {filterCategory !== "All" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8EC] border border-[#E8D9B0] px-2.5 py-1 text-[9px] font-black text-[#B07D20] uppercase tracking-wider">
                                {filterCategory}
                              </span>
                            )}
                            {filterStream !== "All" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8EC] border border-[#E8D9B0] px-2.5 py-1 text-[9px] font-black text-[#B07D20] uppercase tracking-wider">
                                {filterStream}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={clearFilters}
                              className="shrink-0 flex items-center gap-1 rounded-full border border-[#E8E6E0] bg-white px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#6B6B6B] transition-all hover:border-[#C8922A]/45 hover:bg-[#FFF8EC] hover:text-[#1A1A1A] active:scale-95"
                              aria-label="Clear all filters"
                            >
                              Clear
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-5 xl:grid-cols-3">
              {loading && (
                <div className="col-span-full flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                </div>
              )}

              {filteredColleges.map((college, index) => (
                <motion.div
                  key={college._id || college.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24) }}
                  whileHover={{ y: -4 }}
                  className="explore-college-card relative flex flex-col rounded-[1.6rem] overflow-hidden text-left group shadow-[0_8px_28px_rgba(26,26,26,0.12)] hover:shadow-[0_14px_36px_rgba(26,26,26,0.18)] transition-shadow duration-300 cursor-default ring-1 ring-black/5"
                  style={{ height: "420px" }}
                >
                  {/* Full-bleed background image */}
                  <img
                    src={college.banner || COLLEGE_BANNER_FALLBACK}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    alt={college.name}
                    referrerPolicy="no-referrer"
                    onError={handleBannerError}
                  />

                  {/* Dark gradient overlay — richer depth at bottom */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.05) 100%)",
                    }}
                  />
                  <div
                    className="absolute inset-x-0 top-0 h-24 pointer-events-none"
                    style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.28), transparent)" }}
                  />

                  {/* Content overlaid on image */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 space-y-3.5">
                    {/* College name + followers badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="font-black text-[1.05rem] leading-snug line-clamp-2 flex-1 tracking-tight"
                        style={{ color: "white", textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}
                      >
                        {college.name}
                      </h3>
                      {(college.followersCount ?? 0) > 0 && (
                        <div className="flex items-center gap-1 shrink-0 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 backdrop-blur-md">
                          <Users size={10} color="white" />
                          <span className="text-[10px] font-bold" style={{ color: "white" }}>
                            {college.followersCount}
                          </span>
                        </div>
                      )}
                    </div>
                        {/* Location & students pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 backdrop-blur-md" style={{ backgroundColor: "rgba(0,0,0,0.42)" }}>
                            <MapPin size={11} color="#E8B84B" />
                            <span className="text-[11px] font-semibold truncate max-w-[120px]" style={{ color: "white" }}>{college.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 backdrop-blur-md" style={{ backgroundColor: "rgba(0,0,0,0.42)" }}>
                            <Users size={11} color="#E8B84B" />
                            <span className="text-[11px] font-semibold" style={{ color: "white" }}>{college.students} Students</span>
                          </div>
                        </div>

                        {/* Explore Now button — only interactive hotspot on the card */}
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            router.push(`/explore?collegeId=${college._id || college.id}`);
                          }}
                          disabled={loadingCollegeId === (college._id || college.id)}
                          className="explore-college-cta w-full rounded-2xl py-3.5 flex items-center justify-center text-sm font-black tracking-wide text-[#1A1A1A] shadow-[0_6px_18px_rgba(200,146,42,0.35)] transition-opacity hover:opacity-95 disabled:opacity-80 cursor-pointer"
                        >
                          {loadingCollegeId === (college._id || college.id) ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            "Explore Now"
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}

                </div>

            {!loading && filteredColleges.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="explore-empty-panel app-panel mx-auto max-w-sm rounded-[1.75rem] p-9 flex flex-col items-center gap-4">
                  <div className="relative h-14 w-14">
                    <div
                      className="absolute inset-0 rounded-2xl opacity-40 blur-md"
                      style={{ background: "linear-gradient(135deg, #C8922A, #E8B84B)" }}
                    />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl brand-mark ring-1 ring-white/40 shadow-[0_6px_16px_rgba(200,146,42,0.28)]">
                      <SearchX size={24} className="text-white" strokeWidth={2.25} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1A1A1A] mb-1.5">
                      {hasActiveFilters
                        ? "No colleges match these filters"
                        : `No colleges found matching "${search}"`}
                    </p>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                      {hasActiveFilters
                        ? "Try adjusting or clearing your filters."
                        : "Try a different search term."}
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-1 rounded-2xl bg-gradient-to-r from-[#C8922A] to-[#D4A843] px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#1A1A1A] shadow-[0_4px_14px_rgba(200,146,42,0.28)] hover:opacity-95 active:scale-95 transition-all"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            )}
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
              /* --- ARENA VIEW (Esports only) --- */
              <div className="flex flex-col flex-1 relative bg-transparent">
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-5 pb-24 pt-2">
                  <motion.div
                    key="esports"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto w-full max-w-6xl space-y-7"
                  >
                    {/* Section header + CTA */}
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-[#1A1A1A] font-black uppercase tracking-wider flex items-center text-sm">
                          <Swords className="mr-2 text-[#C8922A]" size={16} /> Esports Networks
                        </h3>
                        <p className="text-[11px] text-[#888888] font-medium mt-1">
                          Pick a game and jump into campus matchmaking
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPlayerCardForm(true)}
                        className="shrink-0 ca-btn-primary px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition cursor-pointer"
                      >
                        + Create Card
                      </button>
                    </div>

                    {/* Esports game cards */}
                    <section>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {ESPORTS_NETWORKS.filter(
                          (game) =>
                            arenaSportFilter === "All" ||
                            arenaSportFilter === game.name
                        ).map((game) => {
                          const Icon = game.icon;
                          return (
                            <motion.button
                              key={game.key}
                              type="button"
                              whileHover={{ y: -3 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => router.push(`/arena/sport/${game.key}`)}
                              className="group relative rounded-[1.35rem] border border-[#E8E6E0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#C8922A]/45 transition-all cursor-pointer overflow-hidden text-left"
                            >
                              <div
                                className="h-1.5 w-full"
                                style={{ background: `linear-gradient(90deg, ${game.accent}, ${game.accent}88)` }}
                              />
                              <div className="p-4 flex flex-col gap-3">
                                <div
                                  className="w-11 h-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105"
                                  style={{
                                    background: `${game.accent}14`,
                                    borderColor: `${game.accent}35`,
                                  }}
                                >
                                  <Icon size={20} style={{ color: game.accent }} strokeWidth={2.25} />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-[#1A1A1A] tracking-tight">
                                    {game.name}
                                  </p>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mt-0.5 group-hover:text-[#C8922A] transition-colors">
                                    Open lobby
                                  </p>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </section>

                    {/* Top Players */}
                    <section>
                      <h3 className="text-[#1A1A1A] font-black uppercase tracking-wider mb-3 flex items-center text-sm">
                        <Target className="mr-2 text-[#C8922A]" size={16} /> Top Players
                      </h3>
                      <div className="rounded-[1.5rem] border border-[#E8E6E0] bg-gradient-to-b from-[#FFF8EC]/70 to-[#F9F8F5] px-6 py-12 flex flex-col items-center text-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8D9B0] shadow-sm flex items-center justify-center">
                          <Gamepad2 size={24} className="text-[#C8922A]" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#1A1A1A]">
                            Be the first on the board
                          </p>
                          <p className="text-[11px] text-[#888888] font-medium mt-1 max-w-xs">
                            Create your player card and show up in Top Players for your campus.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPlayerCardForm(true)}
                          className="mt-1 ca-btn-primary px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                        >
                          Create My Card
                        </button>
                      </div>
                    </section>
                  </motion.div>
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
            {/* Profile Header — framed banner with padding */}
            <div className="relative px-3 pt-3">
              <div className="h-[380px] sm:h-[420px] w-full bg-[#F3F2EE] relative overflow-hidden rounded-2xl shadow-sm border border-[#E8E6E0]">
                <img
                  src={selectedCollege.banner || COLLEGE_BANNER_FALLBACK}
                  className="w-full h-full object-cover object-center"
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={handleBannerError}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 100%)",
                  }}
                />

                {/* Back Button — hardcoded white stroke (global CSS overrides lucide currentColor) */}
                <button
                  type="button"
                  onClick={() => router.push('/explore')}
                  className="explore-college-banner__back absolute top-3 left-3 p-2.5 bg-black/45 backdrop-blur-md rounded-full hover:bg-black/65 transition-colors z-20 border border-white/10 cursor-pointer"
                  aria-label="Back to explore"
                  style={{ cursor: "pointer", color: "#ffffff" }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* College Info on Banner */}
                <div className="absolute bottom-5 left-4 right-4 flex items-end space-x-4 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-2xl shrink-0">
                    {selectedCollege.emoji ? (
                      <span className="text-3xl leading-none" aria-hidden>
                        {selectedCollege.emoji}
                      </span>
                    ) : (
                      <Building2 size={32} className="text-[#1A1A1A]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-0.5">
                    <h2 className="explore-college-banner__title text-2xl font-bold leading-tight">
                      {selectedCollege.name}
                    </h2>
                    <p className="explore-college-banner__meta text-sm flex items-center mt-1.5">
                      <MapPin size={14} className="mr-1 shrink-0" />
                      <span className="truncate">{selectedCollege.location}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 px-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-stretch gap-2 sm:gap-3">
                {[
                  {
                    label: "Students",
                    value: selectedCollege.realStudentCount ?? selectedCollege.students,
                  },
                  {
                    label: "Posts",
                    value: selectedCollege.realPostCount ?? selectedCollege.posts,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="min-w-[72px] rounded-2xl border border-[#E8E6E0] bg-[#F9F8F5] px-3 py-2.5 text-center"
                  >
                    <p className="text-base font-bold text-[#1A1A1A] leading-none">{stat.value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mt-1.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Follower count + Follow toggle */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl px-3 py-2.5">
                  <Users size={14} className="text-[#888888]" />
                  <span className="text-sm font-bold text-[#1A1A1A]">
                    {selectedCollege.followersCount ?? 0}
                  </span>
                </div>
                <button
                  onClick={() => toggleFollow(selectedCollege._id || selectedCollege.id)}
                  className={clsx(
                    "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95",
                    followed[selectedCollege._id || selectedCollege.id]
                      ? "bg-[#F3F2EE] text-[#6B6B6B] border border-[#E8E6E0]"
                      : "text-white shadow-md"
                  )}
                  style={
                    !followed[selectedCollege._id || selectedCollege.id]
                      ? {
                        backgroundColor: selectedCollege.accent || "#C8922A",
                        boxShadow: `0 8px 18px -4px ${selectedCollege.accent || "#C8922A"}40`,
                      }
                      : {}
                  }
                >
                  {followed[selectedCollege._id || selectedCollege.id] ? "Following" : "Follow"}
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="mt-6 px-4 flex border-b border-[#E8E6E0]">
              {["posts", "students", "memories"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "flex-1 py-3.5 text-sm font-bold capitalize tracking-wide transition-all relative",
                    activeTab === tab ? "text-[#1A1A1A]" : "text-[#888888] hover:text-[#4A4A4A]"
                  )}
                  style={
                    activeTab === tab
                      ? { color: selectedCollege.accent || "#C8922A" }
                      : {}
                  }
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full"
                      style={{ backgroundColor: selectedCollege.accent || "#C8922A" }}
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
                    {(() => {
                      const feedPosts = (selectedCollege.postsData || []).filter(p => !p.isMemoryOnly);
                      if (feedPosts.length === 0 && loadingCollegeId === (selectedCollege._id || selectedCollege.id)) {
                        return (
                          <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-[#C8922A]" />
                            <p className="text-xs text-[#888888] mt-3 font-semibold">Loading posts…</p>
                          </div>
                        );
                      }
                      if (feedPosts.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#F9F8F5] border border-[#E8E6E0] flex items-center justify-center mb-4">
                              <MessageSquare size={24} className="text-[#C8922A]" />
                            </div>
                            <p className="text-sm font-semibold text-[#1A1A1A]">No posts yet</p>
                            <p className="text-xs text-[#888888] mt-1 max-w-xs">
                              Be the first to share something from {selectedCollege.name}.
                            </p>
                          </div>
                        );
                      }
                      return feedPosts.map(post => {
                        const isLiked = typeof post.likedByMe === "boolean"
                          ? post.likedByMe
                          : !!(currentUserId && post.likes?.some(
                            (id) => String(id) === String(currentUserId)
                          ));
                        const likeCount = typeof post.likesCount === "number"
                          ? post.likesCount
                          : (post.likes?.length || 0);
                        const commentCount = typeof post.commentsCount === "number"
                          ? post.commentsCount
                          : (post.comments?.length || 0);
                        return (
                          <article
                            key={post._id}
                            className="bg-white border border-[#E8E6E0] rounded-3xl p-5 shadow-sm space-y-4"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full p-[2px] bg-[#F3F2EE] overflow-hidden shrink-0">
                                <img
                                  src={getAvatarSrc(post.author?.profilePic, post.author?.name, post.author?._id || post.author?.id)}
                                  className="w-full h-full object-cover rounded-full bg-white"
                                  alt=""
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-semibold text-[#1A1A1A] leading-none flex items-center gap-1.5">
                                  {post.author?.name || "Student"}
                                  <VerifiedBadge user={post.author} size={16} />
                                </p>
                                <p className="text-sm text-[#888888] mt-1 truncate">
                                  {post.author?.university || selectedCollege.name}
                                  {post.createdAt ? ` • ${timeAgo(post.createdAt)}` : ""}
                                </p>
                              </div>
                            </div>

                            {post.content ? (
                              <p className="text-[15px] text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">
                                {post.content}
                              </p>
                            ) : null}

                            {post.mediaUrl && (
                              <div className="rounded-2xl overflow-hidden border border-[#E8E6E0] bg-[#F3F2EE]">
                                {post.mediaType === "video" ? (
                                  <video
                                    src={post.mediaUrl}
                                    controls
                                    className="w-full h-auto max-h-[420px] object-contain"
                                  />
                                ) : (
                                  <img
                                    src={post.mediaUrl}
                                    className="w-full h-auto max-h-[420px] object-contain mx-auto"
                                    alt=""
                                  />
                                )}
                              </div>
                            )}

                            <div className="flex flex-col space-y-3">
                              <div className="flex items-center justify-between border-t border-[#EBEBEB] pt-4">
                                <div className="flex items-center space-x-4">
                                  <button
                                    onClick={() => toggleLike(post._id)}
                                    className={clsx(
                                      "flex items-center space-x-2 p-2 rounded-full transition-colors group",
                                      isLiked
                                        ? "text-[#C8922A]"
                                        : "text-[#888888] hover:text-[#C8922A]"
                                    )}
                                  >
                                    <Heart
                                      size={22}
                                      className={clsx(
                                        "transition-transform group-active:scale-75",
                                        isLiked && "fill-[#C8922A]"
                                      )}
                                    />
                                    <span className="text-sm text-[#888888]">{likeCount}</span>
                                  </button>
                                  <button
                                    onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                                    className="flex items-center space-x-2 p-2 rounded-full text-[#888888] hover:text-[#C8922A] transition-colors group"
                                  >
                                    <MessageSquare size={22} className="transition-transform group-active:scale-75" />
                                    <span className="text-sm text-[#888888]">{commentCount}</span>
                                  </button>
                                </div>
                                <button
                                  onClick={() => window.open(`https://wa.me/?text=Check out this post from ${selectedCollege.name} on CollageAdda: ${encodeURIComponent(post.content || "")}`, "_blank")}
                                  className="p-2 rounded-full text-[#888888] hover:text-[#C8922A] transition-colors"
                                >
                                  <Share2 size={20} />
                                </button>
                              </div>

                              {activeCommentPost === post._id && (
                                <div className="space-y-3 border-t border-[#EBEBEB] pt-4">
                                  {post.comments?.length > 0 && (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                      {post.comments.map((comment, i) => (
                                        <div
                                          key={comment._id || i}
                                          className="flex items-start space-x-3 text-sm bg-[#F9F8F5] p-3 rounded-2xl"
                                        >
                                          <div className="h-8 w-8 rounded-full gradient-bg p-[1px] shrink-0">
                                            <img
                                              src={getAvatarSrc(comment.user?.profilePic, comment.user?.name, comment.user?._id || comment.user?.id || comment._id)}
                                              alt={comment.user?.name || "Student"}
                                              className="h-full w-full rounded-full object-cover bg-white"
                                              onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = getDefaultAvatar(comment.user?.name || "Student", comment.user?._id || comment.user?.id || comment._id);
                                              }}
                                            />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="font-semibold text-[#1A1A1A] leading-tight">
                                              {comment.user?.name || "Student"}
                                            </p>
                                            <p className="text-[#6B6B6B] mt-0.5">{comment.text}</p>
                                          </div>
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
                                      className="flex-1 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:border-[#C8922A]/50 transition-colors"
                                    />
                                    <button
                                      onClick={() => handleComment(post._id)}
                                      className="bg-[#C8922A] text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#C8922A]/20"
                                    >
                                      <Send size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      });
                    })()}
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
                    {loadingStudents && !(selectedCollege.studentsData?.length > 0) ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#C8922A]" />
                        <p className="text-xs text-[#888888] mt-3 font-semibold">Loading students…</p>
                      </div>
                    ) : (
                      <>
                        {/* Top Bar */}
                        <div className="w-full flex items-center justify-between mb-6">
                          <div className="flex flex-col">
                            <h4 className="text-sm font-bold text-foreground">
                              {viewMode === 'cards' ? 'Discover Students' : 'Student Directory'}
                            </h4>
                            <p className="text-[10px] text-muted font-medium mt-0.5">
                              {(selectedCollege.studentsData?.length || 0)} students found
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

                        {/* 3D Roulette Cylinder Stack */}
                        {viewMode === 'cards' ? (
                          <div className="relative w-full max-w-[900px] flex flex-col items-center justify-center mb-10 mx-auto overflow-visible" style={{ perspective: "1200px" }}>
                            
                            {/* The Static Wheel Container */}
                            <div 
                              className="relative w-[320px] sm:w-[350px] h-[580px] flex items-center justify-center" 
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              {/* Empty State */}
                            {(currentStudentIndices[selectedCollege?._id || selectedCollege?.id] || 0) >= selectedCollege.studentsData.length && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center p-6 space-y-5 bg-surface rounded-[32px] w-full h-full border border-border/50 shadow-lg absolute"
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
                                const currentIndex = currentStudentIndices[selectedCollege?._id || selectedCollege?.id] || 0;
                                // Render up to 8 cards around the cylinder for a continuous wheel look
                                if (Math.abs(idx - currentIndex) > 4) return null;

                                const isTop = idx === currentIndex;
                                const absOffset = Math.abs(idx - currentIndex);
                                
                                // Cards physically orbit the center point!
                                const targetRotateY = ((idx - currentIndex) * -45) + spinRotation; 
                                
                                return (
                                  <motion.div
                                    key={student._id || student.id}
                                    drag={isTop ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    onDrag={(e, info) => isTop && setDragX(info.offset.x)}
                                    onDragEnd={(e, info) => {
                                      if (!isTop) return;
                                      setDragX(0);
                                      if (info.offset.x > 80) handleSwipe(selectedCollege?._id || selectedCollege?.id, 'right', student);
                                      else if (info.offset.x < -80) handleSwipe(selectedCollege?._id || selectedCollege?.id, 'left', student);
                                    }}
                                    initial={false}
                                    animate={{
                                      rotateY: targetRotateY + (isTop ? dragX * 0.1 : 0),
                                      x: isTop ? dragX : 0,
                                      scale: isTop ? 1.05 : 0.85,
                                      opacity: absOffset <= 3 ? 1 : 0 
                                    }}
                                    transition={{ type: "spring", bounce: 0, duration: 1.2 }} // Ultra-smooth natural physics deceleration
                                    className={`absolute w-full h-[95%] bg-surface border border-border/50 rounded-[32px] overflow-hidden flex flex-col ${isTop ? 'cursor-grab active:cursor-grabbing shadow-[0_20px_60px_-10px_rgba(var(--primary),0.4)]' : 'shadow-none pointer-events-none'}`}
                                    style={{ transformOrigin: "50% 50% -450px" }} // Large radius prevents intersection!
                                  >
                                    {/* Student Profile Photo Area - Top Banner */}
                                    <div className="relative w-full h-[28%] bg-[#F3F2EE] shrink-0 pointer-events-none">
                                      <img src={selectedCollege.banner || COLLEGE_BANNER_FALLBACK} alt="Banner" className="w-full h-full object-cover opacity-60 mix-blend-multiply" />

                                      {/* Verified Badge */}
                                      {student.isVerified && (
                                        <div className="absolute top-4 left-4 bg-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-green-100 z-20">
                                          <div className="bg-green-500 rounded-full p-0.5"><Check size={10} className="text-white" strokeWidth={3} /></div>
                                          <span className="text-[10px] font-black text-green-700 tracking-wider">VERIFIED</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Details Area */}
                                    <div className="flex-1 flex flex-col items-center px-4 pt-14 pb-4 text-center bg-white relative">
                                      {/* Circular Profile Picture */}
                                      <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                                        <div className="relative w-[110px] h-[110px] rounded-full border-[5px] border-white shadow-sm bg-muted z-20">
                                          <img
                                            src={getAvatarSrc(student.profilePic, student.name, student._id || student.id)}
                                            alt=""
                                            className="w-full h-full object-cover rounded-full bg-white text-transparent"
                                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getDefaultAvatar(student.name, student._id || student.id); }}
                                          />
                                        </div>
                                      </div>

                                      {/* Name & Contributor Badge */}
                                      <div className="mt-1 w-full">
                                        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight truncate px-2">
                                          {student.name}
                                        </h2>
                                        {((student.postsCount || student.posts?.length || 0) > 10) && (
                                          <div className="mt-1.5 flex justify-center">
                                            <span className="inline-flex items-center gap-1.5 bg-[#FFF8EC] text-[#C8922A] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-[#F3E8D3]">
                                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                              Campus Contributor
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Bio Block */}
                                      <div className="mt-4 w-full bg-[#FFF8EC] border border-[#F3E8D3] rounded-2xl p-3.5 flex gap-2.5 text-left">
                                        <div className="text-[#C8922A] shrink-0 font-serif text-3xl leading-none pt-1.5">“</div>
                                        <p className="text-xs text-[#4A4A4A] font-medium italic leading-relaxed line-clamp-3">
                                          {student.bio || "No bio yet."}
                                        </p>
                                      </div>

                                      {/* Education Details Block */}
                                      <div className="mt-3 w-full bg-[#FAFAF8] border border-[#E8E6E0] rounded-2xl p-3.5 flex flex-col gap-2.5 text-left">
                                        <div className="flex justify-between items-center text-[11px] font-bold text-[#4A4A4A]">
                                          <span className="truncate pr-2">🏫 {student.university || selectedCollege.name}</span>
                                          <span className="shrink-0">👨🏻‍🎓 {student.course || "B.Tech"}, {student.branch || "CSE"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] font-bold text-[#4A4A4A]">
                                          <span>📚 {student.studyYear || "1st Year"}</span>
                                          <span>🏛️ Class of {student.passOutBatch || "2028"}</span>
                                        </div>
                                      </div>

                                      {/* Rank & Badge Pills */}
                                      <div className="mt-2.5 w-full flex flex-wrap items-center gap-2 justify-center">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8EC] border border-[#F3E8D3] rounded-full text-[10px] font-bold text-[#1A1A1A]">
                                          <span>🏆</span>
                                          <span>Campus Rank #{student.campusRank || student.rank || Math.max(1, 100 - Math.floor((student.xp || 0) / 10))}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8EC] border border-[#F3E8D3] rounded-full text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">
                                          <span>🏅</span>
                                          <span>{student.unlockedBadges && student.unlockedBadges.length > 0 ? student.unlockedBadges[0].badgeId : "Networker"}</span>
                                        </div>
                                      </div>

                                      {/* Footer Badges */}
                                      <div className="mt-auto pt-3 w-full flex flex-wrap justify-center items-center gap-x-2 gap-y-1.5 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl py-2 px-1 text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                                        <span className="flex items-center gap-1 shrink-0">📌 <span className="truncate max-w-[80px]">{student.hometownDistrict || student.hometownState || "Delhi, India"}</span></span>
                                        <div className="w-[1px] h-2.5 bg-[#D4D4D4] shrink-0" />
                                        <span className="flex items-center gap-1 shrink-0">📅 Joined {new Date(student.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        {((student.xp || 0) > 150) && (
                                          <>
                                            <div className="w-[1px] h-2.5 bg-[#D4D4D4] shrink-0" />
                                            <span className="flex items-center gap-1 shrink-0 text-[#1A1A1A]">🤝 Active Member</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              }).reverse()}
                            </AnimatePresence>
                            </div>


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
                                      <img src={getAvatarSrc(student.profilePic, student.name, student._id || student.id)} className="w-full h-full object-cover" alt="" />
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
                              className="w-[76px] h-[76px] rounded-full bg-white border-2 border-orange-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-shadow leading-none pb-1"
                            >
                              <span className="text-[40px]">🤪</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleSwipe(selectedCollege?._id || selectedCollege?.id, 'right', selectedCollege.studentsData[currentStudentIndices[selectedCollege?._id || selectedCollege?.id] || 0])}
                              className="w-[76px] h-[76px] rounded-full bg-white border-2 border-pink-500/20 flex items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.2)] hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] transition-shadow leading-none pb-1"
                            >
                              <span className="text-[40px]">😍</span>
                            </motion.button>
                          </div>
                        )}
                      </>
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
                    {(() => {
                      const memoryPosts = (selectedCollege.postsData || []).filter(
                        (p) =>
                          (p.mediaUrl || p.image)
                      );
                      if (memoryPosts.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#F9F8F5] border border-[#E8E6E0] flex items-center justify-center mb-4">
                              <Bookmark size={24} className="text-[#C8922A]" />
                            </div>
                            <p className="text-sm font-semibold text-[#1A1A1A]">No memories yet</p>
                            <p className="text-xs text-[#888888] mt-1 max-w-xs">
                              Photo posts from this campus will show up here.
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                          {memoryPosts.map((post, i) => (
                            <div
                              key={post._id || i}
                              onClick={() => setSelectedMemoryPhoto(post.mediaUrl || post.image)}
                              className="aspect-square relative group overflow-hidden bg-[#F3F2EE] rounded-xl border border-[#E8E6E0] p-1.5 cursor-pointer"
                            >
                              {post.mediaType === "video" ? (
                                <video
                                  src={post.mediaUrl}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                />
                              ) : (
                                <img
                                  src={post.mediaUrl || post.image}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  alt=""
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
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

      <AnimatePresence>
        {selectedMemoryPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedMemoryPhoto(null)}
          >
            <button
              onClick={() => setSelectedMemoryPhoto(null)}
              className="absolute top-6 right-6 text-white/80 hover:text-white p-2 z-10 transition-colors"
            >
              <X size={32} strokeWidth={2.5} />
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={selectedMemoryPhoto}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              alt="Memory"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
