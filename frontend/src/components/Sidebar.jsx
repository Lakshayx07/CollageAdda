"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Home, Compass, User, LogOut, Users, MessageSquare, Zap, Search, Users2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { getAuthenticatedSupabaseClient } from "@/utils/supabaseAuthUser";
import { syncLoginStreakForUser } from "@/utils/loginStreak";
import { useSocket } from "@/context/SocketProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasRequest, setHasRequest] = useState(false);
  const [streak, setStreak] = useState(0);
  const [authUser, setAuthUser] = useState(null);
  const { unreadCount } = useSocket();

  const navItems = useMemo(() => [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Squad", path: "/friends", icon: Users },
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
    if (pathname === "/login" || pathname === "/onboarding" || pathname === "/welcome-tour") return;
    
    // Check requests
    const checkRequests = () => {
      const incoming = JSON.parse(localStorage.getItem("collegeadda_incoming") || "[]");
      const viewed = localStorage.getItem("collegeadda_friends_viewed") === "true";
      setHasRequest(incoming.length > 0 && !viewed);
    };
    checkRequests();
    
    // Streak logic — clean version
    // First, wipe any stale/hardcoded streak data from previous versions
    if (localStorage.getItem("ca_streak_v2") !== "true") {
      localStorage.removeItem("ca_streak");
      localStorage.removeItem("ca_last_login");
      localStorage.removeItem("ca_streak_reset");
      localStorage.removeItem("ca_streak_reset_to_1");
      localStorage.setItem("ca_streak_v2", "true");
    }

    const today = new Date();
    const todayStr = today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const lastLogin = localStorage.getItem("ca_last_login");
    let currentStreak = parseInt(localStorage.getItem("ca_streak") || "0");

    if (lastLogin === todayStr) {
      // Already counted today, keep streak as-is
    } else if (lastLogin === yesterdayStr) {
      // Consecutive day — increment
      currentStreak += 1;
    } else {
      // First ever login OR missed a day — start at 1
      currentStreak = 1;
    }

    // Always persist
    localStorage.setItem("ca_streak", String(currentStreak));
    localStorage.setItem("ca_last_login", todayStr);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(currentStreak);

    const token = localStorage.getItem("collegeadda_token");
    if (token) {
      getAuthenticatedSupabaseClient()
        .then(({ user }) => setAuthUser(user))
        .catch((error) => {
          console.error("Could not confirm Supabase session for streak:", error);
          setAuthUser(null);
        });
    } else {
      setAuthUser(null);
    }

    window.addEventListener("storage", checkRequests);
    const interval = setInterval(checkRequests, 2000);
    return () => {
      window.removeEventListener("storage", checkRequests);
      clearInterval(interval);
    };
  }, [pathname]);

  useEffect(() => {
    if (!authUser?.id) return;

    syncLoginStreakForUser(authUser.id).then((streakCount) => {
      if (streakCount) setStreak(streakCount);
    });
  }, [authUser?.id]);



  if (pathname === "/login" || pathname === "/onboarding" || pathname === "/welcome-tour") return null;

  return (
    <aside className="nav-rail hidden lg:flex fixed left-0 top-0 z-50 h-full w-72 flex-col px-6 py-7 bg-white border-r border-[#E8E6E0]">
      <div className="mb-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="brand-mark flex h-10 w-10 items-center justify-center rounded-xl text-white">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-[1.2rem] tracking-tight">
              <span className="text-[#1A1A1A] font-extrabold">Campus</span>
              <span className="text-[#C8922A] font-extrabold">Adda</span>
            </h1>
            <p className="text-[9px] font-bold tracking-[0.1em] text-[#888888] uppercase">
              Student Social Network
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          const isFriends = item.name === "Squad";

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => handleNavClick(isFriends)}
              className="relative group"
            >
              <div
                className={clsx(
                  "relative z-10 flex items-center gap-4 px-4 py-3 rounded-[1rem] transition-all duration-200 group",
                  isActive 
                    ? "bg-[#FCF5E5] text-[#9A6A10]" 
                    : "text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#F9F8F5]"
                )}
              >
                <div className="relative flex h-8 w-8 items-center justify-center shrink-0">
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

                <div className="min-w-0 flex-1">
                  <p className={clsx(
                    "text-[15px] font-bold tracking-tight transition-colors duration-300",
                    isActive ? "text-[#9A6A10]" : "text-[#4A4A4A]"
                  )}>
                    {item.name}
                  </p>
                </div>
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
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl gradient-bg px-4 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-[#C8922A]/20 transition-all hover:scale-[1.02]"
        >
          <span>+</span>
          <span>Create Post</span>
        </button>
      </nav>

      <div className="mt-auto flex flex-col gap-4 pb-4 pt-10">
        {/* Streak Card */}
        <div className="rounded-[1.25rem] bg-[#FAFAF8] border border-[#E8E6E0] p-4 flex flex-col shadow-sm">
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
        </div>
      </div>
    </aside>
  );
}
