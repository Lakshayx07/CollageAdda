"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, MessageSquare, Heart, UserPlus, UserCheck, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSwinging, setIsSwinging] = useState(false);
  const [sparkles, setSparkles] = useState([]); // Array of sparkle IDs
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Set up Supabase Realtime Subscription
    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
          handleNewNotification(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*, sender:sender_id(full_name, avatar_url)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const handleNewNotification = (notif) => {
    setNotifications(prev => [notif, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Trigger animations
    setIsSwinging(true);
    triggerSparkles();
    
    // Auto-stop swing after 3 seconds
    setTimeout(() => setIsSwinging(false), 3000);
  };

  const triggerSparkles = () => {
    const newSparkles = Array.from({ length: 12 }).map(() => ({
      id: Math.random(),
      left: Math.random() * 40 - 20, // Random spread around the bell
      delay: Math.random() * 0.5
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 2000);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      // Once opened, we could optionally mark as read, 
      // but usually we keep unread until interaction or "Mark All"
      setIsSwinging(false);
    }
  };

  const markAllAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message': return <MessageSquare size={16} className="text-blue-400" />;
      case 'like': return <Heart size={16} className="text-pink-500 fill-pink-500" />;
      case 'connection_request': return <UserPlus size={16} className="text-purple-400" />;
      case 'connection_accepted': return <UserCheck size={16} className="text-green-400" />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button 
        onClick={toggleDropdown}
        className="relative p-2 rounded-xl hover:bg-surface-hover transition-all active:scale-95 group"
      >
        <div className={`relative ${isSwinging ? 'animate-bell-swing' : ''}`}>
          <Bell 
            size={24} 
            className={`transition-colors ${unreadCount > 0 ? 'text-primary' : 'text-muted group-hover:text-foreground'}`}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-background animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        {/* Sparkles */}
        {sparkles.map(s => (
          <div 
            key={s.id}
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-sparkle-drop pointer-events-none"
            style={{ 
              marginLeft: `${s.left}px`,
              animationDelay: `${s.delay}s`,
              boxShadow: '0 0 4px #fbbf24'
            }}
          />
        ))}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 max-h-[450px] overflow-hidden glass-panel rounded-2xl shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface/50 backdrop-blur-md">
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] uppercase tracking-wider font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                >
                  <CheckCheck size={12} />
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-muted">
                  <Bell size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-4 flex gap-3 hover:bg-surface-hover/50 transition-colors cursor-pointer group ${!notif.is_read ? 'bg-primary/5' : ''}`}
                    >
                      {/* Avatar/Icon */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-border overflow-hidden">
                          {notif.sender?.avatar_url ? (
                            <img src={notif.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                              {notif.sender?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border border-border shadow-sm">
                          {getIcon(notif.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${!notif.is_read ? 'text-white font-medium' : 'text-muted'}`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </div>
                      </div>

                      {/* Unread Glow */}
                      {!notif.is_read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#6366f1] shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border/50 bg-surface/30 text-center">
              <button className="text-[10px] font-bold text-muted hover:text-foreground transition-colors uppercase tracking-widest">
                View All Activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
