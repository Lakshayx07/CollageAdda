"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, X, Check, Plus, Flame, TrendingUp, Search, Zap, BarChart2, Compass, Trophy, ShieldCheck, Flag, Globe, GraduationCap } from "lucide-react";
import Image from "next/image";
import NotificationBell from "../components/NotificationBell";
import VerifiedBadge from "../components/VerifiedBadge";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();

  const [friendsList, setFriendsList] = useState([]);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});
  const [shareModal, setShareModal] = useState(null);
  const [postMenu, setPostMenu] = useState(null);
  const [shareSearchTerm, setShareSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState('none');
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeStory, setActiveStory] = useState(null);
  const [hoveredPost, setHoveredPost] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [confessionText, setConfessionText] = useState("");
  const [confessions, setConfessions] = useState([]);
  const [confessionCommentInputs, setConfessionCommentInputs] = useState({});
  const [confessionScope, setConfessionScope] = useState('local'); // 'local' | 'global'
  const [placeholderText, setPlaceholderText] = useState(() => {
    const prompts = [
      "What is the unwritten rule of the night canteen?",
      "Wrong answers only: why was the professor late today?",
      "Best nap spot on campus nobody talks about?",
      "Hot take: which campus building should be demolished first?",
      "Describe your department in three words (be honest).",
      "Name a campus trend that needs to die immediately.",
      "What does the library WiFi password symbolize about this place?"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  });
  const [selectedGradient, setSelectedGradient] = useState("from-orange-500 via-rose-500 to-purple-600");
  const [dailyCampusDrop, setDailyCampusDrop] = useState([]);
  const [currentDropIndex, setCurrentDropIndex] = useState(0);
  const [collegeLeaderboard, setCollegeLeaderboard] = useState([]);

  const filteredPosts = posts.filter(post => {
    if (!selectedTopic) return true;
    return post.content.toLowerCase().includes(selectedTopic.toLowerCase());
  });

  const isTextTooShort = newPostContent.trim().length > 0 && newPostContent.trim().length < 10 && !selectedMedia;
  
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').trim();
  
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const trendingTopics = [
    { name: "Tech Fest 2024", icon: <Flame size={14} className="text-orange-500" /> },
    { name: "Exam Season", icon: <TrendingUp size={14} className="text-blue-400" /> },
    { name: "Campus Elections", icon: <TrendingUp size={14} className="text-purple-400" /> },
    { name: "Night Canteen", icon: <Flame size={14} className="text-yellow-500" /> },
    { name: "Sports Meet", icon: <Zap size={14} className="text-green-400" /> },
    { name: "Hackathon", icon: <Search size={14} className="text-cyan-400" /> }
  ];

  useEffect(() => {
    const token = localStorage.getItem("collegeadda_token");
    if (!token) {
      router.push("/login");
    } else {
      const u = JSON.parse(localStorage.getItem('collegeadda_user') || '{}');
      setCurrentUser(u);

      // Sync user profile from backend
      const fetchLatestProfile = async () => {
        try {
          const res = await fetch(`${apiUrl}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const profileData = await res.json();
            setCurrentUser(profileData);
            localStorage.setItem('collegeadda_user', JSON.stringify(profileData));
          }
        } catch (err) {
          console.error("Error syncing profile:", err);
        }
      };
      fetchLatestProfile();

      fetchPosts();
      fetchFriends();
      fetchStories();
      fetchLeaderboard();
      fetchDailyCampusDrop();
      fetchConfessions();
    }
  }, [router]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const user = JSON.parse(localStorage.getItem('collegeadda_user') || '{}');
        const formatted = data.map(p => ({
          id: p._id,
          author: p.author?.name || 'Unknown',
          authorId: p.author?._id,
          university: p.university,
          avatar: p.author?.profilePic
            ? p.author.profilePic
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.author?.name || 'U')}&background=7C3AED&color=fff`,
          time: new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          content: p.content,
          likes: p.likes?.length || 0,
          isLiked: p.likes?.includes(user._id || user.id),
          comments: p.comments?.length || 0,
          commentsList: p.comments?.map(c => ({
            id: c._id || Math.random().toString(),
            author: c.user?.name || 'Student',
            text: c.text
          })) || [],
          mediaUrl: p.mediaUrl,
          mediaType: p.mediaType,
          poll: p.poll,
          authorFollowers: p.author?.followers || [],
          authorFollowing: p.author?.following || []
        }));
        setPosts(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/users/me/following`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFriendsList(data.map(u => ({
          id: u._id,
          name: u.name,
          avatar: u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7C3AED&color=fff`
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/stories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const grouped = data.reduce((acc, story) => {
          const authorId = story.author._id || story.author.id;
          if (!acc[authorId]) {
            acc[authorId] = {
              author: story.author,
              stories: []
            };
          }
          acc[authorId].stories.push(story);
          return acc;
        }, {});
        setStories(Object.values(grouped));
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/users/leaderboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCollegeLeaderboard(data.map(item => ({
          college: item._id || "Unknown University",
          score: item.score || 0,
          verifiedCount: item.verifiedCount || 0,
          totalHeat: item.totalHeat || 0,
        })));
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  const fetchDailyCampusDrop = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/users/search/query`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const me = JSON.parse(localStorage.getItem('collegeadda_user') || '{}');
        const others = data.filter(u => u._id !== (me._id || me.id));
        const colors = [
          "from-cyan-500 to-blue-600",
          "from-fuchsia-500 to-purple-600",
          "from-orange-400 to-rose-500"
        ];
        setDailyCampusDrop(others.slice(0, 3).map((u, idx) => ({
          name: u.name,
          college: u.university || "Campus Member",
          vibe: (u.interests && u.interests.length > 0)
            ? u.interests.slice(0, 3).join(', ')
            : (u.bio || "No bio added yet"),
          match: u.year ? `Year ${u.year}` : "New Connect",
          color: colors[idx % colors.length]
        })));
      }
    } catch (err) {
      console.error("Error fetching campus drop:", err);
    }
  };

  const fetchConfessions = async (scope = 'local') => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/confessions?scope=${scope}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConfessions(data);
      }
    } catch (err) {
      console.error("Error fetching confessions:", err);
    }
  };

  const reportConfession = async (id) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/confessions/${id}/report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setToastMsg("Reported. Thanks for keeping campus safe 🛡️");
        setTimeout(() => setToastMsg(""), 3000);
        fetchConfessions(confessionScope);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateConfession = async () => {
    if (!confessionText.trim()) return;
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/confessions`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: confessionText.trim(), gradient: selectedGradient })
      });
      if (res.ok) {
        const newConfession = await res.json();
        setConfessions(prev => [newConfession, ...prev]);
        setConfessionText("");
        setToastMsg("Confession dropped!");
        setTimeout(() => setToastMsg(""), 2000);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to drop confession");
      }
    } catch (err) {
      console.error(err);
      alert("Error dropping confession");
    }
  };

  const toggleLikeConfession = async (id) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/confessions/${id}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchConfessions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentConfession = async (id) => {
    const text = confessionCommentInputs[id];
    if (!text?.trim()) return;
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/confessions/${id}/comment`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        setConfessionCommentInputs(prev => ({ ...prev, [id]: "" }));
        fetchConfessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMediaSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedMedia(reader.result);
      setMediaType(type);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && !selectedMedia) || isPosting || isTextTooShort) return;
    setIsPosting(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl.trim()}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          content: newPostContent,
          mediaUrl: selectedMedia || '',
          mediaType: mediaType
        })
      });
      if (res.ok) {
        fetchPosts();
        setNewPostContent("");
        setSelectedMedia(null);
        setMediaType('none');
        setToastMsg("Post created!");
        setTimeout(() => setToastMsg(""), 2000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || "Failed to create post. Please try again.");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Network error: Could not connect to the backend server. Please make sure the backend is running at " + apiUrl);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2 || isPosting) return;
    setIsPosting(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          content: pollQuestion,
          poll: {
            question: pollQuestion,
            options: pollOptions.filter(opt => opt.trim()).map(text => ({ text, votes: [] })),
            allowMultiple: pollAllowMultiple
          }
        })
      });
      if (res.ok) {
        fetchPosts();
        setShowPollModal(false);
        setPollQuestion("");
        setPollOptions(["", ""]);
        setPollAllowMultiple(false);
        setToastMsg("Poll created!");
        setTimeout(() => setToastMsg(""), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleVote = async (postId, optionIndex) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ optionIndex })
      });
      if (res.ok) {
        const updatedPoll = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, poll: updatedPoll } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: [...(post.commentsList || []), { id: Date.now(), author: "You", text }]
          };
        }
        return post;
      })
    );
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));

    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (postId) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          const isCurrentlyLiked = post.isLiked;
          return {
            ...post,
            isLiked: !isCurrentlyLiked,
            likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );
    
    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        setToastMsg("Post deleted");
        setTimeout(() => setToastMsg(""), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportPost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setToastMsg("Post reported and hidden");
    setTimeout(() => setToastMsg(""), 2000);
  };

  const handleHidePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setToastMsg("Post hidden");
    setTimeout(() => setToastMsg(""), 2000);
  };

  const handleShareToFriend = async (friendId, postId) => {
    const postToShare = posts.find(p => p.id === postId);
    if (!postToShare) return;

    try {
      const token = localStorage.getItem("collegeadda_token");
      // 1. Get or create private room
      const roomRes = await fetch(`${apiUrl}/api/chat/rooms`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: friendId, isGroup: false })
      });
      
      if (!roomRes.ok) return;
      const room = await roomRes.json();

      // 2. Send message
      let messageText = `Check out this post by ${postToShare.author}: ${postToShare.content || ""}`;
      
      await fetch(`${apiUrl}/api/chat/rooms/${room._id}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: messageText,
          mediaUrl: postToShare.mediaUrl || '',
          mediaType: postToShare.mediaType || 'none'
        })
      });

      setShareModal(null);
      setToastMsg("Post shared successfully!");
      setTimeout(() => setToastMsg(""), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-transparent pb-[90px] lg:pb-0">
      <header className="sticky top-0 z-40 border-b app-divider bg-[rgba(11,15,23,0.78)] px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/78">
              Campus pulse
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
              Campus Adda
            </h1>
          </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/explore')}
            className="rounded-2xl border border-white/8 bg-white/[0.04] p-2.5 text-white/70 transition-colors hover:bg-white/[0.08]"
          >
            <Search size={22} />
          </button>
          <NotificationBell />
          <div 
            onClick={() => router.push('/profile')}
            className="brand-mark h-10 w-10 cursor-pointer rounded-2xl p-[2px] transition-transform hover:scale-105"
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[0.95rem] bg-[#0F1420]">
              {currentUser?.profilePic ? (
                <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="Me" />
              ) : (
                <span className="text-sm font-bold">{currentUser?.name?.charAt(0) || "U"}</span>
              )}
            </div>
          </div>
        </div>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-3 py-4 sm:p-6"
      >
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-7 sm:space-y-8">
        <section className="app-panel min-w-0 max-w-full rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-5 space-y-3">
          <div className="no-scrollbar flex max-w-full space-x-4 overflow-x-auto py-2 sm:space-x-5">
            {/* Your Story */}
            <div 
              className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer group"
              onClick={() => router.push('/profile')}
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full p-[3px] bg-white/10 group-hover:bg-white/20 transition-all">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border border-white/5">
                     {currentUser?.profilePic ? (
                       <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="You" />
                     ) : (
                       <span className="text-2xl font-bold text-white/50">{currentUser?.name?.charAt(0) || "Y"}</span>
                     )}
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 w-6 h-6 gradient-bg rounded-full border-2 border-[#0A0A0F] flex items-center justify-center text-white shadow-lg">
                  <Plus size={14} strokeWidth={3} />
                </div>
              </div>
              <span className="text-xs text-white/60 font-medium">Your Story</span>
            </div>

            {/* Others' Stories */}
            {stories.map((group) => (
              <motion.div 
                key={group.author._id} 
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
                onClick={() => setActiveStory(group)}
              >
                <div className="w-20 h-20 rounded-full p-[3px] gradient-bg animate-rotate-gradient">
                  <div className="w-full h-full rounded-full bg-background p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#1A1A1F] flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                      <img 
                        src={group.author.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.author.name)}&background=7C3AED&color=fff`} 
                        className="w-full h-full object-cover" 
                        alt={group.author.name} 
                      />
                    </div>
                  </div>
                </div>
                <span className="text-xs text-white/80 font-medium truncate w-20 text-center">{group.author.name.split(' ')[0]}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid min-w-0 gap-6 grid-cols-1 lg:grid-cols-[0.4fr_0.6fr] items-stretch">
          {/* Daily Campus Drop Slider */}
          <div className="app-panel h-full flex flex-col min-w-0 rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-5 relative">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Daily Campus Drop</p>
                <h2 className="mt-1 text-[clamp(1.1rem,3vw,1.25rem)] font-black tracking-tight text-white">People worth knowing today</h2>
              </div>
              <button
                onClick={() => router.push('/explore')}
                className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white/70 hover:bg-white/[0.08] transition-colors"
              >
                Explore
              </button>
            </div>
            
            <div className="relative overflow-hidden w-full flex-1 flex flex-col justify-center">
              {dailyCampusDrop.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-white/10 py-10 text-center">
                  <p className="text-xs font-bold text-white/30">No other students found yet.</p>
                  <p className="mt-1 text-[10px] text-white/20">Connections will appear as more students join.</p>
                </div>
              ) : (
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentDropIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="w-full"
                    >
                      {(() => {
                        const student = dailyCampusDrop[currentDropIndex];
                        return (
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-5 transition-all hover:border-white/20 hover:bg-white/[0.05]">
                            
                            <div className={`shrink-0 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${student.color} text-2xl font-black text-white shadow-lg`}>
                              {student.name.charAt(0)}
                            </div>
                            
                            <div className="flex-1 min-w-0 text-center sm:text-left flex flex-col justify-center h-full">
                              <h3 className="text-[clamp(1.2rem,4vw,1.5rem)] font-black text-white leading-tight truncate w-full">
                                {student.name}
                              </h3>
                              <p className="text-[clamp(0.75rem,2vw,0.85rem)] font-bold text-white/45 truncate w-full mt-1">
                                {student.college}
                              </p>
                              
                              <div className="mt-3 bg-white/5 border border-white/5 rounded-xl p-3">
                                <p className="text-[clamp(0.8rem,2vw,0.9rem)] leading-relaxed text-white/70 italic min-h-[40px]">
                                  "{student.vibe}"
                                </p>
                              </div>

                              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                                <span className="inline-flex rounded-full bg-cyan-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200 border border-cyan-500/20">
                                  {student.match}
                                </span>
                                
                                <button className="w-full sm:w-auto rounded-full bg-cyan-500 px-5 py-2 text-xs font-black uppercase tracking-widest text-black hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                                  Connect +
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })()}
                    </motion.div>
                  </AnimatePresence>

                  {/* Carousel Controls */}
                  {dailyCampusDrop.length > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setCurrentDropIndex((prev) => (prev > 0 ? prev - 1 : dailyCampusDrop.length - 1))}
                        className="p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        ←
                      </button>
                      <div className="flex gap-1.5">
                        {dailyCampusDrop.map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all ${i === currentDropIndex ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/20'}`}
                          />
                        ))}
                      </div>
                      <button 
                        onClick={() => setCurrentDropIndex((prev) => (prev < dailyCampusDrop.length - 1 ? prev + 1 : 0))}
                        className="p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="app-panel h-full flex flex-col min-w-0 rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-5">
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Anonymous Adda</p>
                  <h2 className="mt-1 text-lg font-black tracking-tight text-white">Campus confessions</h2>
                </div>
                <ShieldCheck size={20} className="text-orange-300" />
              </div>
              {/* Scope Toggle */}
              <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.04] p-1">
                <button
                  onClick={() => { setConfessionScope('local'); fetchConfessions('local'); }}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all",
                    confessionScope === 'local' ? "bg-orange-400 text-black" : "text-white/50 hover:text-white"
                  )}
                >
                  <GraduationCap size={11} /> My Campus
                </button>
                <button
                  onClick={() => { setConfessionScope('global'); fetchConfessions('global'); }}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all",
                    confessionScope === 'global' ? "bg-purple-500 text-white" : "text-white/50 hover:text-white"
                  )}
                >
                  <Globe size={11} /> Global Pulse
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3">
                <textarea
                  value={confessionText}
                  onChange={(e) => setConfessionText(e.target.value)}
                  placeholder="Drop an anonymous campus thought..."
                  className="min-h-16 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/28"
                />
                
                {/* Gradient Picker */}
                <div className="mt-2 flex items-center gap-2 border-t border-white/5 pt-3">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/40">Theme:</span>
                  <div className="flex gap-1.5">
                    {[
                      { name: "Sunset", value: "from-orange-500 via-rose-500 to-purple-600" },
                      { name: "Cyber", value: "from-blue-600 via-indigo-500 to-purple-600" },
                      { name: "Ocean", value: "from-cyan-500 to-blue-600" },
                      { name: "Forest", value: "from-emerald-500 via-teal-600 to-cyan-600" },
                      { name: "Cosmic", value: "from-purple-600 via-fuchsia-500 to-pink-500" }
                    ].map((g) => (
                      <button
                        key={g.name}
                        onClick={() => setSelectedGradient(g.value)}
                        className={clsx(
                          "w-5 h-5 rounded-full bg-gradient-to-br cursor-pointer border border-white/10 transition-all",
                          g.value,
                          selectedGradient === g.value ? "ring-2 ring-white scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                        )}
                        title={g.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Moderated before public</span>
                  <button
                    onClick={handleCreateConfession}
                    className="rounded-full bg-orange-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-black font-extrabold hover:bg-orange-300 transition-all hover:scale-105 cursor-pointer"
                  >
                    Drop
                  </button>
                </div>
              </div>
              
              {confessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-8 text-center flex-1">
                  <p className="text-xs font-bold text-white/30">No confessions yet.</p>
                  <p className="mt-1 text-[10px] text-white/20">Be the first to drop one! 🤫</p>
                </div>
              ) : (
                <div className="flex flex-col flex-1 h-[480px] overflow-y-auto snap-y snap-mandatory no-scrollbar gap-4 pb-10">
                  {confessions.map((confession) => (
                    <div 
                      key={confession._id} 
                      className={clsx(
                        "snap-start snap-always shrink-0 min-h-[220px] relative overflow-hidden rounded-2xl p-5 text-white flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.01]",
                        confession.gradient ? `bg-gradient-to-br ${confession.gradient}` : "border border-white/8 bg-white/[0.025]"
                      )}
                    >
                  <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />

                  <div className="absolute top-3 right-4 flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
                      Campus Adda ✦ Confession ✦ {confession.createdAt ? new Date(confession.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); reportConfession(confession._id); }}
                      title="Report this confession"
                      className="text-white/30 hover:text-red-400 transition-colors cursor-pointer relative z-20"
                    >
                      <Flag size={11} />
                    </button>
                  </div>

                  <p className="text-sm font-extrabold italic leading-relaxed text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] pr-4">
                    "{confession.text}"
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-white/20 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                      <span>📍 {confession.college}</span>
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                        <Flame size={11} className="fill-white animate-pulse" /> {confession.heat} Heat
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 relative z-10">
                      <button 
                        onClick={() => toggleLikeConfession(confession._id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md cursor-pointer"
                      >
                        <Heart size={14} className={confession.likes?.includes(currentUser?._id || currentUser?.id) ? "fill-red-500 text-red-500" : ""} />
                        <span>{confession.likes?.length || 0}</span>
                      </button>

                      <div className="flex-1 ml-3 flex items-center bg-black/20 rounded-full px-3 py-1 border border-white/10">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={confessionCommentInputs[confession._id] || ""}
                          onChange={(e) => setConfessionCommentInputs(prev => ({ ...prev, [confession._id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCommentConfession(confession._id);
                          }}
                          className="w-full bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none"
                        />
                        <button 
                          onClick={() => handleCommentConfession(confession._id)}
                          className="ml-2 text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>

                    {confession.comments && confession.comments.length > 0 && (
                      <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto no-scrollbar bg-black/10 rounded-xl p-2 border border-white/5 relative z-10">
                        {confession.comments.map((comment, i) => (
                          <div key={i} className="text-[11px] text-white/80 flex items-start gap-2">
                            <span className="font-bold text-white/50 text-[9px] uppercase shrink-0 mt-0.5">Anon:</span>
                            <span className="leading-snug">{comment.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid min-w-0 gap-3 lg:grid-cols-1">
          <div className="app-panel rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Trophy size={18} className="text-yellow-300" />
                <h2 className="text-sm font-black uppercase tracking-[0.16em]">College leaderboard</h2>
              </div>
            </div>
            <div className="space-y-2">
              {collegeLeaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-8 text-center">
                  <p className="text-xs font-bold text-white/30">No colleges ranked yet.</p>
                  <p className="mt-1 text-[10px] text-white/20">Rankings appear as more verified students join.</p>
                </div>
              ) : collegeLeaderboard.map((item, idx) => {
                const medals = ["🥇", "🥈", "🥉"];
                const gradients = [
                  "from-yellow-500/20 via-orange-500/10 to-transparent border-yellow-500/30",
                  "from-slate-400/15 via-slate-500/10 to-transparent border-slate-400/25",
                  "from-orange-700/15 via-orange-800/10 to-transparent border-orange-700/25",
                ];
                const isTop3 = idx < 3;
                return (
                  <div
                    key={item.college}
                    className={clsx(
                      "flex items-center gap-3 rounded-2xl border p-3 transition-all",
                      isTop3
                        ? `bg-gradient-to-r ${gradients[idx]}`
                        : "border-white/8 bg-white/[0.03]"
                    )}
                  >
                    <div className={clsx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black",
                      isTop3 ? "text-lg" : "bg-white/[0.06] text-xs text-white"
                    )}>
                      {isTop3 ? medals[idx] : `#${idx + 1}`}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={clsx("truncate text-sm font-bold", isTop3 ? "text-white" : "text-white/80")}>{item.college}</p>
                      <p className="text-[10px] font-medium text-white/40">
                        <span className="text-green-400">{item.verifiedCount} verified students</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={clsx("text-sm font-black", isTop3 ? "text-yellow-300" : "text-white/70")}>{item.score} pts</p>
                      {isTop3 && idx === 0 && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-yellow-400">Top Campus 🏆</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2 text-white/70">
              <Flame size={16} className="text-orange-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {selectedTopic ? `Filtered by: #${selectedTopic}` : "Trending on Campus"}
              </span>
            </div>
            {selectedTopic && (
              <button 
                onClick={() => setSelectedTopic(null)}
                className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300"
              >
                Show All
              </button>
            )}
          </div>
          <div className="no-scrollbar flex max-w-full space-x-2 overflow-x-auto py-1">
            {trendingTopics.map((topic, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                className={clsx(
                  "flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center space-x-2",
                  selectedTopic === topic.name 
                    ? "bg-purple-600/20 text-purple-300 border-purple-500 shadow-md shadow-purple-500/10" 
                    : "glass text-white/80 border-white/5 hover:border-white/20 hover:bg-white/10"
                )}
              >
                {topic.icon}
                <span>{topic.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Create Post Prompt */}
        <motion.div 
          variants={itemVariants}
          className="glass-card relative flex min-w-0 max-w-full flex-col space-y-4 overflow-hidden rounded-[1.6rem] p-4 shadow-2xl group sm:rounded-3xl sm:p-5"
        >
          <div className="absolute top-0 left-0 w-full h-1 gradient-bg opacity-30 group-focus-within:opacity-100 transition-opacity" />
          <div className="flex min-w-0 items-start space-x-3 sm:space-x-4">
            <div className="w-12 h-12 rounded-full gradient-bg p-[2px] flex-shrink-0">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden">
                {currentUser?.profilePic ? (
                  <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="You" />
                ) : (
                  <span className="text-lg font-bold">{currentUser?.name?.charAt(0) || "Y"}</span>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isTextTooShort) handleCreatePost();
                  }
                }}
                placeholder={placeholderText}
                className="min-w-0 w-full resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none sm:text-base mt-2 min-h-[60px]"
              />
              {isTextTooShort && (
                <div className="flex items-center space-x-2 text-orange-400 text-xs font-semibold animate-pulse">
                  <span>⚠️ Write at least 10 characters to share a quality update!</span>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {selectedMedia && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative rounded-2xl overflow-hidden border border-white/10 max-h-72"
              >
                {mediaType === 'video' ? (
                  <video src={selectedMedia} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={selectedMedia} className="w-full h-full object-cover" alt="Preview" />
                )}
                <button 
                  onClick={() => { setSelectedMedia(null); setMediaType('none'); }}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/80 transition-all border border-white/10"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
             <div className="grid grid-cols-3 gap-2 sm:flex sm:space-x-5">
               <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => handleMediaSelect(e, 'image')} />
               <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleMediaSelect(e, 'video')} />
               
               <button 
                 onClick={() => photoInputRef.current?.click()}
                 className="flex min-w-0 items-center justify-center space-x-1.5 rounded-2xl bg-white/[0.03] px-2 py-2 text-white/50 transition-all hover:text-white group sm:justify-start sm:bg-transparent sm:px-0 sm:space-x-2"
               >
                 <div className="p-2 rounded-full group-hover:bg-purple-500/10 transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                 </div>
                 <span className="text-xs font-semibold">Photo</span>
               </button>
               <button 
                 onClick={() => videoInputRef.current?.click()}
                 className="flex min-w-0 items-center justify-center space-x-1.5 rounded-2xl bg-white/[0.03] px-2 py-2 text-white/50 transition-all hover:text-white group sm:justify-start sm:bg-transparent sm:px-0 sm:space-x-2"
               >
                 <div className="p-2 rounded-full group-hover:bg-cyan-500/10 transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                 </div>
                 <span className="text-xs font-semibold">Video</span>
               </button>
               <button 
                 onClick={() => setShowPollModal(true)}
                 className="flex min-w-0 items-center justify-center space-x-1.5 rounded-2xl bg-white/[0.03] px-2 py-2 text-white/50 transition-all hover:text-white group sm:justify-start sm:bg-transparent sm:px-0 sm:space-x-2"
               >
                 <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                   <BarChart2 size={20} />
                 </div>
                 <span className="text-xs font-semibold">Poll</span>
               </button>
             </div>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleCreatePost} 
               disabled={isPosting || isTextTooShort || (!newPostContent.trim() && !selectedMedia)}
               className="gradient-bg flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl shadow-purple-500/20 disabled:opacity-50 sm:w-auto sm:min-w-[120px] sm:rounded-full sm:px-7 sm:py-2.5 cursor-pointer"
             >
               {isPosting ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 "Post to Feed"
               )}
             </motion.button>
          </div>
        </motion.div>

        {/* Posts List */}
        <div className="space-y-6">
          {loadingPosts && (
            <div className="space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-card rounded-[2rem] p-6 space-y-4 animate-pulse border border-white/5 bg-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-1/3" />
                      <div className="h-3 bg-white/5 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-5/6" />
                  </div>
                  <div className="h-40 bg-white/5 rounded-2xl w-full" />
                  <div className="flex justify-between pt-2 border-t border-white/5">
                    <div className="h-6 bg-white/5 rounded w-12" />
                    <div className="h-6 bg-white/5 rounded w-12" />
                    <div className="h-6 bg-white/5 rounded w-8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingPosts && posts.length === 0 && (
            <div className="glass-card rounded-[2rem] p-8 text-center border-dashed border-2 border-white/10 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Compass size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Welcome to Campus Adda!</h3>
              <p className="text-sm text-white/50 max-w-sm">
                Your feed is currently empty. Follow students at your college or explore other campuses to see posts and start connecting!
              </p>
              <button 
                onClick={() => router.push('/explore')}
                className="gradient-bg text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform animate-[pulse_2s_ease-in-out_infinite]"
              >
                Explore Campuses
              </button>
            </div>
          )}

          {!loadingPosts && posts.length > 0 && filteredPosts.length === 0 && (
            <div className="glass-card rounded-[2rem] p-8 text-center border-dashed border-2 border-white/10 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Flame size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">No posts for #{selectedTopic}</h3>
              <p className="text-sm text-white/50 max-w-sm">
                Be the first one to post about this topic on your campus!
              </p>
              <button 
                onClick={() => setSelectedTopic(null)}
                className="gradient-bg text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform"
              >
                Show All Posts
              </button>
            </div>
          )}
          
          {!loadingPosts && filteredPosts.map((post) => (
            <motion.article
              key={post.id} 
              variants={itemVariants}
              className="glass-card relative min-w-0 rounded-[1.6rem] p-4 group border-l-[3px] border-l-transparent transition-all duration-500 hover:border-l-purple-500 sm:rounded-[2rem] sm:p-6"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-white/10 overflow-hidden">
                      <img 
                        src={post.avatar} 
                        alt={post.author} 
                        className="w-full h-full object-cover rounded-full" 
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=7C3AED&color=fff`; }}
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0A0A0F] rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {post.author}
                      <VerifiedBadge user={{ followers: post.authorFollowers, following: post.authorFollowing }} size={16} /> 
                    </h3>
                    <p className="text-xs text-white/40 font-medium">{post.university} • {post.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {friendsList.some(f => f.id === post.authorId) ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                      Your Squad
                    </span>
                  ) : currentUser?._id !== post.authorId && currentUser?.id !== post.authorId ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[11px] font-bold px-4 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-all text-white"
                    >
                      Follow
                    </motion.button>
                  ) : null}
                  <div className="relative">
                    <button onClick={() => setPostMenu(postMenu === post.id ? null : post.id)} className="text-white/40 hover:text-white p-1">
                      <MoreHorizontal size={20} />
                    </button>
                    {postMenu === post.id && (
                      <div className="absolute right-0 top-full mt-2 w-40 bg-[#1A1A1F] border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                        {currentUser?._id === post.authorId || currentUser?.id === post.authorId ? (
                          <button 
                            onClick={() => { handleDeletePost(post.id); setPostMenu(null); }} 
                            className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            Delete Post
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => { handleHidePost(post.id); setPostMenu(null); }}
                              className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-white/70 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                            >
                              Hide Post
                            </button>
                            <button 
                              onClick={() => { handleReportPost(post.id); setPostMenu(null); }}
                              className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors border-t border-white/5 cursor-pointer"
                            >
                              Report Spam
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Post Content */}
              {post.content && (
                <p className="text-[15px] text-white/90 mb-5 leading-relaxed font-medium">
                  {post.content}
                </p>
              )}

              {/* Poll Section */}
              {post.poll && post.poll.options && post.poll.options.length > 0 && (
                <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-4 mb-5 bg-white/[0.01]">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <p className="text-xs font-semibold text-white/50">{post.poll.allowMultiple ? "Select multiple answers" : "Select one answer"}</p>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-400/10 px-2.5 py-0.5 rounded">Active Poll</span>
                  </div>
                  <div className="space-y-2.5">
                    {post.poll.options.map((option, idx) => {
                      const totalVotes = post.poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
                      const optionVotes = option.votes?.length || 0;
                      const percentage = totalVotes === 0 ? 0 : Math.round((optionVotes / totalVotes) * 100);
                      const hasVoted = option.votes?.includes(currentUser?._id || currentUser?.id);
                      
                      return (
                        <div 
                          key={idx}
                          onClick={() => handleVote(post.id, idx)}
                          className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-all hover:bg-white/[0.04] hover:border-white/20 cursor-pointer group"
                        >
                          {/* Percentage Bar Fill */}
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-purple-600/25 to-cyan-500/20"
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                          />
                          
                          <div className="relative flex items-center justify-between p-4 z-10">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className={clsx(
                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                                hasVoted ? "border-cyan-400 bg-cyan-400 text-black" : "border-white/30"
                              )}>
                                {hasVoted && <Check size={12} strokeWidth={4} />}
                              </div>
                              <span className="text-sm font-semibold text-white/90 truncate">{option.text}</span>
                            </div>
                            
                            <div className="flex items-center justify-end space-x-2 shrink-0 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5 backdrop-blur-sm w-20">
                              <span className="text-[11px] font-black text-cyan-300">{percentage}%</span>
                              <span className="text-[10px] font-medium text-white/40">({optionVotes})</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-bold uppercase tracking-wider">
                    <button className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-purple-300 transition-all hover:bg-purple-500/20 hover:scale-105 border border-purple-500/20">
                      <BarChart2 size={12} />
                      View Breakdown
                    </button>
                    <span className="text-white/30">{post.poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0)} total votes</span>
                  </div>
                </div>
              )}

              {post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden mb-5 border border-white/5 bg-black/20 shadow-inner">
                  {post.mediaType === 'video' ? (
                    <video src={post.mediaUrl} controls className="w-full h-auto max-h-[500px] object-contain" />
                  ) : (
                    <img src={post.mediaUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-contain mx-auto" />
                  )}
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center space-x-6 relative">
                  <div className="flex flex-col items-center group/like">
                    <motion.button 
                      whileTap={{ scale: 1.5 }}
                      onClick={() => toggleLike(post.id)}
                      className={clsx(
                        "flex items-center space-x-2 transition-all p-2 rounded-full",
                        post.isLiked ? "text-pink-500 bg-pink-500/10" : "text-white/40 hover:text-pink-500 hover:bg-pink-500/5"
                      )}
                    >
                      <Heart size={22} className={clsx("transition-all", post.isLiked && "fill-pink-500")} />
                      <span className="text-sm font-bold">{post.likes}</span>
                    </motion.button>
                  </div>

                  <button 
                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                    className="flex items-center space-x-2 text-white/40 hover:text-cyan-400 hover:bg-cyan-400/5 p-2 rounded-full transition-all"
                  >
                    <MessageCircle size={22} />
                    <span className="text-sm font-bold">{post.comments}</span>
                  </button>
                </div>

                <button 
                  onClick={() => setShareModal(post.id)}
                  className="flex items-center space-x-2 text-white/40 hover:text-purple-400 hover:bg-purple-400/5 p-2 rounded-full transition-all"
                >
                  <Send size={20} />
                </button>
              </div>

              {/* Inline Comments Section */}
              <AnimatePresence>
                {activeCommentPost === post.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 border-t border-white/5 pt-4 overflow-hidden"
                  >
                    <div className="space-y-4 mb-5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {(post.commentsList || []).map(comment => (
                        <div key={comment.id} className="flex space-x-3 items-start bg-white/5 p-3 rounded-2xl">
                          <div className="w-7 h-7 rounded-full gradient-bg p-[1px] flex-shrink-0">
                            <div className="w-full h-full bg-[#1A1A1F] rounded-full flex items-center justify-center text-[10px] font-bold">
                              {comment.author.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white/90">{comment.author}</p>
                            <p className="text-xs text-white/60 mt-0.5">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-full border border-white/10 focus-within:border-purple-500/50 transition-all">
                      <input 
                        type="text" 
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                        placeholder={`Reply to ${post.author}...`} 
                        className="flex-1 bg-transparent px-4 py-1.5 text-sm focus:outline-none text-white placeholder:text-white/20" 
                      />
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleComment(post.id)}
                        className="gradient-bg p-2 rounded-full text-white shadow-lg shadow-purple-500/20"
                      >
                        <Send size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          ))}
        </div>
        </div>
        </div>
      </motion.div>

      {/* Create Poll Modal */}
      <AnimatePresence>
        {showPollModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 px-3 py-3 backdrop-blur-xl sm:items-center sm:px-4" onClick={() => setShowPollModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-white/10 p-5 shadow-2xl glass custom-scrollbar sm:rounded-[3rem] sm:p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-green-500/10 rounded-2xl text-green-500">
                    <BarChart2 size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Create Poll</h2>
                </div>
                <button onClick={() => setShowPollModal(false)} className="p-2.5 hover:bg-white/5 rounded-full transition-colors text-white/40"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Question</label>
                  <textarea 
                    placeholder="Ask something to the campus..." 
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-sm text-white focus:outline-none focus:border-green-500/50 transition-all min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Options</label>
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="relative group">
                      <input 
                        type="text" 
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...pollOptions];
                          newOpts[i] = e.target.value;
                          setPollOptions(newOpts);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-green-500/50 transition-all"
                      />
                      {pollOptions.length > 2 && (
                        <button 
                          onClick={() => setPollOptions(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-500 p-1"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {pollOptions.length < 5 && (
                    <button 
                      onClick={() => setPollOptions(prev => [...prev, ""])}
                      className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-white/30 text-xs font-bold hover:bg-white/5 hover:text-white transition-all flex items-center justify-center space-x-2"
                    >
                      <Plus size={14} />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center space-x-3">
                    <Check size={18} className={pollAllowMultiple ? "text-green-500" : "text-white/20"} />
                    <span className="text-sm font-bold text-white/70">Allow multiple answers</span>
                  </div>
                  <button 
                    onClick={() => setPollAllowMultiple(!pollAllowMultiple)}
                    className={clsx(
                      "w-12 h-6 rounded-full p-1 transition-all duration-300",
                      pollAllowMultiple ? "bg-green-500" : "bg-white/10"
                    )}
                  >
                    <div className={clsx(
                      "w-4 h-4 bg-white rounded-full shadow-lg transition-all transform",
                      pollAllowMultiple ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreatePoll}
                  disabled={!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2 || isPosting}
                  className="w-full bg-green-500 py-4 rounded-[1.5rem] text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-green-500/20 disabled:opacity-40 transition-all"
                >
                  {isPosting ? "Creating..." : "Launch Poll"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Campus Adda Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 px-3 py-3 backdrop-blur-md sm:items-center sm:px-4" onClick={() => setShareModal(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-white/10 p-5 shadow-2xl glass-card custom-scrollbar sm:rounded-[2.5rem] sm:p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Share with Squad</h2>
              <button onClick={() => setShareModal(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"><X size={20} /></button>
            </div>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="Find people to share with..." 
                value={shareSearchTerm}
                onChange={(e) => setShareSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {friendsList.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <p className="text-white/30 text-sm">No connections found yet.</p>
                  <button onClick={() => router.push('/friends')} className="text-purple-400 text-xs font-bold hover:underline">Find Campus Squad</button>
                </div>
              )}
              {friendsList.filter(f => f.name.toLowerCase().includes(shareSearchTerm.toLowerCase())).map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                  <div className="flex items-center space-x-4">
                    <img src={friend.avatar} alt={friend.name} className="w-11 h-11 rounded-full object-cover border border-white/10" />
                    <p className="text-sm font-bold text-white/90">{friend.name}</p>
                  </div>
                  <button 
                    onClick={() => handleShareToFriend(friend.id, shareModal)}
                    className="gradient-bg text-white text-[11px] font-bold px-5 py-2 rounded-full shadow-lg shadow-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Send Now
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Story Viewer (Keep logic but update UI) */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background" onClick={() => setActiveStory(null)}>
           <div className="relative h-[100dvh] w-full max-w-lg overflow-hidden border-white/10 bg-black shadow-2xl sm:aspect-[9/16] sm:h-auto sm:border md:rounded-3xl">
              {/* Progress Bars */}
              <div className="absolute top-6 left-6 right-6 flex space-x-1.5 z-20">
                  {activeStory.stories.map((s, i) => (
                    <div key={i} className="h-1 bg-white/20 flex-1 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: "100%" }} 
                        transition={{ duration: 5 }} 
                        onAnimationComplete={() => {
                          if (i === activeStory.stories.length - 1) setActiveStory(null);
                        }}
                        className="h-full bg-white" 
                      />
                    </div>
                  ))}
              </div>

              {/* Header */}
              <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full p-[2px] gradient-bg">
                      <img 
                        src={activeStory.author.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeStory.author.name)}&background=7C3AED&color=fff`} 
                        className="w-full h-full rounded-full border border-[#0A0A0F] object-cover" 
                        alt="" 
                      />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{activeStory.author.name}</p>
                      <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">{new Date(activeStory.stories[0].createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveStory(null)} className="text-white/60 hover:text-white p-2 bg-white/5 rounded-full transition-all">
                    <X size={24} />
                  </button>
              </div>

              {/* Content */}
              <div className="w-full h-full flex items-center justify-center bg-black">
                  {activeStory.stories[0].mediaType === 'video' ? (
                    <video src={activeStory.stories[0].mediaUrl} autoPlay className="w-full h-full object-cover" />
                  ) : (
                    <img src={activeStory.stories[0].mediaUrl} className="w-full h-full object-cover" alt="" />
                  )}
              </div>

              {/* Story Actions */}
              <div className="absolute bottom-10 left-6 right-6 flex items-center space-x-4 z-20" onClick={e => e.stopPropagation()}>
                  <div className="flex-1 glass rounded-full flex items-center px-5 py-3 border border-white/10">
                    <input 
                      type="text" 
                      placeholder={`Reply to ${activeStory.author.name.split(' ')[0]}...`} 
                      className="bg-transparent text-white text-sm focus:outline-none w-full"
                    />
                  </div>
                  <button className="p-3 glass rounded-full text-white hover:text-pink-500 transition-colors">
                    <Heart size={24} />
                  </button>
                  <button className="p-3 gradient-bg rounded-full text-white shadow-lg">
                    <Send size={20} />
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Premium Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="app-panel fixed bottom-28 left-1/2 -translate-x-1/2 px-8 py-3.5 rounded-full z-[60] flex items-center space-x-3"
          >
            <div className="gradient-bg text-white p-1 rounded-full">
              <Check size={14} strokeWidth={4} />
            </div>
            <span className="text-sm font-bold text-white whitespace-nowrap">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
