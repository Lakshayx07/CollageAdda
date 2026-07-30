"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, MoreVertical, Send, X, Check, Plus, Flame, TrendingUp, Search, Zap, BarChart2, Compass, ShieldCheck, Flag, Globe, GraduationCap, ChevronLeft, ChevronRight, Users, Trophy, Sun, Sunset, Moon, Pause, Play, Bookmark, Smile, Image as ImageIcon, Video } from "lucide-react";
import Image from "next/image";
import NotificationBell from "../../components/NotificationBell";
import TopNav from "../../components/TopNav";
import NameWithTick from '../../components/NameWithTick';

import CampusLeaderboard from "../../components/CampusLeaderboard";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import FAB from "../../components/FAB";
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
  const [commentLikes, setCommentLikes] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});
  const [shareModal, setShareModal] = useState(null);
  const [postMenu, setPostMenu] = useState(null);
  const [shareSearchTerm, setShareSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [isMobileCreateOpen, setIsMobileCreateOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('none');
  const [isExploreMode, setIsExploreMode] = useState(false);
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

  // Real-time character-by-character typing animation for Create Post input
  const placeholderTexts = useMemo(() => [
    "What's happening on your campus today?",
    "Got any college tea to spill? ☕️",
    "Any upcoming fests or events?",
    "How are you balancing studies and personal life?",
    "Who's winning the inter-college sports tournament? 🏆",
    "Share your campus hack for the day!",
    "What's your dream car right now? 🏎️",
    "Ask a question to your seniors...",
    "Looking for project collaborators?",
    "Late night thoughts or early morning hustle?",
    "What's the best spot to hang out today?"
  ], []);
  
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typedCharCount, setTypedCharCount] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const placeholderTextToType = placeholderTexts[placeholderIndex];

  useEffect(() => {
    let timeout;
    if (typedCharCount < placeholderTextToType.length) {
      timeout = setTimeout(() => {
        setTypedCharCount((prev) => prev + 1);
      }, 55);
    } else {
      timeout = setTimeout(() => {
        setTypedCharCount(0);
        setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
      }, 2500);
    }
    return () => clearTimeout(timeout);
  }, [typedCharCount, placeholderTextToType, placeholderTexts]);

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
        time: new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
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
          text: c.text,
          likesCount: c.likesCount || 0,
          likedByMe: c.likedByMe || false
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
  const exploreInputRef = useRef(null);

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
            // Onboarding redirect removed
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
    // Optimistic UI Update: Instantly show as connected so the user doesn't wait
    setConnectStatus(prev => ({ ...prev, [userId]: 'connected' }));
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/users/${userId}/follow`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Fire invalidations asynchronously in the background
        queryClient.invalidateQueries({ queryKey: ["network-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["explore-following"] });
        queryClient.invalidateQueries({ queryKey: ["user-following"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["network-suggested"] });
        queryClient.invalidateQueries({ queryKey: ["suggested"] });
      } else {
        // Revert optimistic update on failure
        setConnectStatus(prev => ({ ...prev, [userId]: null }));
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update on error
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
    const wasExploreMode = isExploreMode;

    // 1. Optimistic UI Update (only if NOT explore mode)
    if (!wasExploreMode) {
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
    }

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
          mediaType: savedMediaType,
          isMemoryOnly: wasExploreMode
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

        // Success: Reset UI states
        setNewPostContent("");
        setSelectedMedia(null);
        setSelectedMediaFile(null);
        setMediaType('none');
        setIsExploreMode(false);

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
      if (!wasExploreMode) {
        queryClient.setQueryData(["posts", "v2", currentUser?._id], (old) => {
          return (old || []).filter(p => p._id !== tempId);
        });
      }
      // Failed: Do NOT reset explore mode since they might want to retry
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

  const toggleCommentLike = async (postId, commentId) => {
    // Optimistic UI update via setCommentLikes to keep it fast
    setCommentLikes(prev => {
      const isCurrentlyLiked = prev[commentId]?.liked !== undefined
        ? prev[commentId].liked
        : false;

      const currentCount = prev[commentId]?.count !== undefined
        ? prev[commentId].count
        : 0;

      return {
        ...prev,
        [commentId]: {
          liked: !isCurrentlyLiked,
          count: currentCount + (isCurrentlyLiked ? -1 : 1)
        }
      };
    });

    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/posts/${postId}/comment/${commentId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to toggle comment like:", err);
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
        .post-card { transition: box-shadow 0.25s cubic-bezier(0.22,1,0.36,1), transform 0.25s cubic-bezier(0.22,1,0.36,1); }
        .post-card:hover { box-shadow: 0 16px 40px rgba(0,0,0,0.07), 0 6px 16px rgba(0,0,0,0.03); transform: translateY(-2px); }
        .story-ring { background: linear-gradient(135deg, #FDE68A, #FCD34D, #EAC87A); }
        .action-btn { transition: color 0.2s ease, background 0.2s ease, transform 0.15s ease; border-radius: 9999px; }
        .action-btn:hover { transform: scale(1.05); }
        .action-btn:active { transform: scale(0.95); }
      `}</style>

      {/* ── TOP NAV ─────────────────────────────────────────── */}
      <TopNav currentUser={currentUser} />

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-[1440px] min-w-0 flex-1 px-0 py-2 sm:p-6"
      >
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_292px]">
          {/* ── LEFT COLUMN ── */}
          <div className="min-w-0 space-y-5">

            <section
              className="bg-card border-y sm:border border-border sm:rounded-[18px] shadow-sm px-4 py-3 sm:px-6 sm:py-4"
            >
              <div className="no-scrollbar flex max-w-full space-x-4 overflow-x-auto py-1">
                {/* Your Story */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
                  <input type="file" className="hidden" accept="image/*" ref={storyInputRef} onChange={handleStoryUpload} />
                  <div className="relative">
                    <div
                      className="transition-all cursor-pointer"
                      style={{
                        width: 64, height: 64,
                        borderRadius: 9999,
                        padding: 2.5,
                        background: hasMyStory
                          ? "linear-gradient(135deg, #FDE68A, #FCD34D, #EAC87A)"
                          : "#F5F2EC",
                      }}
                      onClick={() => hasMyStory ? setActiveStory(myStoriesGroup) : storyInputRef.current?.click()}
                    >
                      <div
                        className="w-full h-full flex items-center justify-center overflow-hidden"
                        style={{
                          borderRadius: 9999,
                          background: "#FFFFFF",
                          border: hasMyStory ? "1.5px solid rgba(255,255,255,0.8)" : "none",
                        }}
                      >
                        {isUploadingStory ? (
                          <div className="h-4 w-4 border-2 border-[#FDE68A] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <img src={getAvatarSrc(currentUser?.profilePic, currentUser?.name, currentUser?._id || currentUser?.id)} className="w-full h-full object-cover rounded-full" alt="You" />
                        )}
                      </div>
                    </div>
                    {(!hasMyStory || (myStoriesGroup?.stories?.length || 0) < 3) && (
                      <div
                        onClick={(e) => { e.stopPropagation(); storyInputRef.current?.click(); }}
                        className="absolute bottom-0 right-0 flex items-center justify-center text-white cursor-pointer"
                        style={{
                          width: 20, height: 20,
                          borderRadius: 9999,
                          background: "linear-gradient(135deg, #FDE68A, #FCD34D)",
                          border: "2px solid #FFFFFF",
                          boxShadow: "0 2px 6px rgba(253, 230, 138,0.35)",
                          zIndex: 10,
                          transition: "transform 0.15s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = ""}
                      >
                        <Plus size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "-0.01em" }}>Your Story</span>
                </div>

                {/* Others' Stories */}
                {stories.filter(group => (group.author?._id || group.author?.id) !== (currentUser?._id || currentUser?.id)).map((group) => (
                  <motion.div
                    key={group.author._id}
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
                    onClick={() => setActiveStory(group)}
                  >
                    <div
                      style={{
                        width: 64, height: 64,
                        borderRadius: 9999,
                        padding: 2.5,
                        background: "linear-gradient(135deg, #FDE68A, #FCD34D, #EAC87A)",
                      }}
                    >
                      <div
                        className="w-full h-full flex items-center justify-center overflow-hidden"
                        style={{ borderRadius: 9999, background: "#FFFFFF", border: "1.5px solid rgba(255,255,255,0.8)" }}
                      >
                        <img
                          src={getAvatarSrc(group.author.profilePic, group.author.name, group.author._id || group.author.id)}
                          className="w-full h-full object-cover rounded-full"
                          alt={group.author.name}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#4B5563", letterSpacing: "-0.01em", maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                      {group.author.name.split(' ')[0]}
                    </span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* CREATE POST (Hidden on Mobile unless FAB clicked) */}
            <Card variants={itemVariants} className={clsx("relative overflow-hidden group border border-border/70", !isMobileCreateOpen && "hidden sm:block")}>
              <div className="flex min-w-0 items-start gap-4">
                {/* Avatar */}
                <div
                  className="flex-shrink-0 cursor-pointer bg-gradient-to-br from-primary to-primary-hover transition-transform duration-200 hover:scale-105"
                  style={{ padding: 2, borderRadius: 9999 }}
                  onClick={() => router.push('/profile')}
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-card border-2 border-card">
                    <img src={getAvatarSrc(currentUser?.profilePic, currentUser?.name, currentUser?._id || currentUser?.id)} className="w-full h-full object-cover" alt="You" />
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0 relative bg-secondary-background rounded-2xl border border-border/60 p-3.5 transition-colors duration-200 hover:border-primary/40 focus-within:border-primary focus-within:bg-card focus-within:shadow-[0_2px_12px_rgba(251,191,36,0.15)]">
                  {!newPostContent && !isInputFocused && (
                    <div className="absolute top-3.5 left-3.5 pointer-events-none text-foreground-muted/65 text-[16.5px] font-medium leading-relaxed flex items-center">
                      <span>
                        {placeholderTextToType.slice(0, typedCharCount)}
                      </span>
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.7 }}
                        className="inline-block w-[2px] h-[19px] bg-primary ml-0.5 rounded-full"
                      />
                    </div>
                  )}
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!isTextTooShort) handleCreatePost();
                      }
                    }}
                    className="post-editor-textarea w-full min-w-0 resize-none leading-relaxed bg-transparent border-none outline-none text-foreground text-[16.5px] font-medium"
                    style={{
                      minHeight: 56,
                      fontFamily: "Inter, sans-serif",
                      letterSpacing: "-0.015em",
                    }}
                  />
                  {isTextTooShort && (
                    <div className="flex items-center gap-1.5 text-warning animate-pulse mt-2 text-[13px] font-semibold">
                      <span>⚠️ Write at least 10 characters to share a quality update!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Media Preview */}
              <AnimatePresence>
                {selectedMedia && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative overflow-hidden flex items-center justify-center mt-4 mb-2 rounded-2xl border border-border bg-secondary-background"
                    style={{
                      maxHeight: 400,
                    }}
                  >
                    {mediaType === 'video' ? (
                      <video src={selectedMedia} controls className="w-full h-auto max-h-[400px] object-contain" />
                    ) : (
                      <img src={selectedMedia} className="w-full h-auto max-h-[400px] object-contain" alt="Preview" />
                    )}
                    <IconButton
                      onClick={() => {
                        if (selectedMedia?.startsWith("blob:")) URL.revokeObjectURL(selectedMedia);
                        setSelectedMedia(null);
                        setSelectedMediaFile(null);
                        setMediaType('none');
                      }}
                      className="absolute top-3 right-3 !h-8 !w-8 bg-card/80 text-foreground hover:bg-card border border-border backdrop-blur-md shadow-xs"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </IconButton>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Bar */}
              <div
                className="flex flex-col gap-4 mt-4 pt-4 sm:flex-row sm:items-center sm:justify-between border-t border-border/80"
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => { setIsExploreMode(false); handleMediaSelect(e, 'image'); }} />
                  <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => { setIsExploreMode(false); handleMediaSelect(e, 'video'); }} />
                  <input type="file" ref={exploreInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const type = file.type.startsWith('video/') ? 'video' : 'image';
                      setIsExploreMode(true);
                      handleMediaSelect(e, type);
                    }
                  }} />

                  {[
                    { label: "Photo", icon: <ImageIcon size={19} strokeWidth={2} />, onClick: () => photoInputRef.current?.click(), color: "#22C55E" },
                    { label: "Video", icon: <Video size={19} strokeWidth={2} />, onClick: () => videoInputRef.current?.click(), color: "#3B82F6" },
                    { label: "Poll", icon: <BarChart2 size={19} strokeWidth={2} />, onClick: () => setShowPollModal(true), color: "#FCD34D" },
                  ].map(({ label, icon, onClick, color }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      className="flex items-center justify-center gap-2 cursor-pointer text-foreground-muted bg-transparent hover:bg-secondary-background transition-all duration-200 rounded-xl px-3.5 py-2 text-[13.5px] font-semibold"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--color-foreground-muted)";
                      }}
                    >
                      {icon}
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  {(!selectedMedia || isExploreMode) && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (!selectedMedia) { exploreInputRef.current?.click(); }
                        else { handleCreatePost(); }
                      }}
                      disabled={isPosting}
                      loading={isPosting}
                      className="w-full sm:w-auto sm:min-w-[130px] text-black"
                    >
                      Post to Explore
                    </Button>
                  )}
                  {(!selectedMedia || !isExploreMode) && (
                    <Button
                      variant="primary"
                      onClick={handleCreatePost}
                      disabled={isPosting || isTextTooShort || (!newPostContent.trim() && !selectedMedia)}
                      loading={isPosting}
                      className="w-full sm:w-auto sm:min-w-[140px]"
                    >
                      Post to Feed
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* POSTS FEED */}
            <div
              className="bg-card border-y sm:border border-border sm:rounded-[18px] shadow-sm overflow-hidden"
            >
              {/* Skeleton */}
              {showFeedSkeleton && (
                <div>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-6 space-y-4 animate-pulse" style={{ borderBottom: n < 3 ? "1px solid #EDE9E0" : "none" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full" style={{ background: "#F0EBE0" }} />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 rounded-md w-1/3" style={{ background: "#F0EBE0" }} />
                          <div className="h-3 rounded-md w-1/4" style={{ background: "#F5F2EC" }} />
                        </div>
                      </div>
                      <div className="space-y-2 pt-1">
                        <div className="h-3.5 rounded-md w-full" style={{ background: "#F0EBE0" }} />
                        <div className="h-3.5 rounded-md w-5/6" style={{ background: "#F0EBE0" }} />
                        <div className="h-3.5 rounded-md w-3/4" style={{ background: "#F5F2EC" }} />
                      </div>
                      <div className="h-48 rounded-2xl w-full" style={{ background: "#F5F2EC" }} />
                      <div className="flex justify-between pt-2" style={{ borderTop: "1px solid #EDE9E0" }}>
                        <div className="h-5 rounded-full w-14" style={{ background: "#F5F2EC" }} />
                        <div className="h-5 rounded-full w-14" style={{ background: "#F5F2EC" }} />
                        <div className="h-5 rounded-full w-8" style={{ background: "#F5F2EC" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!showFeedSkeleton && posts.length === 0 && (
                <div className="p-10 text-center flex flex-col items-center gap-4">
                  <div
                    className="flex items-center justify-center"
                    style={{ width: 64, height: 64, borderRadius: 18, background: "#FBF7EE", color: "#FDE68A" }}
                  >
                    <Compass size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#202124", letterSpacing: "-0.02em" }}>Welcome to Campus Adda!</h3>
                    <p style={{ fontSize: 13, color: "#6B7280", marginTop: 6, maxWidth: 320, lineHeight: 1.6 }}>
                      Your feed is currently empty. Follow students at your college or explore other campuses to see posts and start connecting!
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/explore')}
                    className="text-white"
                    style={{
                      borderRadius: 14,
                      padding: "10px 24px",
                      background: "linear-gradient(135deg, #FDE68A, #FCD34D)",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      boxShadow: "0 4px 14px rgba(253, 230, 138,0.28)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(253, 230, 138,0.36)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(253, 230, 138,0.28)"; }}
                  >
                    Explore Campuses
                  </button>
                </div>
              )}

              {/* Topic filter empty */}
              {!showFeedSkeleton && posts.length > 0 && filteredPosts.length === 0 && (
                <div className="p-10 text-center flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: 18, background: "#FBF7EE", color: "#FDE68A" }}>
                    <Flame size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#202124" }}>No posts for #{selectedTopic}</h3>
                    <p style={{ fontSize: 13, color: "#6B7280", marginTop: 6 }}>Be the first one to post about this topic on your campus!</p>
                  </div>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="text-white"
                    style={{ borderRadius: 14, padding: "10px 24px", background: "linear-gradient(135deg, #FDE68A, #FCD34D)", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", boxShadow: "0 4px 14px rgba(253, 230, 138,0.28)" }}
                  >
                    Show All Posts
                  </button>
                </div>
              )}

              {/* Post Cards */}
              {!showFeedSkeleton && filteredPosts.map((post, postIdx) => (
                <Card
                  key={post.id}
                  variants={itemVariants}
                  className="post-card relative min-w-0"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className="overflow-hidden flex-shrink-0 cursor-pointer bg-secondary-background border border-border/80 transition-transform duration-200 hover:scale-105"
                        style={{ width: 44, height: 44, borderRadius: 14 }}
                        onClick={() => router.push(`/profile/${post.authorId}`)}
                      >
                        <img
                          src={post.avatar}
                          alt={post.author}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = getAvatarSrc("", post.author, post.authorId); }}
                        />
                      </div>
                      <div>
                        <h3
                          className="flex items-center gap-1.5 cursor-pointer hover:underline decoration-1 underline-offset-2 text-foreground font-bold"
                          style={{ fontSize: 15, letterSpacing: "-0.015em", lineHeight: 1.25 }}
                          onClick={() => router.push(`/profile/${post.authorId}`)}
                        >
                          <NameWithTick name={post.author} tick={post.authorTick} />
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p suppressHydrationWarning className="text-foreground-muted font-normal" style={{ fontSize: 12.5, letterSpacing: "-0.01em" }}>
                            {post.university}
                          </p>
                          <span className="text-border" style={{ fontSize: 10 }}>•</span>
                          <p suppressHydrationWarning className="text-foreground-muted/70 font-normal" style={{ fontSize: 12 }}>
                            {post.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Follow + Menu */}
                    <div className="flex items-center gap-2">
                      {currentUser?._id !== post.authorId && currentUser?.id !== post.authorId ? (
                        friendsList.some(f => String(f.id) === String(post.authorId)) || (currentUser?.following || []).some(id => String(id) === String(post.authorId)) || connectStatus[post.authorId] === 'connected' ? (
                          <span
                            className="inline-flex items-center justify-center rounded-full border border-info/30 bg-info/10 px-3 py-1 text-[10.5px] font-bold text-info tracking-[0.04em] uppercase"
                          >
                            Network
                          </span>
                        ) : (
                          <Button
                            variant="secondary"
                            onClick={() => handleConnectUser(post.authorId)}
                            disabled={connectStatus[post.authorId] === 'pending'}
                            loading={connectStatus[post.authorId] === 'pending'}
                            className="!h-[32px] !px-4 !text-[11.5px] !rounded-full"
                          >
                            Follow
                          </Button>
                        )
                      ) : null}

                      {/* Menu */}
                      <div className="relative">
                        <IconButton
                          onClick={() => setPostMenu(postMenu === post.id ? null : post.id)}
                          className="!h-8 !w-8"
                        >
                          <MoreVertical size={18} />
                        </IconButton>
                        {postMenu === post.id && (
                          <div
                            className="absolute right-0 top-full mt-1.5 py-1 z-50 overflow-hidden rounded-2xl bg-card border border-border shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                            style={{
                              width: 156,
                            }}
                          >
                            {currentUser?._id === post.authorId || currentUser?.id === post.authorId ? (
                              <button
                                onClick={() => { handleDeletePost(post.id); setPostMenu(null); }}
                                className="w-full text-left px-4 py-2.5 cursor-pointer text-danger hover:bg-danger/10 transition-colors"
                                style={{ fontSize: 13, fontWeight: 600 }}
                              >
                                Delete Post
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => { handleHidePost(post.id); setPostMenu(null); }}
                                  className="w-full text-left px-4 py-2.5 cursor-pointer text-foreground hover:bg-background transition-colors"
                                  style={{ fontSize: 13, fontWeight: 500 }}
                                >
                                  Hide Post
                                </button>
                                <div className="h-px bg-border my-0.5 mx-0" />
                                <button
                                  onClick={() => { handleReportPost(post.id); setPostMenu(null); }}
                                  className="w-full text-left px-4 py-2.5 cursor-pointer text-danger hover:bg-danger/10 transition-colors"
                                  style={{ fontSize: 13, fontWeight: 600 }}
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
                    <p className="text-foreground font-medium" style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: 16, letterSpacing: "-0.01em" }}>
                      {post.content}
                    </p>
                  )}

                  {/* Poll */}
                  {post.poll && post.poll.options && post.poll.options.length > 0 && (
                    <div
                      className="space-y-3 mb-5 bg-secondary-background border border-border p-4"
                      style={{ borderRadius: 16 }}
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-border/80">
                        <p className="text-foreground-muted" style={{ fontSize: 11.5, fontWeight: 600 }}>
                          {post.poll.allowMultiple ? "Select multiple answers" : "Select one answer"}
                        </p>
                        <span
                          className="bg-primary/10 border border-primary/20 text-primary"
                          style={{
                            fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                            padding: "2.5px 9px", borderRadius: 9999,
                          }}
                        >
                          Active Poll
                        </span>
                      </div>
                      <div className="space-y-2">
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
                              className="relative overflow-hidden cursor-pointer"
                              style={{ borderRadius: 10, background: "#F5F2EC", transition: "opacity 0.2s ease" }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className="absolute top-0 bottom-0 left-0"
                                style={{
                                  borderRadius: 10,
                                  background: isLeading
                                    ? "linear-gradient(90deg, #FDE68A, #FCD34D)"
                                    : "rgba(253, 230, 138,0.12)",
                                }}
                                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                              />
                              <div className="relative flex items-center justify-between z-10" style={{ padding: "12px 14px" }}>
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className="flex items-center justify-center shrink-0 transition-all"
                                    style={{
                                      width: 18, height: 18,
                                      borderRadius: 5,
                                      border: hasVoted ? "none" : "1.5px solid var(--color-border)",
                                      background: hasVoted ? "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))" : "transparent",
                                    }}
                                  >
                                    {hasVoted && <Check size={11} strokeWidth={3} className="text-white" />}
                                  </div>
                                  <span className="truncate text-foreground" style={{ fontSize: 13, fontWeight: 500 }}>{option.text}</span>
                                </div>
                                <div
                                  className="flex items-center gap-1.5 shrink-0"
                                  style={{
                                    background: "rgba(255,255,255,0.85)",
                                    backdropFilter: "blur(4px)",
                                    border: "1px solid #EDE9E0",
                                    borderRadius: 8, padding: "3px 10px",
                                    minWidth: 72,
                                  }}
                                >
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>{percentage}%</span>
                                  <span style={{ fontSize: 10, fontWeight: 500, color: "#9CA3AF" }}>({optionVotes})</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #EDE9E0" }}>
                        <button
                          className="flex items-center gap-1.5 transition-all bg-transparent hover:bg-background text-primary border border-primary/25"
                          style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                            borderRadius: 9999, padding: "4px 12px",
                          }}
                        >
                          <BarChart2 size={11} /> View Breakdown
                        </button>
                        <span className="text-foreground-muted" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                          {post.poll.options.reduce((sum, opt) => sum + (typeof opt.votesCount === 'number' ? opt.votesCount : (opt.votes?.length || 0)), 0)} total votes
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Media */}
                  {post.mediaUrl && (
                    <div
                      className="overflow-hidden mb-5 rounded-2xl border border-border bg-secondary-background shadow-xs"
                    >
                      {post.mediaType === 'video' ? (
                        <video src={post.mediaUrl} controls className="w-full h-auto max-h-[500px] object-contain" />
                      ) : (
                        <img src={post.mediaUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-cover mx-auto" />
                      )}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      {/* Like */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.90 }}
                        onClick={() => toggleLike(post.id)}
                        className={clsx(
                          "flex items-center gap-2 h-9 px-3.5 rounded-xl font-bold text-[13px] transition-all cursor-pointer border border-transparent",
                          post.isLiked
                            ? "bg-danger/10 text-danger border-danger/20"
                            : "bg-transparent text-foreground-muted hover:bg-secondary-background hover:text-foreground"
                        )}
                      >
                        <motion.div
                          animate={post.isLiked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <Heart size={19} strokeWidth={post.isLiked ? 2.5 : 2} className={post.isLiked ? "fill-danger" : ""} />
                        </motion.div>
                        <span>{post.likes}</span>
                      </motion.button>

                      {/* Comment */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.90 }}
                        onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                        className={clsx(
                          "flex items-center gap-2 h-9 px-3.5 rounded-xl font-bold text-[13px] transition-all cursor-pointer border border-transparent",
                          activeCommentPost === post.id
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-transparent text-foreground-muted hover:bg-secondary-background hover:text-foreground"
                        )}
                      >
                        <MessageCircle size={19} strokeWidth={2} />
                        <span>{post.comments}</span>
                      </motion.button>
                    </div>

                    {/* Share (Telegram Style) */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.90 }}
                      onClick={() => setShareModal(post.id)}
                      title="Share post"
                      className="flex items-center justify-center h-9 w-9 rounded-xl bg-white text-[#2AABEE] hover:bg-slate-50 shadow-[0_2px_8px_rgba(42,171,238,0.15)] border border-[#2AABEE]/20 transition-all cursor-pointer"
                    >
                      <Send size={16} strokeWidth={2.5} className="ml-[-2px] mt-[1px]" />
                    </motion.button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {activeCommentPost === post.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-4 overflow-hidden border-t border-border pt-4"
                      >
                        <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
                          {(post.commentsList || []).map(comment => (
                            <div
                              key={comment.id}
                              className="flex gap-2.5 items-start bg-background rounded-xl px-3 py-2.5"
                            >
                              <div
                                className="overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-primary-hover"
                                style={{ width: 28, height: 28, borderRadius: 9999, padding: 1.5 }}
                              >
                                <img
                                  src={getAvatarSrc(comment.profilePic, comment.author, comment.id || comment._id)}
                                  alt={comment.author}
                                  className="w-full h-full rounded-full object-cover bg-white"
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getDefaultAvatar(comment.author, comment.id || comment._id); }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
                                  <NameWithTick name={comment.author} tick={comment.authorTick} />
                                </p>
                                <p className="text-foreground-muted" style={{ fontSize: 13, marginTop: 2, lineHeight: 1.5 }}>{comment.text}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!commentLikes[comment.id]) {
                                    setCommentLikes(prev => ({ ...prev, [comment.id]: { liked: comment.likedByMe, count: comment.likesCount } }));
                                  }
                                  toggleCommentLike(post.id, comment.id);
                                }}
                                className={`flex items-center gap-1 flex-shrink-0 self-center p-1.5 rounded-full transition-colors cursor-pointer ${(commentLikes[comment.id]?.liked ?? comment.likedByMe) ? 'text-red-500' : 'text-[#B5BAC4] hover:text-red-400'
                                  }`}
                              >
                                <Heart size={14} className={`transition-transform ${(commentLikes[comment.id]?.liked ?? comment.likedByMe) ? 'fill-red-500' : ''}`} />
                                {((commentLikes[comment.id]?.count ?? comment.likesCount ?? 0) > 0) && (
                                  <span style={{ fontSize: 10, fontWeight: 700 }}>{commentLikes[comment.id]?.count ?? comment.likesCount ?? 0}</span>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <Input
                            placeholder={`Reply to ${post.author}...`}
                            value={commentInputs[post.id] || ""}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                            wrapperClassName="flex-1"
                            rightElement={
                              <Button
                                variant="primary"
                                onClick={() => handleComment(post.id)}
                                className="!h-8 !w-8 !min-w-0 !px-0 !rounded-lg shrink-0"
                              >
                                <Send size={14} />
                              </Button>
                            }
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}

              {/* Load More */}
              {!showFeedSkeleton && posts.length > 0 && hasMorePosts && !selectedTopic && (
                <div className="border-t border-border" style={{ padding: "16px 20px" }}>
                  <Button
                    variant="secondary"
                    onClick={loadMorePosts}
                    disabled={loadingMorePosts}
                    loading={loadingMorePosts}
                    className="w-full"
                  >
                    Load more posts
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden xl:flex flex-col w-[300px] shrink-0 gap-6 self-start sticky top-6">

            {/* Premium Leaderboard Card */}
            <Card className="group flex flex-col overflow-hidden border border-border/80 shadow-sm hover:shadow-md transition-shadow duration-300 relative bg-card">
              {/* Subtle top gradient glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-2 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FDFBF7] to-[#F5F2EC] border border-border/80 shadow-xs">
                    <span className="text-lg">🏆</span>
                    {/* Sparkle animation around trophy */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-1 rounded-xl border border-dashed border-[#FCD34D]/30"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-[#1F2937] font-black text-[14px] tracking-tight leading-tight uppercase">
                      Top Campuses
                    </h3>
                    <span className="text-[10px] text-[#6B7280] font-bold tracking-wider uppercase mt-0.5">
                      Weekly Standings
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-[#EF4444] border border-[#EF4444]/20 shadow-xs">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#EF4444]"></span>
                  </span>
                  Live
                </span>
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                {loadingLeaderboard ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 rounded-full border-2 border-[#FCD34D] border-t-transparent" />
                    <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">Crunching Numbers...</span>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="py-8 text-center text-xs font-bold text-[#6B7280]">No campus rankings yet.</div>
                ) : (
                  leaderboard.slice(0, 5).map((item, idx) => {
                    const name = item.college || item.name || item._id || "Unknown";
                    const points = item.points ?? item.score ?? 0;
                    const maxPts = leaderboard[0]?.points || leaderboard[0]?.score || 1;
                    const progress = Math.min(100, Math.max(8, (points / maxPts) * 100));

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={
                          idx < 3
                            ? { opacity: 1, y: 0, scale: 1, backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
                            : { opacity: 1, y: 0, scale: 1 }
                        }
                        transition={{
                          opacity: { duration: 0.4, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] },
                          y: { duration: 0.4, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] },
                          scale: { duration: 0.4, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] },
                          backgroundPosition: { duration: 4, ease: "linear", repeat: Infinity }
                        }}
                        style={idx < 3 ? { backgroundSize: "200% 200%" } : {}}
                        whileHover={{ scale: 1.02, x: 2 }}
                        className={clsx(
                          "relative group/row flex items-center justify-between overflow-hidden rounded-xl p-2.5 transition-all cursor-pointer border",
                          idx === 0
                            ? "bg-gradient-to-r from-amber-100 via-amber-300/40 to-amber-100 border-[#FCD34D]/50 shadow-[0_2px_12px_rgba(252, 211, 77,0.2)] hover:border-[#FCD34D]/80"
                            : idx === 1
                              ? "bg-gradient-to-r from-slate-100 via-slate-300/40 to-slate-100 border-slate-400/50 shadow-sm hover:border-slate-500/60"
                              : idx === 2
                                ? "bg-gradient-to-r from-orange-100 via-orange-300/40 to-orange-100 border-orange-400/50 shadow-sm hover:border-orange-500/60"
                                : "border-border/50 bg-[#FDFCF9] hover:bg-white hover:border-[#FCD34D]/30 hover:shadow-sm"
                        )}
                      >
                        {/* Animated Soft Background Fill (Twitter Poll Style) */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                          className={clsx(
                            "absolute top-0 bottom-0 left-0 z-0",
                            idx === 0 ? "bg-gradient-to-r from-[#FCD34D]/15 to-[#FCD34D]/5" : "bg-[#F3F0E9]"
                          )}
                        />

                        {/* Content */}
                        <div className="relative z-10 flex items-center gap-3 min-w-0">
                          {/* Rank Badge */}
                          <motion.div
                            animate={idx < 3 ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] } : {}}
                            transition={{ duration: 3.5, ease: "linear", repeat: Infinity }}
                            style={idx < 3 ? { backgroundSize: "200% 200%" } : {}}
                            className={clsx(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black shadow-sm border-2",
                              idx === 0
                                ? "bg-gradient-to-r from-[#FDE68A] via-[#D97706] to-[#FDE68A] text-[#78350F] border-white ring-2 ring-amber-400/30"
                                : idx === 1
                                  ? "bg-gradient-to-r from-[#F3F4F6] via-[#9CA3AF] to-[#F3F4F6] text-[#1F2937] border-white ring-1 ring-slate-300/30"
                                  : idx === 2
                                    ? "bg-gradient-to-r from-[#FDBA74] via-[#B45309] to-[#FDBA74] text-[#431407] border-white ring-1 ring-orange-400/30"
                                    : "bg-white text-[#6B7280] border-[#E8E2D8]"
                            )}
                          >
                            {idx + 1}
                          </motion.div>
                          <span className={clsx(
                            "truncate text-[13.5px] transition-colors",
                            idx === 0 ? "text-[#1F2937] font-extrabold" : "text-[#4B5563] font-bold group-hover/row:text-[#1F2937]"
                          )}>
                            {name}
                          </span>
                        </div>

                        <div className="relative z-10 flex shrink-0 items-baseline gap-1">
                          <span className={clsx(
                            "font-black tracking-tight",
                            idx === 0 ? "text-[#FCD34D] text-[14.5px]" : "text-[#1F2937] text-[13px]"
                          )}>
                            {points.toLocaleString()}
                          </span>
                          <span className="text-[9.5px] font-bold uppercase text-[#6B7280]">pts</span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Suggested Connects */}
            <Card className="group flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10 text-info">
                    <Users size={14} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-foreground font-bold" style={{ fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Suggested Connects
                  </h3>
                </div>
              </div>
              <div className="mt-3.5 flex flex-col gap-1.5">
                {loadingSuggested ? (
                  <div className="py-4 text-center text-xs text-foreground-muted">Loading...</div>
                ) : suggestedUsers.length === 0 ? (
                  <div className="py-4 text-center text-xs text-foreground-muted">No suggestions right now.</div>
                ) : (
                  suggestedUsers.slice(0, 5).map((user) => {
                    const isPending = connectStatus[user._id] === 'pending';
                    const isConnected = connectStatus[user._id] === 'connected';
                    const isNetwork = friendsList.some(f => String(f.id) === String(user._id) || String(f.id) === String(user.id)) || (currentUser?.following || []).some(id => String(id) === String(user._id) || String(id) === String(user.id)) || isConnected;
                    return (
                      <div
                        key={user._id}
                        className="group/user flex items-center justify-between gap-3 rounded-2xl p-2.5 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/60 hover:bg-secondary-background hover:shadow-xs hover:-translate-y-[1px]"
                      >
                        <div className="flex items-center gap-3.5 min-w-0" onClick={() => router.push(`/profile/${user._id}`)}>
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border/80 bg-secondary-background shadow-xs">
                            <img src={getAvatarSrc(user.profilePic, user.name, user._id || user.id)} alt={user.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-[13.5px] font-bold text-foreground group-hover/user:text-primary transition-colors">{user.name}</span>
                            <span className="truncate text-[11.5px] font-normal text-foreground-muted">{user.university || "CampusAdda"}</span>
                          </div>
                        </div>
                        {isNetwork ? (
                          <span className="flex shrink-0 items-center justify-center rounded-full bg-info/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-info border border-info/20">
                            Network
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConnectUser(user._id)}
                            disabled={isPending}
                            className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-hover px-3.5 py-1.5 text-[11.5px] font-bold text-white transition-all duration-200 hover:scale-105 shadow-[0_2px_10px_rgba(201,161,75,0.25)] active:scale-95"
                          >
                            {isPending ? "..." : "Connect"}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

          </aside>
        </div>
      </motion.div>

      {/* ── CREATE POLL MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {showPollModal && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center px-3 py-3 sm:items-center sm:px-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowPollModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-[92dvh] w-full max-w-md overflow-y-auto no-scrollbar"
              style={{ background: "#FFFFFF", borderRadius: 24, border: "1px solid #EDE9E0", padding: "24px 24px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-3">
                  <div style={{ padding: 10, background: "rgba(34,197,94,0.10)", borderRadius: 14 }}>
                    <BarChart2 size={22} style={{ color: "#16a34a" }} />
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#202124", letterSpacing: "-0.03em" }}>Create Poll</h2>
                </div>
                <IconButton
                  onClick={() => setShowPollModal(false)}
                >
                  <X size={20} />
                </IconButton>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9CA3AF" }}>Question</label>
                  <textarea
                    placeholder="Ask something to the campus..."
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full resize-none focus:outline-none"
                    style={{ background: "#F5F2EC", border: "1.5px solid #EDE9E0", borderRadius: 14, padding: "14px 16px", fontSize: 14, color: "#202124", minHeight: 96, fontFamily: "Inter, sans-serif", transition: "all 0.2s ease" }}
                    onFocus={(e) => { e.target.style.borderColor = "#FDE68A"; e.target.style.boxShadow = "0 0 0 3px rgba(253, 230, 138,0.12)"; e.target.style.background = "#FFFFFF"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#EDE9E0"; e.target.style.boxShadow = ""; e.target.style.background = "#F5F2EC"; }}
                  />
                </div>

                <div className="space-y-2.5">
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9CA3AF" }}>Options</label>
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="relative">
                      <Input
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => { const newOpts = [...pollOptions]; newOpts[i] = e.target.value; setPollOptions(newOpts); }}
                      />
                      {pollOptions.length > 2 && (
                        <IconButton
                          onClick={() => setPollOptions(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 !h-8 !w-8 hover:!bg-[#FFF1F2] hover:!text-[#EF4444]"
                        >
                          <X size={14} />
                        </IconButton>
                      )}
                    </div>
                  ))}

                  {pollOptions.length < 5 && (
                    <Button
                      variant="ghost"
                      onClick={() => setPollOptions(prev => [...prev, ""])}
                      className="w-full !border-dashed !border-[1.5px] !border-[#EDE9E0] gap-2 !text-[#B5BAC4] hover:!text-[#6B7280]"
                    >
                      <Plus size={14} /> Add Option
                    </Button>
                  )}
                </div>

                {/* Allow Multiple Toggle */}
                <div
                  className="flex items-center justify-between"
                  style={{ padding: "14px 16px", background: "#FAF8F3", borderRadius: 14, border: "1px solid #EDE9E0" }}
                >
                  <div className="flex items-center gap-2.5">
                    <Check size={16} style={{ color: pollAllowMultiple ? "#16a34a" : "#B5BAC4" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#4B5563" }}>Allow multiple answers</span>
                  </div>
                  <button
                    onClick={() => setPollAllowMultiple(!pollAllowMultiple)}
                    className="transition-all duration-300"
                    style={{
                      width: 44, height: 24, borderRadius: 9999,
                      padding: "3px",
                      background: pollAllowMultiple ? "#16a34a" : "#D8D2C4",
                      display: "flex", alignItems: "center",
                      justifyContent: pollAllowMultiple ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: 9999, background: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                  </button>
                </div>

                <Button
                  variant="primary"
                  onClick={handleCreatePoll}
                  disabled={!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2 || isPosting}
                  loading={isPosting}
                  className="w-full"
                >
                  🚀 Launch Poll
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SHARE MODAL ─────────────────────────────────────── */}
      {shareModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center px-3 py-3 sm:items-center sm:px-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
          onClick={() => setShareModal(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto no-scrollbar"
            style={{ background: "#FFFFFF", borderRadius: 24, border: "1px solid #EDE9E0", padding: "24px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#202124", letterSpacing: "-0.03em" }}>Share with Network</h2>
              <button
                onClick={() => setShareModal(null)}
                style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F2EC"; e.currentTarget.style.color = "#202124"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-5">
              <Input
                icon={Search}
                placeholder="Find people to share with..."
                value={shareSearchTerm}
                onChange={(e) => setShareSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {friendsList.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <p style={{ fontSize: 13, color: "#9CA3AF" }}>No connections found yet.</p>
                  <button onClick={() => router.push('/friends')} style={{ fontSize: 12, fontWeight: 700, color: "#FDE68A" }} className="hover:underline">Find Campus Network</button>
                </div>
              )}
              {friendsList.filter(f => f.name.toLowerCase().includes(shareSearchTerm.toLowerCase())).map(friend => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between gap-3 group rounded-xl p-3 transition-all"
                  style={{ border: "1px solid #EDE9E0", background: "#FDFCF9", transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAF5E8"; e.currentTarget.style.borderColor = "#FDE68A"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#FDFCF9"; e.currentTarget.style.borderColor = "#EDE9E0"; }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={friend.avatar} alt={friend.name} className="object-cover shrink-0" style={{ width: 42, height: 42, borderRadius: 12, border: "1.5px solid #EDE9E0" }} />
                    <p className="truncate" style={{ fontSize: 14, fontWeight: 700, color: "#202124" }}>{friend.name}</p>
                  </div>
                  <button
                    onClick={() => handleShareToFriend(friend.id, shareModal)}
                    className="text-white shrink-0 transition-all hover:scale-105 active:scale-95"
                    style={{ borderRadius: 9999, padding: "6px 16px", fontSize: 11, fontWeight: 700, background: "linear-gradient(135deg, #FDE68A, #FCD34D)", boxShadow: "0 2px 8px rgba(253, 230, 138,0.28)" }}
                  >
                    Send
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── STORY VIEWER ────────────────────────────────────── */}
      {activeStory && (() => {
        const currentStory = activeStory.stories[currentStoryIndex];
        const totalStories = activeStory.stories.length;
        const goNext = (e) => { e?.stopPropagation(); if (currentStoryIndex < totalStories - 1) { storyProgressKey.current++; setCurrentStoryIndex(i => i + 1); setIsStoryPaused(false); } else { setActiveStory(null); } };
        const goPrev = (e) => { e?.stopPropagation(); if (currentStoryIndex > 0) { storyProgressKey.current++; setCurrentStoryIndex(i => i - 1); setIsStoryPaused(false); } };
        return (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.92)" }} onClick={() => setActiveStory(null)}>
            <style>{`
              @keyframes story-progress-30s { from { width: 0%; } to { width: 100%; } }
              .story-bar-active { animation: story-progress-30s 30s linear forwards; }
              .story-bar-active.paused { animation-play-state: paused; }
              .story-bar-done { width: 100%; background: white; }
              .story-bar-pending { width: 0%; }
            `}</style>
            <div className="relative h-[100dvh] w-full max-w-lg overflow-hidden bg-black sm:aspect-[9/16] sm:h-auto md:rounded-3xl" style={{ boxShadow: "0 0 80px rgba(0,0,0,0.8)" }} onClick={e => e.stopPropagation()}>
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-30">
                {activeStory.stories.map((s, i) => (
                  <div key={`${s._id}-${storyProgressKey.current}`} className="h-[3px] flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.28)" }}>
                    <div
                      onAnimationEnd={() => goNext()}
                      className={`h-full rounded-full ${i < currentStoryIndex ? 'story-bar-done' : i === currentStoryIndex ? `story-bar-active ${isStoryPaused ? 'paused' : ''}` : 'story-bar-pending'}`}
                      style={{ background: "#FFFFFF" }}
                    />
                  </div>
                ))}
              </div>
              {/* Header */}
              <div className="absolute top-10 left-4 right-4 flex justify-between items-center z-30">
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: 9999, padding: 2, background: "linear-gradient(135deg, #FDE68A, #FCD34D)" }}>
                    <img src={getAvatarSrc(activeStory.author.profilePic, activeStory.author.name, activeStory.author._id || activeStory.author.id)} className="w-full h-full rounded-full border border-black object-cover" alt="" />
                  </div>
                  <div>
                    <p className="!text-white font-bold" style={{ fontSize: 14 }}>{activeStory.author.name}</p>
                    <p className="!text-white/60 uppercase" style={{ fontSize: 10, letterSpacing: "0.06em" }}>
                      {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {currentStoryIndex + 1}/{totalStories}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setIsStoryPaused(p => !p); }} className="!text-white p-2 rounded-full transition-all" style={{ background: "rgba(255,255,255,0.12)" }}>
                    {isStoryPaused ? <Play size={18} /> : <Pause size={18} />}
                  </button>
                  <button onClick={() => setActiveStory(null)} className="!text-white p-2 rounded-full transition-all" style={{ background: "rgba(255,255,255,0.12)" }}>
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
                <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent z-10" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent z-10" />
                <div className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" onClick={goPrev} />
                <div className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer" onClick={goNext} />
              </div>
              {/* Nav Arrows */}
              {currentStoryIndex > 0 && (
                <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 !text-white rounded-full backdrop-blur-sm transition-all" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <ChevronLeft size={24} />
                </button>
              )}
              {currentStoryIndex < totalStories - 1 && (
                <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 !text-white rounded-full backdrop-blur-sm transition-all" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <ChevronRight size={24} />
                </button>
              )}
              {/* Story Actions */}
              <div className="absolute bottom-8 left-4 right-4 flex items-center gap-3 z-30">
                <form
                  onSubmit={(e) => handleStoryReply(e, currentStory._id, activeStory.author._id || activeStory.author.id)}
                  className="flex-1 flex gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex-1 rounded-full flex items-center px-4 py-3" style={{ border: "1px solid rgba(255,255,255,0.25)", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)" }}>
                    <input
                      type="text"
                      value={storyReplyText}
                      onChange={(e) => setStoryReplyText(e.target.value)}
                      placeholder={`Reply to ${activeStory.author.name.split(' ')[0]}...`}
                      className="!bg-transparent !text-white text-sm focus:outline-none w-full placeholder:!text-white/55"
                    />
                  </div>
                  <button type="submit" className="p-3 gradient-bg rounded-full !text-white shadow-lg shrink-0" disabled={!storyReplyText.trim()}>
                    <Send size={18} />
                  </button>
                </form>
                <button
                  onClick={(e) => { e.stopPropagation(); handleStoryLike(currentStory._id); }}
                  className="p-3 rounded-full !text-white shrink-0 backdrop-blur-sm"
                  style={{ border: "1px solid rgba(255,255,255,0.25)", background: "rgba(0,0,0,0.40)" }}
                >
                  <Heart size={22} style={{ fill: (currentStory.likes || []).some(id => id.toString() === (currentUser?._id || currentUser?.id)?.toString()) ? "#EF4444" : "none", color: (currentStory.likes || []).some(id => id.toString() === (currentUser?._id || currentUser?.id)?.toString()) ? "#EF4444" : "#FFFFFF" }} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── TOAST ───────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-3.5"
            style={{
              background: "#202124",
              borderRadius: 9999,
              boxShadow: "0 8px 32px rgba(0,0,0,0.24), 0 0 0 1px rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="flex items-center justify-center text-white"
              style={{ width: 22, height: 22, borderRadius: 9999, background: "linear-gradient(135deg, #FDE68A, #FCD34D)" }}
            >
              <Check size={12} strokeWidth={3.5} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <FAB onClick={() => {
        setIsMobileCreateOpen(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }} isVisible={!isMobileCreateOpen} />
    </div>
  );
}
