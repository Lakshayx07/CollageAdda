"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Send, Users, ChevronLeft, Info, MessageSquare, Plus, Image as ImageIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { io } from "socket.io-client";

import { Suspense } from "react";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ... existing MessagesPage logic ...
  const [user, setUser] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("collegeadda_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(storedUser);
    setUser(u);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    // Initialize socket
    socketRef.current = io(apiUrl, { transports: ['websocket'] });
    socketRef.current.emit('user_online', { userId: u.id || u._id, name: u.name, university: u.university });

    socketRef.current.on('receive_message', (msg) => {
      setMessages(prev => {
        const roomMessages = prev[msg.room] || [];
        if (roomMessages.find(m => m.id === msg._id)) return prev;
        
        return {
          ...prev,
          [msg.room]: [...roomMessages, { 
            id: msg._id, 
            text: msg.text, 
            sender: msg.senderId === (u.id || u._id) ? "me" : "them",
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        };
      });

      setChats(prevChats => prevChats.map(c => 
        c.id === msg.room ? { ...c, lastMsg: msg.text, time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : c
      ));
    });

    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("collegeadda_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const res = await fetch(`${apiUrl}/api/chat/rooms`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Transform backend rooms to UI format
          const formattedRooms = data.map(room => ({
            id: room._id,
            name: room.isGroup ? (room.groupName || `${room.university} Hub`) : (room.participants.find(p => p._id !== u._id)?.name || "Chat"),
            type: room.isGroup ? "group" : "private",
            avatar: room.isGroup ? "🏫" : (room.participants.find(p => p._id !== u._id)?.profilePic || `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`),
            lastMsg: room.lastMessage?.text || "No messages yet",
            time: room.lastMessage ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""
          }));
          
          setChats(formattedRooms);
          
          // If a chat param is provided in URL, activate it
          const chatParam = searchParams.get("chat");
          if (chatParam) {
            const found = formattedRooms.find(c => c.id === chatParam);
            if (found) setActiveChat(found);
          }

          // If a userId param is provided, get or create the private chat
          const userIdParam = searchParams.get("userId");
          if (userIdParam) {
            try {
              const resCreate = await fetch(`${apiUrl}/api/chat/rooms`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ targetUserId: userIdParam })
              });
              
              if (resCreate.ok) {
                const newRoom = await resCreate.json();
                const formattedNewRoom = {
                  id: newRoom._id,
                  name: newRoom.participants.find(p => p._id !== u._id)?.name || "Chat",
                  type: "private",
                  avatar: newRoom.participants.find(p => p._id !== u._id)?.profilePic || `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
                  lastMsg: newRoom.lastMessage?.text || "No messages yet",
                  time: newRoom.lastMessage ? new Date(newRoom.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""
                };
                
                // Add to chats if not already there
                if (!formattedRooms.find(c => c.id === formattedNewRoom.id)) {
                  setChats(prev => [formattedNewRoom, ...prev]);
                }
                setActiveChat(formattedNewRoom);
              }
            } catch (err) {
              console.error("Error creating private chat:", err);
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
               sender: m.sender?._id === (u.id || u._id) ? "me" : "them",
               time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    if (!input.trim() || !activeChat) return;

    const data = {
      room: activeChat.id,
      senderId: user._id || user.id,
      senderName: user.name,
      text: input,
      mediaUrl: '',
      mediaType: 'none'
    };
    
    socketRef.current.emit('send_message', data);
    setInput("");
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-background pb-safe">
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List */}
        <div className={clsx(
          "w-full lg:w-80 flex flex-col border-r border-border/50 transition-all",
          activeChat ? "hidden lg:flex" : "flex"
        )}>
          <header className="p-4 glass-panel border-b border-border/50 flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
            <div className="bg-primary/20 p-2 rounded-full">
              <MessageSquare size={18} className="text-primary" />
            </div>
          </header>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full bg-surface-hover border border-border/50 rounded-xl py-2 pl-10 pr-4 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 px-2">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={clsx(
                  "w-full flex items-center space-x-3 p-3 rounded-2xl transition-all",
                  activeChat?.id === chat.id ? "bg-primary/10 border border-primary/20" : "hover:bg-surface-hover"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-xl overflow-hidden border border-border/50">
                  {chat.type === "group" ? chat.avatar : <img src={chat.avatar} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="font-bold text-sm text-foreground truncate">{chat.name}</p>
                    <span className="text-[10px] text-muted">{chat.time}</span>
                  </div>
                  <p className="text-xs text-muted truncate">{chat.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={clsx(
          "flex-1 flex flex-col transition-all",
          !activeChat ? "hidden lg:flex" : "flex"
        )}>
          {activeChat ? (
            <>
              <header className="p-4 glass-panel border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button onClick={() => setActiveChat(null)} className="lg:hidden p-1 text-muted">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg overflow-hidden border border-border/50">
                    {activeChat.type === "group" ? activeChat.avatar : <img src={activeChat.avatar} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-sm">{activeChat.name}</h2>
                    <p className="text-[10px] text-primary">online</p>
                  </div>
                </div>
                <button onClick={() => alert("Chat info coming soon! ℹ️")} className="text-muted p-2 hover:text-foreground">
                  <Info size={20} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex justify-center">
                  <span className="text-[10px] bg-surface-hover px-3 py-1 rounded-full text-muted uppercase tracking-tighter">
                    {activeChat.type === "group" ? "All messages are public to your university" : "Encrypted conversation"}
                  </span>
                </div>

                {(messages[activeChat.id] || []).map(msg => (
                  <div key={msg.id} className={clsx(
                    "flex flex-col max-w-[80%]",
                    msg.sender === "me" ? "ml-auto items-end" : "items-start"
                  )}>
                    <div className={clsx(
                      "p-3 rounded-2xl text-sm",
                      msg.sender === "me" 
                        ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20" 
                        : "bg-surface-hover text-foreground rounded-tl-none border border-border/50"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-muted mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              {/* Suggested Messages */}
              <div className="px-4 py-2 flex space-x-2 overflow-x-auto no-scrollbar border-t border-border/10">
                {["Hey! 👋", "Hii!", "How's it going?", "Let's connect!", "What's up?"].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="whitespace-nowrap px-3 py-1 rounded-full border border-border/50 text-[10px] text-muted hover:border-primary hover:text-primary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="p-4 glass-panel border-t border-border/50 relative">
                {/* Hidden file input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*,video/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // In a real app you'd upload it, here we just mock sending it
                      const newMsg = { id: Date.now(), text: `Sent an attachment: ${file.name} 🖼️`, sender: "me", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                      setMessages(prev => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), newMsg] }));
                    }
                  }} 
                />

                {/* Attachment Menu Popup */}
                {showAttachments && (
                  <div className="absolute bottom-full left-4 mb-2 bg-surface border border-border/50 rounded-2xl shadow-xl overflow-hidden animate-fade-in w-48 z-50">
                    <button 
                      onClick={() => { setShowAttachments(false); fileInputRef.current?.click(); }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-surface-hover transition-colors text-sm text-foreground text-left"
                    >
                      <div className="bg-purple-500/20 p-2 rounded-xl text-purple-400">
                        <ImageIcon size={18} />
                      </div>
                      <span className="font-medium">Gallery</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-2 relative z-10">
                  <button 
                    onClick={() => setShowAttachments(!showAttachments)}
                    className="p-3 bg-surface-hover border border-border/50 rounded-xl text-muted hover:text-foreground transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus size={20} className={`transition-transform duration-300 ${showAttachments ? 'rotate-45' : ''}`} />
                  </button>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && sendMessage()}
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-surface-hover border border-border/50 rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <button 
                    onClick={sendMessage}
                    className="bg-primary text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-surface-hover flex items-center justify-center">
                <MessageSquare size={40} className="text-muted/30" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Select a Chat</h3>
                <p className="text-sm text-muted max-w-[200px]">Choose a conversation or your university hub to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
