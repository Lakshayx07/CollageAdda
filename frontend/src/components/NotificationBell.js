"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageSquare, UserPlus, Sparkles } from 'lucide-react';
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
        
        // If unread count increased, trigger animation
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
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
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
      case 'like': return <Heart size={14} className="text-pink-500 fill-pink-500" />;
      case 'comment': return <MessageSquare size={14} className="text-blue-500" />;
      case 'follow': return <UserPlus size={14} className="text-green-500" />;
      case 'message': return <MessageSquare size={14} className="text-purple-500" />;
      default: return <Bell size={14} className="text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-surface-hover transition-colors group"
      >
        <motion.div
          animate={vibrate ? { 
            rotate: [0, -20, 20, -20, 20, 0],
            scale: [1, 1.2, 1.2, 1.2, 1.2, 1]
          } : {}}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Bell 
            size={22} 
            className={clsx(
              "transition-colors",
              unreadCount > 0 ? "text-amber-400 fill-amber-400" : "text-muted group-hover:text-amber-400"
            )} 
          />
        </motion.div>

        {/* Sparkles Animation */}
        <AnimatePresence>
          {vibrate && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1.5, 0],
                    x: (i - 2) * 20, 
                    y: -40 - (Math.random() * 20)
                  }}
                  exit={{ opacity: 0 }}
                  className="absolute top-0 left-1/2 text-amber-400 pointer-events-none"
                  transition={{ duration: 1, delay: i * 0.1 }}
                >
                  <Sparkles size={16} fill="currentColor" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden border border-border/50"
          >
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-surface-hover/30">
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAsRead}
                  className="text-[10px] text-primary hover:underline font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-muted text-sm italic">
                  No notifications yet ✨
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif._id}
                    className={clsx(
                      "p-4 flex items-start space-x-3 hover:bg-surface-hover/50 transition-colors border-b border-border/10 last:border-0",
                      !notif.isRead && "bg-primary/5"
                    )}
                  >
                    <div className="relative">
                      <img 
                        src={notif.sender?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.sender?.name || 'U')}&background=6366f1&color=fff`}
                        className="w-10 h-10 rounded-full object-cover border border-border/20"
                        alt="User"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full shadow-sm">
                        {getIcon(notif.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-foreground leading-relaxed flex items-center gap-1 flex-wrap">
                        <span className="font-bold flex items-center">
                          {notif.sender?.name}
                          <VerifiedBadge user={notif.sender} size={12} />
                        </span> {notif.text}
                      </p>
                      <span className="text-[10px] text-muted mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 bg-surface-hover/30 text-center border-t border-border/50">
              <button className="text-[10px] text-muted hover:text-foreground transition-colors font-medium">
                View all activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
