import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Check, MessageSquare, GraduationCap, MapPin, Users } from 'lucide-react';
import AppShell from '../components/AppShell';
import { useToast, ToastContainer } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DUMMY_STUDENTS = [
  { id: 1, name: 'Aarav Sharma', university: 'Rishihood University', program: 'B.Tech Computer Science', avatar: 'Aarav', mutual: 12, following: false, followerCount: 145, followingCount: 89 },
  { id: 2, name: 'Priya Patel', university: 'Rishihood University', program: 'BBA', avatar: 'Priya', mutual: 5, following: true, followerCount: 230, followingCount: 120 },
  { id: 3, name: 'Rohan Gupta', university: 'OP Jindal Global', program: 'LL.B Law', avatar: 'Rohan', mutual: 2, following: false, followerCount: 95, followingCount: 45 },
  { id: 4, name: 'Neha Joshi', university: 'Delhi University', program: 'B.A. Economics', avatar: 'Neha', mutual: 8, following: false, followerCount: 310, followingCount: 180 },
  { id: 5, name: 'Kabir Singh', university: 'IIT Delhi', program: 'M.Tech AI', avatar: 'Kabir', mutual: 24, following: true, followerCount: 520, followingCount: 210 },
  { id: 6, name: 'Aditi Verma', university: 'Rishihood University', program: 'B.Des', avatar: 'Aditi', mutual: 1, following: false, followerCount: 67, followingCount: 30 },
  { id: 7, name: 'Vihaan Kumar', university: 'Jamia Millia Islamia', program: 'Mass Communication', avatar: 'Vihaan', mutual: 0, following: false, followerCount: 22, followingCount: 15 },
  { id: 8, name: 'Siya Rajput', university: 'OP Jindal Global', program: 'BBA Finance', avatar: 'Siya', mutual: 15, following: false, followerCount: 188, followingCount: 92 },
];

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Discover');
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('collageadda_students_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DUMMY_STUDENTS;
      }
    }
    return DUMMY_STUDENTS;
  });
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // Filter students based on search (name or university) and tab
  const filteredStudents = useMemo(() => {
    let filtered = students;
    
    // Process search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.university.toLowerCase().includes(q) ||
        s.program.toLowerCase().includes(q)
      );
    }

    // Process tabs
    if (activeTab === 'My Friends') {
      filtered = filtered.filter(s => s.following);
    }

    return filtered;
  }, [students, searchQuery, activeTab]);

  const toggleFollow = (id, name, isCurrentlyFollowing) => {
    setStudents(prev => {
      const newList = prev.map(s => {
        if (s.id === id) {
          return { 
            ...s, 
            following: !s.following,
            followerCount: s.following ? s.followerCount - 1 : s.followerCount + 1 
          };
        }
        return s;
      });
      localStorage.setItem('collageadda_students_list', JSON.stringify(newList));
      return newList;
    });

    // Update current user's following count
    const currentFollowing = user?.followingCount || 190;
    updateUser({ followingCount: isCurrentlyFollowing ? currentFollowing - 1 : currentFollowing + 1 });

    if (isCurrentlyFollowing) {
      showToast(`Unfollowed ${name}`, 'info');
    } else {
      showToast(`You are now following ${name}! 🎉`, 'success');
    }
  };

  const handleMessage = (name, avatar) => {
    showToast(`Opening secure chat with ${name}...`, 'info');
    setTimeout(() => {
      navigate('/chat', { state: { privateChatUser: name, privateChatAvatar: avatar } });
    }, 800);
  };

  return (
    <AppShell>
      <ToastContainer />
      <div className="min-h-screen pb-24 md:pb-8">
        {/* Header */}
        <header className="glass sticky top-0 z-40 border-b border-gray-800 px-4 md:px-8 py-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-2">
                <Users className="text-blue-500" size={24} />
                Network Hub
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Find peers across universities. 🌍</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, college, or program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark/60 border border-gray-700/50 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
              />
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-dark rounded-xl p-1 border border-gray-800 w-full max-w-sm mx-auto md:mx-0">
            {['Discover', 'My Friends'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredStudents.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="col-span-full py-16 text-center"
                >
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-500" size={24} />
                  </div>
                  <h3 className="text-gray-300 font-medium mb-1">No students found</h3>
                  <p className="text-sm text-gray-500">Try adjusting your search terms or college name.</p>
                </motion.div>
              ) : (
                filteredStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    layoutTracker
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="glass rounded-2xl border border-gray-800/60 p-5 hover:border-gray-700 transition-colors group flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={`https://i.pravatar.cc/150?u=${student.avatar}`} 
                          alt={student.name} 
                          className="w-14 h-14 rounded-full border-2 border-gray-800 object-cover"
                        />
                        <div>
                          <h3 className="font-bold text-white text-[15px] group-hover:text-blue-400 transition-colors">{student.name}</h3>
                          <div className="flex items-center text-xs text-gray-400 mt-0.5 space-x-1">
                            <GraduationCap size={12} className="text-indigo-400" />
                            <span>{student.program}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-5 space-y-1.5 flex-1">
                      <div className="flex items-center text-xs text-gray-400 space-x-1.5 bg-gray-800/30 w-fit px-2.5 py-1 rounded-md">
                        <MapPin size={12} className="text-blue-400" />
                        <span>{student.university}</span>
                      </div>
                      <div className="flex items-center space-x-4 px-1 pt-1.5">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white font-bold">{student.followerCount}</span>
                          <span className="text-[9px] text-gray-500 uppercase">Followers</span>
                        </div>
                        <div className="flex flex-col border-l border-gray-800 pl-4">
                          <span className="text-[10px] text-white font-bold">{student.followingCount}</span>
                          <span className="text-[9px] text-gray-500 uppercase">Following</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-800/80">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleFollow(student.id, student.name, student.following)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all
                          ${student.following 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30'}`}
                      >
                        {student.following ? <Check size={14} /> : <UserPlus size={14} />}
                        <span>{student.following ? 'Following' : 'Connect'}</span>
                      </motion.button>
                      
                      {student.following && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMessage(student.name, student.avatar)}
                          className="p-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <MessageSquare size={16} />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
