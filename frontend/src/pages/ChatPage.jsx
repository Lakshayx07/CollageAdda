import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Smile, Paperclip, Wifi, Lock } from 'lucide-react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import AppShell from '../components/AppShell';

const UNIVERSITY_ROOMS = [
  { id: 'rishihood', name: 'Rishihood University', emoji: '🎓', color: 'from-indigo-500 to-purple-600' },
  { id: 'op-jindal', name: 'OP Jindal Global', emoji: '⚖️', color: 'from-blue-500 to-cyan-500' },
  { id: 'general', name: '# General Lounge', emoji: '🌐', color: 'from-green-500 to-teal-500' },
  { id: 'study-group', name: '📚 Study Groups', emoji: '📚', color: 'from-yellow-500 to-orange-500' },
];

const DUMMY_USER = { name: 'You', id: 'me', avatar: 'https://i.pravatar.cc/150?u=me' };

const SEED_MESSAGES = {
  rishihood: [
    { id: 1, senderName: 'Aarav Sharma', text: 'Anyone prepping for the DSA exam tmrw? 😭', timestamp: '10:32 AM', isMine: false },
    { id: 2, senderName: 'Priya Patel', text: "YES. I've been up all night lol", timestamp: '10:34 AM', isMine: false },
    { id: 3, senderName: 'You', text: 'Same. Someone share notes pls 🙏', timestamp: '10:35 AM', isMine: true },
  ],
  general: [
    { id: 1, senderName: 'Neha Joshi', text: 'Good morning everyone! ☀️', timestamp: '9:00 AM', isMine: false },
    { id: 2, senderName: 'Kabir Singh', text: 'Morning!', timestamp: '9:02 AM', isMine: false },
  ],
};

const AI_STUDY_MATERIAL = {
  'Computer Science': {
    explanation: "📌 **Today's Topic: Time Complexity (O-Notation)**\nTime complexity measures the amount of time an algorithm takes to run as a function of the input size (n). 'Big O' specifically describes the worst-case scenario. Common ones are O(1) for constant time and O(n) for linear time.",
    questions: "📝 **Quick Questions:**\n1. What is the Big O of a binary search?\n2. If you have nested loops (each running n times), what is the complexity?"
  },
  'Economics': {
    explanation: "📌 **Today's Topic: Market Equilibrium**\nMarket equilibrium occurs where the quantity demanded equals the quantity supplied. At this price point (Equilibrium Price), there is no shortage or surplus. Shifts in demand or supply curves will create a new equilibrium.",
    questions: "📝 **Quick Questions:**\n1. What happens to equilibrium price if demand increases but supply is constant?\n2. Define 'Price Ceiling'."
  },
  'Law': {
    explanation: "📌 **Today's Topic: Principles of Natural Justice**\nNatural justice consists of two main rules: 'Nemo judex in causa sua' (No one should be a judge in their own cause) and 'Audi alteram partem' (Hear the other side). These ensure fairness in legal and administrative proceedings.",
    questions: "📝 **Quick Questions:**\n1. Which landmark case in India established the basic structure doctrine?\n2. What is the significance of Article 21?"
  },
  'default': {
    explanation: "📌 **Topic: Effective Study Habits**\nConsistency is key. Try the Pomodoro Technique: 25 minutes of focused study followed by a 5-minute break. This keeps your brain fresh and prevents burnout.",
    questions: "📝 **Quick Questions:**\n1. What is your biggest goal for this study session?\n2. Have you reviewed the core concepts yet?"
  }
};

const STORAGE_PREFIX = 'collageadda_messages_';

export default function ChatPage() {
  const location = useLocation();
  const incomingUser = location.state?.privateChatUser;
  const incomingAvatar = location.state?.privateChatAvatar;

  // Initialize rooms list, merging localStorage persistency with incoming Friend links
  const [chatRooms, setChatRooms] = useState(() => {
    let savedPrivate = [];
    try {
      savedPrivate = JSON.parse(localStorage.getItem('collageadda_private_chats') || '[]');
    } catch (e) {
      savedPrivate = [];
    }

    if (incomingUser) {
      const id = `private-${incomingUser.replace(/\s+/g, '-').toLowerCase()}`;
      // Add if it doesn't already exist in the saved list
      if (!savedPrivate.find(r => r.id === id)) {
        savedPrivate.unshift({
          id,
          name: incomingUser,
          avatar: `https://i.pravatar.cc/150?u=${incomingAvatar || incomingUser}`,
          color: 'from-pink-500 to-rose-500',
          isPrivate: true
        });
        localStorage.setItem('collageadda_private_chats', JSON.stringify(savedPrivate));
      }
    }
    
    // Add incoming Study Group if it exists
    const incomingStudyName = location.state?.studyGroupName;
    const incomingStudySubject = location.state?.studyGroupSubject;
    if (incomingStudyName) {
      const id = `study-${incomingStudyName.replace(/\s+/g, '-').toLowerCase()}`;
      if (!savedPrivate.find(r => r.id === id)) {
        savedPrivate.push({
          id,
          name: incomingStudyName,
          subject: incomingStudySubject,
          emoji: '🔥',
          color: 'from-orange-500 to-amber-500',
          isStudy: true
        });
        localStorage.setItem('collageadda_private_chats', JSON.stringify(savedPrivate));
      }
    }

    return [...savedPrivate, ...UNIVERSITY_ROOMS];
  });

  const initialActiveRoom = (incomingUser || location.state?.studyGroupName)
    ? chatRooms.find(r => r.name === (incomingUser || location.state?.studyGroupName)) || chatRooms[0] 
    : chatRooms[0];

  const [activeRoom, setActiveRoom] = useState(initialActiveRoom);
  const [messages, setMessages] = useState(SEED_MESSAGES[initialActiveRoom.id] || []);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    // Connect to socket
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      transports: ['websocket'],
      reconnectionAttempts: 3,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('user_online', { userId: 'demo', name: 'You', university: activeRoom.id });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('receive_message', (data) => {
      if (data.room === activeRoom.id && !data.isMine) {
        setMessages((prev) => {
          const newMessages = [...prev, { ...data, id: Date.now(), isMine: false }];
          localStorage.setItem(`${STORAGE_PREFIX}${activeRoom.id}`, JSON.stringify(newMessages));
          return newMessages;
        });
      }
    });

    socket.on('user_typing', ({ name }) => {
      setIsTyping(name);
      setTimeout(() => setIsTyping(false), 2000);
    });

    socket.on('online_users', (users) => setOnlineCount(users.length));

    return () => socket.disconnect();
  }, [activeRoom.id]);

  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${activeRoom.id}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages(SEED_MESSAGES[activeRoom.id] || []);
      }
    } else {
      // If it's a study room and no history, add AI Content
      if (activeRoom.isStudy) {
        const material = AI_STUDY_MATERIAL[activeRoom.subject] || AI_STUDY_MATERIAL.default;
        const aiMessages = [
          { 
            id: 'ai-1', 
            senderName: 'CollageAdda AI Tutor', 
            text: `Welcome to the ${activeRoom.name} Study Hub! 🚀 I've prepared some material to get you started.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: false,
            isAI: true 
          },
          { 
            id: 'ai-2', 
            senderName: 'CollageAdda AI Tutor', 
            text: material.explanation,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: false,
            isAI: true 
          },
          { 
            id: 'ai-3', 
            senderName: 'CollageAdda AI Tutor', 
            text: material.questions,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: false,
            isAI: true 
          }
        ];
        setMessages(aiMessages);
        localStorage.setItem(`${STORAGE_PREFIX}${activeRoom.id}`, JSON.stringify(aiMessages));
      } else {
        setMessages(SEED_MESSAGES[activeRoom.id] || []);
      }
    }
  }, [activeRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRoomChange = (room) => {
    setActiveRoom(room);
    socketRef.current?.emit('join_room', room.id);
  };

  const handleTyping = () => {
    socketRef.current?.emit('typing', { room: activeRoom.id, name: 'You' });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { room: activeRoom.id });
    }, 1500);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      id: Date.now(),
      room: activeRoom.id,
      senderName: DUMMY_USER.name,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };
    
    setMessages((prev) => {
      const newMessages = [...prev, msg];
      localStorage.setItem(`${STORAGE_PREFIX}${activeRoom.id}`, JSON.stringify(newMessages));
      return newMessages;
    });
    
    socketRef.current?.emit('send_message', msg);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AppShell>
      <div className="flex h-screen overflow-hidden">
        {/* Chat Rooms Panel */}
        <aside className="hidden md:flex flex-col w-56 bg-dark border-r border-gray-800 py-6 flex-shrink-0">
          <div className="px-5 mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Chat Rooms</h2>
          </div>
          <div className="space-y-1 px-3 flex-1">
            {chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomChange(room)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                  ${activeRoom.id === room.id
                    ? 'bg-primary/20 text-primary'
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'}`}
              >
                <div className="flex items-center space-x-3 truncate">
                  {room.isPrivate ? (
                    <img src={room.avatar} alt="DP" className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-gray-700" />
                  ) : (
                    <span className="text-base">{room.emoji}</span>
                  )}
                  <span className="truncate text-xs">{room.name}</span>
                </div>
                {room.isPrivate && <Lock size={10} className="opacity-50 flex-shrink-0 ml-2" />}
              </button>
            ))}
          </div>
          <div className="px-5 pt-4 border-t border-gray-800">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Wifi size={12} className={connected ? 'text-green-400' : 'text-red-400'} />
              <span>{connected ? `${onlineCount || 1} online` : 'Connecting...'}</span>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <header className="glass border-b border-gray-800 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              {(() => {
                const roomIsPrivate = activeRoom.isPrivate;
                return (
                  <>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base overflow-hidden flex-shrink-0
                ${roomIsPrivate ? 'border-2 border-pink-500/50' : `bg-gradient-to-br ${activeRoom.color}`}`}
              >
                {roomIsPrivate ? (
                  <img src={activeRoom.avatar} alt="DP" className="w-full h-full object-cover" />
                ) : (
                  activeRoom.emoji
                )}
              </div>
              <div>
                <h2 className="font-semibold text-sm drop-shadow-sm">{activeRoom.name}</h2>
                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  {roomIsPrivate ? <Lock size={10} /> : <Users size={10} />}
                  <span>{roomIsPrivate ? 'End-to-End Encrypted' : 'University Chat Room'}</span>
                </p>
              </div>
              </>
              );
            })()}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-500">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end space-x-2 ${msg.isMine ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  {!msg.isMine && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${msg.isAI ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                      {msg.isAI ? (
                        <div className="w-5 h-5 text-white">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 12 2.21 12"/><path d="M12 12V22"/><path d="m20 7-8 5-8-5"/></svg>
                        </div>
                      ) : (
                        <img src={`https://i.pravatar.cc/150?u=${msg.senderName}`} alt={msg.senderName} className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                  <div className={`max-w-[85%] ${msg.isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!msg.isMine && (
                      <span className={`text-[10px] uppercase font-bold mb-1 ml-1 tracking-wider ${msg.isAI ? 'text-indigo-400' : 'text-gray-500'}`}>
                        {msg.senderName} {msg.isAI && '• AI ASSISTANT'}
                      </span>
                    )}
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                      ${msg.isMine 
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/10' 
                        : msg.isAI 
                          ? 'bg-indigo-950/40 border border-indigo-500/30 text-gray-100 rounded-bl-sm shadow-lg shadow-indigo-500/5'
                          : 'glass text-gray-100 rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-600 mt-1 mx-1">{msg.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0" />
                <div className="glass px-4 py-3 rounded-2xl rounded-bl-sm flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div className="glass border-t border-gray-800 px-4 py-3 flex-shrink-0 mb-16 md:mb-0">
            <div className="flex items-center space-x-3 bg-gray-800/50 rounded-2xl px-4 py-2.5">
              <button className="text-gray-500 hover:text-primary transition-colors"><Paperclip size={17} /></button>
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeRoom.name}...`}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
              <button className="text-gray-500 hover:text-yellow-400 transition-colors"><Smile size={17} /></button>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
