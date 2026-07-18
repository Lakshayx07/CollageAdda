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
        setUnreadCount(prevCount => {
          if (newUnread > prevCount) {
            setVibrate(true);
            setTimeout(() => setVibrate(false), 1000);
          }
          return newUnread;
        });
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

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
      case 'comment': return <MessageSquare size={10} className="text-[#C8922A] fill-cyan-400" />;
      case 'follow': return <UserPlus size={10} className="text-[#C8922A]" />;
      case 'message': return <Zap size={10} className="text-amber-400 fill-amber-400" />;
      default: return <Bell size={10} className="text-[#1A1A1A]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative rounded-2xl border border-[#E8E6E0] bg-white p-2.5 text-[#6B6B6B] shadow-sm transition-all hover:bg-[#FFF8EC] active:scale-90"
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
              unreadCount > 0 ? "text-amber-400 fill-amber-400" : "text-[#6B6B6B]"
            )} 
          />
        </motion.div>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-amber-400 px-1 text-[10px] font-black text-[#1A1A1A] shadow-lg shadow-amber-300/30"
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
            className="absolute right-0 z-[100] mt-4 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-[#E8E6E0] bg-white text-[#1A1A1A] shadow-2xl shadow-black/10"
          >
            <div className="p-5 border-b border-[#E8E6E0] flex justify-between items-center bg-[#F3F2EE]">
              <h3 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">Recent Activity</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAsRead}
                  className="text-[9px] text-[#C8922A] font-black uppercase tracking-widest hover:text-[#C8922A] transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                   <div className="w-12 h-12 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl flex items-center justify-center text-[#888888] mx-auto mb-4 border border-[#E8E6E0]">
                      <Sparkles size={24} />
                   </div>
                   <p className="text-[10px] text-[#888888] font-black uppercase tracking-widest">No activity found</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F0ECE5]">
                  {notifications.map((notif, i) => (
                    <motion.div 
                      key={notif._id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={clsx(
                        "p-4 flex items-start space-x-3 hover:bg-[#F3F2EE] transition-all",
                        !notif.isRead && "bg-amber-50/70"
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-300 p-[1.5px]">
                          <img 
                            src={notif.sender?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.sender?.name || 'U')}&background=7C3AED&color=fff`}
                            className="h-full w-full rounded-[0.9rem] border-2 border-white object-cover"
                            alt={notif.sender?.name || "User"}
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FAFAF8] rounded-lg border border-[#E8E6E0] flex items-center justify-center shadow-lg">
                          {getIcon(notif.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[#4A4A4A] leading-tight">
                          <span className="inline-flex items-center font-black text-[#1A1A1A] mr-1">
                            {notif.sender?.name}
                            <VerifiedBadge user={notif.sender} size={12} />
                          </span> 
                          {notif.text}
                        </p>
                        <span className="text-[9px] text-[#888888] font-bold uppercase tracking-widest mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-[#F3F2EE] text-center border-t border-[#E8E6E0]">
              <button className="text-[9px] text-[#888888] font-black uppercase tracking-[0.2em] hover:text-[#1A1A1A] transition-colors">
                View Full Logs
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
