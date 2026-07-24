"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, X, Check, Plus, Flame, TrendingUp, Search, Zap, BarChart2, Compass, ShieldCheck, Flag, Globe, GraduationCap, ChevronLeft, ChevronRight, Users, Trophy, Sun, Sunset, Moon, Pause, Play } from "lucide-react";
import Image from "next/image";
import NotificationBell from "../../components/NotificationBell";
import NameWithTick from '../../components/NameWithTick';

import CampusLeaderboard from "../../components/CampusLeaderboard";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  removeUploadedImage,
  savePostImageRecord,
  uploadPostImage,
  uploadAvatar
} from "@/utils/supabaseUploads";
import { useApiQuery } from "@/utils/useApiQuery";
import { useQueryClient } from "@tanstack/react-query";
import { getAvatarSrc, getDefaultAvatar } from "@/utils/defaultAvatars";

export default function Home() {
  const router = useRouter();

  const queryClient = useQueryClient();
  const [connectStatus, setConnectStatus] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});
  const [shareModal, setShareModal] = useState(null);
  const [postMenu, setPostMenu] = useState(null);
  const [shareSearchTerm, setShareSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('none');
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Hydrate from localStorage on first paint so the posts query uses the right cache key immediately
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("collegeadda_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("collegeadda_token"));
  });
  const [activeStory, setActiveStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const storyVideoRef = useRef(null);
  const storyProgressKey = useRef(0); // increment to reset animation
  const [storyReplyText, setStoryReplyText] = useState("");
  const [hoveredPost, setHoveredPost] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [confessionText, setConfessionText] = useState("");
  // setConfessions is defined below as a custom updater for optimistic updates on cached queries
  const [confessionCommentInputs, setConfessionCommentInputs] = useState({});
  const [confessionScope, setConfessionScope] = useState('local'); // 'local' | 'global'
  const FEED_PAGE_SIZE = 20;
  const [feedPage, setFeedPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
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
  const [selectedGradient, setSelectedGradient] = useState("from-orange-500 via-rose-500 to-[#D4A843]");
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').trim();

  // ── TanStack Query hooks for cached data fetching ────────────────────────
  const formatPosts = useCallback((data) => {
    const user = currentUser || {};
    const userId = user._id || user.id;
    return (data || []).map(p => {
      // If the post is already formatted (from optimistic UI updates in the cache), return it as is
      if (p.id && !p._id) return p;

      const likesCount = typeof p.likesCount === 'number' ? p.likesCount : (p.likes?.length || 0);
      const commentsCount = typeof p.commentsCount === 'number' ? p.commentsCount : (p.comments?.length || 0);
      const isLiked = typeof p.likedByMe === 'boolean'
        ? p.likedByMe
        : Boolean(p.likes?.some?.((id) => String(id) === String(userId)) || p.likes?.includes?.(userId));

      return {
        id: p._id,
        author: p.author?.name || 'Unknown',
        authorTick: p.author?.currentTick || null,
        authorId: p.author?._id,
        university: p.university,
        avatar: getAvatarSrc(p.author?.profilePic, p.author?.name, p.author?._id),
        time: new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
        content: p.content,
        likes: likesCount,
        isLiked,
        comments: commentsCount,
        commentsList: p.comments?.map(c => ({
          id: c._id || Math.random().toString(),
          author: c.user?.name || 'Student',
          authorTick: c.user?.currentTick || null,
          userId: c.user?._id || c.user?.id,
          profilePic: c.user?.profilePic,
          text: c.text
        })) || [],
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType,
        poll: p.poll
          ? {
              ...p.poll,
              options: (p.poll.options || []).map((option) => ({
                text: option.text,
                votesCount: typeof option.votesCount === 'number' ? option.votesCount : (option.votes?.length || 0),
                votedByMe: typeof option.votedByMe === 'boolean'
                  ? option.votedByMe
                  : Boolean(option.votes?.some?.((id) => String(id) === String(userId)) || option.votes?.includes?.(userId)),
                votes: option.votes
              }))
            }
          : p.poll,
        authorFollowers: p.author?.followers || [],
        authorFollowing: p.author?.following || [],
        authorUser: p.author || { isVerified: false }
      };
    });
  }, [currentUser]);

  const feedUserId = currentUser?._id || currentUser?.id;
  const { data: posts = [], isLoading: loadingPosts, refetch: refetchPosts } = useApiQuery(
    ["posts", "v2", feedUserId],
    `/api/posts?limit=${feedPage * FEED_PAGE_SIZE}`,
    {
      enabled: isAuthenticated && !!feedUserId,
      select: formatPosts,
      staleTime: 0, // Force refresh to pick up cross-university posts
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnMount: true, // background refresh if stale; cached posts still render
    }
  );
  const showFeedSkeleton = loadingPosts && posts.length === 0;

  useEffect(() => {
    setFeedPage(1);
    setHasMorePosts(true);
  }, [currentUser?._id]);

  useEffect(() => {
    if (!loadingPosts && feedPage === 1) {
      setHasMorePosts(posts.length >= FEED_PAGE_SIZE);
    }
  }, [loadingPosts, posts.length, feedPage]);

  const loadMorePosts = async () => {
    if (loadingMorePosts || !hasMorePosts || !currentUser?._id) return;
    setLoadingMorePosts(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const nextPage = feedPage + 1;
      const res = await fetch(`${apiUrl}/api/posts?page=${nextPage}&limit=${FEED_PAGE_SIZE}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(`Failed to load more posts (${res.status})`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length < FEED_PAGE_SIZE) {
        setHasMorePosts(false);
      }
      if (Array.isArray(data) && data.length > 0) {
        queryClient.setQueryData(["posts", "v2", currentUser._id], (old) => {
          const existing = Array.isArray(old) ? old : [];
          const seen = new Set(existing.map((p) => String(p._id || p.id)));
          const fresh = data.filter((p) => !seen.has(String(p._id)));
          return [...existing, ...fresh];
        });
        setFeedPage(nextPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMorePosts(false);
    }
  };

  const { data: friendsList = [] } = useApiQuery(
    "friends",
    "/api/users/me/following",
    {
      enabled: isAuthenticated,
      select: (data) => (data || []).map(u => ({
        id: u._id,
        name: u.name,
        avatar: getAvatarSrc(u.profilePic, u.name, u._id)
      })),
    }
  );

  const { data: stories = [] } = useApiQuery(
    "stories",
    "/api/stories",
    {
      enabled: isAuthenticated,
      select: (data) => {
        const grouped = (data || []).reduce((acc, story) => {
          const authorId = story.author._id || story.author.id;
          if (!acc[authorId]) {
            acc[authorId] = { author: story.author, stories: [] };
          }
          acc[authorId].stories.push(story);
          return acc;
        }, {});
        return Object.values(grouped);
      },
    }
  );

  const { data: confessions = [], refetch: refetchConfessions } = useApiQuery(
    ["confessions", confessionScope],
    `/api/confessions?scope=${confessionScope}`,
    {
      // Confessions are not rendered on the home feed — skip the mount-time request
      enabled: false,
      staleTime: 30 * 1000,
    }
  );
  // Local state for optimistic updates on confessions
  const [localConfessions, setLocalConfessions] = useState(null);
  const displayConfessions = localConfessions !== null ? localConfessions : confessions;
  // Sync localConfessions when query data changes
  useEffect(() => {
    setLocalConfessions(null);
  }, [confessions]);

  const setConfessions = useCallback((updater) => {
    setLocalConfessions(prev => {
      const current = prev !== null ? prev : confessions;
      return typeof updater === 'function' ? updater(current) : updater;
    });
  }, [confessions]);

  const { data: leaderboard = [], isLoading: loadingLeaderboard } = useApiQuery(
    "leaderboard",
    "/api/users/leaderboard",
    {
      // Let the feed win bandwidth first
      enabled: isAuthenticated && !loadingPosts,
      select: (data) => {
        const rows = Array.isArray(data) ? data : data?.leaderboard || [];
        return rows.slice(0, 5);
      },
      staleTime: 5 * 60 * 1000, // 5 min — leaderboard changes slowly
    }
  );

  const { data: suggestedUsers = [], isLoading: loadingSuggested } = useApiQuery(
    "suggested",
    "/api/users/daily-drop",
    {
      enabled: isAuthenticated && !loadingPosts,
      select: (data) => Array.isArray(data) ? data : [],
      staleTime: 5 * 60 * 1000,
    }
  );

  // ── Local state for UI interactions ──────────────────────────────────────
  // We use setPosts wrapper functions for optimistic updates on the cached data
  const setPosts = useCallback((updater) => {
    queryClient.setQueryData(["posts", "v2", currentUser?._id], (oldRawData) => {
      if (!oldRawData) return oldRawData;
      const currentFormatted = formatPosts(oldRawData);
      const updated = typeof updater === 'function' ? updater(currentFormatted) : updater;
      // We need to mark the raw data so the select picks up changes
      // Store formatted data directly as raw and skip select on next read
      return updated;
    });
  }, [queryClient, currentUser?._id, formatPosts]);

  const filteredPosts = posts.filter(post => {
    if (!selectedTopic) return true;
    return post.content.toLowerCase().includes(selectedTopic.toLowerCase());
  });

  const isTextTooShort = newPostContent.trim().length > 0 && newPostContent.trim().length < 10 && !selectedMedia;
  
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const clearSessionAndLogin = () => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/");
  };

  const trendingTopics = [
    { name: "Tech Fest 2024", icon: <Flame size={14} className="text-orange-500" /> },
    { name: "Exam Season", icon: <TrendingUp size={14} className="text-blue-400" /> },
    { name: "Campus Elections", icon: <TrendingUp size={14} className="text-[#C8922A]" /> },
    { name: "Night Canteen", icon: <Flame size={14} className="text-yellow-500" /> },
    { name: "Sports Meet", icon: <Zap size={14} className="text-green-400" /> },
    { name: "Hackathon", icon: <Search size={14} className="text-[#C8922A]" /> }
  ];

  useEffect(() => {
    const token = localStorage.getItem("collegeadda_token");
    if (!token) {
      clearSessionAndLogin();
    } else {
      let u = {};
      try {
        u = JSON.parse(localStorage.getItem('collegeadda_user') || '{}');
      } catch {
        clearSessionAndLogin();
        return;
      }
      setCurrentUser(u);
      setIsAuthenticated(true);

      // Sync user profile from backend
      const fetchLatestProfile = async () => {
        try {
          const res = await fetch(`${apiUrl}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const profileData = await res.json();
            if (!profileData.onboardingComplete) {
              router.push("/onboarding");
              return;
            }
            setCurrentUser(profileData);
            localStorage.setItem('collegeadda_user', JSON.stringify(profileData));
          } else if (res.status === 401) {
            clearSessionAndLogin();
          }
        } catch (err) {
          console.error("Error syncing profile:", err);
        }
      };
      fetchLatestProfile();
      // Data fetching is now handled by useApiQuery hooks above
    }
  }, [router]);

  // fetchPosts / fetchFriends / fetchStories / fetchConfessions / fetchLeaderboard / fetchSuggested
  // are now handled by useApiQuery hooks at the top of this component.

  const handleConnectUser = async (userId) => {
    setConnectStatus(prev => ({ ...prev, [userId]: 'pending' }));
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/users/${userId}/follow`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setConnectStatus(prev => ({ ...prev, [userId]: 'connected' }));
        queryClient.invalidateQueries({ queryKey: ["squad-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["explore-following"] });
        queryClient.invalidateQueries({ queryKey: ["user-following"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["squad-suggested"] });
        queryClient.invalidateQueries({ queryKey: ["suggested"] });
      } else {
        setConnectStatus(prev => ({ ...prev, [userId]: null }));
      }
    } catch (err) {
      console.error(err);
      setConnectStatus(prev => ({ ...prev, [userId]: null }));
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
        refetchConfessions();
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
    const userId = currentUser?._id || currentUser?.id;
    if (!userId) return;

    // --- OPTIMISTIC UI UPDATE --- 
    // Toggle like locally first — no re-fetch, card never disappears
    setLocalConfessions(prev => (prev || confessions).map(c => {
      if (c._id !== id) return c;
      const alreadyLiked = c.likes?.some(l => l.toString() === userId.toString());
      const newLikes = alreadyLiked
        ? (c.likes || []).filter(l => l.toString() !== userId.toString())
        : [...(c.likes || []), userId];
      return { ...c, likes: newLikes, heat: 1 + (newLikes.length * 2) + ((c.comments?.length || 0) * 3) };
    }));

    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/confessions/${id}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Server persists, no need to re-fetch
    } catch (err) {
      console.error(err);
      // Rollback on error by re-fetching
      refetchConfessions();
    }
  };

  const handleCommentConfession = async (id) => {
    const text = confessionCommentInputs[id];
    if (!text?.trim()) return;

    // --- OPTIMISTIC UI UPDATE ---
    const tempComment = { text: text.trim(), createdAt: new Date().toISOString(), _temp: true };
    setLocalConfessions(prev => (prev || confessions).map(c => {
      if (c._id !== id) return c;
      return { ...c, comments: [...(c.comments || []), tempComment] };
    }));
    setConfessionCommentInputs(prev => ({ ...prev, [id]: "" }));

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
        const updated = await res.json();
        // Replace with real server data to remove _temp flag
        setLocalConfessions(prev => (prev || confessions).map(c => c._id === id ? updated : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMediaSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (selectedMedia?.startsWith("blob:")) URL.revokeObjectURL(selectedMedia);

    if (type === "image") {
      setSelectedMedia(URL.createObjectURL(file));
      setSelectedMediaFile(file);
      setMediaType(type);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedMedia(reader.result);
      setSelectedMediaFile(null);
      setMediaType(type);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Story Video Pause/Play Sync
  useEffect(() => {
    if (storyVideoRef.current) {
      if (isStoryPaused) {
        storyVideoRef.current.pause();
      } else {
        storyVideoRef.current.play().catch(e => console.error("Video play error:", e));
      }
    }
  }, [isStoryPaused]);

  useEffect(() => {
    if (activeStory) {
      setIsStoryPaused(false);
      setCurrentStoryIndex(0);
      storyProgressKey.current += 1;
    }
  }, [activeStory?._id || activeStory?.author?._id]);

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && !selectedMedia) || isPosting || isTextTooShort) return;
    setIsPosting(true);

    const token = localStorage.getItem("collegeadda_token");
    const userId = currentUser?._id || currentUser?.id;
    const tempId = `temp-${Date.now()}`;
    
    const savedContent = newPostContent;
    const savedMedia = selectedMedia;
    const savedMediaFile = selectedMediaFile;
    const savedMediaType = mediaType;
    
    // 1. Optimistic UI Update
    const optimisticRawPost = {
      _id: tempId,
      author: currentUser,
      university: currentUser?.university,
      createdAt: new Date().toISOString(),
      content: savedContent,
      likes: [],
      comments: [],
      mediaUrl: savedMedia || "",
      mediaType: savedMediaType,
      poll: null
    };
    
    queryClient.setQueryData(["posts", "v2", currentUser?._id], (old) => {
      return [optimisticRawPost, ...(old || [])];
    });
    
    // 2. Instantly reset inputs
    setNewPostContent("");
    setSelectedMedia(null);
    setSelectedMediaFile(null);
    setMediaType('none');
    
    try {
      let mediaUrl = savedMedia || "";
      let uploadedPostImage = null;

      if (savedMediaType === "image" && savedMediaFile) {
        uploadedPostImage = await uploadPostImage(savedMediaFile, userId);
        mediaUrl = uploadedPostImage.publicUrl;
      }

      const res = await fetch(`${apiUrl.trim()}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          content: savedContent,
          mediaUrl,
          mediaType: savedMediaType
        })
      });
      
      if (res.ok) {
        const createdPost = await res.json();
        
        if (savedMediaType === "image" && uploadedPostImage) {
          await savePostImageRecord({
            postId: createdPost._id || createdPost.id,
            userId,
            caption: savedContent,
            imageUrl: uploadedPostImage.publicUrl,
            university: createdPost.university || currentUser?.university,
            createdAt: createdPost.createdAt
          });
        }
        
        setFeedPage(1);
        setHasMorePosts(true);
        refetchPosts();
        
        setToastMsg("Post created!");
        setTimeout(() => setToastMsg(""), 2000);
      } else {
        throw new Error("Failed to create post on server");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      // Rollback optimistic update
      queryClient.setQueryData(["posts", "v2", currentUser?._id], (old) => {
        return (old || []).filter(p => p._id !== tempId);
      });
      setNewPostContent(savedContent);
      setSelectedMedia(savedMedia);
      setSelectedMediaFile(savedMediaFile);
      setMediaType(savedMediaType);
      alert(err.message || "Could not create post. Please try again.");
    } finally {
      setIsPosting(false);
      if (savedMedia?.startsWith("blob:")) {
        setTimeout(() => URL.revokeObjectURL(savedMedia), 5000);
      }
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
            commentsList: [...(post.commentsList || []), {
              id: `temp-${Date.now()}`,
              author: currentUser?.name || "You",
              userId: currentUser?._id || currentUser?.id,
              profilePic: currentUser?.profilePic,
              text
            }]
          };
        }
        return post;
      })
    );
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));

    try {
      const token = localStorage.getItem("collegeadda_token");
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
        const [formattedPost] = formatPosts([updatedPost]);
        if (formattedPost) {
          setPosts(currentPosts => currentPosts.map(post => post.id === postId ? formattedPost : post));
        }
      }
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

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return { text: "Good Morning", icon: Sun, color: "text-amber-500" };
    if (hr < 17) return { text: "Good Afternoon", icon: Sun, color: "text-orange-500" };
    if (hr < 21) return { text: "Good Evening", icon: Sunset, color: "text-rose-500" };
    if (hr < 21) return { text: "Good Evening", icon: Sunset, color: "text-rose-500" };
    return { text: "Good Night", icon: Moon, color: "text-indigo-400" };
  };

  const storyInputRef = useRef(null);
  const [isUploadingStory, setIsUploadingStory] = useState(false);

  const handleStoryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingStory(true);
    try {
      const { publicUrl } = await uploadAvatar(file, currentUser._id || currentUser.id);
      
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ mediaUrl: publicUrl, mediaType: "image" })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to post story to server");
      }
      
      queryClient.invalidateQueries(["stories"]);
      setToastMsg("Story uploaded successfully!");
      setTimeout(() => setToastMsg(""), 2000);
    } catch (err) {
      console.error(err);
      alert(`Failed to upload story: ${err.message}`);
    } finally {
      setIsUploadingStory(false);
      if (storyInputRef.current) storyInputRef.current.value = '';
    }
  };

  const handleStoryLike = async (storyId) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      
      // Optimistic update
      if (activeStory) {
        setActiveStory(prev => {
          const newStoryGroup = { ...prev };
          newStoryGroup.stories = [...prev.stories];
          const storyIndex = newStoryGroup.stories.findIndex(s => s._id === storyId);
          if (storyIndex !== -1) {
            const currentUserId = currentUser._id || currentUser.id;
            const targetStory = { ...newStoryGroup.stories[storyIndex] };
            const hasLiked = targetStory.likes?.some(id => id.toString() === currentUserId.toString());
            const likes = targetStory.likes || [];
            
            if (hasLiked) {
              targetStory.likes = (targetStory.likes || []).filter(id => id.toString() !== currentUserId.toString());
            } else {
              targetStory.likes = [...(targetStory.likes || []), currentUserId.toString()];
            }
            newStoryGroup.stories[storyIndex] = targetStory;
          }
          return newStoryGroup;
        });
      }

      await fetch(`${apiUrl}/api/stories/${storyId}/like`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      queryClient.invalidateQueries(["stories"]);
    } catch (err) {
      console.error("Failed to like story:", err);
    }
  };

  const handleStoryReply = async (e, storyId, targetUserId) => {
    e.preventDefault();
    if (!storyReplyText.trim()) return;

    try {
      const token = localStorage.getItem("collegeadda_token");
      
      // 1. Get or create private room
      const roomRes = await fetch(`${apiUrl}/api/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ target: targetUserId })
      });
      
      if (!roomRes.ok) throw new Error("Failed to access chat room");
      const room = await roomRes.json();
      
      // 2. Send the message
      const msgRes = await fetch(`${apiUrl}/api/chat/rooms/${room._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: `Replying to story: ${storyReplyText}`,
          mediaType: 'none'
        })
      });

      if (!msgRes.ok) throw new Error("Failed to send reply");
      
      setToastMsg("Reply sent!");
      setStoryReplyText("");
      setTimeout(() => setToastMsg(""), 2000);
      setActiveStory(null);
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    }
  };

  const myStoriesGroup = stories.find(s => (s.author?._id || s.author?.id) === (currentUser?._id || currentUser?.id));
  const hasMyStory = myStoriesGroup && myStoriesGroup.stories && myStoriesGroup.stories.length > 0;

  if (!isMounted || !isAuthenticated) return null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-transparent pb-[90px] lg:pb-0">
      <style>{`
        @keyframes shimmer-bg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .header-shimmer {
          background: linear-gradient(270deg, rgba(255,255,255,0.9), rgba(252,245,229,0.5), rgba(255,255,255,0.9));
          background-size: 200% 200%;
          animation: shimmer-bg 6s ease infinite;
        }
      `}</style>
      <header className="sticky top-0 z-40 border-b border-[#E8E6E0] header-shimmer px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-[1440px] w-full px-2 items-center justify-between">
          <div className="relative overflow-hidden py-1">
            {(() => {
              if (!currentUser) {
                return (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C8922A]">
                      Campus pulse
                    </p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1A1A1A]">
                      Campus Adda
                    </h1>
                  </div>
                );
              }
              const greeting = getGreeting();
              const Icon = greeting.icon;
              const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Champ';
              return (
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ rotate: [0, 15, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className={clsx("p-2 rounded-xl bg-amber-50/80 border border-amber-100 shadow-sm shrink-0", greeting.color)}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <div>
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C8922A] leading-none"
                    >
                      {greeting.text}
                    </motion.p>
                    <motion.h1 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25, type: "spring", stiffness: 100 }}
                      className="mt-0.5 text-xl font-black tracking-tight text-[#1A1A1A] leading-tight flex items-center gap-1"
                    >
                      Hey, {firstName} <span className="inline-block hover:animate-bounce cursor-default">👋</span>
                    </motion.h1>
                  </div>
                </div>
              );
            })()}
          </div>
        <div className="flex items-center space-x-4">

          <button 
            onClick={() => router.push('/collab')}
            title="Collab"
            className="rounded-2xl border border-[#E8E6E0] bg-[#F3F2EE] p-2.5 text-[#4A4A4A] transition-colors hover:bg-[#FFF8EC] hover:text-[#C8922A]"
          >
            <Zap size={22} />
          </button>
          <NotificationBell />
          <div 
            onClick={() => router.push('/profile')}
            className="brand-mark h-10 w-10 cursor-pointer rounded-2xl p-[2px] transition-transform hover:scale-105"
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[0.95rem] bg-white border border-[#E8E6E0]">
              <img src={getAvatarSrc(currentUser?.profilePic, currentUser?.name, currentUser?._id || currentUser?.id)} className="w-full h-full object-cover" alt="Me" />
            </div>
          </div>
        </div>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-[1440px] min-w-0 flex-1 px-3 py-4 sm:p-6"
      >
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-7 sm:space-y-8">
        <section className="app-panel min-w-0 max-w-full rounded-[1.6rem] border-2 border-[rgba(229,201,122,0.45)] p-4 transition-colors hover:border-[rgba(229,201,122,0.68)] sm:rounded-[2rem] sm:p-5 space-y-3">
          <div className="no-scrollbar flex max-w-full space-x-4 overflow-x-auto py-2 sm:space-x-5">
            {/* Your Story */}
            <div 
              className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer group"
            >
              <input type="file" className="hidden" accept="image/*" ref={storyInputRef} onChange={handleStoryUpload} />
              <div className="relative">
                <div 
                  className={clsx(
                    "w-20 h-20 rounded-full p-[3px] transition-all cursor-pointer",
                    hasMyStory 
                      ? "gradient-bg animate-rotate-gradient" 
                      : "bg-[#F3F2EE] group-hover:bg-[#E8E6E0]"
                  )}
                  onClick={() => hasMyStory ? setActiveStory(myStoriesGroup) : storyInputRef.current?.click()}
                >
                  <div className={clsx("w-full h-full rounded-full flex items-center justify-center overflow-hidden border", hasMyStory ? "bg-[#F9F8F5] border-[#E8E6E0] p-[2px]" : "bg-white border-[#E8E6E0]")}>
                    <div className={clsx("w-full h-full rounded-full flex items-center justify-center overflow-hidden", hasMyStory ? "border border-[#E8E6E0] shadow-inner" : "")}>
                       {isUploadingStory ? (
                         <div className="flex flex-col items-center justify-center">
                           <div className="h-4 w-4 border-2 border-[#C8922A] border-t-transparent rounded-full animate-spin"></div>
                         </div>
                       ) : (
                         <img src={getAvatarSrc(currentUser?.profilePic, currentUser?.name, currentUser?._id || currentUser?.id)} className="w-full h-full object-cover" alt="You" />
                       )}
                    </div>
                  </div>
                </div>
                {(!hasMyStory || (myStoriesGroup?.stories?.length || 0) < 3) && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); storyInputRef.current?.click(); }}
                    className="absolute bottom-1 right-1 w-6 h-6 gradient-bg rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg z-10 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </div>
                )}
              </div>
              <span className="text-xs text-[#6B6B6B] font-medium">Your Story</span>
            </div>

            {/* Others' Stories - all uni members except yourself */}
            {stories.filter(group => (group.author?._id || group.author?.id) !== (currentUser?._id || currentUser?.id)).map((group) => (
              <motion.div 
                key={group.author._id} 
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
                onClick={() => setActiveStory(group)}
              >
                <div className="w-20 h-20 rounded-full p-[3px] gradient-bg animate-rotate-gradient">
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#F9F8F5] flex items-center justify-center overflow-hidden border border-[#E8E6E0] shadow-inner">
                      <img 
                        src={getAvatarSrc(group.author.profilePic, group.author.name, group.author._id || group.author.id)} 
                        className="w-full h-full object-cover" 
                        alt={group.author.name} 
                      />
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#4A4A4A] font-medium truncate w-20 text-center">{group.author.name.split(' ')[0]}</span>
              </motion.div>
            ))}
          </div>
        </section>


        {/* Create Post Prompt */}
        <motion.div 
          variants={itemVariants}
          className="relative flex min-w-0 max-w-full flex-col space-y-4 overflow-hidden bg-white border border-[#E8E6E0] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] group sm:p-5"
        >
          <div className="absolute top-0 left-0 w-full h-1 gradient-bg opacity-30 group-focus-within:opacity-100 transition-opacity" />
          <div className="flex min-w-0 items-start space-x-3 sm:space-x-4">
            <div className="w-12 h-12 rounded-full gradient-bg p-[2px] flex-shrink-0">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden">
                <img src={getAvatarSrc(currentUser?.profilePic, currentUser?.name, currentUser?._id || currentUser?.id)} className="w-full h-full object-cover" alt="You" />
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
                className="ca-input w-full min-w-0 resize-none sm:text-base mt-2 min-h-[60px] p-3"
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
                  onClick={() => {
                    if (selectedMedia?.startsWith("blob:")) URL.revokeObjectURL(selectedMedia);
                    setSelectedMedia(null);
                    setSelectedMediaFile(null);
                    setMediaType('none');
                  }}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/40 transition-all border border-white/10"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3 border-t border-[#E8E6E0] pt-4 sm:flex-row sm:items-center sm:justify-between">
             <div className="grid grid-cols-3 gap-2 sm:flex sm:space-x-5">
               <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => handleMediaSelect(e, 'image')} />
               <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleMediaSelect(e, 'video')} />
               
               <button 
                 onClick={() => photoInputRef.current?.click()}
                 className="flex min-w-0 items-center justify-center space-x-1.5 rounded-2xl px-2 py-2 text-[#6B6B6B] transition-colors hover:text-[#C8922A] group sm:justify-start sm:px-0 sm:space-x-2"
               >
                 <div className="p-2 rounded-full group-hover:bg-[#FFF8EC] transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                 </div>
                 <span className="text-xs font-semibold">Photo</span>
               </button>
               <button 
                 onClick={() => videoInputRef.current?.click()}
                 className="flex min-w-0 items-center justify-center space-x-1.5 rounded-2xl px-2 py-2 text-[#6B6B6B] transition-colors hover:text-[#C8922A] group sm:justify-start sm:px-0 sm:space-x-2"
               >
                 <div className="p-2 rounded-full group-hover:bg-[#FFF8EC] transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                 </div>
                 <span className="text-xs font-semibold">Video</span>
               </button>
               <button 
                 onClick={() => setShowPollModal(true)}
                 className="flex min-w-0 items-center justify-center space-x-1.5 rounded-2xl px-2 py-2 text-[#6B6B6B] transition-colors hover:text-[#C8922A] group sm:justify-start sm:px-0 sm:space-x-2"
               >
                 <div className="p-2 rounded-full group-hover:bg-[#FFF8EC] transition-colors">
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
               className="ca-btn-primary flex w-full sm:w-auto sm:min-w-[120px] px-5 py-3 sm:px-7 sm:py-2.5 items-center justify-center disabled:opacity-50 cursor-pointer"
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
        <div className="overflow-hidden rounded-[1.25rem] border border-[#E8E6E0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {showFeedSkeleton && (
            <div className="divide-y divide-[#E8E6E0]">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-6 space-y-4 animate-pulse bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-[#F3F2EE]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[#F3F2EE] rounded w-1/3" />
                      <div className="h-3 bg-[#F0EFE9] rounded w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-4 bg-[#F3F2EE] rounded w-full" />
                    <div className="h-4 bg-[#F3F2EE] rounded w-5/6" />
                  </div>
                  <div className="h-40 bg-[#F0EFE9] rounded-2xl w-full" />
                  <div className="flex justify-between pt-2 border-t border-[#E8E6E0]">
                    <div className="h-6 bg-[#F0EFE9] rounded w-12" />
                    <div className="h-6 bg-[#F0EFE9] rounded w-12" />
                    <div className="h-6 bg-[#F0EFE9] rounded w-8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showFeedSkeleton && posts.length === 0 && (
            <div className="bg-white p-8 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF8EC] flex items-center justify-center text-[#C8922A]">
                <Compass size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A]">Welcome to Campus Adda!</h3>
              <p className="text-sm text-[#6B6B6B] max-w-sm">
                Your feed is currently empty. Follow students at your college or explore other campuses to see posts and start connecting!
              </p>
              <button 
                onClick={() => router.push('/explore')}
                className="gradient-bg text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)] hover:scale-105 transition-transform animate-[pulse_2s_ease-in-out_infinite]"
              >
                Explore Campuses
              </button>
            </div>
          )}

          {!showFeedSkeleton && posts.length > 0 && filteredPosts.length === 0 && (
            <div className="bg-white p-8 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF8EC] flex items-center justify-center text-[#C8922A]">
                <Flame size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A]">No posts for #{selectedTopic}</h3>
              <p className="text-sm text-[#6B6B6B] max-w-sm">
                Be the first one to post about this topic on your campus!
              </p>
              <button 
                onClick={() => setSelectedTopic(null)}
                className="gradient-bg text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)] hover:scale-105 transition-transform"
              >
                Show All Posts
              </button>
            </div>
          )}
          
          {!showFeedSkeleton && filteredPosts.map((post) => (
            <motion.article
              key={post.id} 
              variants={itemVariants}
              className="relative min-w-0 border-b-2 border-[#D1D1D1] bg-white p-4 group last:border-b-0 sm:p-6"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-[#F3F2EE] overflow-hidden">
                      <img 
                        src={post.avatar} 
                        alt={post.author} 
                        className="w-full h-full object-cover rounded-full" 
                        onError={(e) => { e.target.src = getAvatarSrc("", post.author, post.authorId); }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[#1A1A1A] font-semibold flex items-center gap-2">
                      <NameWithTick name={post.author} tick={post.authorTick} />
                    </h3>
                    <p suppressHydrationWarning className="text-[#888888] text-sm">{post.university} • {post.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {friendsList.some(f => f.id === post.authorId) ? null : currentUser?._id !== post.authorId && currentUser?.id !== post.authorId ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleConnectUser(post.authorId)}
                      disabled={connectStatus[post.authorId] === 'pending' || connectStatus[post.authorId] === 'connected'}
                      className="text-[11px] font-bold px-4 py-1.5 rounded-full border border-[#E8E6E0] hover:bg-[#FFF8EC] hover:border-[#C8922A]/30 transition-all text-[#4A4A4A] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {connectStatus[post.authorId] === 'connected' ? 'Following' : connectStatus[post.authorId] === 'pending' ? '...' : 'Follow'}
                    </motion.button>
                  ) : null}
                  <div className="relative">
                    <button onClick={() => setPostMenu(postMenu === post.id ? null : post.id)} className="text-[#888888] hover:text-[#1A1A1A] p-1">
                      <MoreHorizontal size={20} />
                    </button>
                    {postMenu === post.id && (
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-[#E8E6E0] rounded-xl shadow-lg py-1 z-50 overflow-hidden">
                        {currentUser?._id === post.authorId || currentUser?.id === post.authorId ? (
                          <button 
                            onClick={() => { handleDeletePost(post.id); setPostMenu(null); }} 
                            className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-[#FFF8EC] transition-colors cursor-pointer"
                          >
                            Delete Post
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => { handleHidePost(post.id); setPostMenu(null); }}
                              className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-[#4A4A4A] hover:bg-[#F9F8F5] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                            >
                              Hide Post
                            </button>
                            <button 
                              onClick={() => { handleReportPost(post.id); setPostMenu(null); }}
                              className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-[#FFF8EC] hover:text-red-600 transition-colors border-t border-[#E8E6E0] cursor-pointer"
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
              
              {post.content && (
                <p className="text-[#1A1A1A] text-[15px] mb-5 leading-relaxed">
                  {post.content}
                </p>
              )}

              {/* Poll Section */}
              {post.poll && post.poll.options && post.poll.options.length > 0 && (
                <div className="bg-[#F9F8F5] p-5 rounded-2xl border border-[#E8E6E0] space-y-4 mb-5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EBEBEB]">
                    <p className="text-xs font-semibold text-[#888888]">{post.poll.allowMultiple ? "Select multiple answers" : "Select one answer"}</p>
                    <span className="text-[10px] text-[#C8922A] font-bold uppercase tracking-wider bg-[#C8922A]/10 px-2.5 py-0.5 rounded">Active Poll</span>
                  </div>
                  <div className="space-y-2.5">
                    {post.poll.options.map((option, idx) => {
                      const voteCountOf = (o) => (typeof o.votesCount === 'number' ? o.votesCount : (o.votes?.length || 0));
                      const maxVotes = Math.max(...post.poll.options.map(voteCountOf));
                      const totalVotes = post.poll.options.reduce((sum, opt) => sum + voteCountOf(opt), 0);
                      const optionVotes = voteCountOf(option);
                      const percentage = totalVotes === 0 ? 0 : Math.round((optionVotes / totalVotes) * 100);
                      const hasVoted = typeof option.votedByMe === 'boolean'
                        ? option.votedByMe
                        : Boolean(option.votes?.includes?.(currentUser?._id || currentUser?.id));
                      const isLeading = optionVotes === maxVotes && maxVotes > 0;
                      
                      return (
                        <div 
                          key={idx}
                          onClick={() => handleVote(post.id, idx)}
                          className="relative overflow-hidden rounded-lg bg-[#F3F2EE] transition-all hover:opacity-90 cursor-pointer group"
                        >
                          {/* Percentage Bar Fill */}
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className={`absolute top-0 bottom-0 left-0 ${isLeading ? 'ca-poll-bar-leading' : 'ca-poll-bar-default'}`}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                          />
                          
                          <div className="relative flex items-center justify-between p-4 z-10">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className={clsx(
                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                                hasVoted ? "border-[#C8922A] bg-[#C8922A] text-white" : "border-[#D1CFC8]"
                              )}>
                                {hasVoted && <Check size={12} strokeWidth={4} />}
                              </div>
                              <span className="text-[#1A1A1A] text-sm truncate">{option.text}</span>
                            </div>
                            
                            <div className="flex items-center justify-end space-x-2 shrink-0 bg-white/80 px-2.5 py-1 rounded-lg border border-[#E8E6E0] backdrop-blur-sm w-20">
                              <span className="text-[#1A1A1A] font-semibold">{percentage}%</span>
                              <span className="text-[10px] font-medium text-[#888888]">({optionVotes})</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#EBEBEB] text-[10px] font-bold uppercase tracking-wider">
                    <button className="text-[#C8922A] border border-[#C8922A]/30 hover:bg-[#FFF8EC] flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all">
                      <BarChart2 size={12} />
                      View Breakdown
                    </button>
                    <span className="text-[#888888] text-[10px] font-bold uppercase tracking-wider">{post.poll.options.reduce((sum, opt) => sum + (typeof opt.votesCount === 'number' ? opt.votesCount : (opt.votes?.length || 0)), 0)} total votes</span>
                  </div>
                </div>
              )}

              {post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden mb-5 border border-[#E8E6E0] bg-[#F3F2EE] shadow-sm">
                  {post.mediaType === 'video' ? (
                    <video src={post.mediaUrl} controls className="w-full h-auto max-h-[500px] object-contain" />
                  ) : (
                    <img src={post.mediaUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-contain mx-auto" />
                  )}
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between border-t border-[#EBEBEB] pt-4">
                <div className="flex items-center space-x-6 relative">
                  <div className="flex flex-col items-center group/like">
                    <motion.button 
                      whileTap={{ scale: 1.5 }}
                      onClick={() => toggleLike(post.id)}
                      className={clsx(
                        "flex items-center space-x-2 transition-colors p-2 rounded-full",
                        post.isLiked ? "text-[#C8922A]" : "text-[#888888] hover:text-[#C8922A]"
                      )}
                    >
                      <Heart size={22} className={clsx("transition-all", post.isLiked && "fill-[#C8922A]")} />
                      <span className="text-sm text-[#888888]">{post.likes}</span>
                    </motion.button>
                  </div>

                  <button 
                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                    className="flex items-center space-x-2 text-[#888888] hover:text-[#C8922A] p-2 rounded-full transition-colors"
                  >
                    <MessageCircle size={22} />
                    <span className="text-sm text-[#888888]">{post.comments}</span>
                  </button>
                </div>

                <button 
                  onClick={() => setShareModal(post.id)}
                  className="flex items-center space-x-2 text-[#888888] hover:text-[#C8922A] p-2 rounded-full transition-colors"
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
                    className="mt-4 border-t border-[#EBEBEB] pt-4 overflow-hidden"
                  >
                    <div className="space-y-4 mb-5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {(post.commentsList || []).map(comment => (
                        <div key={comment.id} className="flex space-x-3 items-start bg-[#F9F8F5] p-3 rounded-2xl">
                          <div className="w-7 h-7 rounded-full gradient-bg p-[1px] flex-shrink-0">
                            <img
                              src={getAvatarSrc(comment.profilePic, comment.author, comment.id || comment._id)}
                              alt={comment.author}
                              className="w-full h-full rounded-full object-cover bg-white"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getDefaultAvatar(comment.author, comment.id || comment._id);
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-[#1A1A1A]"><NameWithTick name={comment.author} tick={comment.authorTick} /></p>
                            <p className="text-xs text-[#6B6B6B] mt-0.5">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-[#F3F2EE] p-2 rounded-full border border-[#E8E6E0] focus-within:border-[#C8922A]/50 transition-all">
                      <input 
                        type="text" 
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                        placeholder={`Reply to ${post.author}...`} 
                        className="flex-1 bg-transparent px-4 py-1.5 text-sm focus:outline-none text-[#1A1A1A] placeholder:text-[#AAAAAA]" 
                      />
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleComment(post.id)}
                        className="gradient-bg p-2 rounded-full text-white shadow-md"
                      >
                        <Send size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          ))}

          {!showFeedSkeleton && posts.length > 0 && hasMorePosts && !selectedTopic && (
            <div className="p-4 bg-white border-t border-[#E8E6E0]">
              <button
                type="button"
                onClick={loadMorePosts}
                disabled={loadingMorePosts}
                className="w-full rounded-full border border-[#E8E6E0] bg-[#F9F8F5] px-4 py-3 text-xs font-black uppercase tracking-widest text-[#1A1A1A] transition-colors hover:border-[#C8922A]/40 hover:bg-[#FFF8EC] disabled:cursor-wait disabled:opacity-60"
              >
                {loadingMorePosts ? "Loading more..." : "Load more posts"}
              </button>
            </div>
          )}
        </div>
        </div>

        {/* Right Sidebar */}
        <aside className="hidden xl:flex flex-col w-[280px] shrink-0 space-y-6 self-start sticky top-24">
          
          {/* College Leaderboard */}
          <div className="bg-white border border-[#E8E6E0] rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F3F2EE]">
              <Trophy size={18} className="text-[#C8922A]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">College Leaderboard</h3>
            </div>
            <div className="space-y-3.5">
              {loadingLeaderboard ? (
                <div className="text-center py-4 text-xs text-[#888888]">Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#888888]">No rankings yet.</div>
              ) : (
                leaderboard.map((item, idx) => {
                  const name = item.college || item.name || item._id || "Unknown";
                  const count = item.verifiedStudents ?? item.verifiedCount ?? 0;
                  const points = item.points ?? item.score ?? 0;
                  
                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={clsx(
                          "w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0",
                          idx === 0 ? "bg-amber-100 text-amber-800" :
                          idx === 1 ? "bg-slate-100 text-slate-700" :
                          idx === 2 ? "bg-orange-100 text-orange-800" :
                          "bg-[#F3F2EE] text-[#6B6B6B]"
                        )}>
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-[#1A1A1A] truncate max-w-[130px]" title={name}>{name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[#1A1A1A]">{points} pts</p>
                        <p className="text-[9px] text-[#888888]">{count} stds</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Suggested for you */}
          <div className="bg-white border border-[#E8E6E0] rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F3F2EE]">
              <Users size={18} className="text-[#C8922A]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">Suggested for you</h3>
            </div>
            <div className="space-y-4">
              {loadingSuggested ? (
                <div className="text-center py-4 text-xs text-[#888888]">Loading...</div>
              ) : suggestedUsers.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#888888]">No suggestions right now.</div>
              ) : (
                suggestedUsers.slice(0, 5).map((user) => {
                  const isPending = connectStatus[user._id] === 'pending';
                  const isConnected = connectStatus[user._id] === 'connected';
                  
                  return (
                    <div key={user._id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-9 h-9 rounded-full overflow-hidden border border-[#E8E6E0] bg-[#F9F8F5] flex-shrink-0 cursor-pointer"
                          onClick={() => router.push(`/profile/${user._id}`)}
                        >
                          <img src={getAvatarSrc(user.profilePic, user.name, user._id || user.id)} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p 
                              className="text-xs font-bold text-[#1A1A1A] truncate cursor-pointer hover:underline"
                              onClick={() => router.push(`/profile/${user._id}`)}
                            >
                              {user.name}
                            </p>
                          </div>
                          <p className="text-[10px] text-[#888888] truncate max-w-[120px]">
                            {user.university || "CampusAdda User"}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleConnectUser(user._id)}
                        disabled={isPending || isConnected}
                        className={clsx(
                          "text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all shrink-0",
                          isConnected 
                            ? "bg-[#F3F2EE] text-[#888888] border-transparent" 
                            : "bg-white border-[#C8922A]/40 text-[#C8922A] hover:bg-[#FFF8EC]"
                        )}
                      >
                        {isPending ? "Connecting..." : isConnected ? "Connected" : "Connect"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </aside>
        </div>
      </motion.div>

      {/* Create Poll Modal */}
      <AnimatePresence>
        {showPollModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4" onClick={() => setShowPollModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-[#E8E6E0] p-5 shadow-xl bg-white custom-scrollbar sm:rounded-[3rem] sm:p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-green-500/10 rounded-2xl text-green-500">
                    <BarChart2 size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Create Poll</h2>
                </div>
                <button onClick={() => setShowPollModal(false)} className="p-2.5 hover:bg-[#F3F2EE] rounded-full transition-colors text-[#888888]"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#888888] ml-2">Question</label>
                  <textarea 
                    placeholder="Ask something to the campus..." 
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-[1.5rem] p-5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C8922A]/50 transition-all min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#888888] ml-2">Options</label>
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
                        className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-2xl py-4 pl-5 pr-12 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C8922A]/50 transition-all"
                      />
                      {pollOptions.length > 2 && (
                        <button 
                          onClick={() => setPollOptions(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-red-500 p-1"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {pollOptions.length < 5 && (
                    <button 
                      onClick={() => setPollOptions(prev => [...prev, ""])}
                      className="w-full py-4 rounded-2xl border border-dashed border-[#E8E6E0] text-[#AAAAAA] text-xs font-bold hover:bg-[#F9F8F5] hover:text-[#4A4A4A] transition-all flex items-center justify-center space-x-2"
                    >
                      <Plus size={14} />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F9F8F5] rounded-3xl border border-[#E8E6E0]">
                  <div className="flex items-center space-x-3">
                    <Check size={18} className={pollAllowMultiple ? "text-green-500" : "text-[#AAAAAA]"} />
                    <span className="text-sm font-bold text-[#4A4A4A]">Allow multiple answers</span>
                  </div>
                  <button 
                    onClick={() => setPollAllowMultiple(!pollAllowMultiple)}
                    className={clsx(
                      "w-12 h-6 rounded-full p-1 transition-all duration-300",
                      pollAllowMultiple ? "bg-green-500" : "bg-[#D1CFC8]"
                    )}
                  >
                    <div className={clsx(
                      "w-4 h-4 bg-white rounded-full shadow-md transition-all transform",
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4" onClick={() => setShareModal(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-[#E8E6E0] p-5 shadow-xl bg-white custom-scrollbar sm:rounded-[2.5rem] sm:p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Share with Squad</h2>
              <button onClick={() => setShareModal(null)} className="p-2 hover:bg-[#F3F2EE] rounded-full transition-colors text-[#888888]"><X size={20} /></button>
            </div>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAAAAA]" size={18} />
              <input 
                type="text" 
                placeholder="Find people to share with..." 
                value={shareSearchTerm}
                onChange={(e) => setShareSearchTerm(e.target.value)}
                className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-2xl py-3 pl-12 pr-4 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C8922A]/50 transition-all"
              />
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {friendsList.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <p className="text-[#888888] text-sm">No connections found yet.</p>
                  <button onClick={() => router.push('/friends')} className="text-[#C8922A] text-xs font-bold hover:underline">Find Campus Squad</button>
                </div>
              )}
              {friendsList.filter(f => f.name.toLowerCase().includes(shareSearchTerm.toLowerCase())).map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-[#F9F8F5] rounded-2xl transition-all border border-transparent hover:border-[#E8E6E0] group">
                  <div className="flex items-center space-x-4">
                    <img src={friend.avatar} alt={friend.name} className="w-11 h-11 rounded-full object-cover border border-[#E8E6E0]" />
                    <p className="text-sm font-bold text-[#1A1A1A]">{friend.name}</p>
                  </div>
                  <button 
                    onClick={() => handleShareToFriend(friend.id, shareModal)}
                    className="gradient-bg text-white text-[11px] font-bold px-5 py-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Send Now
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Story Viewer */}
      {activeStory && (() => {
        const currentStory = activeStory.stories[currentStoryIndex];
        const totalStories = activeStory.stories.length;
        const goNext = (e) => { e?.stopPropagation(); if (currentStoryIndex < totalStories - 1) { storyProgressKey.current++; setCurrentStoryIndex(i => i + 1); setIsStoryPaused(false); } else { setActiveStory(null); } };
        const goPrev = (e) => { e?.stopPropagation(); if (currentStoryIndex > 0) { storyProgressKey.current++; setCurrentStoryIndex(i => i - 1); setIsStoryPaused(false); } };
        return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90" onClick={() => setActiveStory(null)}>
          <style>{`
            @keyframes story-progress-30s { from { width: 0%; } to { width: 100%; } }
            .story-bar-active { animation: story-progress-30s 30s linear forwards; }
            .story-bar-active.paused { animation-play-state: paused; }
            .story-bar-done { width: 100%; background: white; }
            .story-bar-pending { width: 0%; }
          `}</style>
          <div className="relative h-[100dvh] w-full max-w-lg overflow-hidden bg-black shadow-2xl sm:aspect-[9/16] sm:h-auto md:rounded-3xl" onClick={e => e.stopPropagation()}>

            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex space-x-1 z-30">
              {activeStory.stories.map((s, i) => (
                <div key={`${s._id}-${storyProgressKey.current}`} className="h-[3px] bg-white/30 flex-1 rounded-full overflow-hidden">
                  <div 
                    onAnimationEnd={() => goNext()}
                    className={`h-full bg-white rounded-full ${
                      i < currentStoryIndex ? 'story-bar-done' :
                      i === currentStoryIndex ? `story-bar-active ${isStoryPaused ? 'paused' : ''}` :
                      'story-bar-pending'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-10 left-4 right-4 flex justify-between items-center z-30">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full p-[2px] gradient-bg">
                  <img 
                    src={getAvatarSrc(activeStory.author.profilePic, activeStory.author.name, activeStory.author._id || activeStory.author.id)} 
                    className="w-full h-full rounded-full border border-black object-cover" 
                    alt="" 
                  />
                </div>
                <div>
                  <p className="!text-white font-bold text-sm leading-tight">{activeStory.author.name}</p>
                  <p className="!text-white/60 text-[10px] uppercase tracking-wider">
                    {new Date(currentStory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {currentStoryIndex + 1}/{totalStories}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button onClick={(e) => { e.stopPropagation(); setIsStoryPaused(p => !p); }} className="!text-white p-2 !bg-white/10 hover:!bg-white/20 rounded-full transition-all">
                  {isStoryPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>
                <button onClick={() => setActiveStory(null)} className="!text-white p-2 !bg-white/10 hover:!bg-white/20 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="w-full h-full flex items-center justify-center bg-black relative">
              {currentStory.mediaType === 'video' ? (
                <video ref={storyVideoRef} src={currentStory.mediaUrl} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={currentStory.mediaUrl} className="w-full h-full object-cover" alt="" />
              )}
              {/* Top & Bottom Gradients */}
              <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent z-10" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent z-10" />

              {/* Tap zones: left = prev, right = next */}
              <div className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" onClick={goPrev} />
              <div className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer" onClick={goNext} />
            </div>

            {/* Prev / Next Arrow Buttons */}
            {currentStoryIndex > 0 && (
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 !bg-white/15 hover:!bg-white/30 !text-white rounded-full backdrop-blur-sm transition-all"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {currentStoryIndex < totalStories - 1 && (
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 !bg-white/15 hover:!bg-white/30 !text-white rounded-full backdrop-blur-sm transition-all"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Story Actions */}
            <div className="absolute bottom-8 left-4 right-4 flex items-center space-x-3 z-30">
              <form 
                onSubmit={(e) => handleStoryReply(e, currentStory._id, activeStory.author._id || activeStory.author.id)}
                className="flex-1 flex space-x-2"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex-1 rounded-full flex items-center px-4 py-3 border !border-white/30 !bg-black/40 backdrop-blur-md">
                  <input 
                    type="text" 
                    value={storyReplyText}
                    onChange={(e) => setStoryReplyText(e.target.value)}
                    placeholder={`Reply to ${activeStory.author.name.split(' ')[0]}...`} 
                    className="!bg-transparent !text-white text-sm focus:outline-none w-full placeholder:!text-white/60"
                  />
                </div>
                <button 
                  type="submit"
                  className="p-3 gradient-bg rounded-full !text-white shadow-lg shrink-0"
                  disabled={!storyReplyText.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
              <button 
                onClick={(e) => { e.stopPropagation(); handleStoryLike(currentStory._id); }}
                className="p-3 rounded-full !text-white !bg-black/40 border !border-white/30 backdrop-blur-md shrink-0"
              >
                <Heart 
                  size={22} 
                  className={(currentStory.likes || []).some(id => id.toString() === (currentUser?._id || currentUser?.id)?.toString()) ? "fill-red-500 text-red-500" : ""}
                />
              </button>
            </div>
          </div>
        </div>
        );
      })()}

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
