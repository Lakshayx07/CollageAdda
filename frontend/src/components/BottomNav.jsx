"use client";
import { useEffect, useState } from "react";

import { Home, Compass, PlusSquare, BookOpen, User, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const INSTA_GRADIENT = "url(#instaGrad)";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Feed", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Compass, insta: true },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Friends", path: "/friends", icon: Users },
    { name: "Profile", path: "/profile", isProfile: true },
  ];

  const [hasRequest, setHasRequest] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-border/50 pb-safe shadow-2xl">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="instaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          const isExplore = item.insta;
          const isProfile = item.isProfile;
          const isFriends = item.name === "Friends";

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => { if (isFriends) localStorage.setItem("collegeadda_friends_viewed", "true"); }}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 relative",
                !isExplore && !isProfile && (isActive ? "text-primary scale-110" : "text-muted hover:text-foreground"),
                isFriends && hasRequest && !isActive && "text-red-500 animate-blink-twice"
              )}
            >
              {isExplore ? (
                <div className={clsx("transition-transform duration-200", isActive && "scale-110")}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={isActive ? 2.5 : 2} stroke={INSTA_GRADIENT}>
                    <defs>
                      <linearGradient id="instaGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="10" stroke="url(#instaGrad2)" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" stroke="url(#instaGrad2)" />
                  </svg>
                </div>
              ) : isProfile ? (
                <div className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                  isActive ? "border-primary scale-110 shadow-[0_0_10px_rgba(235,50,90,0.3)]" : "border-muted"
                )}>
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center">
                    <User size={14} className={isActive ? "text-primary" : "text-muted"} />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={clsx(isActive && "animate-fade-in")}
                  />
                  {isFriends && hasRequest && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
                  )}
                </div>
              )}
              <span className={clsx(
                "text-[10px] font-bold tracking-tight transition-colors duration-200",
                isExplore ? "bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent" :
                isFriends && hasRequest && !isActive ? "text-red-500" :
                isActive ? "text-primary" : "text-muted"
              )}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
