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
  Bookmark,
  Send
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
      { id: 101, name: "Arjun Khanna", age: 20, course: "BBA", year: "2nd Year", avatar: "AK", verified: true, interests: ["🎸 Music", "💻 Coding", "📸 Photography"], instagram: "@arjun.khanna", bio: "Looking for study buddies and chai pe charcha 😄", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80" },
      { id: 102, name: "Sneha Reddy", age: 21, course: "LLM", year: "Final Year", avatar: "SR", verified: false, interests: ["📚 Reading", "☕ Coffee", "✈️ Travel"], instagram: "@sneha.reads", bio: "Always found in the library. Let's debate!", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80" },
      { id: 103, name: "Kabir Das", age: 19, course: "Psychology", year: "3rd Year", avatar: "KD", verified: true, interests: ["🎨 Art", "🧘‍♂️ Meditation", "🌱 Nature"], instagram: "@kabir.mind", bio: "Analyzing minds and painting sunsets.", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&q=80" },
      { id: 104, name: "Priya Sharma", age: 20, course: "Global Affairs", year: "2nd Year", avatar: "PS", verified: true, interests: ["🌍 Politics", "🗣️ Debating", "🎾 Tennis"], instagram: "@priya.global", bio: "Future diplomat. Catch me on the tennis court.", photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80" },
      { id: 105, name: "Rohan Verma", age: 22, course: "MBA", year: "1st Year", avatar: "RV", verified: false, interests: ["📈 Finance", "🚗 Cars", "🏋️ Fitness"], instagram: "@rohan_invests", bio: "Building the next big thing. Let's network.", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80" }
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
      { id: 201, name: "Rohan Mehra", age: 19, course: "B.Com", year: "1st Year", avatar: "RM", verified: false, interests: ["🏏 Cricket", "🎬 K-Drama", "🍕 Foodie"], instagram: "@rohan.du", bio: "First year surviving on momos and dreams.", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80" },
      { id: 202, name: "Ananya Jha", age: 21, course: "MA English", year: "1st Year", avatar: "AJ", verified: true, interests: ["📖 Poetry", "🎸 Indie Music", "☕ Chai"], instagram: "@ananya.writes", bio: "Finding poetry in the chaos of North Campus.", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80" },
      { id: 203, name: "Vicky Kaushal", age: 20, course: "Physics", year: "2nd Year", avatar: "VK", verified: true, interests: ["🌌 Astronomy", "💻 Coding", "🎮 Gaming"], instagram: "@vicky.astro", bio: "Trying to understand the universe and my syllabus.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80" },
      { id: 204, name: "Neha Singh", age: 19, course: "History", year: "2nd Year", avatar: "NS", verified: false, interests: ["🏛️ Museums", "📷 Photography", "✈️ Travel"], instagram: "@neha.hist", bio: "Living in the past, capturing the present.", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80" },
      { id: 205, name: "Amit Kumar", age: 21, course: "Economics", year: "3rd Year", avatar: "AK", verified: true, interests: ["📊 Data", "💼 Startups", "🏃 Running"], instagram: "@amit.eco", bio: "Economics by day, startup hustler by night.", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80" }
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
      { id: 301, name: "Saurabh Jain", age: 23, course: "M.Tech CSE", year: "1st Year", avatar: "SJ", verified: true, interests: ["🤖 AI", "💻 Coding", "🎮 Gaming"], instagram: "@saurabh.ai", bio: "Training models and drinking red bull.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80" },
      { id: 302, name: "Tanmay Singh", age: 20, course: "B.Tech ME", year: "3rd Year", avatar: "TS", verified: false, interests: ["🏎️ Formula 1", "🎸 Guitar", "📸 Photography"], instagram: "@tanmay.mech", bio: "Building robots and breaking hearts.", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80" },
      { id: 303, name: "Ridhi Dogra", age: 25, course: "PhD Physics", year: "2nd Year", avatar: "RD", verified: true, interests: ["🌌 Astronomy", "📚 Reading", "☕ Coffee"], instagram: "@ridhi.physics", bio: "Lost in quantum mechanics.", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80" },
      { id: 304, name: "Ankit Patel", age: 19, course: "B.Tech EE", year: "2nd Year", avatar: "AP", verified: true, interests: ["⚡ Electronics", "🏏 Cricket", "🍿 Movies"], instagram: "@ankit.ee", bio: "Shockingly good at circuits.", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80" },
      { id: 305, name: "Meera Reddy", age: 21, course: "B.Tech CE", year: "4th Year", avatar: "MR", verified: false, interests: ["🏗️ Design", "🎨 Art", "✈️ Travel"], instagram: "@meera.civil", bio: "Building bridges, literally.", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80" }
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
      { id: 401, name: "Omar Farooq", age: 21, course: "Journalism", year: "Final Year", avatar: "OF", verified: true, interests: ["📰 News", "📸 Photography", "🗣️ Debating"], instagram: "@omar.reports", bio: "Seeking truth and good biryani.", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80" },
      { id: 402, name: "Farah Naaz", age: 20, course: "B.Arch", year: "3rd Year", avatar: "FN", verified: true, interests: ["🏛️ Architecture", "🎨 Art", "☕ Coffee"], instagram: "@farah.designs", bio: "Designing spaces and sketching faces.", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80" },
      { id: 403, name: "Yusuf Malik", age: 19, course: "Law", year: "1st Year", avatar: "YM", verified: false, interests: ["⚖️ Law", "📚 Reading", "⚽ Football"], instagram: "@yusuf.law", bio: "Future Chief Justice. Probably.", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80" },
      { id: 404, name: "Aisha Khan", age: 22, course: "Fine Arts", year: "MFA 1st Year", avatar: "AK", verified: true, interests: ["🎨 Painting", "🎸 Indie Music", "🌿 Nature"], instagram: "@aisha.art", bio: "Living life in watercolors.", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80" },
      { id: 405, name: "Zain Ali", age: 20, course: "BBA", year: "2nd Year", avatar: "ZA", verified: false, interests: ["💼 Business", "📱 Tech", "🎮 Gaming"], instagram: "@zain.hustles", bio: "Entrepreneur in the making.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80" }
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
      { id: 501, name: "Varun Dhawan", age: 21, course: "Marketing", year: "3rd Year", avatar: "VD", verified: true, interests: ["📈 Marketing", "🎬 Movies", "🏋️ Fitness"], instagram: "@varun.markets", bio: "Pitching ideas and lifting weights.", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80" },
      { id: 502, name: "Alia Bhatt", age: 20, course: "Journalism", year: "2nd Year", avatar: "AB", verified: true, interests: ["📰 News", "👗 Fashion", "☕ Coffee"], instagram: "@alia.scoop", bio: "Always looking for the next big story.", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80" },
      { id: 503, name: "Sidharth M", age: 22, course: "Law", year: "Final Year", avatar: "SM", verified: false, interests: ["⚖️ Law", "🚗 Cars", "🏏 Cricket"], instagram: "@sid.legal", bio: "Objection, hearsay! Just kidding, let's play cricket.", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80" },
      { id: 504, name: "Tara Sutaria", age: 19, course: "Fashion Design", year: "1st Year", avatar: "TS", verified: true, interests: ["👗 Fashion", "🎵 Music", "✈️ Travel"], instagram: "@tara.styles", bio: "Designing dreams and singing songs.", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80" },
      { id: 505, name: "Tiger Shroff", age: 21, course: "B.P.Ed", year: "3rd Year", avatar: "TS", verified: true, interests: ["🥋 Martial Arts", "🏋️ Fitness", "🕺 Dance"], instagram: "@tiger.moves", bio: "Flipping through college life.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80" }
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
  const [chatWithStudent, setChatWithStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  
  const [currentStudentIndices, setCurrentStudentIndices] = useState({});
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [dragX, setDragX] = useState(0);

  const handleSwipe = (collegeId, direction, student) => {
    setSwipeDirection(direction);
    
    if (direction === 'right') {
      const autoMessage = "Hey! 👋 Lakshay from Rishihood University just connected with you on Campus Adda! Say hi back 🎓💗";
      
      setChatMessages(prev => ({
        ...prev,
        [student.id]: [...(prev[student.id] || []), { text: autoMessage, time: 'now' }]
      }));
      
      setToastMessage("Friend request sent! They'll see your message 💗");
      toggleAddStudent(student.id);
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
                            <button className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors shadow-sm">
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
                                  CONNECT 💗
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
                          💗
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
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { type: "image", url: "https://images.unsplash.com/photo-1523050335456-c38a7047d28c?w=400&q=80", label: "Sunset Vibes" },
                      { type: "image", url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80", label: "Library Session" },
                      { type: "image", url: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&q=80", label: "Campus Day" },
                      { type: "image", url: "https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=400&q=80", label: "Hackathon Night" },
                    ].map((memory, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer">
                        <img src={memory.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-2 left-2 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {memory.label}
                        </div>
                      </div>
                    ))}
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
