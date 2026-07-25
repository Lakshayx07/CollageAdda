"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Home, Compass, User, LogOut, Users, MessageSquare, Zap, Search, Users2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { getAuthenticatedSupabaseClient } from "@/utils/supabaseAuthUser";
import { syncLoginStreakForUser, getDisplayStreak, LOGIN_STREAK_UPDATED_EVENT } from "@/utils/loginStreak";
import { useSocket } from "@/context/SocketProvider";
import { useSidebar } from "@/context/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasRequest, setHasRequest] = useState(false);
  const [streak, setStreak] = useState(0);
  const [authUser, setAuthUser] = useState(null);
  const { unreadCount } = useSocket();
  const { isExpanded, handleMouseEnter, handleMouseLeave } = useSidebar();

  const navItems = useMemo(() => [
    { name: "Home", path: "/home", icon: Home },
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Network", path: "/friends", icon: Users },
    { name: "Community", path: "/community", icon: Users2 },
    { name: "Hustle", path: "/hustle", icon: Compass },
    { name: "Collab", path: "/collab", icon: Zap },
    { name: "Profile", path: "/profile", icon: User },
  ], []);

  const handleNavClick = useCallback((isFriends) => {
    if (isFriends) {
      localStorage.setItem("collegeadda_friends_viewed", "true");
      setHasRequest(false);
    }
  }, []);

  useEffect(() => {
    if (pathname === "/login" || pathname === "/onboarding" || pathname === "/") return;
    
    // Check requests
    const checkRequests = () => {
      const incoming = JSON.parse(localStorage.getItem("collegeadda_incoming") || "[]");
      const viewed = localStorage.getItem("collegeadda_friends_viewed") === "true";
      setHasRequest(incoming.length > 0 && !viewed);
    };
    checkRequests();
    
    // Initialize streak from cached user to match Profile exactly
    const stored = localStorage.getItem("collegeadda_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setStreak(getDisplayStreak(u));
      } catch (e) {}
    }

    const handleStreakUpdate = (e) => {
      if (e.detail?.streak_count) setStreak(e.detail.streak_count);
    };
    window.addEventListener(LOGIN_STREAK_UPDATED_EVENT, handleStreakUpdate);

    const token = localStorage.getItem("collegeadda_token");
    if (token) {
      getAuthenticatedSupabaseClient()
        .then(({ user }) => setAuthUser(user))
        .catch((error) => {
          console.warn("Could not confirm Supabase session for streak:", error);
          setAuthUser(null);
        });
    } else {
      setAuthUser(null);
    }

    window.addEventListener("storage", checkRequests);
    const interval = setInterval(checkRequests, 2000);
    return () => {
      window.removeEventListener("storage", checkRequests);
      window.removeEventListener(LOGIN_STREAK_UPDATED_EVENT, handleStreakUpdate);
      clearInterval(interval);
    };
  }, [pathname]);

  useEffect(() => {
    if (!authUser?.id) return;

    syncLoginStreakForUser(authUser.id).then((streakCount) => {
      if (streakCount) setStreak(streakCount);
    });
  }, [authUser?.id]);



  if (pathname === "/login" || pathname === "/onboarding" || pathname === "/") return null;

  return (
    <motion.aside 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      initial={false}
      animate={{ width: isExpanded ? 288 : 80 }}
      transition={{ type: "spring", bounce: 0, duration: 0.22 }}
      className="nav-rail hidden lg:flex fixed left-0 top-0 z-50 h-full flex-col bg-white border-r border-[#E8E6E0] overflow-hidden"
    >
      <div className="mb-8 space-y-5 px-6 pt-7 min-w-[288px]">
        <div className="flex items-center gap-3 h-10">
          <div className="brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
            <Zap size={20} fill="currentColor" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap"
              >
                <h1 className="text-[1.2rem] tracking-tight">
                  <span className="text-[#1A1A1A] font-extrabold">Campus</span>
                  <span className="text-[#C8922A] font-extrabold">Adda</span>
                </h1>
                <p className="text-[9px] font-bold tracking-[0.1em] text-[#888888] uppercase">
                  Student Social Network
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-3 min-w-[288px]">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          const isFriends = item.name === "Network";

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => handleNavClick(isFriends)}
              aria-label={item.name}
              className="relative group block w-[264px]"
            >
              <div
                className={clsx(
                  "relative z-10 flex items-center h-12 rounded-[1rem] transition-all duration-200 overflow-hidden w-full",
                  isExpanded ? "px-4" : "px-[12px]",
                  isActive 
                    ? "bg-[#FCF5E5] text-[#9A6A10]" 
                    : "text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#F9F8F5]"
                )}
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#9A6A10]" : "text-[#6B6B6B] group-hover:text-[#1A1A1A]"} />
                  {isFriends && hasRequest && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.65)]" />
                  )}
                  {item.name === "Messages" && unreadCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm border border-white">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.15 }}
                      className="ml-4 whitespace-nowrap"
                    >
                      <p className={clsx(
                        "text-[15px] font-bold tracking-tight transition-colors duration-300",
                        isActive ? "text-[#9A6A10]" : "text-[#4A4A4A]"
                      )}>
                        {item.name}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}

        <button
          onClick={() => {
            const editor = document.querySelector('.post-editor-textarea');
            if (editor) {
              editor.focus();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              router.push('/');
            }
          }}
          aria-label="Create Post"
          className={clsx(
            "mt-6 flex items-center justify-center gradient-bg font-bold text-white shadow-lg shadow-[#C8922A]/20 transition-all hover:scale-[1.02]",
            isExpanded ? "w-[240px] rounded-xl px-4 py-3.5 h-12 gap-2" : "w-12 h-12 rounded-full shrink-0 ml-[2px]"
          )}
        >
          <span className="text-xl leading-none flex items-center justify-center shrink-0">+</span>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden text-[15px]"
              >
                Create Post
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      <div className="mt-auto flex flex-col gap-4 pb-4 pt-10 min-w-[288px]">
        {/* Streak Card */}
        <div className={clsx(
          "bg-[#FAFAF8] border border-[#E8E6E0] shadow-sm relative overflow-hidden transition-all duration-200",
          isExpanded ? "rounded-[1.25rem] p-4 mx-4" : "rounded-full w-12 h-12 flex items-center justify-center p-0 ml-4"
        )}>
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col w-full h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-bold text-[#1A1A1A]">Your Streak</span>
                <div className="w-4 h-4 rounded-full bg-[#E8E6E0] flex items-center justify-center text-[8px] text-[#888888] font-bold">?</div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xl font-extrabold text-[#1A1A1A]">{streak} Days</p>
                  <p className="text-[11px] font-semibold text-[#888888]">Keep going!</p>
                </div>
                <span className="text-2xl drop-shadow-md">🔥</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex items-center justify-center w-full h-full"
            >
              <span className="text-xl drop-shadow-md">🔥</span>
              <div className="absolute -bottom-1 -right-1 bg-white border border-[#E8E6E0] text-[9px] font-bold rounded-full px-1.5 py-0.5 shadow-sm text-[#1A1A1A]">
                {streak}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
