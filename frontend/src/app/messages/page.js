"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, Users, ChevronLeft, MessageSquare, Plus, Image as ImageIcon, Smile, MoreVertical, X, LogOut, UserPlus, FileText, BarChart3, Pencil, Trash2, Reply, Pin, PinOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useSocket } from "@/context/SocketProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useCallback, useMemo } from "react";
import { useApiQuery } from "@/utils/useApiQuery";
import { useQueryClient } from "@tanstack/react-query";
import { getAvatarSrc } from "@/utils/defaultAvatars";

function MessagesContent() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    document.body.classList.add('messages-page-active');
    return () => {
      document.body.classList.remove('messages-page-active');
      document.body.classList.remove('messages-chat-open');
    };
  }, []);
  const [activeChat, setActiveChat] = useState(null);

  const getMessagePreview = useCallback((message) => {
    if (!message) return "No messages yet";
    if (message.deletedAt) return "Message deleted";
    if (message.poll?.question) return `Poll: ${message.poll.question}`;
    if (message.mediaType === 'image') return "Photo";
    if (message.mediaType === 'video') return "Video";
    if (message.mediaType === 'file') return "Document";
    return message.text || "Sent an attachment";
  }, []);

  const formatMessage = useCallback((m, currentUser) => {
    const senderId = m.sender?._id || m.sender?.id || m.senderId;
    const senderName = m.sender?.name || m.senderName || "Student";
    return {
      id: m._id || m.id,
      text: m.text || "",
      sender: String(senderId) === String(currentUser?._id || currentUser?.id) ? "me" : "them",
      senderName,
      senderAvatar: getAvatarSrc(m.sender?.profilePic || m.senderAvatar, senderName, senderId),
      mediaUrl: m.mediaUrl || "",
      mediaType: m.mediaType || "none",
      replyTo: m.replyTo || null,
      poll: m.poll || null,
      isPinned: Boolean(m.isPinned),
      editedAt: m.editedAt,
      deletedAt: m.deletedAt,
      time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: m.isSystem
    };
  }, []);

  const { data: activeChatMessages, isLoading: loadingMessages } = useApiQuery(
    activeChat ? ["chat-messages", activeChat.id] : null,
    activeChat ? `/api/chat/rooms/${activeChat.id}/messages` : null,
    {
      enabled: !!activeChat && !!user,
      staleTime: 60 * 1000 // 1 minute
    }
  );

  useEffect(() => {
    if (activeChat && activeChatMessages) {
      const u = user || JSON.parse(localStorage.getItem('collegeadda_user') || '{}');
      const formattedMsgs = activeChatMessages.map(m => formatMessage(m, u));
      formattedMsgs.forEach(m => {
        if (m.id) seenSocketMessageIdsRef.current.add(String(m.id));
      });
      setMessages(prev => ({ ...prev, [activeChat.id]: formattedMsgs }));
    }
  }, [activeChat, activeChatMessages, user, formatMessage]);

  const queryClient = useQueryClient();

  const readStoredUser = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("collegeadda_user") || "null");
    } catch {
      return null;
    }
  }, []);

  const getEntityId = useCallback((entity) => String(entity?._id || entity?.id || entity || ""), []);
  const getCurrentUserId = useCallback(() => getEntityId(user || readStoredUser()), [getEntityId, user, readStoredUser]);

  const isFormattedRoomCache = useCallback((rooms) => (
    Array.isArray(rooms) && rooms.length > 0 && !!rooms[0]?.id && !rooms[0]?._id
  ), []);

  const getRoomPartner = useCallback((room) => {
    const currentUserId = getCurrentUserId();
    return room.participants?.find((p) => getEntityId(p) !== currentUserId);
  }, [getCurrentUserId, getEntityId]);

  const getPrivatePartnerId = useCallback((room) => {
    if (room.type === "group" || room.isGroup) return "";
    if (room.partner) return getEntityId(room.partner);
    const currentUserId = getCurrentUserId();
    return (room.participants || [])
      .map(getEntityId)
      .find((id) => id && id !== currentUserId) || "";
  }, [getCurrentUserId, getEntityId]);

  const dedupeChats = useCallback((roomList) => {
    const byKey = new Map();
    roomList.forEach((room) => {
      if (!room?.id) return;
      const partnerId = room.partnerId || getPrivatePartnerId(room);
      const key = room.type === "private" && partnerId ? `private:${partnerId}` : `${room.type || "room"}:${room.id}`;
      const existing = byKey.get(key);
      if (!existing || (room.timestamp || 0) > (existing.timestamp || 0)) {
        byKey.set(key, { ...room, partnerId });
      }
    });
    return Array.from(byKey.values());
  }, [getPrivatePartnerId]);

  const formatRooms = useCallback((data) => {
    const currentUser = user || readStoredUser();
    if (!Array.isArray(data) || !currentUser) return [];

    // Recover display from a previously poisoned UI-shaped cache (do not wipe)
    if (isFormattedRoomCache(data)) {
      return dedupeChats(data.map((room) => ({
        ...room,
        participants: room.participants || [],
        partnerId: room.partnerId || getPrivatePartnerId(room),
        avatar: room.type === "group"
          ? "group"
          : getAvatarSrc(
              typeof room.avatar === "string" && room.avatar !== "group" ? room.avatar : room.partner?.profilePic,
              room.name || room.partner?.name || "Student",
              room.partner?._id || room.partner?.id || room.id
            ),
      })));
    }

    const myId = String(currentUser._id || currentUser.id);
    const unreadKey = currentUser._id || currentUser.id;
    const formatted = data.map((room) => {
      const partner = getRoomPartner(room);
      return {
        id: room._id,
        name: room.isGroup
          ? (room.groupName || `${room.university} Hub`)
          : (partner?.name || "Chat"),
        type: room.isGroup ? "group" : "private",
        avatar: room.isGroup
          ? "group"
          : getAvatarSrc(partner?.profilePic, partner?.name || "Student", partner?._id || partner?.id),
        lastMsg: getMessagePreview(room.lastMessage),
        time: room.lastMessage
          ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        timestamp: room.lastMessage?.createdAt
          ? new Date(room.lastMessage.createdAt).getTime()
          : new Date(room.updatedAt || room.createdAt || 0).getTime(),
        unreadCount: room.unreadCounts?.[unreadKey] || room.unreadCounts?.[String(unreadKey)] || 0,
        participants: room.participants?.map((p) => p._id || p.id) || [],
        partnerId: getEntityId(partner),
        partner: room.isGroup ? null : partner,
      };
    });
    return dedupeChats(formatted);
  }, [user, readStoredUser, isFormattedRoomCache, getMessagePreview, getRoomPartner, getPrivatePartnerId, getEntityId, dedupeChats]);

  const { data: rawRooms = [], isLoading: loadingChats } = useApiQuery(
    "chat-rooms",
    "/api/chat/rooms",
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );

  // Keep API-shaped rooms in the query cache; format only for UI
  const chats = useMemo(() => formatRooms(rawRooms), [rawRooms, formatRooms]);

  const invalidateChatRooms = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
  }, [queryClient]);

  const patchRawRoom = useCallback((roomId, updater) => {
    queryClient.setQueryData(["chat-rooms"], (old) => {
      if (!Array.isArray(old)) return old;
      if (isFormattedRoomCache(old)) {
        // Poisoned cache — refetch full list instead of patching UI shapes
        queueMicrotask(() => invalidateChatRooms());
        return old;
      }
      let matched = false;
      const next = old.map((room) => {
        if (String(room._id) !== String(roomId)) return room;
        matched = true;
        return typeof updater === "function" ? updater(room) : { ...room, ...updater };
      });
      if (!matched) {
        queueMicrotask(() => invalidateChatRooms());
      }
      return next;
    });
  }, [queryClient, isFormattedRoomCache, invalidateChatRooms]);

  const removeRawRoom = useCallback((roomId) => {
    queryClient.setQueryData(["chat-rooms"], (old) => {
      if (!Array.isArray(old)) return old;
      return old.filter((room) => String(room._id || room.id) !== String(roomId));
    });
  }, [queryClient]);

  const applyRoomMessagePreview = useCallback((roomId, message, { unreadDelta = 0, clearUnread = false } = {}) => {
    const currentUser = user || readStoredUser();
    const uid = currentUser?._id || currentUser?.id;
    patchRawRoom(roomId, (room) => {
      const nextUnread = { ...(room.unreadCounts || {}) };
      if (uid) {
        const key = String(uid);
        if (clearUnread) {
          nextUnread[uid] = 0;
          nextUnread[key] = 0;
        } else if (unreadDelta) {
          const current = nextUnread[uid] ?? nextUnread[key] ?? 0;
          nextUnread[uid] = current + unreadDelta;
          nextUnread[key] = current + unreadDelta;
        }
      }
      return {
        ...room,
        lastMessage: message
          ? {
              text: message.text,
              mediaType: message.mediaType,
              poll: message.poll,
              deletedAt: message.deletedAt,
              createdAt: message.createdAt || new Date().toISOString(),
              sender: message.sender || message.senderId,
            }
          : room.lastMessage,
        updatedAt: message?.createdAt || room.updatedAt || new Date().toISOString(),
        unreadCounts: nextUnread,
      };
    });
  }, [patchRawRoom, user, readStoredUser]);

  // Drop poisoned UI-shaped room lists persisted from older builds
  useEffect(() => {
    if (isFormattedRoomCache(rawRooms)) {
      invalidateChatRooms();
    }
  }, [rawRooms, isFormattedRoomCache, invalidateChatRooms]);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMemberCount, setShowMemberCount] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [mediaType, setMediaType] = useState('none');
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [typingName, setTypingName] = useState("");
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pinnedJumpIndex, setPinnedJumpIndex] = useState(0);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [connectionsLoaded, setConnectionsLoaded] = useState(false);
  
  const emojis = ["❤️", "🔥", "😂", "😍", "🙌", "👏", "✨", "💯", "🎉", "😎", "🚀", "💡", "☕", "📚", "🎓", "🍕", "🎸", "🎮", "🏀", "🧪"];
  
  const { socket, setActiveRoom, resetUnread } = useSocket();
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const outgoingTypingTimeoutRef = useRef(null);
  const seenSocketMessageIdsRef = useRef(new Set());
  const deepLinkHandledRef = useRef(false);
  const creatingDirectRoomRef = useRef(null);
  const messageRefs = useRef({});
  const scrollRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('messages-chat-open', Boolean(activeChat));
    return () => document.body.classList.remove('messages-chat-open');
  }, [activeChat]);

  const isOnlyEmoji = (text) => {
    if (!text) return false;
    const cleanText = text.trim().replace(/\s/g, '');
    // Improved regex to handle common emojis, variation selectors, skin tones, and ZWJ sequences
    const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\ufe0f|\u200d)+$/;
    return emojiRegex.test(cleanText) && cleanText.length <= 15;
  };
  
  const sendAutoInterestMessage = async (roomId, productTitle) => {
    const storedUser = localStorage.getItem("collegeadda_user");
    if (!storedUser) return;
    let u;
    try {
      u = JSON.parse(storedUser);
    } catch (e) {
      return;
    }
    const textMsg = `👋 Hi! ${u.name} is interested in your listing: "${productTitle}"`;
    const token = localStorage.getItem("collegeadda_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    try {
      const res = await fetch(`${apiUrl}/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: textMsg })
      });
      if (res.ok) {
        const savedMsg = await res.json();
        if (socket) {
          socket.emit("forward_message", {
            room: roomId,
            senderId: u._id || u.id,
            senderName: u.name,
            text: textMsg,
            mediaUrl: "",
            mediaType: "none",
            _id: savedMsg._id,
            createdAt: savedMsg.createdAt || new Date().toISOString()
          });
        }
        setMessages(prev => {
          const currentRoomMsgs = prev[roomId] || [];
          if (currentRoomMsgs.some(m => m.id === savedMsg._id)) return prev;
          return {
            ...prev,
            [roomId]: [...currentRoomMsgs, {
              id: savedMsg._id,
              text: textMsg,
              sender: "me",
              senderName: u.name,
              senderAvatar: getAvatarSrc(u.profilePic, u.name, u._id || u.id),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]
          };
        });
      }
    } catch (error) {
      console.error("Error sending auto interest message:", error);
    }
    
    const url = new URL(window.location.href);
    url.searchParams.delete("interestProduct");
    url.searchParams.delete("userId");
    window.history.replaceState({}, document.title, url.pathname + url.search);
  };

  // Auth bootstrap — keep separate from deep-link handling
  useEffect(() => {
    const storedUser = localStorage.getItem("collegeadda_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    let u;
    try {
      u = JSON.parse(storedUser);
    } catch (e) {
      console.error("Auth error", e);
      router.push("/login");
      return;
    }

    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
    resetUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-link: ?chat= / ?userId= — wait until user + rooms are ready
  useEffect(() => {
    if (!user || loadingChats || deepLinkHandledRef.current || activeChat) return;

    const chatParam = searchParams.get("chat");
    const userIdParam = searchParams.get("userId");
    const interestParam = searchParams.get("interestProduct");
    if (!chatParam && !userIdParam) return;

    const openDirectRoom = (room) => {
      setActiveChat(room);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("chat", room.id);
        url.searchParams.delete("userId");
        url.searchParams.delete("interestProduct");
        window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
      }
      if (interestParam) sendAutoInterestMessage(room.id, interestParam);
    };

    if (chatParam) {
      const found = chats.find((c) => String(c.id) === String(chatParam));
      if (found) {
        deepLinkHandledRef.current = true;
        openDirectRoom(found);
      }
      return;
    }

    // Always getOrCreate so empty DMs get a one-shot inbox surface bump
    if (creatingDirectRoomRef.current === userIdParam) return;
    deepLinkHandledRef.current = true;
    creatingDirectRoomRef.current = userIdParam;
    let cancelled = false;

    const openOrCreateDM = async () => {
      try {
        const token = localStorage.getItem("collegeadda_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const createRes = await fetch(`${apiUrl}/api/chat/rooms`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ participantId: userIdParam }),
        });
        if (!createRes.ok) {
          deepLinkHandledRef.current = false;
          return;
        }
        const room = await createRes.json();
        if (cancelled) return;
        await queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
        const formatted = formatRooms([room])[0];
        if (formatted) openDirectRoom(formatted);
      } catch (err) {
        console.error("Error opening DM room:", err);
        deepLinkHandledRef.current = false;
      } finally {
        creatingDirectRoomRef.current = null;
      }
    };

    openOrCreateDM();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingChats, chats, searchParams, activeChat]);

  // Separate useEffect to handle global socket message reception locally
  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (msg) => {
      const incomingId = String(msg._id || msg.id || "");
      const isDuplicateSocketMessage = incomingId && seenSocketMessageIdsRef.current.has(incomingId);
      if (incomingId) seenSocketMessageIdsRef.current.add(incomingId);
      const isMine = String(msg.senderId || msg.sender?._id || msg.sender?.id) === String(user._id || user.id);
      const didAppendUnreadMessage = !isDuplicateSocketMessage && !isMine;
      setMessages(prev => {
        const roomMessages = prev[msg.room] || [];
        
        // Check if this message already exists (by ID)
        if (isDuplicateSocketMessage || roomMessages.find(m => m.id === msg._id)) return prev;

        // If it's my own message coming back, replace the temp one
        const tempMsgIdx = roomMessages.findIndex(m => m.id === msg.tempId);
        if (tempMsgIdx !== -1) {
          const updated = [...roomMessages];
          updated[tempMsgIdx] = {
            ...updated[tempMsgIdx],
            id: msg._id,
            status: 'sent',
            ...formatMessage({ ...msg, id: msg._id }, user)
          };
          return { ...prev, [msg.room]: updated };
        }

        const formatted = formatMessage({ ...msg, id: msg._id }, user);
        
        return {
          ...prev,
          [msg.room]: [...roomMessages, formatted]
        };
      });

      const isCurrent = activeChat?.id === msg.room;
      applyRoomMessagePreview(msg.room, msg, {
        unreadDelta: isCurrent || !didAppendUnreadMessage ? 0 : 1,
      });
    };

    const handleMessageUpdated = ({ room, message }) => {
      const updatedMessage = formatMessage(message, user);
      setMessages(prev => ({
        ...prev,
        [room]: (prev[room] || []).map(m => m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m)
      }));
      applyRoomMessagePreview(room, message);
    };

    const handleTyping = ({ name }) => {
      if (!name || name === user.name) return;
      setTypingName(name);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingName(""), 1600);
    };

    const handleStopTyping = () => setTypingName("");

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, user, activeChat, formatMessage, applyRoomMessagePreview]);

  useEffect(() => {
    if (activeChat && socket) {
      socket.emit('join_room', activeChat.id);
      setActiveRoom(activeChat.id);
      
      const markSeen = async () => {
        const token = localStorage.getItem("collegeadda_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        try {
          await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/seen`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          applyRoomMessagePreview(activeChat.id, null, { clearUnread: true });
        } catch (e) { console.error(e); }
      };
      markSeen();


    }
    return () => {
      if (activeChat?.id && socket) {
        socket.emit('leave_room', activeChat.id);
      }
      setActiveRoom(null);
    };
  }, [activeChat, socket, setActiveRoom, applyRoomMessagePreview]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const handleMediaSelect = (e, forcedType = null) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const type = forcedType || (file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : 'file');
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedMedia(reader.result);
      setMediaType(type);
      setSelectedFileName(file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleInputChange = (value) => {
    setInput(value);
    if (!socket || !activeChat) return;
    socket.emit('typing', { room: activeChat.id, name: user?.name });
    clearTimeout(outgoingTypingTimeoutRef.current);
    outgoingTypingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { room: activeChat.id });
    }, 900);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedMedia) || !activeChat || isSending) return;

    setIsSending(true);
    const token = localStorage.getItem("collegeadda_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    if (editingMessage) {
      try {
        const res = await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/messages/${editingMessage.id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text: input })
        });
        if (res.ok) {
          const updated = await res.json();
          const formatted = formatMessage(updated, user);
          setMessages(prev => ({
            ...prev,
            [activeChat.id]: (prev[activeChat.id] || []).map(m => m.id === formatted.id ? { ...m, ...formatted } : m)
          }));
          socket?.emit('message_updated', { room: activeChat.id, message: updated });
          console.log("chat database updated");
        } else {
          const errorData = await res.json().catch(() => ({}));
          alert(errorData.message || "Failed to edit message.");
        }
      } catch (err) {
        console.error("Error editing message:", err);
        alert("Failed to edit message.");
      }
      setEditingMessage(null);
      setInput("");
      setIsSending(false);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const data = {
      room: activeChat.id,
      senderId: user._id || user.id,
      senderName: user.name,
      senderAvatar: getAvatarSrc(user.profilePic, user.name, user._id || user.id),
      text: input,
      mediaUrl: selectedMedia || '',
      mediaType: mediaType,
      replyTo,
      tempId // Add tempId to track optimistic message
    };

    // Optimistic UI update
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [
        ...(prev[activeChat.id] || []),
        {
          id: tempId,
          text: data.text,
          sender: "me",
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          replyTo,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sending'
        }
      ]
    }));
    // Optimistic UI update for chat list (raw cache)
    applyRoomMessagePreview(activeChat.id, {
      text: data.text,
      mediaType: data.mediaType,
      createdAt: new Date().toISOString(),
    });
    
    try {
      const res = await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: data.text,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          replyTo,
          fileName: selectedFileName
        })
      });
      
      if (res.ok) {
        const savedMsg = await res.json();
        if (socket) {
          // Forward the saved message to other users via socket
          socket.emit('forward_message', {
            ...data,
            _id: savedMsg._id,
            replyTo: savedMsg.replyTo,
            poll: savedMsg.poll,
            isPinned: savedMsg.isPinned,
            editedAt: savedMsg.editedAt,
            deletedAt: savedMsg.deletedAt,
            createdAt: savedMsg.createdAt || new Date().toISOString()
          });
        }
      } else {
        console.error("Failed to send message via API");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }

    setInput("");
    setSelectedMedia(null);
    setSelectedFileName("");
    setMediaType('none');
    setReplyTo(null);
    setIsSending(false);
  };

  const addEmoji = (emoji) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const emitMessageUpdate = (message) => {
    socket?.emit('message_updated', { room: activeChat.id, message });
  };

  const applyUpdatedMessage = (message) => {
    const formatted = formatMessage(message, user);
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: (prev[activeChat.id] || []).map(m => m.id === formatted.id ? { ...m, ...formatted } : m)
    }));
    applyRoomMessagePreview(activeChat.id, message);
    emitMessageUpdate(message);
  };

  const startReply = (msg) => {
    setReplyTo({
      messageId: msg.id,
      text: msg.deletedAt ? "Message deleted" : msg.poll?.question || msg.text || getMessagePreview(msg),
      senderName: msg.senderName
    });
    setActiveMessageMenu(null);
  };

  const startEdit = (msg) => {
    if (msg.deletedAt || msg.sender !== "me") return;
    setEditingMessage(msg);
    setInput(msg.text || "");
    setReplyTo(null);
    setActiveMessageMenu(null);
  };

  const readActionError = async (res, fallback) => {
    try {
      const data = await res.json();
      return data.message || fallback;
    } catch (jsonError) {
      try {
        const text = await res.text();
        return text || fallback;
      } catch (textError) {
        return fallback;
      }
    }
  };

  const deleteMessage = async (msg) => {
    if (!msg?.id || String(msg.id).startsWith("temp-")) {
      setMessages(prev => ({
        ...prev,
        [activeChat.id]: (prev[activeChat.id] || []).filter(item => item.id !== msg.id)
      }));
      setActiveMessageMenu(null);
      return;
    }

    try {
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/messages/${msg.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        applyUpdatedMessage(updated);
        console.log("chat database updated");
      } else {
        const deleteError = await readActionError(res, "Failed to delete message.");
        const fallbackRes = await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/messages/${msg.id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text: "This message was deleted" })
        });

        if (fallbackRes.ok) {
          const updated = await fallbackRes.json();
          applyUpdatedMessage({ ...updated, deletedAt: updated.deletedAt || new Date().toISOString(), text: "This message was deleted" });
          console.log("chat database updated");
        } else {
          const fallbackError = await readActionError(fallbackRes, deleteError);
          alert(fallbackError || deleteError);
        }
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message.");
    } finally {
      setActiveMessageMenu(null);
    }
  };

  const togglePinMessage = async (msg) => {
    if (msg.deletedAt) return;
    try {
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/messages/${msg.id}/pin`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        applyUpdatedMessage(updated);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || "Failed to pin message.");
      }
    } catch (err) {
      console.error("Error pinning message:", err);
      alert("Failed to pin message.");
    } finally {
      setActiveMessageMenu(null);
    }
  };

  const createPollMessage = async () => {
    const question = pollQuestion.trim();
    const options = pollOptions.map(option => option.trim()).filter(Boolean);
    if (!activeChat || activeChat.type !== "group" || !question || options.length < 2 || isSending) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: question,
          mediaType: "none",
          replyTo,
          poll: { question, options, allowMultiple: false }
        })
      });
      if (res.ok) {
        const savedMsg = await res.json();
        const formatted = formatMessage(savedMsg, user);
        setMessages(prev => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), formatted] }));
        applyRoomMessagePreview(activeChat.id, savedMsg);
        socket?.emit('forward_message', {
          room: activeChat.id,
          senderId: user._id || user.id,
          senderName: user.name,
          senderAvatar: getAvatarSrc(user.profilePic, user.name, user._id || user.id),
          text: question,
          mediaUrl: "",
          mediaType: "none",
          replyTo: savedMsg.replyTo,
          poll: savedMsg.poll,
          isPinned: savedMsg.isPinned,
          _id: savedMsg._id,
          createdAt: savedMsg.createdAt || new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error creating poll:", err);
    } finally {
      setShowPollModal(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setReplyTo(null);
      setIsSending(false);
    }
  };

  const votePoll = async (msg, optionIndex) => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/messages/${msg.id}/poll`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ optionIndex })
      });
      if (res.ok) applyUpdatedMessage(await res.json());
    } catch (err) {
      console.error("Error voting poll:", err);
    }
  };

  const fetchConnections = useCallback(async (force = false) => {
    if (connectionsLoaded && !force) return;
    setLoadingConnections(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const [f1, f2] = await Promise.all([
        fetch(`${apiUrl}/api/users/me/following`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${apiUrl}/api/users/me/followers`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);
      const combined = [...(Array.isArray(f1) ? f1 : []), ...(Array.isArray(f2) ? f2 : [])];
      // Deduplicate
      const unique = combined.filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i);
      setConnections(unique);
      setConnectionsLoaded(true);
    } catch (err) {
      console.error("Error fetching connections:", err);
    } finally {
      setLoadingConnections(false);
    }
  }, [connectionsLoaded]);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => fetchConnections(), 800);
    return () => clearTimeout(timer);
  }, [user, fetchConnections]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return;
    setCreatingGroup(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/chat/rooms`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isGroup: true, 
          groupName: newGroupName, 
          participantIds: selectedMembers
        })
      });
      
      if (res.ok) {
        const newRoom = await res.json();
        await queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
        const formatted = formatRooms([newRoom])[0];
        if (formatted) setActiveChat(formatted);
        setShowCreateGroup(false);
        setNewGroupName("");
        setSelectedMembers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingGroup(false);
    }
  };

  const toggleMemberSelection = (id) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const openChat = (chat) => {
    setActiveChat(chat);
    setShowAttachments(false);
    setShowEmojiPicker(false);
    setShowChatOptions(false);
    setActiveMessageMenu(null);
    setReplyTo(null);
    setEditingMessage(null);
    setTypingName("");
    setPinnedJumpIndex(0);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("chat", chat.id);
      url.searchParams.delete("userId");
      url.searchParams.delete("interestProduct");
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
    }
  };

  const closeChat = () => {
    setActiveChat(null);
    setShowAttachments(false);
    setShowEmojiPicker(false);
    setShowChatOptions(false);
    setSelectedMedia(null);
    setSelectedFileName("");
    setMediaType('none');
    setReplyTo(null);
    setEditingMessage(null);
    setActiveMessageMenu(null);
    setTypingName("");
    setPinnedJumpIndex(0);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("chat");
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeChat || activeChat.type !== 'group') return;
    
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    try {
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      
      const res = await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/leave`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        // Emit leave message via socket
        socket?.emit('send_message', {
          room: activeChat.id,
          senderId: user._id || user.id,
          senderName: 'System',
          text: `${user.name} left the group`,
          isSystem: true
        });

        removeRawRoom(activeChat.id);
        invalidateChatRooms();
        setActiveChat(null);
        setShowChatOptions(false);
      }
    } catch (err) {
      console.error("Error leaving group:", err);
    }
  };

  const handleAddMember = async (memberId, memberName) => {
    if (!activeChat || activeChat.type !== 'group') return;

    try {
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      
      const res = await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/add`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ participantId: memberId })
      });
      
      if (res.ok) {
        invalidateChatRooms();

        // Emit system message via socket
        socket?.emit('send_message', {
          room: activeChat.id,
          senderId: user._id || user.id,
          senderName: 'System',
          text: `${memberName} added to group`,
          isSystem: true
        });

        setShowAddMemberModal(false);
        setShowChatOptions(false);
      }
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };

  const sortedChats = [...chats].sort((a, b) => {
    // Check if it's the common group
    const isACommonGroup = a.type === "group" && a.name.includes("Common Group");
    const isBCommonGroup = b.type === "group" && b.name.includes("Common Group");
    
    if (isACommonGroup && !isBCommonGroup) return -1;
    if (!isACommonGroup && isBCommonGroup) return 1;
    
    // Sort by timestamp descending
    return (b.timestamp || 0) - (a.timestamp || 0);
  });

  const filteredChats = sortedChats.filter(c => c.name.toLowerCase().includes(chatSearch.toLowerCase()));
  const activeMessages = activeChat ? (messages[activeChat.id] || []) : [];
  const pinnedMessages = activeMessages.filter(msg => msg.isPinned && !msg.deletedAt);
  const pinnedCount = pinnedMessages.length;

  const handleJumpToPinned = () => {
    if (pinnedMessages.length === 0) return;
    const target = pinnedMessages[pinnedJumpIndex % pinnedMessages.length];
    if (target && messageRefs.current[target.id]) {
      messageRefs.current[target.id].scrollIntoView({ behavior: "smooth", block: "center" });
      setPinnedJumpIndex(prev => (prev + 1) % pinnedMessages.length);
    }
  };

  const renderMessageActions = (msg, isMe) => (
    <div className={clsx(
      "absolute z-40 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-2xl border border-[#E8E6E0] bg-white p-1 shadow-xl",
      isMe ? "right-full mr-2" : "left-full ml-2"
    )}>
      <button onClick={() => startReply(msg)} className="p-2 rounded-xl text-[#5F5F5F] hover:bg-amber-50 hover:text-amber-700" title="Reply" aria-label="Reply">
        <Reply size={15} />
      </button>
      <button onClick={() => togglePinMessage(msg)} className="p-2 rounded-xl text-[#5F5F5F] hover:bg-amber-50 hover:text-amber-700" title={msg.isPinned ? "Unpin" : "Pin"} aria-label={msg.isPinned ? "Unpin" : "Pin"}>
        {msg.isPinned ? <PinOff size={15} /> : <Pin size={15} />}
      </button>
      {isMe && (
        <>
          <button onClick={() => startEdit(msg)} className="p-2 rounded-xl text-[#5F5F5F] hover:bg-amber-50 hover:text-amber-700" title="Edit" aria-label="Edit">
            <Pencil size={15} />
          </button>
          <button onClick={() => deleteMessage(msg)} className="p-2 rounded-xl text-[#5F5F5F] hover:bg-red-50 hover:text-red-600" title="Delete" aria-label="Delete">
            <Trash2 size={15} />
          </button>
        </>
      )}
    </div>
  );

  if (!isMounted || !user) return null;

  return (
    <div className="messages-layout">
      {/* Chat List Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={clsx(
          "inbox-panel bg-white border-r border-[#E8E6E0]",
          activeChat && "chat-active"
        )}
      >
        <header className="inbox-header flex flex-col pt-4">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight sm:text-3xl">Inbox</h1>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowCreateGroup(true);
                fetchConnections();
              }}
              className="p-3 rounded-2xl text-[#C8922A] border border-[#E8E6E0] bg-[#F3F2EE] hover:bg-[#F3F2EE]"
            >
              <Plus size={22} />
            </motion.button>
          </div>

          <div className="inbox-search relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B] group-focus-within:text-[#C8922A] transition-colors" size={20} />
            <input
              type="text"
              value={chatSearch}
              onChange={e => setChatSearch(e.target.value)}
              placeholder="Search conversations..."
              className="input-surface w-full rounded-[1.25rem] py-3.5 pl-12 pr-4 text-sm placeholder:text-[#888888]"
            />
          </div>
        </header>

        <div className="inbox-conversation-list custom-scrollbar px-2 space-y-1 flex-1 overflow-y-auto min-h-0">
          {loadingChats ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 sm:space-x-4 sm:p-4 opacity-50 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-[#E8E6E0] sm:h-14 sm:w-14 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#E8E6E0] rounded w-1/2" />
                  <div className="h-3 bg-[#E8E6E0] rounded w-3/4" />
                </div>
              </div>
            ))
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#888888]">
              <MessageSquare size={48} className="mb-4 text-[#E8E6E0]" />
              <p className="font-medium text-[#1A1A1A]">Your Inbox is Waiting</p>
              <p className="text-sm mt-1">Start a conversation with a network member.</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <motion.button
                key={chat.id}
                whileHover={{ x: 4 }}
                type="button"
                onClick={() => openChat(chat)}
                aria-label={`Open chat with ${chat.name}`}
                className={clsx(
                  "group relative flex w-full items-center space-x-3 rounded-[1.35rem] p-3 transition-all sm:space-x-4 sm:rounded-[1.5rem] sm:p-4",
                  activeChat?.id === chat.id 
                    ? "bg-purple-900/30 border-l-2 border-[#C8922A] shadow-xl rounded-l-none" 
                    : "hover:bg-[#F3F2EE] border border-transparent"
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="h-12 w-12 rounded-full p-[2px] gradient-bg shadow-lg sm:h-14 sm:w-14">
                    <div className="w-full h-full rounded-full bg-[#FAFAF8] flex items-center justify-center overflow-hidden">
                      {chat.type === "group" ? (
                        <div className="w-full h-full bg-[#7C3AED] flex items-center justify-center">
                          <Users size={24} className="text-white" />
                        </div>
                      ) : (
                        <img 
                          src={chat.avatar} 
                          alt=""
                          className="w-full h-full object-cover" 
                            onError={(e) => { e.target.src = getAvatarSrc("", chat.name, chat.id); }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex min-w-0 items-center">
                      <p className="font-bold text-[15px] text-[#1A1A1A] truncate leading-tight">{chat.name}</p>
                    </div>
                    <span className="text-[10px] text-[#6B6B6B] font-medium flex-shrink-0 ml-2">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={clsx(
                      "text-xs truncate flex-1 leading-normal",
                      chat.unreadCount > 0 ? "text-[#1A1A1A] font-bold" : "text-[#6B6B6B]"
                    )}>
                      {chat.lastMsg}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="ml-3 px-2 py-0.5 min-w-[20px] bg-[#EC4899] text-[#1A1A1A] text-[10px] font-black rounded-full shadow-lg shadow-[0_4px_14px_rgba(200,146,42,0.15)] flex-shrink-0 text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                
                {activeChat?.id === chat.id && (
                  <motion.div 
                    layoutId="active-chat-indicator"
                    className="absolute left-0 w-1 h-8 gradient-bg rounded-r-full"
                  />
                )}
              </motion.button>
            ))
          )}
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className={clsx(
        "chat-panel bg-white",
        activeChat && "chat-active"
      )}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <header className="chat-header page-header flex items-center justify-between px-4 md:px-6 py-2">
              <div className="flex items-center space-x-3 min-w-0">
                <button onClick={closeChat} className="lg:hidden p-2 text-[#6B6B6B] hover:text-[#1A1A1A] bg-[#F3F2EE] rounded-full mr-1 flex-shrink-0" aria-label="Back to conversations">
                  <ChevronLeft size={20} />
                </button>
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full p-[2px] gradient-bg">
                    <div className="w-full h-full rounded-full bg-[#FAFAF8] flex items-center justify-center overflow-hidden">
                      {activeChat.type === "group" ? (
                        <div className="w-full h-full gradient-bg flex items-center justify-center text-[#1A1A1A] font-black text-sm">
                          {activeChat.name.charAt(0)}
                        </div>
                      ) : <img 
                            src={activeChat.avatar} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.src = getAvatarSrc("", activeChat.name, activeChat.id); }}
                          />}
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <h2 className="font-bold text-[#1A1A1A] text-[14px] truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none leading-tight">{activeChat.name}</h2>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                {pinnedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleJumpToPinned}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-100"
                    title="Jump to pinned message"
                  >
                    <Pin size={14} />
                    {pinnedCount}
                  </button>
                )}
                {activeChat.type === "group" && (
                  <button 
                    onClick={() => {
                      setShowMemberCount(true);
                      setTimeout(() => setShowMemberCount(false), 10000);
                    }}
                    className="p-2 text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F3F2EE] rounded-xl transition-all flex items-center justify-center min-w-[32px]"
                  >
                    <AnimatePresence mode="wait">
                      {showMemberCount ? (
                        <motion.span
                          key="count"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-[#C8922A] font-black text-xs"
                        >
                          {activeChat.participants?.length || 0}
                        </motion.span>
                      ) : (
                        <motion.div
                          key="icon"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Users size={18} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}
                <div className="relative">
                  <button 
                    onClick={() => setShowChatOptions(!showChatOptions)}
                    className="p-2 text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F3F2EE] rounded-xl transition-all"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  <AnimatePresence>
                    {showChatOptions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl border border-[#E8E6E0] shadow-2xl py-2 z-50 overflow-hidden"
                      >
                        {activeChat.type === 'group' ? (
                          <>
                            <button 
                              onClick={() => { setShowAddMemberModal(true); setShowChatOptions(false); fetchConnections(); }}
                              className="w-full text-left px-4 py-3 text-sm font-bold text-green-500 hover:bg-green-500/10 flex items-center space-x-2 transition-colors border-b border-[#E8E6E0]"
                            >
                              <UserPlus size={16} />
                              <span>Add Member</span>
                            </button>
                            <button 
                              onClick={handleLeaveGroup}
                              className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 flex items-center space-x-2 transition-colors"
                            >
                              <LogOut size={16} />
                              <span>Exit Group</span>
                            </button>
                          </>
                        ) : (
                          <div className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#888888]">
                            No options available
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="chat-messages-area custom-scrollbar relative">
              <div className="flex justify-center mb-6 shrink-0">
                <span className="text-[10px] bg-[#F9F8F5] border border-[#E8E6E0] px-4 py-1.5 rounded-full text-[#6B6B6B] font-bold uppercase tracking-[0.2em] border border-[#E8E6E0]">
                  Begin your secure campus connection
                </span>
              </div>

              <AnimatePresence initial={false}>
                {activeMessages.map((msg, idx, arr) => {
                    const isMe = msg.sender === "me";
                    const showAvatar = !isMe && (idx === 0 || arr[idx-1].sender !== "them");
                    
                    if (msg.isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center w-full my-4">
                          <span className="text-[10px] bg-[#F9F8F5] border border-[#E8E6E0] px-4 py-1.5 rounded-full text-[#6B6B6B] font-bold uppercase tracking-[0.2em] border border-[#E8E6E0]">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }
                    
                    return (
                    <motion.div 
                      key={msg.id}
                      ref={(node) => {
                        if (node) messageRefs.current[msg.id] = node;
                      }}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={clsx(
                        "flex w-full group mb-2",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <div className="w-8 h-8 flex-shrink-0 mr-3 mt-auto">
                          {showAvatar ? (
                            <img 
                              src={msg.senderAvatar} 
                              className="w-full h-full rounded-full object-cover border border-[#E8E6E0]" 
                            />
                          ) : null}
                        </div>
                      )}
                      
                      <div className={clsx(
                        "flex flex-col max-w-[84%] sm:max-w-[75%]",
                        isMe ? "items-end" : "items-start"
                      )}>
                        {!isMe && showAvatar && (
                          <span className="text-[10px] text-[#6B6B6B] font-bold mb-1 ml-1">
                            {msg.senderName.split(' ')[0]}
                          </span>
                        )}
                        <div className="relative flex items-center gap-2">
                        {isMe && !msg.deletedAt && (
                          <div className="relative flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id)}
                              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-full bg-white border border-[#E8E6E0] text-[#6B6B6B] shadow-md hover:text-[#1A1A1A] transition-all"
                              aria-label="Message options"
                              aria-expanded={activeMessageMenu === msg.id}
                            >
                              <MoreVertical size={15} />
                            </button>
                            <AnimatePresence>
                              {activeMessageMenu === msg.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.94, x: 8 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.94, x: 8 }}
                                >
                                  {renderMessageActions(msg, isMe)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                        {isOnlyEmoji(msg.text) && !msg.mediaUrl && !msg.poll ? (
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ 
                              scale: [1, 1.15, 1],
                              rotate: [0, 5, -5, 0],
                              opacity: 1
                            }}
                            transition={{ 
                              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                              rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                              opacity: { duration: 0.3 }
                            }}
                            className="text-5xl py-1 cursor-default select-none drop-shadow-2xl"
                          >
                            {msg.text}
                          </motion.div>
                        ) : (
                          <div className={clsx(
                            "w-fit max-w-full px-3.5 py-2.5 text-[14px] leading-relaxed shadow-2xl relative break-words",
                            isMe 
                              ? "ca-chat-sent" 
                              : "ca-chat-received"
                          )}>
                            {msg.isPinned && (
                              <div className="mb-1 flex items-center gap-1 text-[10px] font-black opacity-80">
                                <Pin size={11} /> Pinned
                              </div>
                            )}
                            {msg.replyTo && (
                              <div className={clsx(
                                "mb-2 rounded-xl border-l-4 px-3 py-2 text-xs",
                                isMe ? "bg-white/20 border-white/70" : "bg-[#F3F2EE] border-[#C8922A]"
                              )}>
                                <div className="font-black">{msg.replyTo.senderName}</div>
                                <div className="line-clamp-1 opacity-80">{msg.replyTo.text}</div>
                              </div>
                            )}
                            {msg.mediaUrl && (
                              <div className="mb-2 rounded-xl overflow-hidden border border-[#E8E6E0] bg-black/5 flex items-center justify-center">
                                {msg.mediaType === 'video' ? (
                                  <video src={msg.mediaUrl} controls className="max-w-full h-auto max-h-[350px] object-contain" />
                                ) : msg.mediaType === 'file' ? (
                                  <a href={msg.mediaUrl} download className="flex items-center gap-2 bg-white/30 px-3 py-2 text-sm font-black">
                                    <FileText size={18} /> Document
                                  </a>
                                ) : (
                                  <img src={msg.mediaUrl} alt="" className="max-w-full h-auto max-h-[350px] object-contain" />
                                )}
                              </div>
                            )}
                            {msg.poll?.question && (
                              <div className="relative z-10 w-64 max-w-[70vw] space-y-2">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-80">
                                  <BarChart3 size={14} /> Poll
                                </div>
                                <div className="font-black">{msg.poll.question}</div>
                                {msg.poll.options?.map((option, optionIndex) => {
                                  const totalVotes = msg.poll.options.reduce((sum, item) => sum + (item.votes?.length || 0), 0);
                                  const votes = option.votes?.length || 0;
                                  const percent = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
                                  const didVote = option.votes?.some(vote => String(vote) === String(user._id || user.id));
                                  return (
                                    <button
                                      key={`${msg.id}-poll-${optionIndex}`}
                                      type="button"
                                      onClick={() => votePoll(msg, optionIndex)}
                                      className={clsx(
                                        "relative w-full overflow-hidden rounded-xl border px-3 py-2 text-left text-xs font-black",
                                        didVote ? "border-white bg-white/30" : "border-white/60 bg-white/10"
                                      )}
                                    >
                                      <span className="absolute inset-y-0 left-0 bg-white/20" style={{ width: `${percent}%` }} />
                                      <span className="relative flex items-center justify-between gap-3">
                                        <span>{option.text}</span>
                                        <span>{votes}</span>
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            {!msg.poll?.question && <div className="relative z-10 font-medium">{msg.text}</div>}
                            {msg.editedAt && !msg.deletedAt && <div className="mt-1 text-[10px] font-bold opacity-70">edited</div>}
                          </div>
                        )}
                        {!isMe && !msg.deletedAt && (
                          <div className="relative flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id)}
                              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-full bg-white border border-[#E8E6E0] text-[#6B6B6B] shadow-md hover:text-[#1A1A1A] transition-all"
                              aria-label="Message options"
                              aria-expanded={activeMessageMenu === msg.id}
                            >
                              <MoreVertical size={15} />
                            </button>
                            <AnimatePresence>
                              {activeMessageMenu === msg.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.94, x: -8 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.94, x: -8 }}
                                >
                                  {renderMessageActions(msg, isMe)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                        </div>
                        
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-[11px] text-[#6B6B6B] font-semibold">{msg.time}</span>
                          {isMe && (
                            <div className={clsx(
                              "w-1 h-1 rounded-full",
                              msg.status === 'sending' ? "bg-[#F3F2EE] animate-pulse" : "bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                            )} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {typingName && activeChat && (
                <div className="mb-2 flex items-center gap-3 pl-11 text-xs font-bold text-[#6B6B6B]">
                  <span>{typingName.split(" ")[0]} is typing</span>
                  <span className="ca-typing-wave"><span /><span /><span /></span>
                </div>
              )}
              <div ref={scrollRef} className="shrink-0 h-4" />
            </div>

            <div className="chat-input-area">
            <AnimatePresence>
              {(replyTo || editingMessage) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mx-4 mt-2 flex items-center justify-between rounded-2xl border border-[#E8E6E0] bg-[#F9F8F5] px-4 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C8922A]">
                      {editingMessage ? "Editing message" : `Replying to ${replyTo.senderName}`}
                    </p>
                    <p className="truncate text-xs font-bold text-[#1A1A1A]">
                      {editingMessage ? editingMessage.text : replyTo.text}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null);
                      setEditingMessage(null);
                      if (editingMessage) setInput("");
                    }}
                    className="ml-3 rounded-full p-1.5 text-[#6B6B6B] hover:bg-[#F3F2EE] hover:text-[#1A1A1A]"
                    aria-label="Cancel"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Selected Media Preview */}
            <AnimatePresence>
              {selectedMedia && (
                <div className="px-4 py-2 shrink-0 bg-[#FAFAF8]/80 backdrop-blur-xl border-t border-[#E8E6E0] relative z-20">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative rounded-2xl overflow-hidden border border-[#E8E6E0] max-h-32 w-32"
                  >
                    {mediaType === 'video' ? (
                      <video src={selectedMedia} className="w-full h-full object-cover" />
                    ) : mediaType === 'file' ? (
                      <div className="flex h-24 w-32 flex-col items-center justify-center gap-2 bg-[#F3F2EE] p-3 text-center">
                        <FileText size={28} className="text-[#C8922A]" />
                        <span className="line-clamp-1 text-[10px] font-black text-[#1A1A1A]">{selectedFileName || "Document"}</span>
                      </div>
                    ) : (
                      <img src={selectedMedia} className="w-full h-full object-cover" alt="Preview" />
                    )}
                    <button 
                      onClick={() => { setSelectedMedia(null); setMediaType('none'); }}
                      className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-[#1A1A1A] p-1 rounded-full hover:bg-black/40 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Message Input */}
            <div className="relative z-20 flex min-h-[60px] w-full shrink-0 items-center justify-between border-t border-[#E8E6E0] bg-[#FAFAF8] px-3 py-2.5 sm:px-4">
              <div className="w-full h-full ca-input rounded-full flex items-center px-1.5 py-0.5 shadow-2xl transition-all">
                {/* Plus button */}
                <button 
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="p-2 text-[#6B6B6B] hover:text-[#C8922A] hover:bg-[#F3F2EE] rounded-full transition-all flex items-center justify-center shrink-0"
                >
                  <Plus size={20} className={clsx("transition-transform duration-500", showAttachments && "rotate-45")} />
                </button>

                {/* Emoji button */}
                <div className="relative flex items-center">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={clsx(
                      "p-2 hover:bg-[#F3F2EE] rounded-full transition-all flex items-center justify-center shrink-0",
                      showEmojiPicker ? "text-yellow-400" : "text-[#6B6B6B]"
                    )}
                  >
                    <Smile size={20} />
                  </button>

                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-12 left-0 z-50 w-[min(14rem,calc(100vw-2rem))] rounded-[1.5rem] border border-[#E8E6E0] bg-[#16161D] p-3 shadow-2xl"
                      >
                        <div className="grid grid-cols-5 gap-1.5">
                          {emojis.map((emoji, i) => (
                            <button
                              key={i}
                              onClick={() => addEmoji(emoji)}
                              className="text-xl hover:scale-125 transition-transform p-0.5"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input Field */}
                <input
                  value={input}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  type="text"
                  placeholder="Share a campus moment..."
                  className="flex-1 bg-transparent py-1 px-2 text-[14px] text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:outline-none font-medium min-w-0"
                />

                {/* Send Button */}
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={isSending || (!input.trim() && !selectedMedia)}
                  className="ca-btn-primary p-2 rounded-full disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center shrink-0 w-9 h-9"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-[#E8E6E0] border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </motion.button>
              </div>
            </div>
            
            {/* Attachment Menu Popup */}
            <AnimatePresence>
              {showAttachments && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-16 left-3 z-50 w-[min(16rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.5rem] border border-[#E8E6E0] bg-white text-[#1A1A1A] shadow-2xl sm:left-4 sm:w-64"
                >
                  <button 
                    onClick={() => { setShowAttachments(false); fileInputRef.current?.click(); }}
                    className="w-full flex items-center space-x-4 px-6 py-4 hover:bg-[#F3F2EE] transition-all text-left group"
                  >
                    <div className="bg-[#C8922A]/10 p-2.5 rounded-xl text-[#C8922A] group-hover:scale-110 transition-transform">
                      <ImageIcon size={20} />
                    </div>
                    <span className="text-sm font-bold text-[#1A1A1A]">Gallery</span>
                  </button>
                  <button 
                    onClick={() => { setShowAttachments(false); documentInputRef.current?.click(); }}
                    className="w-full flex items-center space-x-4 px-6 py-4 hover:bg-[#F3F2EE] transition-all text-left group border-t border-[#E8E6E0]"
                  >
                    <div className="bg-[#C8922A]/10 p-2.5 rounded-xl text-[#C8922A] group-hover:scale-110 transition-transform">
                      <FileText size={20} />
                    </div>
                    <span className="text-sm font-bold text-[#1A1A1A]">Documents</span>
                  </button>
                  {activeChat.type === "group" && (
                    <button 
                      onClick={() => { setShowAttachments(false); setShowPollModal(true); }}
                      className="w-full flex items-center space-x-4 px-6 py-4 hover:bg-[#F3F2EE] transition-all text-left group border-t border-[#E8E6E0]"
                    >
                      <div className="bg-[#C8922A]/10 p-2.5 rounded-xl text-[#C8922A] group-hover:scale-110 transition-transform">
                        <BarChart3 size={20} />
                      </div>
                      <span className="text-sm font-bold text-[#1A1A1A]">Poll</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <input type="file" ref={fileInputRef} accept="image/*,video/*" className="hidden" onChange={handleMediaSelect} />
            <input type="file" ref={documentInputRef} className="hidden" onChange={(e) => handleMediaSelect(e, 'file')} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8">
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-[#C8922A] blur-3xl rounded-full opacity-20" 
              />
              <div className="w-24 h-24 rounded-[2.5rem] bg-[#F9F8F5] border border-[#E8E6E0] flex items-center justify-center relative z-10 border-[#E8E6E0]">
                <MessageSquare size={44} className="text-[#C8922A]/50" />
              </div>
            </div>
            <div className="max-w-xs">
              <h3 className="text-xl font-black text-[#1A1A1A] mb-2 tracking-tight">Your Inbox is Waiting</h3>
              <p className="text-sm text-[#6B6B6B] font-medium leading-relaxed">
                Connect with your campus network or join university hubs to start vibrating.
              </p>
            </div>
            <button className="gradient-bg px-8 py-3 rounded-full text-sm font-bold text-[#1A1A1A] shadow-xl shadow-[0_4px_14px_rgba(200,146,42,0.15)]">
              New Message
            </button>
          </div>
        )}
      </div>

      {/* --- POLL MODAL --- */}
      <AnimatePresence>
        {showPollModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setShowPollModal(false)}
          >
            <motion.div 
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] bg-white shadow-2xl sm:rounded-[2rem]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E8E6E0] bg-[#F9F8F5] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[#C8922A]/10 p-3 text-[#C8922A]">
                    <BarChart3 size={20} />
                  </div>
                  <h3 className="text-lg font-black text-[#1A1A1A]">Create Poll</h3>
                </div>
                <button onClick={() => setShowPollModal(false)} className="rounded-full p-2 text-[#6B6B6B] hover:bg-[#F3F2EE]">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <input
                  value={pollQuestion}
                  onChange={e => setPollQuestion(e.target.value)}
                  placeholder="Ask a question"
                  className="w-full rounded-2xl border border-[#E8E6E0] bg-[#FAFAF8] p-4 text-sm font-bold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                />
                <div className="space-y-2">
                  {pollOptions.map((option, idx) => (
                    <input
                      key={idx}
                      value={option}
                      onChange={e => setPollOptions(prev => prev.map((item, i) => i === idx ? e.target.value : item))}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-[#FAFAF8] p-3 text-sm font-bold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    />
                  ))}
                </div>
                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions(prev => [...prev, ""])}
                    className="text-xs font-black uppercase tracking-widest text-[#C8922A]"
                  >
                    Add option
                  </button>
                )}
                <button
                  type="button"
                  onClick={createPollMessage}
                  disabled={!pollQuestion.trim() || pollOptions.filter(option => option.trim()).length < 2 || isSending}
                  className="w-full rounded-2xl bg-[#D4A843] py-4 text-sm font-black text-[#1A1A1A] shadow-lg disabled:opacity-40"
                >
                  Send Poll
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CREATE GROUP MODAL --- */}
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setShowCreateGroup(false)}
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-[2.5rem]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E8E6E0] flex items-center justify-between shrink-0">
                <h3 className="text-lg font-black text-[#1A1A1A]">Create Network Group</h3>
                <button onClick={() => setShowCreateGroup(false)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Group Name</label>
                  <input 
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-2xl p-4 text-sm text-[#1A1A1A] focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="E.g. Weekend Hackers..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2 flex justify-between">
                    <span>Select Members ({selectedMembers.length})</span>
                  </label>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar bg-[#F3F2EE] p-2 rounded-2xl border border-[#E8E6E0]">
                    {loadingConnections ? (
                      <div className="flex items-center justify-center gap-2 py-6 text-xs font-black uppercase tracking-widest text-[#6B6B6B]">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#E8E6E0] border-t-[#C8922A]" />
                        Loading friends
                      </div>
                    ) : connections.length === 0 ? (
                      <p className="text-[#6B6B6B] text-xs text-center py-4 font-medium italic">No connections found. Follow people first!</p>
                    ) : (
                      connections.map(c => (
                        <div 
                          key={c._id}
                          onClick={() => toggleMemberSelection(c._id)}
                          className={clsx(
                            "flex items-center space-x-3 p-3 rounded-[1.5rem] cursor-pointer transition-all border",
                            selectedMembers.includes(c._id) ? "bg-[#C8922A]/10 border-purple-500/50" : "bg-[#F3F2EE] border-transparent hover:bg-[#F3F2EE]"
                          )}
                        >
                          <img src={getAvatarSrc(c.profilePic, c.name, c._id || c.id)} className="w-10 h-10 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1A1A1A] truncate">{c.name}</p>
                            <p className="text-[10px] text-[#6B6B6B] truncate">{c.university}</p>
                          </div>
                          {selectedMembers.includes(c._id) && (
                            <div className="w-5 h-5 rounded-full bg-[#C8922A] flex items-center justify-center">
                              <span className="text-[#1A1A1A] text-xs font-black">✓</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateGroup}
                  disabled={creatingGroup || !newGroupName.trim() || selectedMembers.length === 0}
                  className="w-full gradient-bg py-4 rounded-2xl text-sm font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl shadow-[0_4px_14px_rgba(200,146,42,0.15)] disabled:opacity-40"
                >
                  {creatingGroup ? "Creating..." : "Create Group"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-md sm:items-center sm:p-4"
            onClick={() => setShowAddMemberModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] shadow-2xl bg-[#F9F8F5] border border-[#E8E6E0] sm:rounded-[2.5rem]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E8E6E0] flex items-center justify-between bg-[#F3F2EE]">
                <h3 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Add to Group</h3>
                <button onClick={() => setShowAddMemberModal(false)} className="p-2 hover:bg-[#F3F2EE] rounded-full transition-all text-[#6B6B6B]"><X size={20} /></button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {loadingConnections ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-[10px] font-black uppercase tracking-widest text-[#888888]">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#E8E6E0] border-t-[#C8922A]" />
                    Loading friends
                  </div>
                ) : connections.length === 0 ? (
                  <div className="py-10 text-center text-[#888888] font-bold uppercase tracking-widest text-[10px]">No friends found</div>
                ) : (
                  connections
                    .filter(f => !(activeChat.participants || []).includes(f._id || f.id))
                    .map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-[#F3F2EE] rounded-2xl transition-all border border-transparent hover:border-[#E8E6E0] group">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={getAvatarSrc(f.profilePic, f.name, f._id || f.id)} 
                            className="w-11 h-11 rounded-full object-cover border border-[#E8E6E0]" 
                          />
                          <div>
                            <p className="text-sm font-bold text-[#1A1A1A]">{f.name}</p>
                            <p className="text-[10px] text-[#6B6B6B] font-bold uppercase tracking-wider">{f.university}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAddMember(f._id || f.id, f.name)}
                          className="px-4 py-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-[#1A1A1A] rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20 transition-all"
                        >
                          Add
                        </button>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[100dvh] items-center justify-center bg-[#FAFAF8]">
        <div className="w-12 h-12 border-4 border-[#E8E6E0] border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
