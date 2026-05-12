"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, Users, ChevronLeft, Info, MessageSquare, Plus, Image as ImageIcon, Smile, MoreVertical, X, Zap, Flame, TrendingUp, LogOut, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";
import VerifiedBadge from "@/components/VerifiedBadge";

function MessagesContent() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
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
  
  const emojis = ["❤️", "🔥", "😂", "😍", "🙌", "👏", "✨", "💯", "🎉", "😎", "🚀", "💡", "☕", "📚", "🎓", "🍕", "🎸", "🎮", "🏀", "🧪"];
  
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const isOnlyEmoji = (text) => {
    if (!text) return false;
    const cleanText = text.trim().replace(/\s/g, '');
    // Improved regex to handle common emojis, variation selectors, skin tones, and ZWJ sequences
    const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\ufe0f|\u200d)+$/;
    return emojiRegex.test(cleanText) && cleanText.length <= 15;
  };

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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    socketRef.current = io(apiUrl, { transports: ['websocket'] });
    socketRef.current.emit('user_online', { userId: u.id || u._id, name: u.name, university: u.university });

    socketRef.current.on('receive_message', (msg) => {
      setMessages(prev => {
        const roomMessages = prev[msg.room] || [];
        
        // Check if this message already exists (by ID)
        if (roomMessages.find(m => m.id === msg._id)) return prev;

        // If it's my own message coming back, replace the temp one
        const tempMsgIdx = roomMessages.findIndex(m => m.id === msg.tempId);
        if (tempMsgIdx !== -1) {
          const updated = [...roomMessages];
          updated[tempMsgIdx] = {
            ...updated[tempMsgIdx],
            id: msg._id,
            status: 'sent'
          };
          return { ...prev, [msg.room]: updated };
        }
        
        return {
          ...prev,
          [msg.room]: [...roomMessages, { 
            id: msg._id, 
            text: msg.text, 
            mediaUrl: msg.mediaUrl,
            mediaType: msg.mediaType,
            sender: String(msg.senderId) === String(u._id || u.id) ? "me" : "them",
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || "U")}&background=7C3AED&color=fff`,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: msg.isSystem
          }]
        };
      });

      setChats(prevChats => prevChats.map(c => {
        if (c.id === msg.room) {
          const isCurrent = activeChat?.id === msg.room;
          return { 
            ...c, 
            lastMsg: msg.text, 
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: isCurrent ? 0 : (c.unreadCount || 0) + 1
          };
        }
        return c;
      }));
    });

    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("collegeadda_token");
        const res = await fetch(`${apiUrl}/api/chat/rooms`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (!Array.isArray(data)) {
            setChats([]);
            return;
          }
          const formattedRooms = data.map(room => ({
            id: room._id,
            name: room.isGroup ? (room.groupName || `${room.university} Hub`) : (room.participants.find(p => p._id !== u._id)?.name || "Chat"),
            type: room.isGroup ? "group" : "private",
            avatar: room.isGroup ? <Users size={20} className="text-purple-400" /> : (room.participants.find(p => p._id !== u._id)?.profilePic || `https://ui-avatars.com/api/?name=User&background=7C3AED&color=fff`),
            lastMsg: room.lastMessage?.text || "No messages yet",
            time: room.lastMessage ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
            unreadCount: room.unreadCounts?.[u._id] || 0,
            participants: room.participants?.map(p => p._id || p.id) || []
          }));
          
          setChats(formattedRooms);

          // Handle ?chat=roomId (direct room link)
          const chatParam = searchParams.get("chat");
          if (chatParam) {
            const found = formattedRooms.find(c => c.id === chatParam);
            if (found) { setActiveChat(found); return; }
          }

          // Handle ?userId=X (open/create DM from Squad page)
          const userIdParam = searchParams.get("userId");
          if (userIdParam) {
            // Check if a private room with this user already exists
            const existingRoom = formattedRooms.find(r => r.type === "private" && r.participants.includes(userIdParam));
            if (existingRoom) {
              setActiveChat(existingRoom);
            } else {
              // Create a new private DM room
              try {
                const createRes = await fetch(`${apiUrl}/api/chat/rooms`, {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                  body: JSON.stringify({ participantId: userIdParam })
                });
                if (createRes.ok) {
                  const newRoom = await createRes.json();
                  const formatted = {
                    id: newRoom._id,
                    name: newRoom.participants?.find(p => p._id !== u._id)?.name || "Chat",
                    type: "private",
                    avatar: newRoom.participants?.find(p => p._id !== u._id)?.profilePic || `https://ui-avatars.com/api/?name=User&background=7C3AED&color=fff`,
                    lastMsg: "No messages yet",
                    time: "",
                    unreadCount: 0
                  };
                  setChats(prev => {
                    const exists = prev.find(c => c.id === formatted.id);
                    return exists ? prev : [formatted, ...prev];
                  });
                  setActiveChat(formatted);
                }
              } catch (err) {
                console.error("Error creating DM room:", err);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };

    fetchRooms();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [searchParams, router]);

  useEffect(() => {
    if (activeChat && socketRef.current) {
      socketRef.current.emit('join_room', activeChat.id);
      
      const markSeen = async () => {
        const token = localStorage.getItem("collegeadda_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        try {
          await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/seen`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, unreadCount: 0 } : c));
        } catch (e) { console.error(e); }
      };
      markSeen();

      const fetchHistory = async () => {
        const token = localStorage.getItem("collegeadda_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        try {
          const res = await fetch(`${apiUrl}/api/chat/rooms/${activeChat.id}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
             const data = await res.json();
             const u = JSON.parse(localStorage.getItem('collegeadda_user'));
             const formattedMsgs = data.map(m => ({
               id: m._id,
               text: m.text,
               sender: String(m.sender?._id || m.sender?.id) === String(u._id || u.id) ? "me" : "them",
               senderName: m.sender?.name || "Student",
               senderAvatar: m.sender?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.sender?.name || "U")}&background=7C3AED&color=fff`,
               mediaUrl: m.mediaUrl,
               mediaType: m.mediaType,
               time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
               isSystem: m.isSystem
             }));
             setMessages(prev => ({ ...prev, [activeChat.id]: formattedMsgs }));
          }
        } catch (e) {
          console.error(e);
        }
      }
      fetchHistory();
    }
  }, [activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const sendMessage = () => {
    if (!input.trim() || !activeChat || isSending) return;

    setIsSending(true);
    const tempId = `temp-${Date.now()}`;
    const data = {
      room: activeChat.id,
      senderId: user._id || user.id,
      senderName: user.name,
      senderAvatar: user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7C3AED&color=fff`,
      text: input,
      mediaUrl: '',
      mediaType: 'none',
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
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sending'
        }
      ]
    }));
    
    socketRef.current.emit('send_message', data);
    setInput("");
    setIsSending(false);
  };

  const addEmoji = (emoji) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const fetchConnections = async () => {
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
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

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
        const formatted = {
          id: newRoom._id,
          name: newRoom.groupName,
          type: "group",
          avatar: <Users size={20} className="text-purple-400" />,
          lastMsg: "Group created",
          time: "",
          unreadCount: 0,
          participants: newRoom.participants?.map(p => p._id || p.id) || []
        };
        setChats(prev => [formatted, ...prev]);
        setActiveChat(formatted);
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
        socketRef.current?.emit('send_message', {
          room: activeChat.id,
          senderId: user._id || user.id,
          senderName: 'System',
          text: `${user.name} left the group`,
          isSystem: true
        });

        setChats(prev => prev.filter(c => c.id !== activeChat.id));
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
        const data = await res.json();
        // Update local chat info
        setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, participants: [...c.participants, memberId] } : c));
        
        // Emit system message via socket
        socketRef.current?.emit('send_message', {
          room: activeChat.id,
          senderId: user._id || user.id,
          senderName: 'System',
          text: `New member added to Group`,
          isSystem: true
        });

        setShowAddMemberModal(false);
        setShowChatOptions(false);
      }
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };

  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(chatSearch.toLowerCase()));

  if (!isMounted || !user) return null;

  return (
    <div className="flex h-full bg-[#0A0A0F] overflow-hidden">
      {/* Chat List Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={clsx(
          "w-full lg:w-[380px] flex flex-col border-r border-white/5 transition-all relative z-20",
          activeChat ? "hidden lg:flex" : "flex"
        )}
      >
        <header className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white tracking-tight">Inbox</h1>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowCreateGroup(true);
                fetchConnections();
              }}
              className="p-3 glass rounded-2xl text-purple-400 border border-white/10"
            >
              <Plus size={22} />
            </motion.button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors" size={20} />
            <input
              type="text"
              value={chatSearch}
              onChange={e => setChatSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white/5 border border-white/5 rounded-[1.25rem] py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-20 lg:pb-4">
          {filteredChats.map(chat => (
            <motion.button
              key={chat.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveChat(chat)}
              className={clsx(
                "w-full flex items-center space-x-4 p-4 rounded-[1.5rem] transition-all group relative",
                activeChat?.id === chat.id 
                  ? "bg-white/5 border border-white/10 shadow-xl" 
                  : "hover:bg-white/[0.03] border border-transparent"
              )}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full p-[2px] gradient-bg shadow-lg">
                  <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center overflow-hidden">
                    {chat.type === "group" ? (
                      <div className="text-purple-400">{chat.avatar}</div>
                    ) : (
                      <img 
                        src={chat.avatar} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=7C3AED&color=fff`; }}
                      />
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-[3px] border-[#0A0A0F] rounded-full animate-pulse-glow" />
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-[15px] text-white truncate leading-tight">{chat.name}</p>
                  <span className="text-[10px] text-white/30 font-medium">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={clsx(
                    "text-xs truncate flex-1 leading-normal",
                    chat.unreadCount > 0 ? "text-white font-bold" : "text-white/40"
                  )}>
                    {chat.lastMsg}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="ml-3 px-2 py-0.5 min-w-[20px] bg-[#EC4899] text-white text-[10px] font-black rounded-full shadow-lg shadow-pink-500/20">
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
          ))}
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className={clsx(
        "flex-1 flex flex-col transition-all relative pb-20 lg:pb-0",
        !activeChat ? "hidden lg:flex" : "flex"
      )}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <header className="px-6 py-4 glass border-b border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <button onClick={() => setActiveChat(null)} className="lg:hidden p-2 text-white/40 hover:text-white bg-white/5 rounded-full">
                  <ChevronLeft size={22} />
                </button>
                <div className="relative">
                  <div className="w-11 h-11 rounded-full p-[2px] gradient-bg">
                    <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center overflow-hidden">
                      {activeChat.type === "group" ? (
                        <div className="w-full h-full gradient-bg flex items-center justify-center text-white font-black text-lg">
                          {activeChat.name.charAt(0)}
                        </div>
                      ) : <img 
                            src={activeChat.avatar} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=7C3AED&color=fff`; }}
                          />}
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0A0A0F] rounded-full" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-bold text-white text-[15px]">{activeChat.name}</h2>
                    <VerifiedBadge user={{ followers: [], following: [] }} size={14} />
                  </div>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center">
                    <span className="w-1 h-1 rounded-full bg-green-500 mr-1.5" />
                    Active Now
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {activeChat.type === "group" && (
                  <button 
                    onClick={() => {
                      setShowMemberCount(true);
                      setTimeout(() => setShowMemberCount(false), 10000);
                    }}
                    className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all flex items-center justify-center min-w-[40px]"
                  >
                    <AnimatePresence mode="wait">
                      {showMemberCount ? (
                        <motion.span
                          key="count"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-purple-400 font-black text-sm"
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
                          <Users size={20} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}
                <div className="relative">
                  <button 
                    onClick={() => setShowChatOptions(!showChatOptions)}
                    className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  <AnimatePresence>
                    {showChatOptions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-48 glass rounded-2xl border border-white/5 shadow-2xl py-2 z-50 overflow-hidden"
                      >
                        {activeChat.type === 'group' ? (
                          <>
                            <button 
                              onClick={() => { setShowAddMemberModal(true); setShowChatOptions(false); fetchConnections(); }}
                              className="w-full text-left px-4 py-3 text-sm font-bold text-green-500 hover:bg-green-500/10 flex items-center space-x-2 transition-colors border-b border-white/5"
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
                          <div className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/20">
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
              <div className="flex justify-center mb-8">
                <span className="text-[10px] glass px-4 py-1.5 rounded-full text-white/30 font-bold uppercase tracking-[0.2em] border border-white/5">
                  Begin your secure campus connection
                </span>
              </div>

              <AnimatePresence initial={false}>
                {(messages[activeChat.id] || []).map((msg, idx, arr) => {
                    const isMe = msg.sender === "me";
                    const showAvatar = !isMe && (idx === 0 || arr[idx-1].sender !== "them");
                    
                    if (msg.isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center w-full my-4">
                          <span className="text-[10px] glass px-4 py-1.5 rounded-full text-white/30 font-bold uppercase tracking-[0.2em] border border-white/5">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }
                    
                    return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={clsx(
                        "flex w-full group",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <div className="w-8 h-8 flex-shrink-0 mr-3 mt-auto">
                          {showAvatar ? (
                            <img 
                              src={msg.senderAvatar} 
                              className="w-full h-full rounded-full object-cover border border-white/10" 
                            />
                          ) : null}
                        </div>
                      )}
                      
                      <div className={clsx(
                        "flex flex-col max-w-[75%]",
                        isMe ? "items-end" : "items-start"
                      )}>
                        {!isMe && showAvatar && (
                          <span className="text-[10px] text-white/30 font-bold mb-1.5 ml-1">
                            {msg.senderName.split(' ')[0]}
                          </span>
                        )}
                        {isOnlyEmoji(msg.text) ? (
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
                            className="text-6xl py-2 cursor-default select-none drop-shadow-2xl"
                          >
                            {msg.text}
                          </motion.div>
                        ) : (
                          <div className={clsx(
                            "px-4 py-3 text-[14px] leading-relaxed shadow-2xl relative",
                            isMe 
                              ? "gradient-bg text-white rounded-[1.5rem] rounded-tr-[0.25rem] shadow-purple-500/10" 
                              : "glass text-white/90 rounded-[1.5rem] rounded-tl-[0.25rem] border-white/5"
                          )}>
                            {msg.mediaUrl && (
                              <div className="mb-2 rounded-xl overflow-hidden border border-white/10">
                                {msg.mediaType === 'video' ? (
                                  <video src={msg.mediaUrl} controls className="max-w-full h-auto max-h-64 object-cover" />
                                ) : (
                                  <img src={msg.mediaUrl} alt="Media" className="max-w-full h-auto max-h-64 object-cover" />
                                )}
                              </div>
                            )}
                            <div className="relative z-10 font-medium">{msg.text}</div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1.5 mt-1.5">
                          <span className="text-[9px] text-white/20 font-bold uppercase tracking-wider">{msg.time}</span>
                          {isMe && (
                            <div className={clsx(
                              "w-1 h-1 rounded-full",
                              msg.status === 'sending' ? "bg-white/20 animate-pulse" : "bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                            )} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={scrollRef} />
            </div>

            {/* Quick Reply Pills */}
            <div className="px-6 py-3 flex space-x-2 overflow-x-auto no-scrollbar">
              {[
                { text: "Sup?", icon: <Zap size={14} className="text-yellow-400" /> },
                { text: "Let's meet!", icon: <Users size={14} className="text-purple-400" /> },
                { text: "Class?", icon: <TrendingUp size={14} className="text-cyan-400" /> },
                { text: "Exam check", icon: <TrendingUp size={14} className="text-blue-400" /> },
                { text: "Canteen?", icon: <Flame size={14} className="text-orange-400" /> }
              ].map(pill => (
                <motion.button
                  key={pill.text}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInput(pill.text)}
                  className="whitespace-nowrap px-4 py-2 glass rounded-full text-[11px] font-bold text-white/60 hover:text-white hover:border-purple-500/50 transition-all border border-white/5 flex items-center space-x-2"
                >
                  {pill.icon}
                  <span>{pill.text}</span>
                </motion.button>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-6 pt-2">
              <div className="glass-card p-2 rounded-[2rem] border border-white/10 flex items-center space-x-2 shadow-2xl group focus-within:border-purple-500/30 transition-all">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="p-3.5 text-white/40 hover:text-purple-400 hover:bg-white/5 rounded-full transition-all"
                >
                  <Plus size={22} className={clsx("transition-transform duration-500", showAttachments && "rotate-45")} />
                </motion.button>
                
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  type="text"
                  placeholder="Share a campus moment..."
                  className="flex-1 bg-transparent py-3 px-2 text-sm text-white placeholder:text-white/20 focus:outline-none font-medium"
                />

                <div className="relative">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={clsx(
                      "p-3.5 hover:bg-white/5 rounded-full transition-all",
                      showEmojiPicker ? "text-yellow-400 bg-yellow-400/10" : "text-white/40"
                    )}
                  >
                    <Smile size={22} />
                  </button>

                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-16 right-0 bg-[#16161D] border border-white/10 rounded-[2rem] shadow-2xl p-4 z-50 w-64"
                      >
                        <div className="grid grid-cols-5 gap-2">
                          {emojis.map((emoji, i) => (
                            <button
                              key={i}
                              onClick={() => addEmoji(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={isSending || !input.trim()}
                  className="gradient-bg text-white p-3.5 rounded-[1.5rem] shadow-xl shadow-purple-500/20 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center min-w-[50px]"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={20} />
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
                  className="absolute bottom-28 left-8 bg-[#16161D] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-50 w-56"
                >
                  <button 
                    onClick={() => { setShowAttachments(false); fileInputRef.current?.click(); }}
                    className="w-full flex items-center space-x-4 px-6 py-4 hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                      <ImageIcon size={20} />
                    </div>
                    <span className="text-sm font-bold text-white/80">Gallery</span>
                  </button>
                  <button 
                    className="w-full flex items-center space-x-4 px-6 py-4 hover:bg-white/5 transition-all text-left group border-t border-white/5"
                  >
                    <div className="bg-cyan-500/10 p-2.5 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
                      <Plus size={20} />
                    </div>
                    <span className="text-sm font-bold text-white/80">Documents</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <input type="file" ref={fileInputRef} accept="image/*,video/*" className="hidden" />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8">
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-purple-500 blur-3xl rounded-full opacity-20" 
              />
              <div className="w-24 h-24 rounded-[2.5rem] glass flex items-center justify-center relative z-10 border-white/10">
                <MessageSquare size={44} className="text-purple-500/50" />
              </div>
            </div>
            <div className="max-w-xs">
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">Your Inbox is Waiting</h3>
              <p className="text-sm text-white/30 font-medium leading-relaxed">
                Connect with your campus squad or join university hubs to start vibrating.
              </p>
            </div>
            <button className="gradient-bg px-8 py-3 rounded-full text-sm font-bold text-white shadow-xl shadow-purple-500/10">
              New Message
            </button>
          </div>
        )}
      </div>

      {/* --- CREATE GROUP MODAL --- */}
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateGroup(false)}
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md bg-[#111118] rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-black text-white">Create Squad Group</h3>
                <button onClick={() => setShowCreateGroup(false)} className="p-2 glass rounded-full text-white/30"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Group Name</label>
                  <input 
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="E.g. Weekend Hackers..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2 flex justify-between">
                    <span>Select Members ({selectedMembers.length})</span>
                  </label>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar bg-white/[0.02] p-2 rounded-2xl border border-white/5">
                    {connections.length === 0 ? (
                      <p className="text-white/30 text-xs text-center py-4 font-medium italic">No connections found. Follow people first!</p>
                    ) : (
                      connections.map(c => (
                        <div 
                          key={c._id}
                          onClick={() => toggleMemberSelection(c._id)}
                          className={clsx(
                            "flex items-center space-x-3 p-3 rounded-[1.5rem] cursor-pointer transition-all border",
                            selectedMembers.includes(c._id) ? "bg-purple-500/10 border-purple-500/50" : "bg-white/5 border-transparent hover:bg-white/10"
                          )}
                        >
                          <img src={c.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=7C3AED&color=fff`} className="w-10 h-10 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{c.name}</p>
                            <p className="text-[10px] text-white/40 truncate">{c.university}</p>
                          </div>
                          {selectedMembers.includes(c._id) && (
                            <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                              <span className="text-white text-xs font-black">✓</span>
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
                  className="w-full gradient-bg py-4 rounded-2xl text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-purple-500/20 disabled:opacity-40"
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowAddMemberModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="text-xl font-bold text-white tracking-tight">Add to Group</h3>
                <button onClick={() => setShowAddMemberModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/40"><X size={20} /></button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {connections.length === 0 ? (
                  <div className="py-10 text-center text-white/20 font-bold uppercase tracking-widest text-[10px]">No friends found</div>
                ) : (
                  connections
                    .filter(f => !activeChat.participants.includes(f._id || f.id))
                    .map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={f.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=7C3AED&color=fff`} 
                            className="w-11 h-11 rounded-full object-cover border border-white/10" 
                          />
                          <div>
                            <p className="text-sm font-bold text-white">{f.name}</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{f.university}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAddMember(f._id || f.id, f.name)}
                          className="px-4 py-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20 transition-all"
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
      <div className="flex h-screen items-center justify-center bg-[#0A0A0F]">
        <div className="w-12 h-12 border-4 border-white/5 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
