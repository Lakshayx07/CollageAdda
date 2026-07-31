"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Users2, Send, Loader2, Globe, CheckCircle2, 
  AlertCircle, LogOut, MoreVertical, Plus, ArrowRight, Smile,
  Image as ImageIcon, Video, BarChart3, Pencil, Trash2, Reply,
  Pin, PinOff, X, Check, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";
import { getAvatarSrc, getDefaultAvatar } from "@/utils/defaultAvatars";
import { supabase } from "../../../utils/supabase";
import { getAuthenticatedSupabaseClient } from "../../../utils/supabaseAuthUser";
import { uploadPublicMedia } from "../../../utils/supabaseUploads";

function JoinSparkles({ active }) {
  const pieces = Array.from({ length: 34 }, (_, index) => ({
    id: index,
    left: 8 + ((index * 19) % 84),
    delay: ((index * 7) % 35) / 100,
    duration: 1.9 + ((index * 11) % 9) / 10,
    size: 14 + ((index * 5) % 12),
    drift: ((index * 23) % 80) - 40,
  }));

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none fixed inset-0 z-[220] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ y: -40, x: 0, opacity: 0, rotate: 0, scale: 0.8 }}
              animate={{ y: "105vh", x: piece.drift, opacity: [0, 1, 1, 0], rotate: 260, scale: [0.8, 1.15, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: piece.duration, delay: piece.delay, ease: "easeIn" }}
              className="absolute top-0 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.65)]"
              style={{ left: `${piece.left}%`, fontSize: piece.size }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default function CommunityChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id;
  const openAtLatest = searchParams.get("at") === "latest";
  const [activeCommunityId, setActiveCommunityId] = useState(id);

  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);
  
  // Data States
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [membershipSet, setMembershipSet] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isMember, setIsMember] = useState(false);
  const [role, setRole] = useState(null); // owner | member | null
  const [currentUserId, setCurrentUserId] = useState("");
  
  // Status/Loading States
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joiningCommunityId, setJoiningCommunityId] = useState(null);
  const [leaving, setLeaving] = useState(false);
  
  // Input / UI States
  const [inputText, setInputText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [tappedMessageId, setTappedMessageId] = useState(null);
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [pinnedJumpIndex, setPinnedJumpIndex] = useState(0);
  const [showJoinSparkles, setShowJoinSparkles] = useState(false);

  const scrollRef = useRef(null);
  const chatContainerRef = useRef(null);
  const initialScrollDone = useRef(false);
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const remoteTypingTimersRef = useRef({});
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const messageRefs = useRef({});
  const didInitialScrollRef = useRef(false);
  const pendingScrollToBottomRef = useRef(openAtLatest);

  const showToastMsg = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const scrollChatToBottom = (behavior = "smooth", delay = 50) => {
    window.setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior,
        });
      }
    }, delay);
  };

  const communityThemes = {
    sports: { gradient: "from-sky-100 via-sky-200 to-cyan-100", text: "text-sky-700", avatar: "bg-sky-50 text-sky-700 border-sky-100" },
    gaming: { gradient: "from-violet-100 via-purple-200 to-indigo-100", text: "text-violet-700", avatar: "bg-violet-50 text-violet-700 border-violet-100" },
    tech: { gradient: "from-emerald-100 via-green-200 to-teal-100", text: "text-emerald-700", avatar: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    business: { gradient: "from-amber-100 via-yellow-200 to-orange-100", text: "text-amber-700", avatar: "bg-amber-50 text-amber-700 border-amber-100" },
    art: { gradient: "from-rose-100 via-pink-200 to-orange-100", text: "text-rose-700", avatar: "bg-rose-50 text-rose-700 border-rose-100" },
    music: { gradient: "from-fuchsia-100 via-pink-200 to-purple-100", text: "text-fuchsia-700", avatar: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100" },
    default: { gradient: "from-amber-100 via-orange-200 to-yellow-100", text: "text-amber-700", avatar: "bg-amber-50 text-amber-700 border-amber-100" },
  };

  const getCommunityTheme = (comm) => {
    const haystack = [comm?.name, comm?.description, ...(comm?.tags || [])].join(" ").toLowerCase();
    if (haystack.includes("sport")) return communityThemes.sports;
    if (haystack.includes("gaming") || haystack.includes("esport") || haystack.includes("game")) return communityThemes.gaming;
    if (haystack.includes("tech") || haystack.includes("code") || haystack.includes("hack")) return communityThemes.tech;
    if (haystack.includes("business") || haystack.includes("startup")) return communityThemes.business;
    if (haystack.includes("art") || haystack.includes("design")) return communityThemes.art;
    if (haystack.includes("music")) return communityThemes.music;
    return communityThemes.default;
  };

  const getLocalPinnedIds = (communityId) => {
    if (typeof window === "undefined" || !communityId) return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem(`community_pinned_${communityId}`) || "[]"));
    } catch (e) {
      return new Set();
    }
  };

  const setLocalPinnedId = (communityId, messageId, pinned) => {
    const ids = getLocalPinnedIds(communityId);
    if (pinned) ids.add(messageId);
    else ids.delete(messageId);
    localStorage.setItem(`community_pinned_${communityId}`, JSON.stringify([...ids]));
  };

  const normalizePoll = (poll) => {
    if (!poll) return null;
    if (typeof poll === "string") {
      try {
        return JSON.parse(poll);
      } catch (e) {
        return null;
      }
    }
    return poll;
  };

  const isEmojiOnly = (text) => {
    const value = String(text || "").trim();
    if (!value) return false;
    const compact = value.replace(/\s/g, "");
    return /^(\p{Extended_Pictographic}|\uFE0F|\u200D)+$/u.test(compact);
  };

  const normalizeLegacyMessage = (msg) => {
    const localPinnedIds = getLocalPinnedIds(msg?.community_id);
    const poll = normalizePoll(msg?.poll);
    const inferredAttachment = poll
      ? "poll"
      : msg?.media_url
        ? (String(msg?.media_url).match(/\.(mp4|webm|mov)(\?|$)/i) ? "video" : "photo")
        : msg?.attachment_type || "text";
    return {
      attachment_type: "text",
      is_pinned: localPinnedIds.has(msg?.id),
      poll: null,
      ...msg,
      attachment_type: inferredAttachment,
      poll,
      is_pinned: Boolean(msg?.is_pinned || localPinnedIds.has(msg?.id)),
    };
  };

  const isRecoverableSchemaError = (error) => {
    const msg = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
    return msg.includes("column") || msg.includes("schema cache");
  };

  const getSenderAvatar = () => user?.profilePic || user?.profilePicture || "";

  const replaceOrAppendMessage = (incoming) => {
    const normalized = normalizeLegacyMessage(incoming);
    setMessages((prev) => {
      if (prev.some((m) => m.id === normalized.id)) {
        return prev.map((m) => (m.id === normalized.id ? normalized : m));
      }
      return [...prev, normalized];
    });
    return normalized;
  };

  const buildUnreadCounts = (rows, userId, openCommunityId = activeCommunityId) => {
    return (rows || []).reduce((acc, msg) => {
      if (msg.sender_id === userId) return acc;
      if (msg.community_id === openCommunityId) return acc;
      const seenAt = localStorage.getItem(`community_seen_${msg.community_id}`);
      if (seenAt && new Date(msg.created_at) <= new Date(seenAt)) return acc;
      acc[msg.community_id] = (acc[msg.community_id] || 0) + 1;
      return acc;
    }, {});
  };

  const fetchDetails = async (targetId = activeCommunityId, showPageLoader = false) => {
    if (!supabase || !targetId) {
      setLoading(false);
      return;
    }
    if (showPageLoader) setLoading(true);
    try {
      // Use anon client for public data reads (communities table has public SELECT policy)
      const { data: comm, error: commErr } = await supabase
        .from("communities")
        .select("*")
        .eq("id", targetId)
        .single();

      if (commErr || !comm) {
        showToastMsg("error", "Community not found.");
        router.push("/community");
        return;
      }
      setCommunity(comm);

      const { data: allCommunities } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });
      if (allCommunities) setCommunities(allCommunities);

      // Fetch messages
      const { data: msgs } = await supabase
        .from("community_messages")
        .select("*")
        .eq("community_id", targetId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (msgs) {
        setMessages(msgs.map(normalizeLegacyMessage));
        const lastMessageAt = msgs[msgs.length - 1]?.created_at || new Date().toISOString();
        localStorage.setItem(`community_seen_${targetId}`, lastMessageAt);
      }

      if ((allCommunities || []).length > 0) {
        const { data: recentMessages } = await supabase
          .from("community_messages")
          .select("community_id,sender_id,created_at")
          .in("community_id", allCommunities.map(c => c.id))
          .order("created_at", { ascending: false })
          .limit(500);
        // We'll set unread counts after getting userId below
        const tempUnread = recentMessages;

        // Now get authenticated user for membership check
        try {
          const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
          setCurrentUserId(authUser.id);
          setIsMember(false);
          setRole(null);

          const { data: memberships } = await authSupabase
            .from("community_members")
            .select("community_id")
            .eq("user_id", authUser.id);
          const nextMembershipSet = new Set(memberships?.map(m => m.community_id) || []);
          setMembershipSet(nextMembershipSet);

          // Check membership for this specific community
          const { data: member } = await authSupabase
            .from("community_members")
            .select("*")
            .eq("community_id", targetId)
            .eq("user_id", authUser.id)
            .maybeSingle();

          if (member) {
            setIsMember(true);
            setRole(member.role);
          }

          setUnreadCounts(buildUnreadCounts(tempUnread, authUser.id, targetId));

          // Subscribe to Realtime messages using auth client
          if (channelRef.current) {
            authSupabase.removeChannel(channelRef.current);
          }
          const channel = authSupabase
            .channel(`community:${targetId}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "community_messages",
                filter: `community_id=eq.${targetId}`,
              },
              (payload) => {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === payload.new.id)) return prev;
                  return [...prev, normalizeLegacyMessage(payload.new)];
                });
                localStorage.setItem(`community_seen_${targetId}`, payload.new.created_at);
              }
            )
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "community_messages",
                filter: `community_id=eq.${targetId}`,
              },
              (payload) => {
                setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? normalizeLegacyMessage(payload.new) : m)));
              }
            )
            .on("broadcast", { event: "typing" }, ({ payload }) => {
              if (!payload?.userId || payload.userId === authUser.id) return;
              setTypingUsers((prev) => ({
                ...prev,
                [payload.userId]: payload.name || "Someone",
              }));
              window.clearTimeout(remoteTypingTimersRef.current[payload.userId]);
              remoteTypingTimersRef.current[payload.userId] = window.setTimeout(() => {
                setTypingUsers((prev) => {
                  const next = { ...prev };
                  delete next[payload.userId];
                  return next;
                });
              }, 1800);
            })
            .subscribe();
          channelRef.current = channel;
        } catch (authErr) {
          // Auth failed — community data still loaded, user just can't send messages
          console.warn("Auth client unavailable, community shown in read-only mode:", authErr.message);
        }
      } else {
        // No communities yet — still try to set up auth for membership
        try {
          const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
          setCurrentUserId(authUser.id);
          setIsMember(false);
          setRole(null);

          const { data: member } = await authSupabase
            .from("community_members")
            .select("*")
            .eq("community_id", targetId)
            .eq("user_id", authUser.id)
            .maybeSingle();

          if (member) {
            setIsMember(true);
            setRole(member.role);
          }

          if (channelRef.current) {
            authSupabase.removeChannel(channelRef.current);
          }
          const channel = authSupabase
            .channel(`community:${targetId}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_messages", filter: `community_id=eq.${targetId}` },
              (payload) => {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === payload.new.id)) return prev;
                  return [...prev, normalizeLegacyMessage(payload.new)];
                });
                localStorage.setItem(`community_seen_${targetId}`, payload.new.created_at);
              }
            )
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "community_messages", filter: `community_id=eq.${targetId}` },
              (payload) => {
                setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? normalizeLegacyMessage(payload.new) : m)));
              }
            )
            .subscribe();
          channelRef.current = channel;
        } catch (authErr) {
          console.warn("Auth client unavailable:", authErr.message);
        }
      }
    } catch (err) {
      console.error("Error fetching community info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    return () => {
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveCommunityId(id);
    initialScrollDone.current = false;
    didInitialScrollRef.current = false;
    pendingScrollToBottomRef.current = openAtLatest;
    setPinnedJumpIndex(0);
  }, [id, openAtLatest]);

  useEffect(() => {
    if (!supabase || !currentUserId) return;
    const channel = supabase
      .channel('global-community-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        (payload) => {
          const msg = payload.new;
          if (msg.sender_id !== currentUserId && msg.community_id !== activeCommunityId && membershipSet.has(msg.community_id)) {
            setUnreadCounts((prev) => ({
              ...prev,
              [msg.community_id]: (prev[msg.community_id] || 0) + 1
            }));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, activeCommunityId, membershipSet]);

  useEffect(() => {
    const storedUser = localStorage.getItem("collegeadda_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsed);
      fetchDetails(activeCommunityId, !community);
    } catch (e) {
      router.push("/login");
    }
  }, [activeCommunityId]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (chatContainerRef.current && messages.length > 0) {
      const isInitial = !initialScrollDone.current;
      const shouldForceBottom = pendingScrollToBottomRef.current;
      
      if (isInitial || shouldForceBottom) {
        initialScrollDone.current = true;
        pendingScrollToBottomRef.current = false;
        scrollChatToBottom(shouldForceBottom ? "auto" : "smooth", 150);
      } else {
        scrollChatToBottom("smooth", 50);
      }
    }
  }, [messages]);

  const triggerJoinSparkles = () => {
    setShowJoinSparkles(true);
    setTimeout(() => setShowJoinSparkles(false), 2600);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !isMember || !supabase) return;

    const senderName = user?.name || "Anonymous Student";
    const senderAvatar = getSenderAvatar();

    const content = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const senderId = authUser.id;
      if (!senderId) {
        showToastMsg("error", "Please log in again before sending a message.");
        return;
      }
      setCurrentUserId(senderId);

      const legacyPayload = {
        community_id: activeCommunityId,
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar,
        content,
      };

      const richPayload = {
        ...legacyPayload,
        reply_to_id: replyTo?.id || null,
        reply_to_content: replyTo?.content || null,
        reply_to_sender_name: replyTo?.sender_name || null,
        attachment_type: "text"
      };

      const request = editingMessage
        ? authSupabase
            .from("community_messages")
            .update({ content, edited_at: new Date().toISOString() })
            .eq("id", editingMessage.id)
            .eq("sender_id", senderId)
            .select()
            .single()
        : authSupabase
            .from("community_messages")
            .insert([richPayload])
            .select()
            .single();

      let { data, error } = await request;
      if (editingMessage && error && isRecoverableSchemaError(error)) {
        const fallback = await authSupabase
          .from("community_messages")
          .update({ content })
          .eq("id", editingMessage.id)
          .eq("sender_id", senderId)
          .select()
          .single();
        data = fallback.data ? { ...fallback.data, edited_at: new Date().toISOString() } : null;
        error = fallback.error;
      }
      if (!editingMessage && error && isRecoverableSchemaError(error)) {
        const fallback = await authSupabase
          .from("community_messages")
          .insert([legacyPayload])
          .select()
          .single();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        showToastMsg("error", editingMessage ? "Edit needs the chat database update." : "Failed to send message.");
        setInputText(content); // restore content
      } else if (data) {
        replaceOrAppendMessage(data);
        if (editingMessage) showToastMsg("success", "Message edited.");
        setReplyTo(null);
        setEditingMessage(null);
      }
    } catch (err) {
      console.error(err);
      showToastMsg("error", "Network error. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (value) => {
    setInputText(value);
    if (!channelRef.current || !currentUserId || !value.trim()) return;
    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId, name: user?.name || "Someone" },
    });
    window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {}, 900);
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setReplyTo(null);
    setInputText(msg.content || "");
    setActiveMessageId(null);
  };

  const handleDeleteMessage = async (msg) => {
    if (!supabase || msg.sender_id !== currentUserId) return;
    const deletedAt = new Date().toISOString();
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      let { data, error } = await authSupabase
        .from("community_messages")
        .update({ content: "This message was deleted", deleted_at: deletedAt })
        .eq("id", msg.id)
        .eq("sender_id", authUser.id)
        .select()
        .single();
      if (error && isRecoverableSchemaError(error)) {
        const fallback = await authSupabase
          .from("community_messages")
          .update({ content: "This message was deleted" })
          .eq("id", msg.id)
          .eq("sender_id", authUser.id)
          .select()
          .single();
        data = fallback.data ? { ...fallback.data, deleted_at: deletedAt } : null;
        error = fallback.error;
      }
      if (error) throw error;
      if (data) replaceOrAppendMessage(data);
      setActiveMessageId(null);
      showToastMsg("success", "Message deleted.");
    } catch (err) {
      showToastMsg("error", "Delete needs the chat database update.");
    }
  };

  const handleTogglePin = async (msg) => {
    if (!supabase) return;
    try {
      const { client: authSupabase } = await getAuthenticatedSupabaseClient();
      const { data, error } = await authSupabase
        .from("community_messages")
        .update({ is_pinned: !msg.is_pinned })
        .eq("id", msg.id)
        .select()
        .single();
      if (error && isRecoverableSchemaError(error)) {
        setLocalPinnedId(msg.community_id, msg.id, !msg.is_pinned);
        setMessages((prev) => prev.map((m) => (
          m.id === msg.id ? { ...m, is_pinned: !msg.is_pinned } : m
        )));
        setActiveMessageId(null);
        showToastMsg("success", msg.is_pinned ? "Message unpinned." : "Message pinned.");
        return;
      }
      if (error) throw error;
      if (data) replaceOrAppendMessage(data);
      setActiveMessageId(null);
      showToastMsg("success", msg.is_pinned ? "Message unpinned." : "Message pinned.");
    } catch (err) {
      showToastMsg("error", "Pin needs the chat database update.");
    }
  };

  const handleReplyMessage = (msg) => {
    setReplyTo(msg);
    setEditingMessage(null);
    setActiveMessageId(null);
  };

  const insertAttachmentMessage = async ({ type, content, mediaUrl, mediaPath, poll }) => {
    setSending(true);
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const legacyPayload = {
        community_id: activeCommunityId,
        sender_id: authUser.id,
        sender_name: user?.name || "Anonymous Student",
        sender_avatar: getSenderAvatar(),
        content,
      };
      const richPayload = {
        ...legacyPayload,
        reply_to_id: replyTo?.id || null,
        reply_to_content: replyTo?.content || null,
        reply_to_sender_name: replyTo?.sender_name || null,
        attachment_type: type,
        media_url: mediaUrl || null,
        media_path: mediaPath || null,
        poll: poll || null
      };
      let { data, error } = await authSupabase
        .from("community_messages")
        .insert([richPayload])
        .select()
        .single();
      if (error && isRecoverableSchemaError(error)) {
        if (mediaUrl || poll) {
          throw new Error("Run Supabase chat SQL to save this attachment.");
        }
        const fallback = await authSupabase
          .from("community_messages")
          .insert([legacyPayload])
          .select()
          .single();
        data = fallback.data;
        error = fallback.error;
      }
      if (error) throw error;
      const normalized = replaceOrAppendMessage(data);
      setReplyTo(null);
      return normalized;
    } finally {
      setSending(false);
    }
  };

  const handleAttachmentChoice = (type) => {
    if (!isMember || sending || !supabase) return;
    setShowAttachMenu(false);
    setShowEmojiPicker(false);
    if (type === "photo") {
      photoInputRef.current?.click();
      return;
    }
    if (type === "video") {
      videoInputRef.current?.click();
      return;
    }
    setShowPollModal(true);
  };

  const handleMediaSelected = async (event, type) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !isMember || sending) return;

    setSending(true);
    try {
      const { user: authUser } = await getAuthenticatedSupabaseClient();
      const uploaded = await uploadPublicMedia({
        bucket: "community-chat",
        file,
        userId: authUser.id,
        kind: type === "video" ? "video" : "image"
      });
      await insertAttachmentMessage({
        type,
        content: type === "video" ? "Video" : "Photo",
        mediaUrl: uploaded.publicUrl,
        mediaPath: uploaded.path
      });
    } catch (err) {
      showToastMsg("error", err.message || `Failed to upload ${type}.`);
    } finally {
      setSending(false);
    }
  };

  const handleCreatePollMessage = async () => {
    const cleanOptions = pollOptions.map(opt => opt.trim()).filter(Boolean);
    if (!pollQuestion.trim() || cleanOptions.length < 2 || sending) return;

    const pollPayload = {
      question: pollQuestion.trim(),
      options: cleanOptions.map((text) => ({ text, votes: [] })),
      allowMultiple: pollAllowMultiple
    };

    try {
      await insertAttachmentMessage({
        type: "poll",
        content: pollQuestion.trim(),
        poll: pollPayload
      });
      setShowPollModal(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setPollAllowMultiple(false);
    } catch (err) {
      showToastMsg("error", "Run Supabase chat SQL to save polls.");
    }
  };

  const handleJoin = async () => {
    if (!supabase || joining) return;

    setJoining(true);
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const memberUserId = authUser.id;
      if (!memberUserId) return;
      setCurrentUserId(memberUserId);

      const { error: memberError } = await authSupabase
        .from("community_members")
        .insert([{ community_id: activeCommunityId, user_id: memberUserId, role: 'member' }]);

      if (memberError && memberError.code !== '23505') throw memberError;
      const alreadyJoined = memberError?.code === '23505';

      // Update community member count
      const newCount = alreadyJoined ? (community?.member_count || 0) : (community?.member_count || 0) + 1;
      if (!alreadyJoined) {
        await authSupabase
          .from("communities")
          .update({ member_count: newCount })
          .eq("id", activeCommunityId);
      }

      setCommunity((prev) => ({ ...prev, member_count: newCount }));
      setMembershipSet(prev => new Set([...prev, activeCommunityId]));
      setCommunities(prev => prev.map(comm => (
        comm.id === activeCommunityId ? { ...comm, member_count: newCount } : comm
      )));
      localStorage.setItem(`community_seen_${activeCommunityId}`, new Date().toISOString());
      setIsMember(true);
      setRole('member');
      showToastMsg("success", "You joined the community! 🎉");
      triggerJoinSparkles();

      // Reload messages
      const { data: msgs } = await authSupabase
        .from("community_messages")
        .select("*")
        .eq("community_id", activeCommunityId)
        .order("created_at", { ascending: true });
      if (msgs) setMessages(msgs.map(normalizeLegacyMessage));
    } catch (err) {
      showToastMsg("error", "Failed to join community.");
    } finally {
      setJoining(false);
    }
  };

  const handleJoinCommunity = async (targetCommunity) => {
    if (!supabase || joiningCommunityId || membershipSet.has(targetCommunity.id)) return;

    setJoiningCommunityId(targetCommunity.id);
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const memberUserId = authUser.id;
      if (!memberUserId) return;
      setCurrentUserId(memberUserId);

      const { error: memberError } = await authSupabase
        .from("community_members")
        .insert([{ community_id: targetCommunity.id, user_id: memberUserId, role: 'member' }]);

      if (memberError && memberError.code !== '23505') throw memberError;
      const alreadyJoined = memberError?.code === '23505';

      const newCount = alreadyJoined ? (targetCommunity.member_count || 0) : (targetCommunity.member_count || 0) + 1;
      if (!alreadyJoined) {
        await authSupabase
          .from("communities")
          .update({ member_count: newCount })
          .eq("id", targetCommunity.id);
      }

      localStorage.setItem(`community_seen_${targetCommunity.id}`, new Date().toISOString());
      setMembershipSet(prev => new Set([...prev, targetCommunity.id]));
      setCommunities(prev => prev.map(comm => (
        comm.id === targetCommunity.id ? { ...comm, member_count: newCount } : comm
      )));
      if (targetCommunity.id === activeCommunityId) {
        setCommunity(prev => ({ ...prev, member_count: newCount }));
        setIsMember(true);
        setRole('member');
      }
      showToastMsg("success", `Joined ${targetCommunity.name}!`);
      triggerJoinSparkles();
    } catch (err) {
      showToastMsg("error", "Failed to join community.");
    } finally {
      setJoiningCommunityId(null);
    }
  };

  const handleOpenCommunity = (targetId) => {
    if (!targetId || targetId === activeCommunityId) return;
    pendingScrollToBottomRef.current = true;
    window.history.pushState(null, "", `/community/${targetId}?at=latest`);
    setActiveCommunityId(targetId);
    setUnreadCounts(prev => ({ ...prev, [targetId]: 0 }));
    localStorage.setItem(`community_seen_${targetId}`, new Date().toISOString());
  };

  const handleLeave = async () => {
    if (!supabase || leaving || !isMember) return;

    const confirmLeave = window.confirm("Are you sure you want to leave this community?");
    if (!confirmLeave) return;

    setLeaving(true);
    setShowMenu(false);
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const memberUserId = authUser.id;
      if (!memberUserId) return;
      setCurrentUserId(memberUserId);

      const { error } = await authSupabase
        .from("community_members")
        .delete()
        .eq("community_id", activeCommunityId)
        .eq("user_id", memberUserId);

      if (error) throw error;

      // Update community member count
      const newCount = Math.max(0, (community?.member_count || 1) - 1);
      await authSupabase
        .from("communities")
        .update({ member_count: newCount })
        .eq("id", activeCommunityId);

      setCommunity((prev) => ({ ...prev, member_count: newCount }));
      setMembershipSet(prev => {
        const next = new Set(prev);
        next.delete(activeCommunityId);
        return next;
      });
      setCommunities(prev => prev.map(comm => (
        comm.id === activeCommunityId ? { ...comm, member_count: newCount } : comm
      )));
      setIsMember(false);
      setRole(null);
      showToastMsg("success", "You left the community.");
    } catch (err) {
      showToastMsg("error", "Failed to leave community.");
    } finally {
      setLeaving(false);
    }
  };

  const handlePollVote = async (msg, optionIndex) => {
    if (!msg.poll || !currentUserId) return;
    const nextPoll = {
      ...msg.poll,
      options: (msg.poll.options || []).map((option, index) => {
        const votes = option.votes || [];
        const hasVote = votes.includes(currentUserId);
        if (msg.poll.allowMultiple) {
          if (index !== optionIndex) return option;
          return { ...option, votes: hasVote ? votes.filter(id => id !== currentUserId) : [...votes, currentUserId] };
        }
        return {
          ...option,
          votes: index === optionIndex
            ? (hasVote ? votes : [...votes, currentUserId])
            : votes.filter(id => id !== currentUserId)
        };
      })
    };

    setMessages((prev) => prev.map((item) => (
      item.id === msg.id ? { ...item, poll: nextPoll } : item
    )));

    try {
      const { client: authSupabase } = await getAuthenticatedSupabaseClient();
      await authSupabase
        .from("community_messages")
        .update({ poll: nextPoll })
        .eq("id", msg.id);
    } catch (err) {
      // Local vote stays responsive even if the DB migration is not present yet.
    }
  };

  const handleJumpToPinned = () => {
    const pinnedMessages = [...messages]
      .filter((msg) => msg.is_pinned)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (pinnedMessages.length === 0) return;
    const nextIndex = pinnedJumpIndex % pinnedMessages.length;
    const target = pinnedMessages[nextIndex];
    messageRefs.current[target.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveMessageId(target.id);
    setPinnedJumpIndex((prev) => (prev + 1) % pinnedMessages.length);
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  const formatDateDivider = (isoString) => {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
    });
  };

  const sortedMessages = [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const pinnedCount = messages.filter((msg) => msg.is_pinned).length;
  const typingNames = Object.values(typingUsers).slice(0, 2);

  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="h-full bg-[#F9F8F5] flex items-center justify-center pt-[70px] lg:pt-0">
        <Loader2 className="animate-spin text-[#C8922A]" size={32} />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="h-full bg-[#F9F8F5] flex flex-col items-center justify-center gap-4">
        <AlertCircle size={36} className="text-[#C8922A]" />
        <p className="text-[#333333] font-bold">Community not found.</p>
        <button
          onClick={() => router.push("/community")}
          className="px-5 py-2 rounded-2xl bg-amber-100 text-amber-800 font-black text-sm cursor-pointer hover:bg-amber-200 transition-colors"
        >
          Back to Communities
        </button>
      </div>
    );
  }

  const theme = getCommunityTheme(community);
  const grad = theme.gradient;
  const railCommunities = [...communities].sort((a, b) => {
    if (a.id === activeCommunityId) return -1;
    if (b.id === activeCommunityId) return 1;
    return (b.member_count || 0) - (a.member_count || 0);
  });

  return (
    <div className="h-full bg-[#F9F8F5] pt-[70px] lg:pt-0 flex flex-col lg:grid lg:grid-cols-[330px_minmax(0,1fr)]">
      <aside className="hidden lg:flex min-h-0 flex-col border-r border-[#E8E6E0] bg-white/70 backdrop-blur-sm">
        <div className="px-5 py-5 flex items-center gap-3 shrink-0">
          <button
            onClick={() => router.push("/community")}
            className="p-2 hover:bg-[#F3F2EE] rounded-xl text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-black text-[#1A1A1A]">Communities</h1>
        </div>

        <div className="px-5 pb-3 text-xs font-black text-[#1A1A1A]">Your communities</div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4 custom-scrollbar">
          {railCommunities.map((comm) => {
            const cardTheme = getCommunityTheme(comm);
            const cardGrad = cardTheme.gradient;
            const active = comm.id === activeCommunityId;
            const member = membershipSet.has(comm.id);
            const isJoiningCard = joiningCommunityId === comm.id;
            const unread = unreadCounts[comm.id] || 0;

            return (
              <div
                key={comm.id}
                className={clsx(
                  "bg-white rounded-[1.35rem] overflow-hidden border shadow-sm transition-all",
                  active ? "border-[#D8A128] shadow-lg shadow-amber-500/10" : "border-[#E8E6E0] hover:shadow-md"
                )}
              >
                <div className={`h-12 w-full bg-gradient-to-r ${cardGrad} relative`}>
                  {active && (
                    <span className="absolute right-4 top-3 rounded-full bg-black/25 text-white text-[10px] font-black px-3 py-1">
                      Open
                    </span>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <div className={`relative z-10 w-12 h-12 rounded-2xl ${cardTheme.avatar} border-4 border-white flex items-center justify-center font-black text-lg shadow-sm -mt-5 mb-3 leading-none`}>
                    {comm.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-black text-[#1A1A1A] text-base leading-tight truncate">{comm.name}</h3>
                  <p className="text-xs font-bold text-[#333333] line-clamp-1 mt-1">{comm.description || "Student community"}</p>
                  <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed mt-2 font-medium">
                    Join conversations, share ideas and grow together.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(comm.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-black">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-4">
                    <div className="flex items-center gap-2 text-xs font-black text-[#555555]">
                      <Users2 size={15} />
                      {comm.member_count || 0} member{comm.member_count !== 1 ? 's' : ''}
                    </div>
                    {!active && member && (
                      <button
                        onClick={() => handleOpenCommunity(comm.id)}
                        className={`relative flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-black cursor-pointer ${cardTheme.avatar} hover:bg-white group`}
                      >
                        Explore Now <Flame size={14} className="text-orange-500 animate-pulse group-hover:scale-125 transition-transform" />
                        {unread > 0 && (
                          <span className="absolute -right-2 -top-2 min-w-6 h-6 px-1.5 rounded-full bg-[#1A1A1A] text-white text-[10px] font-black flex items-center justify-center">
                            +{unread > 99 ? "99" : unread}
                          </span>
                        )}
                      </button>
                    )}
                    {!active && !member && (
                      <button
                        onClick={() => handleJoinCommunity(comm)}
                        disabled={isJoiningCard}
                        className={`flex items-center gap-1.5 rounded-2xl bg-white border px-4 py-2 text-xs font-black cursor-pointer disabled:opacity-50 ${cardTheme.text} ${cardTheme.avatar}`}
                      >
                        {isJoiningCard ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <section className="min-h-0 h-full flex-1 flex flex-col overflow-hidden">
      {/* Community Header */}
      <div className="bg-white border-b border-[#E8E6E0] px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => router.push("/community")}
            className="p-2 hover:bg-[#F3F2EE] rounded-xl text-[#6B6B6B] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className={`w-10 h-10 rounded-xl ${theme.avatar} flex items-center justify-center font-black shrink-0`}>
            {community?.name?.charAt(0).toUpperCase()}
          </div>
          
          <div className="min-w-0">
            <h2 className="font-black text-[#1A1A1A] leading-tight truncate text-base">
              {community?.name}
            </h2>
            <p className="text-xs text-[#888888] font-semibold flex items-center gap-1.5 mt-0.5">
              <span>{community?.member_count} member{community?.member_count !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="capitalize">{community?.privacy?.replace('_', ' ')}</span>
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          {pinnedCount > 0 && (
            <button
              type="button"
              onClick={handleJumpToPinned}
              className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-100 cursor-pointer"
              title="Jump to pinned message"
            >
              <span aria-hidden="true">📌</span>
              {pinnedCount}
            </button>
          )}
          {isMember && (
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-[#F3F2EE] rounded-xl text-[#6B6B6B] transition-colors cursor-pointer"
            >
              <MoreVertical size={18} />
            </button>
          )}

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-1 w-48 bg-white border border-[#E8E6E0] rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                >
                  <button
                    onClick={handleLeave}
                    disabled={role === 'owner'}
                    className={clsx(
                      "w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-bold transition-colors cursor-pointer",
                      role === 'owner' 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-red-600 hover:bg-red-50"
                    )}
                  >
                    <LogOut size={14} />
                    Leave Community
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0 bg-[#F9F8F5] custom-scrollbar">
        {/* Info Box */}
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 border border-[#E8E6E0] shadow-sm text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl ${theme.avatar} flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-sm`}>
            {community?.name?.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-black text-[#1A1A1A] text-lg leading-tight">{community?.name}</h3>
          <p className="text-xs text-[#888888] font-semibold mt-1">Created on {new Date(community?.created_at).toLocaleDateString()}</p>
          <p className="text-xs text-[#6B6B6B] leading-relaxed mt-3 font-medium bg-[#F9F8F5] p-3 rounded-2xl border border-[#E8E6E0]/60">
            {community?.description || "Welcome to the group! Start talking and collaborating."}
          </p>
        </div>

        {/* Message bubbles */}
        {sortedMessages.map((msg, index) => {
          const isMe = msg.sender_id === currentUserId;
          const prevMsg = index > 0 ? sortedMessages[index - 1] : null;
          const showAvatar = index === 0 || prevMsg.sender_id !== msg.sender_id;
          const isDeleted = !!msg.deleted_at;
          const emojiOnly = isEmojiOnly(msg.content) && !msg.poll && !msg.media_url && msg.attachment_type === "text";
          
          const msgDateStr = new Date(msg.created_at).toDateString();
          const prevMsgDateStr = prevMsg ? new Date(prevMsg.created_at).toDateString() : null;
          const showDateDivider = msgDateStr !== prevMsgDateStr;
          
          return (
            <Fragment key={msg.id}>
              {showDateDivider && (
                <div className="flex justify-center my-6">
                  <span className="bg-[#E8E6E0]/60 text-[#555555] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                    {formatDateDivider(msg.created_at)}
                  </span>
                </div>
              )}
              <div
                ref={(node) => {
                  if (node) messageRefs.current[msg.id] = node;
                }}
                className={clsx("group flex w-full mb-1 scroll-mt-24", isMe ? "justify-end" : "justify-start")}
              >
              {!isMe && showAvatar && (
                <img
                  src={getAvatarSrc(msg.sender_avatar, msg.sender_name, msg.sender_id)}
                  alt={msg.sender_name}
                  className="w-8 h-8 rounded-full object-cover border border-[#E8E6E0] mr-2 shrink-0 self-end mb-1"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getDefaultAvatar(msg.sender_name, msg.sender_id);
                  }}
                />
              )}
              {!isMe && !showAvatar && <div className="w-8 mr-2 shrink-0" />}

              <div
                className={clsx("flex flex-col max-w-[75%] relative cursor-pointer", isMe ? "items-end" : "items-start")}
                onClick={() => setTappedMessageId(tappedMessageId === msg.id ? null : msg.id)}
              >
                {!isMe && showAvatar && (
                  <span className="text-[10px] text-[#6B6B6B] font-bold mb-1 ml-1">
                    {msg.sender_name}
                  </span>
                )}
                
                <div className={clsx(
                  emojiOnly
                    ? "relative px-1 py-1 text-4xl leading-none"
                    : "px-4 py-2.5 text-sm shadow-sm relative font-medium whitespace-pre-wrap break-words leading-relaxed",
                  !emojiOnly && (isMe ? "ca-chat-sent" : "ca-chat-received"),
                  isDeleted && "opacity-70 italic"
                )}>
                  {msg.is_pinned && (
                    <div className={clsx("mb-1 flex items-center gap-1 text-[10px] font-black", isMe ? "text-white/80" : "text-amber-700")}>
                      <Pin size={11} />
                      Pinned
                    </div>
                  )}
                  {msg.reply_to_content && (
                    <div className={clsx("mb-2 rounded-xl border-l-4 px-3 py-2 text-xs", isMe ? "border-white/70 bg-white/15 text-white/90" : "border-amber-300 bg-amber-50 text-[#5F4B23]")}>
                      <p className="font-black truncate">{msg.reply_to_sender_name || "Student"}</p>
                      <p className="truncate">{msg.reply_to_content}</p>
                    </div>
                  )}
                  {msg.attachment_type && msg.attachment_type !== "text" && (
                    <div className={clsx("mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black", isMe ? "bg-white/15 text-white" : "bg-[#F8F3E8] text-amber-800")}>
                      {msg.attachment_type === "poll" && <BarChart3 size={15} />}
                      {msg.attachment_type === "photo" && <ImageIcon size={15} />}
                      {msg.attachment_type === "video" && <Video size={15} />}
                      {msg.attachment_type.charAt(0).toUpperCase() + msg.attachment_type.slice(1)}
                    </div>
                  )}
                  {msg.media_url && msg.attachment_type === "photo" && (
                    <img
                      src={msg.media_url}
                      alt={msg.content || "Chat photo"}
                      className="mb-2 max-h-72 w-full rounded-2xl object-cover"
                    />
                  )}
                  {msg.media_url && msg.attachment_type === "video" && (
                    <video
                      src={msg.media_url}
                      controls
                      className="mb-2 max-h-80 w-full rounded-2xl bg-black"
                    />
                  )}
                  {msg.poll && (
                    <div className={clsx("mb-2 min-w-64 rounded-2xl p-3", isMe ? "bg-white/15" : "bg-[#F9F8F5] border border-[#E8E6E0]")}>
                      <p className={clsx("mb-2 text-sm font-black", isMe ? "text-white" : "text-[#1A1A1A]")}>{msg.poll.question || msg.content}</p>
                      <div className="space-y-2">
                        {(msg.poll.options || []).map((option, optionIndex) => {
                          const totalVotes = Math.max(1, (msg.poll.options || []).reduce((sum, item) => sum + (item.votes?.length || 0), 0));
                          const votes = option.votes?.length || 0;
                          const percentage = Math.round((votes / totalVotes) * 100);
                          const selected = option.votes?.includes(currentUserId);
                          return (
                            <button
                              key={`${option.text}-${optionIndex}`}
                              type="button"
                              onClick={() => handlePollVote(msg, optionIndex)}
                              className={clsx(
                                "relative w-full overflow-hidden rounded-xl border px-3 py-2 text-left text-xs font-black cursor-pointer",
                                isMe ? "border-white/25 text-white" : "border-[#E8E6E0] text-[#1A1A1A]"
                              )}
                            >
                              <span
                                className={clsx("absolute inset-y-0 left-0", selected ? "bg-emerald-400/30" : "bg-amber-300/20")}
                                style={{ width: `${percentage}%` }}
                              />
                              <span className="relative flex items-center justify-between gap-3">
                                <span className="truncate">{option.text}</span>
                                <span>{votes}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <p className={clsx("mt-2 text-[10px] font-bold", isMe ? "text-white/70" : "text-[#888888]")}>
                        {msg.poll.allowMultiple ? "Multiple answers allowed" : "Select one answer"}
                      </p>
                    </div>
                  )}
                  {(!msg.poll || !msg.poll.question) && !msg.media_url && msg.content}
                  {msg.edited_at && !isDeleted && (
                    <span className={clsx("ml-2 text-[10px] font-bold", isMe ? "text-white/70" : "text-[#888888]")}>
                      edited
                    </span>
                  )}
                </div>

                {!isDeleted && activeMessageId === msg.id && (
                  <div className={clsx(
                    "absolute z-20 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-2xl border border-[#E8E6E0] bg-white p-1 shadow-xl",
                    isMe ? "right-full mr-12" : "left-full ml-12"
                  )}>
                    <button onClick={() => handleReplyMessage(msg)} className="p-2 rounded-xl text-[#5F5F5F] hover:bg-amber-50 hover:text-amber-700 cursor-pointer" title="Reply">
                      <Reply size={15} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleTogglePin(msg); }} className="p-2 rounded-xl text-[#5F5F5F] hover:bg-amber-50 hover:text-amber-700 cursor-pointer" title={msg.is_pinned ? "Unpin" : "Pin"}>
                      {msg.is_pinned ? <PinOff size={15} /> : <Pin size={15} />}
                    </button>
                    {isMe && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); handleEditMessage(msg); }} className="p-2 rounded-xl text-[#5F5F5F] hover:bg-amber-50 hover:text-amber-700 cursor-pointer" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg); }} className="p-2 rounded-xl text-[#5F5F5F] hover:bg-red-50 hover:text-red-600 cursor-pointer" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!isDeleted && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMessageId(activeMessageId === msg.id ? null : msg.id);
                    }}
                    className={clsx(
                      "absolute top-1/2 -translate-y-1/2 rounded-full bg-white border border-[#E8E6E0] p-1.5 text-[#6B6B6B] shadow-sm opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 cursor-pointer",
                      isMe ? "-left-9" : "-right-9"
                    )}
                    title="Message options"
                  >
                    <MoreVertical size={14} />
                  </button>
                )}
                
                <span className="text-[9px] text-[#888888] font-bold mt-1 px-1">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          </Fragment>
        );
      })}
        {Object.keys(typingUsers).length > 0 && (() => {
          const firstId = Object.keys(typingUsers)[0];
          const firstName = typingUsers[firstId];
          return (
            <div className="flex items-end gap-2">
              <img
                src={getDefaultAvatar(firstName, firstId)}
                alt={firstName}
                className="w-8 h-8 rounded-full object-cover border border-[#E8E6E0]"
              />
              <div className="ca-chat-received px-4 py-3 shadow-sm">
                <div className="mb-1 text-[10px] font-black text-[#6B6B6B]">
                  {Object.values(typingUsers).slice(0, 2).join(", ")} typing
                </div>
                <div className="ca-typing-wave" aria-label="typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          );
        })()}
        <div ref={scrollRef} className="h-4" />
      </div>

      {/* Input Bar / Join Banner */}
      <div className="bg-white border-t border-[#E8E6E0] p-4 shrink-0">
        {isMember ? (
          <div className="max-w-4xl mx-auto space-y-2">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleMediaSelected(event, "photo")}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => handleMediaSelected(event, "video")}
            />
            {(replyTo || editingMessage) && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-black text-amber-800">{editingMessage ? "Editing message" : `Replying to ${replyTo?.sender_name || "Student"}`}</p>
                  <p className="truncate text-xs font-semibold text-[#6B5A38]">{editingMessage?.content || replyTo?.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null);
                    setEditingMessage(null);
                    setInputText("");
                  }}
                  className="rounded-full p-1 text-amber-700 hover:bg-amber-100 cursor-pointer"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <div className="relative flex flex-1 items-center rounded-2xl border border-[#E8E6E0] bg-[#F9F8F5] px-2 focus-within:border-[#C8922A]">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker((prev) => !prev);
                    setShowAttachMenu(false);
                  }}
                  className="p-2 text-[#777777] hover:text-amber-700 cursor-pointer"
                  title="Emoji"
                >
                  <Smile size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu((prev) => !prev);
                    setShowEmojiPicker(false);
                  }}
                  className="p-2 text-[#777777] hover:text-amber-700 cursor-pointer"
                  title="Add"
                >
                  <Plus size={21} />
                </button>
                <input
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Send message..."
                  disabled={sending}
                  className="flex-1 border-0 bg-transparent px-2 py-3 text-sm focus:outline-none"
                />

                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute bottom-full left-0 mb-2 grid grid-cols-8 gap-1 rounded-2xl border border-[#E8E6E0] bg-white p-2 shadow-xl"
                    >
                      {["😀","😂","😍","🔥","👏","❤️","👍","🎉","😎","🤝","🥳","🙌","💯","✨","😅","😭"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleInputChange(`${inputText}${emoji}`)}
                          className="h-8 w-8 rounded-xl text-lg hover:bg-amber-50 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                  {showAttachMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute bottom-full left-10 mb-2 grid w-52 gap-2 rounded-2xl border border-[#E8E6E0] bg-white p-3 shadow-xl"
                    >
                      {[
                        { type: "poll", label: "Poll", icon: BarChart3, color: "text-amber-700 bg-amber-50" },
                        { type: "photo", label: "Photo", icon: ImageIcon, color: "text-sky-700 bg-sky-50" },
                        { type: "video", label: "Video", icon: Video, color: "text-rose-700 bg-rose-50" },
                      ].map(({ type, label, icon: Icon, color }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleAttachmentChoice(type)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-black text-[#1A1A1A] hover:bg-[#FAF7F1] cursor-pointer"
                        >
                          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                            <Icon size={18} />
                          </span>
                          {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="p-3 bg-gradient-to-r from-amber-300 to-orange-300 text-[#1A1A1A] rounded-2xl hover:from-amber-400 hover:to-orange-400 transition-colors shadow-md shadow-amber-300/20 disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-2">
            <p className="text-sm text-[#6B6B6B] mb-3 font-semibold">You are not a member of this community.</p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full bg-gradient-to-r from-amber-300 to-orange-300 hover:from-amber-400 hover:to-orange-400 text-[#1A1A1A] py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-300/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {joining ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              Join Community to Participate
            </button>
          </div>
        )}
      </div>
      </section>

      {/* Poll Composer */}
      <AnimatePresence>
        {showPollModal && (
          <div
            className="fixed inset-0 z-[180] flex items-end justify-center bg-black/50 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4"
            onClick={() => setShowPollModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-[#E8E6E0] bg-white p-5 shadow-xl custom-scrollbar sm:rounded-[2rem] sm:p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600">
                    <BarChart3 size={23} />
                  </div>
                  <h2 className="text-xl font-black text-[#1A1A1A]">Create Poll</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPollModal(false)}
                  className="rounded-full p-2 text-[#888888] hover:bg-[#F3F2EE] cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="ml-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#888888]">Question</label>
                  <textarea
                    placeholder="Ask your community..."
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="min-h-[96px] w-full resize-none rounded-[1.25rem] border border-[#E8E6E0] bg-[#F3F2EE] p-4 text-sm text-[#1A1A1A] outline-none transition-all focus:border-[#C8922A]/50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="ml-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#888888]">Options</label>
                  {pollOptions.map((opt, index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const next = [...pollOptions];
                          next[index] = e.target.value;
                          setPollOptions(next);
                        }}
                        className="w-full rounded-2xl border border-[#E8E6E0] bg-[#F3F2EE] py-3.5 pl-4 pr-11 text-sm text-[#1A1A1A] outline-none transition-all focus:border-[#C8922A]/50"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#AAAAAA] hover:bg-red-50 hover:text-red-500 cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}

                  {pollOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions(prev => [...prev, ""])}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E8E6E0] py-3.5 text-xs font-black text-[#888888] hover:bg-[#F9F8F5] cursor-pointer"
                    >
                      <Plus size={14} />
                      Add Option
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#E8E6E0] bg-[#F9F8F5] p-4">
                  <div className="flex items-center gap-3">
                    <Check size={18} className={pollAllowMultiple ? "text-emerald-500" : "text-[#AAAAAA]"} />
                    <span className="text-sm font-black text-[#4A4A4A]">Allow multiple answers</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPollAllowMultiple(!pollAllowMultiple)}
                    className={clsx("h-6 w-12 rounded-full p-1 transition-all cursor-pointer", pollAllowMultiple ? "bg-emerald-500" : "bg-[#D1CFC8]")}
                  >
                    <div className={clsx("h-4 w-4 rounded-full bg-white shadow-md transition-transform", pollAllowMultiple ? "translate-x-6" : "translate-x-0")} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCreatePollMessage}
                  disabled={!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2 || sending}
                  className="w-full rounded-[1.25rem] bg-emerald-500 py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {sending ? "Creating..." : "Launch Poll"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
      <JoinSparkles active={showJoinSparkles} />
    </div>
  );
}
