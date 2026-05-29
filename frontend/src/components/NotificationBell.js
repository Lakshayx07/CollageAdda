"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageSquare, UserPlus, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import VerifiedBadge from './VerifiedBadge';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [vibrate, setVibrate] = useState(false);
  const dropdownRef = useRef(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const newUnread = data.filter(n => !n.isRead).length;
        if (newUnread > unreadCount) {
          setVibrate(true);
          setTimeout(() => setVibrate(false), 1000);
        }
        setNotifications(data);
        setUnreadCount(newUnread);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [unreadCount]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem("collegeadda_token");
      await fetch(`${apiUrl}/api/notifications/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen && unreadCount > 0) {
      markAsRead();
    }
    setIsOpen(!isOpen);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={10} className="text-pink-500 fill-pink-500" />;
      case 'comment': return <MessageSquare size={10} className="text-cyan-400 fill-cyan-400" />;
      case 'follow': return <UserPlus size={10} className="text-purple-500" />;
      case 'message': return <Zap size={10} className="text-amber-400 fill-amber-400" />;
      default: return <Bell size={10} className="text-white" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2.5 glass rounded-2xl hover:bg-white/5 transition-all border border-white/5 active:scale-90"
      >
        <motion.div
          animate={vibrate ? { 
            rotate: [0, -20, 20, -20, 20, 0],
            scale: [1, 1.2, 1.2, 1.2, 1.2, 1]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          <Bell 
            size={20} 
            className={clsx(
              "transition-colors",
              unreadCount > 0 ? "text-amber-400 fill-amber-400" : "text-white/40"
            )} 
          />
        </motion.div>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 gradient-bg text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0A0A0F] shadow-lg shadow-purple-500/30"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="app-panel absolute right-0 mt-4 w-80 rounded-[1.5rem] z-[100] overflow-hidden"
          >
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Recent Activity</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAsRead}
                  className="text-[9px] text-purple-400 font-black uppercase tracking-widest hover:text-purple-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                   <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white/10 mx-auto mb-4 border border-white/5">
                      <Sparkles size={24} />
                   </div>
                   <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No activity found</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif, i) => (
                    <motion.div 
                      key={notif._id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={clsx(
                        "p-4 flex items-start space-x-3 hover:bg-white/[0.03] transition-all",
                        !notif.isRead && "bg-purple-500/[0.03]"
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-2xl p-[1.5px] gradient-bg">
                          <img 
                            src={notif.sender?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.sender?.name || 'U')}&background=7C3AED&color=fff`}
                            className="w-full h-full rounded-[0.9rem] object-cover border-2 border-[#0A0A0F]"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-lg border border-white/10 flex items-center justify-center shadow-lg">
                          {getIcon(notif.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white/90 leading-tight">
                          <span className="font-black text-white mr-1">
                            {notif.sender?.name}
                          </span> 
                          {notif.text}
                        </p>
                        <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white/[0.02] text-center border-t border-white/5">
              <button className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                View Full Logs
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
