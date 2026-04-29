"use client";
import { useEffect, useState } from "react";

import { Home, Compass, PlusSquare, BookOpen, User, LogOut, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

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

  const handleLogout = () => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 glass-panel border-r border-border/50 p-6 z-50 shadow-xl">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Campus Adda
        </h1>
        <p className="text-xs text-muted mt-1 font-medium">Student Social Network</p>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          const isFriends = item.name === "Friends";
          const isExplore = item.insta;
          const isProfile = item.isProfile;

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => { if (isFriends) localStorage.setItem("collegeadda_friends_viewed", "true"); }}
              className={clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm relative",
                isActive && !isExplore && !isProfile
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(235,50,90,0.1)]"
                  : isFriends && hasRequest && !isActive
                  ? "text-red-500 animate-blink-twice"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )}
              style={isExplore ? { background: isActive ? 'rgba(220,39,67,0.1)' : undefined } : {}}
            >
              {isExplore ? (
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" strokeWidth={isActive ? 2.5 : 2}>
                  <defs>
                    <linearGradient id="sidebarInstaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="10" stroke="url(#sidebarInstaGrad)" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" stroke="url(#sidebarInstaGrad)" />
                </svg>
              ) : isProfile ? (
                <div className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                  isActive ? "border-primary scale-110 shadow-[0_0_10px_rgba(235,50,90,0.3)]" : "border-muted"
                )}>
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center">
                    <User size={12} className={isActive ? "text-primary" : "text-muted"} />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isFriends && hasRequest && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
                  )}
                </div>
              )}
              <span className={clsx(
                isExplore ? "bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent" :
                isActive ? "text-primary" : "text-muted"
              )}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium mt-4"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
