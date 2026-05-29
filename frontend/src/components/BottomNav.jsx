"use client";
import { useEffect, useState } from "react";
import { Home, Compass, User, Users, MessageSquare, Search, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Hustle", path: "/hustle", icon: Compass },
    { name: "Collab", path: "/collab", icon: Zap },
    { name: "Squad", path: "/friends", icon: Users },
    { name: "Profile", path: "/profile", icon: User },
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 sm:px-3">
      <div className="app-panel mx-auto grid max-w-xl grid-cols-7 items-center rounded-[1.6rem] px-1 py-1 backdrop-blur-xl sm:rounded-[2rem] sm:px-1.5 sm:py-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          const isFriends = item.name === "Squad";

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => { if (isFriends) localStorage.setItem("collegeadda_friends_viewed", "true"); }}
              className="relative min-w-0"
              aria-label={item.name}
            >
              <div className={clsx(
                "relative z-10 flex min-w-0 flex-col items-center justify-center rounded-[1.15rem] px-0.5 py-2 transition-all duration-300 sm:rounded-[1.35rem] sm:px-1 sm:py-2.5",
                isActive ? "text-white" : "text-white/35"
              )}>
                <div className="relative">
                  <div className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-2xl border transition-all sm:h-10 sm:w-10",
                    isActive ? "border-white/12 bg-white/9" : "border-transparent bg-transparent"
                  )}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {isFriends && hasRequest && (
                    <span className="absolute -right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0f1420] bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.55)]"></span>
                  )}
                </div>
                <span className={clsx(
                  "mt-1 max-w-full truncate overflow-hidden text-[7px] font-black uppercase leading-none tracking-[0.08em] transition-all duration-300 sm:text-[8px] sm:tracking-[0.16em]",
                  isActive ? "opacity-100 max-h-4 scale-100" : "opacity-0 max-h-0 scale-75"
                )}>
                  {item.name}
                </span>

                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 -z-10 rounded-[1.35rem] bg-[linear-gradient(135deg,rgba(124,92,255,0.22),rgba(34,199,214,0.18))] ring-1 ring-white/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
