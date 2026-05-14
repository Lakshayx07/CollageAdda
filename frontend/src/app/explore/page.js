"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VerifiedBadge from "@/components/VerifiedBadge";
import PlayerCard from "@/components/PlayerCard";
import PlayerCardForm from "@/components/PlayerCardForm";
import clsx from "clsx";


export default function ExplorePage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [colleges, setColleges] = useState([]);
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
  const [loading, setLoading] = useState(true);

  const [currentStudentIndices, setCurrentStudentIndices] = useState({});
  const [studentSearch, setStudentSearch] = useState("");
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'list'

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const [myFollowing, setMyFollowing] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("collegeadda_token");
        
        // Fetch colleges
        const res = await fetch(`${apiUrl}/api/colleges`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setColleges(data);
        }

        // Fetch my following list to check connections
        const followingRes = await fetch(`${apiUrl}/api/users/me/following`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (followingRes.ok) {
          const followingData = await followingRes.json();
          setMyFollowing(followingData.map(u => u._id));
        }

      } catch (err) {
        console.error("Error fetching initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [apiUrl]);

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

  const fetchCollegeDetails = async (college) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/colleges/${college._id || college.id}`, {
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
    }
  };

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

  const filteredColleges = useMemo(() => {
    return colleges.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, colleges]);

  const toggleFollow = (id) => {
    setFollowed(prev => {
      const isCurrentlyFollowing = prev[id];
      setSelectedCollege(curr => {
        const currId = curr?._id || curr?.id;
        if (currId !== id) return curr;
        let currentStudents = parseInt(curr.students) || 0;
        return {
          ...curr,
          students: isCurrentlyFollowing ? currentStudents - 1 : currentStudents + 1
        };
      });
      return { ...prev, [id]: !isCurrentlyFollowing };
    });
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
      
      // 2. Get or Create Room
      const res = await fetch(`${apiUrl}/api/chat/rooms`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId: userId })
      });

      if (res.ok) {
        const room = await res.json();
        setToastMessage("Opening chat...");
        router.push(`/messages?chat=${room._id}`);
      } else {
        setToastMessage("Failed to start chat.");
      }
      setTimeout(() => setToastMessage(null), 2000);
    } catch (err) {
      console.error("Error starting direct message:", err);
    }
  };



  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden">
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
            <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-4 flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className={clsx("p-2 rounded-xl", exploreMode === "colleges" ? "bg-primary/20" : "gradient-bg")}>
                  {exploreMode === "colleges" ? <Building2 className="text-primary" size={20} /> : <Trophy className="text-white" size={20} />}
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  {exploreMode === "colleges" ? "Explore Colleges" : "Campus Arena"}
                </h1>
              </div>

              <div className="flex items-center space-x-3 w-full">
                <div className="relative w-1/2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder={exploreMode === "colleges" ? "Search college..." : "Search players..."}
                    className="w-full bg-surface-hover border border-border/50 rounded-2xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setExploreMode(exploreMode === "colleges" ? "arena" : "colleges");
                    setSearch("");
                  }}
                  className={clsx(
                    "flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl border transition-all text-sm font-black shadow-lg whitespace-nowrap w-1/2",
                    exploreMode === "colleges" 
                      ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent shadow-purple-500/30 hover:shadow-purple-500/50" 
                      : "glass border-border/50 text-foreground hover:bg-surface-hover"
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
                      "shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                      arenaSportFilter === "All" 
                        ? "bg-foreground text-background border-foreground shadow-md" 
                        : "glass border-border/50 text-muted hover:text-foreground hover:border-border"
                    )}
                  >
                    All Sports
                  </button>
                  {["🎮 Esports", "🏸 Badminton", "⚽ Football", "🏀 Basketball", "🏐 Volleyball", "🏏 Cricket", "🎾 Tennis", "🏊 Swimming", "🏅 Athletics"].map(sport => (
                    <button
                      key={sport}
                      onClick={() => setArenaSportFilter(sport)}
                      className={clsx(
                        "shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                        arenaSportFilter === sport 
                          ? "bg-foreground text-background border-foreground shadow-md" 
                          : "glass border-border/50 text-muted hover:text-foreground hover:border-border"
                      )}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              )}
            </header>

            {exploreMode === "colleges" ? (
              <>
                <div className="p-4 grid grid-cols-2 gap-6">
              {loading && (
                <div className="col-span-2 flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                </div>
              )}
              {!loading && filteredColleges.length === 0 && (
                <div className="col-span-2 text-center py-20 text-muted">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No colleges found. Try searching for something else!</p>
                </div>
              )}
              {filteredColleges.map(college => (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={college._id || college.id}
                  onClick={() => fetchCollegeDetails(college)}
                  className="flex flex-col bg-surface border border-border/50 rounded-3xl overflow-hidden text-left hover:border-primary/50 transition-all shadow-md group h-full"
                >
                  {/* Full Image Container */}
                  <div className="h-[200px] w-full bg-muted overflow-hidden">
                    <img
                      src={college.banner}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={college.name}
                    />
                  </div>

                  {/* Info Section Below Image */}
                  <div className="p-4 flex flex-col flex-1 space-y-3 bg-surface">
                    <div className="space-y-1">
                        <div className="bg-primary/10 p-1.5 rounded-lg mr-2">
                          <Building2 size={16} style={{ color: college.accent }} />
                        </div>
                        <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">
                          {college.name}
                        </h3>
                      <div className="flex items-center text-[11px] text-muted">
                        <MapPin size={12} className="mr-1 text-primary" />
                        <span className="truncate">{college.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-[11px] text-muted font-medium pb-2">
                      <Users size={12} className="mr-1.5 text-secondary" />
                      {college.students} Students
                    </div>

                    {/* Visit Me Button */}
                    <div className="mt-auto pt-2">
                      <div
                        className="w-full py-2.5 rounded-xl text-[11px] font-bold text-center transition-all shadow-sm active:scale-95"
                        style={{
                          backgroundColor: `${college.accent}15`,
                          color: college.accent,
                          border: `1.5px solid ${college.accent}30`
                        }}
                      >
                        Visit Now
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredColleges.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted">
                <Search size={48} className="mb-4 opacity-20" />
                <p>No colleges found matching "{search}"</p>
              </div>
            )}
              </>
            ) : (
              /* --- ARENA VIEW --- */
              <div className="flex flex-col flex-1 relative bg-[#050508]">
                {/* Top Toggle: Esports vs Sports */}
                <div className="px-4 py-3 flex space-x-2 bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
                  <button
                    onClick={() => setArenaCategory("esports")}
                    className={clsx(
                      "flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                      arenaCategory === "esports"
                        ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                        : "glass text-white/50 hover:text-white border border-white/10"
                    )}
                  >
                    🎮 Esports
                  </button>
                  <button
                    onClick={() => setArenaCategory("sports")}
                    className={clsx(
                      "flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                      arenaCategory === "sports"
                        ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                        : "glass text-white/50 hover:text-white border border-white/10"
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
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-105 transition"
                          >
                            + Create My Card
                          </button>
                        </div>
                        {/* Player Profile Card (FIFA Style) */}
                        <section>
                          <h3 className="text-white font-black uppercase tracking-wider mb-3 flex items-center text-sm">
                            <Target className="mr-2 text-pink-500" size={16} /> Top Players
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {/* We will map real data here soon */}
                            {/* {realEsportsPlayers.map(player => ( ... ))} */}
                          </div>
                          <div className="text-center py-10">
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">No players yet. Create your card!</p>
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
                            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-105 transition"
                          >
                            + Create My Card
                          </button>
                        </div>
                        {/* Player Cards (Sports) */}
                        <section>
                          <h3 className="text-white font-black uppercase tracking-wider mb-3 flex items-center text-sm">
                            <Users className="mr-2 text-orange-400" size={16} /> Top Athletes
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {/* We will map real data here soon */}
                            {/* {realSportsPlayers.map(player => ( ... ))} */}
                          </div>
                          <div className="text-center py-10">
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">No athletes yet. Create your card!</p>
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
                <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/20" />

                {/* Back Button */}
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors z-20"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* College Info on Banner */}
                <div className="absolute bottom-6 left-4 right-4 flex items-center space-x-4 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                    <Building2 size={32} className="text-white" />
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
                  <p className="font-bold text-foreground">{selectedCollege.students}</p>
                  <p className="text-[10px] text-muted uppercase">Students</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{selectedCollege.posts}</p>
                  <p className="text-[10px] text-muted uppercase">Posts</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{selectedCollege.departments}</p>
                  <p className="text-[10px] text-muted uppercase">Depts</p>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(selectedCollege.id)}
                className={clsx(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95",
                  followed[selectedCollege.id]
                    ? "bg-surface-hover text-muted border border-border/50"
                    : "text-white shadow-lg shadow-opacity-20"
                )}
                style={!followed[selectedCollege.id] ? { backgroundColor: selectedCollege.accent, boxShadow: `0 10px 15px -3px ${selectedCollege.accent}30` } : {}}
              >
                {followed[selectedCollege.id] ? "Following" : "Follow"}
              </button>
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
                                    className="bg-primary text-white p-2 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
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
                            viewMode === 'cards' ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
                          )}
                        >
                          Cards
                        </button>
                        <button 
                          onClick={() => setViewMode('list')}
                          className={clsx(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                            viewMode === 'list' ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
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
                          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#0A0A0F] border border-border/50 shadow-xl px-6 py-3 rounded-full text-sm font-bold flex items-center text-foreground"
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
                                  <div className="flex-1 p-5 space-y-4 bg-[#0A0A0F] overflow-y-auto custom-scrollbar flex flex-col relative z-10">
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
                                          className="w-full py-4 gradient-bg rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-xl flex items-center justify-center space-x-2"
                                        >
                                          <MessageSquare size={16} />
                                          <span>Chat Now</span>
                                        </motion.button>
                                      ) : (
                                        <motion.button
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() => handleConnect(student)}
                                          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black text-white uppercase tracking-widest flex items-center justify-center space-x-2"
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
                                  className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
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
                          <div key={post._id || i} className="aspect-square relative group overflow-hidden bg-white/5 rounded-lg">
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
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-background z-[101] shadow-2xl flex flex-col"
            >
              <header className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
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
                      className="p-3 rounded-2xl rounded-tr-none text-sm text-white shadow-lg"
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
                    className="p-3 rounded-xl text-white shadow-lg active:scale-95 transition-all"
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
