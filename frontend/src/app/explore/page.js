"use client";
import { useState, useMemo } from "react";
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
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const COLLEGES = [
  {
    id: "opjgu",
    name: "O.P. Jindal Global University",
    location: "Sonipat, Haryana",
    students: "10,000+",
    posts: 420,
    departments: 12,
    emoji: "⚖️",
    accent: "#6366f1", // Indigo
    banner: "https://media.collegedekho.com/media/img/institute/crawled_images/None/op-jindal-global-university-.jpg",
    postsData: [
      { id: 1, author: "Rahul Singh", meta: "B.A. LL.B (Hons) • 3rd Year", time: "2h ago", text: "The Moot Court competition today was intense! Glad to have made it to the semi-finals. #LawLife #OPJGU", likes: 24, liked: false },
      { id: 2, author: "Ishita Rao", meta: "Global Affairs • 1st Year", time: "5h ago", text: "Sunset at the JGU campus is something else. ❤️", likes: 56, liked: true, image: "https://images.unsplash.com/photo-1523050335456-c38a7047d28c?w=500&q=80" },
    ],
    studentsData: [
      { id: 101, name: "Arjun Khanna", course: "BBA • 2nd Year", avatar: "AK" },
      { id: 102, name: "Sneha Reddy", course: "LLM • Final Year", avatar: "SR" },
      { id: 103, name: "Kabir Das", course: "Psychology • 3rd Year", avatar: "KD" },
    ]
  },
  {
    id: "du",
    name: "Delhi University",
    location: "New Delhi, Delhi",
    students: "700,000+",
    posts: "15k+",
    departments: 80,
    emoji: "📜",
    accent: "#ec4899", // Pink
    banner: "https://blog.oureducation.in/wp-content/uploads/2013/03/Delhi_University2.jpg",
    postsData: [
      { id: 3, author: "Amit Sharma", meta: "SRCC • Eco Hons", time: "1h ago", text: "SRCC fest vibes are unmatched. #Crossroads #DU", likes: 120, liked: false },
      { id: 4, author: "Priya Verma", meta: "Miranda House • History", time: "3h ago", text: "North Campus library is my second home now. 📚", likes: 89, liked: false },
    ],
    studentsData: [
      { id: 201, name: "Rohan Mehra", course: "B.Com • 1st Year", avatar: "RM" },
      { id: 202, name: "Ananya Jha", course: "MA English", avatar: "AJ" },
      { id: 203, name: "Vicky Kaushal", course: "Physics • 2nd Year", avatar: "VK" },
    ]
  },
  {
    id: "iitd",
    name: "IIT Delhi",
    location: "Hauz Khas, Delhi",
    students: "11,000+",
    posts: "5k+",
    departments: 19,
    emoji: "⚙️",
    accent: "#3b82f6", // Blue
    banner: "https://home.iitd.ac.in/images/for-faculty/camp8.jpg",
    postsData: [
      { id: 5, author: "Vikram Gupta", meta: "CSE • 4th Year", time: "30m ago", text: "Placement season is finally over! Off to Google. 🚀 #IITD #LifeAtIIT", likes: 450, liked: true },
      { id: 6, author: "Neha Soni", meta: "EE • 2nd Year", time: "4h ago", text: "Lab reports are the death of me. Anyone up for a coffee at SDA?", likes: 34, liked: false },
    ],
    studentsData: [
      { id: 301, name: "Saurabh Jain", course: "M.Tech CSE", avatar: "SJ" },
      { id: 302, name: "Tanmay Singh", course: "B.Tech ME", avatar: "TS" },
      { id: 303, name: "Ridhi Dogra", course: "PhD Physics", avatar: "RD" },
    ]
  },
  {
    id: "jmi",
    name: "Jamia Millia Islamia",
    location: "Jamia Nagar, Delhi",
    students: "20,000+",
    posts: "2.4k",
    departments: 35,
    emoji: "🕌",
    accent: "#10b981", // Emerald
    banner: "https://cache.careers360.mobi/media/article_images/2025/7/1/jamia-millia-islamia-set-up-department-of-library-and-information-science-featured-image.jpg",
    postsData: [
      { id: 7, author: "Zaid Khan", meta: "Mass Comm • Final Year", time: "1h ago", text: "The new documentary screening at MCRC was eye-opening.", likes: 45, liked: false },
      { id: 8, author: "Sana Ahmed", meta: "Fine Arts • 2nd Year", time: "6h ago", text: "Painting the central canteen walls today! Stop by to see the progress. 🎨", likes: 67, liked: true },
    ],
    studentsData: [
      { id: 401, name: "Omar Farooq", course: "Journalism", avatar: "OF" },
      { id: 402, name: "Farah Naaz", course: "B.Arch", avatar: "FN" },
      { id: 403, name: "Yusuf Malik", course: "Law • 1st Year", avatar: "YM" },
    ]
  },
  {
    id: "amity",
    name: "Amity University",
    location: "Noida, UP",
    students: "150,000+",
    posts: "8k+",
    departments: 50,
    emoji: "🌟",
    accent: "#f59e0b", // Amber
    banner: "https://www.amity.edu/lucknow/images/university.jpg",
    postsData: [
      { id: 9, author: "Karan Johar", meta: "BBA • 2nd Year", time: "45m ago", text: "Amity Noida campus is a whole vibe today. ✨", likes: 21, liked: false },
      { id: 10, author: "Shanaya Roy", meta: "Fashion Design • 1st Year", time: "2h ago", text: "Portfolio submissions are finally done! Pizza party? 🍕", likes: 43, liked: false },
    ],
    studentsData: [
      { id: 501, name: "Varun Dhawan", course: "Marketing", avatar: "VD" },
      { id: 502, name: "Alia Bhatt", course: "Journalism", avatar: "AB" },
      { id: 503, name: "Sidharth M", course: "Law", avatar: "SM" },
    ]
  }
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [followed, setFollowed] = useState({});
  const [addedStudents, setAddedStudents] = useState({});
  const [likes, setLikes] = useState({});

  const filteredColleges = useMemo(() => {
    return COLLEGES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

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
              {filteredColleges.map(college => (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={college.id}
                  onClick={() => setSelectedCollege(college)}
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
                        Visit Me
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
              {["posts", "students"].map(tab => (
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
                {activeTab === "posts" ? (
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
                            <button className="flex items-center space-x-1.5 text-muted hover:text-foreground transition-colors">
                              <MessageSquare size={18} />
                              <span className="text-xs font-bold">12</span>
                            </button>
                          </div>
                          <button className="text-muted hover:text-foreground transition-colors">
                            <Share2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="students"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {selectedCollege.studentsData.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-surface-hover rounded-2xl border border-border/20">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">
                            {student.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{student.name}</p>
                            <p className="text-[10px] text-muted uppercase">{student.course}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleAddStudent(student.id)}
                          className={clsx(
                            "flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                            addedStudents[student.id]
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : "text-white"
                          )}
                          style={!addedStudents[student.id] ? { backgroundColor: selectedCollege.accent } : {}}
                        >
                          {addedStudents[student.id] ? (
                            <><Check size={14} /> <span>Added ✓</span></>
                          ) : (
                            <><Plus size={14} /> <span>Add</span></>
                          )}
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
