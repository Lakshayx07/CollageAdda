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
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";


export default function ExplorePage() {
  const router = useRouter();
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [followed, setFollowed] = useState({});
  const [addedStudents, setAddedStudents] = useState({});
  const [likes, setLikes] = useState({});
  const [chatWithStudent, setChatWithStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [loading, setLoading] = useState(true);

  const [currentStudentIndices, setCurrentStudentIndices] = useState({});
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [dragX, setDragX] = useState(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const token = localStorage.getItem("collegeadda_token");
        const res = await fetch(`${apiUrl}/api/colleges`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setColleges(data);
        }
      } catch (err) {
        console.error("Error fetching colleges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, [apiUrl]);

  const fetchCollegeDetails = async (college) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/colleges/${college._id || college.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
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
        
        const autoMessage = `Hey! 👋 just connected with you on Campus Adda! Say hi back 🎓💕`;

        setChatMessages(prev => ({
          ...prev,
          [student._id || student.id]: [...(prev[student._id || student.id] || []), { text: autoMessage, time: 'now' }]
        }));

        setToastMessage("Connected successfully! They'll see your message 💕");
        toggleAddStudent(student._id || student.id);
      } catch (err) {
        console.error("Error connecting with user:", err);
      }
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage("Skipped! Next up 👀");
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
    setFollowed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAddStudent = (id) => {
    setAddedStudents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLike = (postId) => {
    setLikes(prev => ({ ...prev, [postId]: !prev[postId] }));
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
                <div className="bg-primary/20 p-2 rounded-xl">
                  <Building2 className="text-primary" size={20} />
                </div>
                <h1 className="text-xl font-bold text-foreground">Explore Colleges</h1>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Search your dream college..."
                  className="w-full bg-surface-hover border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </header>

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
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{college.emoji}</span>
                        <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">
                          {college.name}
                        </h3>
                      </div>
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
          </motion.div>
        ) : (
          /* --- COLLEGE PROFILE VIEW --- */
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col pb-20"
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
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-2xl">
                    {selectedCollege.emoji}
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
                    {selectedCollege.postsData.map(post => (
                      <div key={post.id} className="bg-surface border border-border/50 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: selectedCollege.accent }}
                          >
                            {post.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-foreground leading-none">{post.author}</p>
                            <p className="text-[10px] text-muted mt-1">{post.meta} • {post.time}</p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/90">{post.text}</p>
                        {post.image && (
                          <div className="rounded-xl overflow-hidden border border-border/50">
                            <img src={post.image} className="w-full h-auto" alt="" />
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => toggleLike(post.id)}
                              className={clsx(
                                "flex items-center space-x-1.5 transition-colors",
                                likes[post.id] ? "text-red-500" : "text-muted hover:text-foreground"
                              )}
                            >
                              <Heart size={18} fill={likes[post.id] ? "currentColor" : "none"} />
                              <span className="text-xs font-bold">{post.likes + (likes[post.id] ? 1 : 0)}</span>
                            </button>
                            <button onClick={() => { setToastMessage("Comments coming soon! 💬"); setTimeout(() => setToastMessage(null), 2000); }} className="flex items-center space-x-1.5 text-muted hover:text-foreground transition-colors">
                              <MessageSquare size={18} />
                              <span className="text-xs font-bold">12</span>
                            </button>
                          </div>
                          <button onClick={() => { setToastMessage("Share feature coming soon! 🚀"); setTimeout(() => setToastMessage(null), 2000); }} className="text-muted hover:text-foreground transition-colors">
                            <Share2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
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
                    <div className="w-full flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-foreground">
                        Discover Students
                      </h4>
                      <div className="text-[10px] text-muted font-bold bg-surface-hover px-3 py-1 rounded-full border border-border/50 shadow-sm">
                        {Math.min((currentStudentIndices[selectedCollege.id] || 0) + 1, selectedCollege.studentsData.length)} of {selectedCollege.studentsData.length}
                      </div>
                    </div>

                    {/* Toast Notification */}
                    <AnimatePresence>
                      {toastMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-surface/90 backdrop-blur-md border border-border/50 shadow-xl px-6 py-3 rounded-full text-sm font-bold flex items-center text-foreground"
                        >
                          {toastMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tinder Card Stack */}
                    <div className="relative w-full max-w-[340px] aspect-[4/5] flex items-center justify-center perspective-1000">
                      {/* Empty State */}
                      {(currentStudentIndices[selectedCollege.id] || 0) >= selectedCollege.studentsData.length && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center justify-center text-center p-6 space-y-5 bg-surface rounded-[32px] w-full h-full border border-border/50 shadow-lg"
                        >
                          <div className="text-7xl mb-2">🎓</div>
                          <h3 className="font-bold text-foreground text-xl">You've seen everyone at {selectedCollege.name}!</h3>
                          <div className="space-y-3 w-full mt-4">
                            <button onClick={() => router.push('/messages')} className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors shadow-sm">
                              See who connected back →
                            </button>
                            <button onClick={() => setSelectedCollege(null)} className="w-full py-3 bg-surface-hover border border-border/50 text-foreground font-bold rounded-xl text-sm hover:bg-surface-hover/80 transition-colors shadow-sm">
                              Explore another college →
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
                              key={student.id}
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
                                scale: isTop ? 1 : 1 - offset * 0.05,
                                y: isTop ? 0 : offset * 18,
                                zIndex: 10 - offset,
                                rotate: isTop && swipeDirection === 'right' ? 15 : isTop && swipeDirection === 'left' ? -15 : isTop ? dragX * 0.05 : 0,
                                x: isTop && swipeDirection === 'right' ? 400 : isTop && swipeDirection === 'left' ? -400 : isTop ? dragX : 0,
                                opacity: isTop && swipeDirection ? 0 : 1
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              className="absolute w-full h-full bg-surface border border-border/50 rounded-[32px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] flex flex-col cursor-grab active:cursor-grabbing"
                            >
                              {/* Stamps */}
                              {isTop && dragX > 20 && (
                                <div className="absolute top-12 left-6 z-20 rotate-[-15deg] border-4 border-green-500 text-green-500 font-black text-3xl px-4 py-1 rounded-xl uppercase tracking-widest bg-green-500/10 backdrop-blur-sm" style={{ opacity: Math.min(dragX / 100, 1) }}>
                                  CONNECT 💕
                                </div>
                              )}
                              {isTop && dragX < -20 && (
                                <div className="absolute top-12 right-6 z-20 rotate-[15deg] border-4 border-red-500 text-red-500 font-black text-3xl px-4 py-1 rounded-xl uppercase tracking-widest bg-red-500/10 backdrop-blur-sm" style={{ opacity: Math.min(Math.abs(dragX) / 100, 1) }}>
                                  SKIP 🤪
                                </div>
                              )}

                              {/* Student Profile Photo Area */}
                              <div className="relative h-[50%] w-full bg-muted pointer-events-none">
                                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                              </div>

                              {/* Details Area */}
                              <div className="flex-1 p-5 space-y-4 bg-surface overflow-y-auto pointer-events-none flex flex-col">
                                <div>
                                  <h2 className="text-2xl font-black text-foreground flex items-center gap-2 tracking-tight">
                                    {student.name}, {student.age}
                                    {student.verified && <span className="text-blue-500 text-xl">✅</span>}
                                  </h2>
                                  <div className="flex flex-col mt-2 space-y-1.5">
                                    <div className="flex items-center text-foreground/90 text-[13px] font-semibold">
                                      🎓 {student.course} • {student.year}
                                    </div>
                                    <div className="flex items-center text-foreground/80 text-[12px] font-medium">
                                      🏫 {selectedCollege.name}
                                    </div>
                                    <div className="flex items-center text-foreground/80 text-[12px] font-medium">
                                      📍 {student.location || selectedCollege.location}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2.5">Interests</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {student.interests.map(interest => (
                                      <span key={interest} className="px-3 py-1.5 bg-surface-hover border border-border/50 rounded-lg text-[11px] font-bold text-foreground shadow-sm">
                                        {interest}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="pt-2 mt-auto">
                                  <p className="text-[13px] text-foreground/80 italic leading-relaxed font-medium bg-surface-hover p-3 rounded-xl border border-border/50">
                                    "{student.bio}"
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        }).reverse()}
                      </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    {(currentStudentIndices[selectedCollege.id] || 0) < selectedCollege.studentsData.length && (
                      <div className="flex items-center justify-center space-x-8 mt-8 w-full">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSwipe(selectedCollege.id, 'left', selectedCollege.studentsData[currentStudentIndices[selectedCollege.id] || 0])}
                          className="w-[70px] h-[70px] rounded-full bg-surface border-2 border-orange-500/20 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-shadow"
                        >
                          🤪
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSwipe(selectedCollege.id, 'right', selectedCollege.studentsData[currentStudentIndices[selectedCollege.id] || 0])}
                          className="w-[84px] h-[84px] rounded-full bg-surface border-2 border-pink-500/20 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(236,72,153,0.2)] hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] transition-shadow"
                        >
                          💕
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
                    className="flex flex-col items-center justify-center py-20 text-muted w-full"
                  >
                    <Bookmark size={48} className="mb-4 opacity-20" />
                    <p>No campus memories shared yet. Be the first!</p>
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
