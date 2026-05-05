"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Send, Users, ChevronLeft, Info, MessageSquare } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

// Real rooms will be fetched from backend
const MOCK_CHATS = [];

import { Suspense } from "react";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ... existing MessagesPage logic ...
  const [user, setUser] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState(MOCK_CHATS);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("collegeadda_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(storedUser);
    setUser(u);

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
            avatar: room.isGroup ? "🏫" : (room.participants.find(p => p._id !== u._id)?.profilePic || "https://i.pravatar.cc/150"),
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
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };

    fetchRooms();

    // Load messages from localStorage (as fallback or cache)
    const savedMessages = JSON.parse(localStorage.getItem("collegeadda_messages") || "{}");
    setMessages(savedMessages);
  }, [searchParams, router]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    if (Object.keys(messages).length > 0) {
      localStorage.setItem("collegeadda_messages", JSON.stringify(messages));
    }
  }, [messages, activeChat]);

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;
    
    const newMsg = { id: Date.now(), text: input, sender: "me", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const updatedMessages = {
      ...messages,
      [activeChat.id]: [...(messages[activeChat.id] || []), newMsg]
    };
    setMessages(updatedMessages);
    setInput("");

    // Update last message in chat list
    setChats(prev => prev.map(c => 
      c.id === activeChat.id ? { ...c, lastMsg: input, time: "Just now" } : c
    ));
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

              <div className="p-4 glass-panel border-t border-border/50">
                <div className="flex items-center space-x-2">
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
