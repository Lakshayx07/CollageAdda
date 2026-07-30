"use client";
import { useEffect, useState } from "react";
import { Home, Users, MessageSquare, Users2, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSocket } from "@/context/SocketProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const [hasRequest, setHasRequest] = useState(false);
  const { unreadCount } = useSocket();

  const navItems = [
    { name: "Home",      path: "/home",      icon: Home },
    { name: "Network",   path: "/friends",   icon: Users },
    { name: "Messages",  path: "/messages",  icon: MessageSquare },
    { name: "Community", path: "/community", icon: Users2 },
  ];

  useEffect(() => {
    if (pathname === "/login" || pathname === "/onboarding" || pathname === "/") return;
    const checkRequests = () => {
      const incoming = JSON.parse(localStorage.getItem("collegeadda_incoming") || "[]");
      const viewed = localStorage.getItem("collegeadda_friends_viewed") === "true";
      setHasRequest(incoming.length > 0 && !viewed);
    };
    checkRequests();
    window.addEventListener("storage", checkRequests);
    const interval = setInterval(checkRequests, 2000);
    return () => {
      window.removeEventListener("storage", checkRequests);
      clearInterval(interval);
    };
  }, [pathname]);

  if (pathname === "/login" || pathname === "/onboarding" || pathname === "/") return null;

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        const isFriends = item.name === "Network";

        return (
          <Link
            key={item.name}
            href={item.path}
            onClick={() => {
              if (isFriends) localStorage.setItem("collegeadda_friends_viewed", "true");
            }}
            className={clsx("nav-item relative", isActive && "active")}
            aria-label={item.name}
          >
            <div className="relative flex flex-col items-center gap-1">
              {/* Icon Container */}
              <div
                className="relative flex items-center justify-center transition-all duration-200"
                style={{
                  width: 36,
                  height: 30,
                  borderRadius: 12,
                  background: isActive ? "rgba(253, 230, 138,0.10)" : "transparent",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ color: isActive ? "var(--color-primary)" : "var(--color-foreground-muted)" }}
                />
                {/* Friend request dot */}
                {isFriends && hasRequest && (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
                    style={{ background: "#F97316", boxShadow: "0 0 6px rgba(249,115,22,0.5)" }}
                  />
                )}
                {/* Messages unread badge */}
                {item.name === "Messages" && unreadCount > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white border border-white"
                    style={{ background: "#EF4444", fontSize: 8, fontWeight: 700 }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--color-primary)" : "var(--color-foreground-muted)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  transition: "color 0.2s ease, font-weight 0.2s ease",
                }}
              >
                {item.name}
              </span>

              {/* Active dot indicator */}
              {isActive && (
                <span
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ width: 4, height: 4, background: "var(--color-primary)" }}
                />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
