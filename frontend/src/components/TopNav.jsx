"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MessageSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "./NotificationBell";
import { getAvatarSrc } from "@/utils/defaultAvatars";
import { useSocket } from "@/context/SocketProvider";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
  if (h < 21) return { text: "Good evening", emoji: "🌙" };
  return { text: "Late night grind", emoji: "🌙" };
}

export default function TopNav({ currentUser }) {
  const router = useRouter();
  const { unreadCount } = useSocket();
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isOnline] = useState(true);
  const searchRef = useRef(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchValue.trim())}`);
    }
  }, [searchValue, router]);

  const greeting = getGreeting();
  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "there";
  const avatarSrc = getAvatarSrc(currentUser?.profilePic, currentUser?.name, currentUser?._id || currentUser?.id);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
        scrolled
          ? "bg-card/90 backdrop-blur-lg border-border/80 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
          : "bg-card/70 backdrop-blur-md border-border/50"
      }`}
      style={{
        height: 72,
      }}
    >
      <div
        className="flex items-center justify-between h-full mx-auto px-4 sm:px-8"
        style={{ maxWidth: 1440 }}
      >
        {/* ── LEFT: Greeting & Brand ──────────────────────────── */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {currentUser ? (
            <>
              {/* Greeting emoji avatar box */}
              <div
                className="flex items-center justify-center shrink-0 border border-primary/20 bg-primary/10 shadow-xs"
                style={{
                  width: 46, height: 46, borderRadius: 15,
                  fontSize: 22, lineHeight: 1,
                }}
              >
                {greeting.emoji}
              </div>
              <div className="flex flex-col justify-center leading-tight gap-0.5">
                <span className="text-[#6B7280] font-medium text-[12px] tracking-tight">
                  {greeting.text}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#1F2937] font-extrabold text-[19px] tracking-tight">
                    {firstName}
                  </span>
                  <span className="text-[18px]">👋</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-primary to-primary-hover shadow-sm"
                style={{
                  width: 42, height: 42, borderRadius: 13,
                }}
              >
                <span style={{ fontSize: 18 }}>⚡</span>
              </div>
              <span className="text-[#1F2937] font-extrabold text-[20px] tracking-tight">
                Campus<span className="text-primary">Adda</span>
              </span>
            </div>
          )}
        </div>

        {/* ── RIGHT: Actions (Crisp Black Icons) ──────────────────────────── */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          {/* Messages */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => router.push("/messages")}
              title="Messages"
              className="relative flex items-center justify-center bg-card border border-border/80 text-[#1F2937] hover:text-primary cursor-pointer transition-all duration-200 hover:bg-secondary-background hover:border-primary/40 shadow-xs rounded-full"
              style={{
                width: 44, height: 44,
              }}
            >
              <MessageSquare size={20} strokeWidth={2.2} className="text-[#1F2937]" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center border-2 border-card text-white bg-danger font-extrabold rounded-full"
                  style={{
                    minWidth: 19, height: 19,
                    fontSize: 9.5, padding: "0 3px",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>
          </div>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile Avatar */}
          <motion.button
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => router.push("/profile")}
            title="My Profile"
            className="relative flex items-center justify-center bg-gradient-to-br from-primary to-primary-hover shadow-sm cursor-pointer rounded-full p-0.5"
          >
            <div
              className="flex items-center justify-center overflow-hidden bg-card border-2 border-card rounded-full"
              style={{
                width: 40, height: 40,
              }}
            >
              <img
                src={avatarSrc}
                alt={currentUser?.name || "Profile"}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Online dot */}
            {isOnline && (
              <span
                className="absolute bottom-0 right-0 border-2 border-card rounded-full"
                style={{
                  width: 12, height: 12,
                  background: "#22C55E",
                  boxShadow: "0 0 6px rgba(34,197,94,0.45)",
                  zIndex: 10
                }}
              />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
