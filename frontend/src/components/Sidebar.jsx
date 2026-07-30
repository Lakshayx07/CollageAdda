"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Home, Search, MessageSquare, Users, Users2, Zap, User, PenLine, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { getAuthenticatedSupabaseClient } from "@/utils/supabaseAuthUser";
import { syncLoginStreakForUser, getDisplayStreak, LOGIN_STREAK_UPDATED_EVENT } from "@/utils/loginStreak";
import { useSocket } from "@/context/SocketProvider";
import { useSidebar } from "@/context/SidebarContext";
import { getAvatarSrc } from "@/utils/defaultAvatars";

const EASE = [0.22, 1, 0.36, 1];
const DUR = 0.38;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasRequest, setHasRequest] = useState(false);
  const [streak, setStreak] = useState(0);
  const [authUser, setAuthUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { unreadCount } = useSocket();
  const { isExpanded, handleMouseEnter, handleMouseLeave } = useSidebar();

  const navItems = useMemo(() => [
    { name: "Home", path: "/home", icon: Home },
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Network", path: "/friends", icon: Users },
    { name: "Community", path: "/community", icon: Users2 },
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

    const checkRequests = () => {
      const incoming = JSON.parse(localStorage.getItem("collegeadda_incoming") || "[]");
      const viewed = localStorage.getItem("collegeadda_friends_viewed") === "true";
      setHasRequest(incoming.length > 0 && !viewed);
    };
    checkRequests();

    const stored = localStorage.getItem("collegeadda_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setStreak(getDisplayStreak(u));
        setCurrentUser(u);
      } catch (e) { }
    }

    const handleStreakUpdate = (e) => {
      if (e.detail?.streak_count) setStreak(e.detail.streak_count);
    };
    window.addEventListener(LOGIN_STREAK_UPDATED_EVENT, handleStreakUpdate);

    const token = localStorage.getItem("collegeadda_token");
    if (token) {
      getAuthenticatedSupabaseClient()
        .then(({ user }) => setAuthUser(user))
        .catch(() => setAuthUser(null));
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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/login");
  }, [router]);

  if (pathname === "/login" || pathname === "/onboarding" || pathname === "/") return null;

  return (
    <motion.aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) handleMouseLeave();
      }}
      initial={false}
      animate={{ width: isExpanded ? 288 : 80 }}
      transition={{ duration: DUR, ease: EASE }}
      className="hidden lg:flex fixed left-0 top-0 z-50 flex-col overflow-hidden will-change-[width] bg-card border-r border-border"
      style={{
        height: "100vh",
        borderRadius: 0,
        boxShadow: "2px 0 16px rgba(0,0,0,0.03)",
      }}
    >
      {/* BRAND */}
      <div
        className="flex items-center gap-3 shrink-0 border-b border-border/60"
        style={{ height: 72, padding: "0 16px" }}
      >
        <div
          className="flex shrink-0 items-center justify-center text-white bg-gradient-to-br from-primary to-primary-hover shadow-sm"
          style={{
            width: 40, height: 40, borderRadius: 12,
            boxShadow: "0 2px 10px rgba(252, 211, 77,0.30)",
          }}
        >
          <Zap size={18} fill="white" strokeWidth={0} />
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
          transition={{ duration: 0.2, delay: isExpanded ? 0.1 : 0, ease: EASE }}
          className="overflow-hidden whitespace-nowrap"
          aria-hidden={!isExpanded}
          style={{ pointerEvents: "none" }}
        >
          <p className="text-[#1F2937]" style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
            Campus<span className="text-primary">Adda</span>
          </p>
          <p className="text-foreground-muted uppercase" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", marginTop: 2 }}>
            Student Network
          </p>
        </motion.div>
      </div>

      {/* NAV */}
      <nav className="flex flex-1 flex-col overflow-hidden" style={{ padding: "12px 10px 0" }}>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/home" && pathname.startsWith(item.path));
            const Icon = item.icon;
            const isFriends = item.name === "Network";
            const hasMessages = item.name === "Messages" && unreadCount > 0;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => handleNavClick(isFriends)}
                aria-label={item.name}
                className="block relative group"
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  className={clsx(
                    "relative flex items-center overflow-hidden h-11 rounded-[14px] px-2.5 transition-colors duration-200",
                    isActive ? "text-[#1F2937]" : "text-[#1F2937] hover:bg-secondary-background"
                  )}
                  whileHover={!isActive ? { y: -1, scale: 1.01 } : {}}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                >
                  {/* Sliding active pill indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary-hover rounded-[14px] shadow-[0_2px_10px_rgba(252, 211, 77,0.28)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Icon - Always Crisp Black (#1F2937) */}
                  <div className="relative z-10 flex shrink-0 items-center justify-center w-8 h-8 rounded-[10px]">
                    <Icon
                      size={20}
                      strokeWidth={1.8}
                      color={isActive ? "#1F2937" : "#6B7280"}
                      className="transition-colors"
                    />
                    {isFriends && hasRequest && (
                      <span
                        className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-warning"
                        style={{ boxShadow: "0 0 6px rgba(245,158,11,0.5)" }}
                      />
                    )}
                    {hasMessages && (
                      <span
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-white border border-white bg-danger"
                        style={{ fontSize: 8, fontWeight: 800 }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <motion.span
                    initial={false}
                    animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -8 }}
                    transition={{ duration: 0.2, delay: isExpanded ? 0.07 : 0, ease: EASE }}
                    aria-hidden={!isExpanded}
                    style={{
                      marginLeft: 12,
                      fontSize: 13.5,
                      fontWeight: isActive ? 800 : 600,
                      letterSpacing: "-0.015em",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                      pointerEvents: "none",
                    }}
                    className="relative z-10 text-[#1F2937]"
                  >
                    {item.name}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Create Post Button with Black Text & Black Pencil */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            const editor = document.querySelector('.post-editor-textarea');
            if (editor) { editor.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
            else { router.push('/'); }
          }}
          aria-label="Create Post"
          className="flex shrink-0 items-center justify-center text-[#1F2937] font-extrabold overflow-hidden bg-gradient-to-br from-primary to-primary-hover shadow-[0_4px_14px_rgba(252, 211, 77,0.28)] hover:shadow-[0_6px_20px_rgba(252, 211, 77,0.38)] cursor-pointer"
          style={{
            marginTop: 40,
            height: 44,
            borderRadius: 14,
            fontSize: 13.5,
            letterSpacing: "-0.01em",
            gap: 8,
            width: "100%",
            transition: "all 0.2s ease",
          }}
        >
          <PenLine size={18} strokeWidth={2.3} color="#1F2937" className="shrink-0" />
          <motion.span
            initial={false}
            animate={{ opacity: isExpanded ? 1 : 0, maxWidth: isExpanded ? 100 : 0 }}
            transition={{ duration: 0.2, delay: isExpanded ? 0.08 : 0, ease: EASE }}
            className="whitespace-nowrap overflow-hidden text-[#1F2937]"
            aria-hidden={!isExpanded}
          >
            Create Post
          </motion.span>
        </motion.button>
      </nav>

      {/* BOTTOM */}
      <div className="flex flex-col shrink-0 gap-2.5" style={{ padding: "14px 10px 18px" }}>
        {/* Streak */}
        <div
          className="relative overflow-hidden w-full shrink-0"
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #FDE68A",
            boxShadow: "0 2px 12px rgba(251,191,36,0.12)",
            ...(isExpanded
              ? { borderRadius: 14, padding: "12px 12px 10px", height: 124, display: "flex", flexDirection: "column" }
              : { borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }
            ),
            transition: "all 0.38s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Expanded view — foolproof fixed layout */}
          <motion.div
            initial={false}
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.2, delay: isExpanded ? 0.1 : 0 }}
            className={clsx("flex flex-col items-center w-full h-full text-center", !isExpanded && "pointer-events-none absolute inset-0")}
            aria-hidden={!isExpanded}
          >
            {/* Title pinned to top */}
            <span className="shrink-0" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#D97706" }}>
              🔥 Daily Streak
            </span>

            {/* Big centered count with flex-1 to push others to edges */}
            <div className="flex-1 flex items-end justify-center gap-1 w-full" style={{ paddingBottom: 4 }}>
              <motion.span
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1, color: "#1F2937" }}
              >
                {streak}
              </motion.span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#9CA3AF", paddingBottom: 4 }}>days</span>
            </div>

            {/* Dynamic milestone text pinned to bottom */}
            {(() => {
              const basePill = "w-full shrink-0 flex items-center justify-center";
              if (streak === 0) return (
                <div className={basePill} style={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", background: "#F3F4F6", borderRadius: 10, padding: "5px 12px" }}>
                  Start your first day 💪
                </div>
              );
              if (streak >= 30) return (
                <div className={basePill} style={{ fontSize: 11.5, fontWeight: 800, color: "#7C3AED", background: "#EDE9FE", borderRadius: 10, padding: "5px 12px" }}>
                  Legend status! 🏆 {streak} day run
                </div>
              );
              if (streak >= 7) return (
                <div className={basePill} style={{ fontSize: 11.5, fontWeight: 800, color: "#DC2626", background: "#FEF2F2", borderRadius: 10, padding: "5px 12px" }}>
                  You&apos;re on fire! 🚀 Keep it up
                </div>
              );
              const daysLeft = 7 - (streak % 7);
              return (
                <div className={basePill} style={{ fontSize: 11.5, fontWeight: 700, color: "#D97706", background: "#FFFBEB", borderRadius: 10, padding: "5px 12px" }}>
                  {daysLeft} more day{daysLeft !== 1 ? "s" : ""} to 🔥 milestone
                </div>
              );
            })()}
          </motion.div>

          {/* Collapsed view */}
          <motion.div
            initial={false}
            animate={{ opacity: isExpanded ? 0 : 1 }}
            transition={{ duration: 0.18, delay: isExpanded ? 0 : 0.08 }}
            className={clsx("flex items-center justify-center w-full h-full relative", isExpanded && "pointer-events-none absolute inset-0")}
            aria-hidden={isExpanded}
          >
            <span style={{ fontSize: 22 }}>🔥</span>
            <div
              className="absolute -bottom-0.5 -right-0.5 border-[1.5px] border-white bg-amber-400 text-white"
              style={{ borderRadius: 9999, padding: "1px 4px", fontSize: 7.5, fontWeight: 900 }}
            >
              {streak}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, margin: "0 4px" }} className="bg-border" />

        {/* User profile + logout */}
        {currentUser && (
          <div
            className="flex items-center gap-2.5 overflow-hidden group"
            style={{
              height: 48, borderRadius: 12, padding: "0 6px",
              cursor: "pointer", transition: "background 0.2s ease",
            }}
            onClick={() => router.push("/profile")}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div
              className="shrink-0 overflow-hidden bg-background border-[1.5px] border-primary/30"
              style={{
                width: 32, height: 32, borderRadius: 9999,
              }}
            >
              <img
                src={getAvatarSrc(currentUser.profilePic, currentUser.name, currentUser._id || currentUser.id)}
                alt={currentUser.name || "User"}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 9999 }}
              />
            </div>

            <motion.div
              initial={false}
              animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -8 }}
              transition={{ duration: 0.2, delay: isExpanded ? 0.07 : 0, ease: EASE }}
              className="flex-1 min-w-0"
              aria-hidden={!isExpanded}
              style={{ pointerEvents: "none" }}
            >
              <p className="text-foreground" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentUser.name || "You"}
              </p>
              <p className="text-foreground-muted" style={{ fontSize: 10, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentUser.university || "CampusAdda"}
              </p>
            </motion.div>

            <motion.button
              initial={false}
              animate={{ opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.15, delay: isExpanded ? 0.1 : 0 }}
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
              aria-label="Logout"
              className="shrink-0 flex items-center justify-center text-foreground-muted hover:bg-danger/10 hover:text-danger"
              style={{
                width: 28, height: 28, borderRadius: 8,
                transition: "all 0.2s ease",
                pointerEvents: isExpanded ? "auto" : "none",
              }}
            >
              <LogOut size={14} strokeWidth={2} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
