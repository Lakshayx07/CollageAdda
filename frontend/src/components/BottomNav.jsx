"use client";
import { useEffect, useState } from "react";
import { Home, Compass, Users, Users2, MessageSquare, Search, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Suspense } from "react";

import { useSocket } from "@/context/SocketProvider";

import { isUserUnverifiedOrIncomplete } from "@/utils/verificationCheck";

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasRequest, setHasRequest] = useState(false);
  const [user, setUser] = useState(null);
  const { unreadCount } = useSocket();

  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Network", path: "/friends", icon: Users },
    { name: "Community", path: "/community", icon: Users2 },
  ];

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const scrollPositions = new WeakMap();
    // Also track window separately since WeakMap requires object keys
    let windowLastScrollY = window.scrollY;

    const handleScroll = (e) => {
      let currentScrollY;
      let target = e.target;
      let lastScrollY;

      if (target === document || target === window) {
        currentScrollY = window.scrollY;
        lastScrollY = windowLastScrollY;
      } else {
        // Ignore form elements
        if (target.tagName && ['textarea', 'input'].includes(target.tagName.toLowerCase())) return;
        // Ignore if element is not actually scrollable
        if (target.scrollHeight <= target.clientHeight) return;
        
        currentScrollY = target.scrollTop;
        lastScrollY = scrollPositions.get(target) || 0;
      }

      if (currentScrollY === undefined) return;

      const delta = currentScrollY - lastScrollY;
      
      if (target === document || target === window) {
        windowLastScrollY = currentScrollY;
      } else {
        scrollPositions.set(target, currentScrollY);
      }

      if (Math.abs(delta) < 10) return;

      if (delta > 0 && currentScrollY > 50) {
        setIsVisible(false);
      } else if (delta < 0) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  useEffect(() => {
    if (pathname === "/login" || pathname === "/onboarding" || pathname === "/") return;
    const checkRequests = () => {
      const incoming = JSON.parse(localStorage.getItem("collegeadda_incoming") || "[]");
      const viewed = localStorage.getItem("collegeadda_friends_viewed") === "true";
      setHasRequest(incoming.length > 0 && !viewed);

      const storedUser = localStorage.getItem("collegeadda_user");
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch (e) {}
      }
    };
    checkRequests();
    window.addEventListener("storage", checkRequests);
    const interval = setInterval(checkRequests, 2000);
    return () => {
      window.removeEventListener("storage", checkRequests);
      clearInterval(interval);
    };
  }, [pathname]);

  // Base hidden routes
  if (pathname === "/login" || pathname === "/onboarding" || pathname === "/") return null;

  // Hide on Network user profile detail
  if (pathname.startsWith("/profile/")) return null;

  // Hide on Community detail
  if (pathname.startsWith("/community/") && pathname !== "/community") return null;

  // Hide on Messages chat active
  if (pathname === "/messages" && (searchParams.has("chat") || searchParams.has("userId"))) return null;

  // Hide on Explore university detail
  if (pathname === "/explore" && searchParams.has("collegeId")) return null;

  return (
    <nav 
      className="mobile-bottom-nav bg-white border-t border-[#E8E6E0]"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        const isFriends = item.name === "Network";

        return (
          <Link
            key={item.name}
            href={item.path}
            onClick={() => { if (isFriends) localStorage.setItem("collegeadda_friends_viewed", "true"); }}
            className={clsx("nav-item relative", isActive ? "text-[#C8922A]" : "text-[#888888]")}
            aria-label={item.name}
          >
            <div className="relative flex flex-col items-center">
              <Icon className="icon" color={isActive ? "#C8922A" : "#888888"} />
              {isFriends && hasRequest && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-orange-400"></span>
              )}
              {item.name === "Messages" && unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </div>
            <span>{item.name}</span>
            {isActive && (
              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#C8922A]"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavContent />
    </Suspense>
  );
}
