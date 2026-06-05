"use client";
import { useEffect, useState } from "react";
import { Home, Compass, User, Users, MessageSquare, Search, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/onboarding") return null;

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Hustle", path: "/hustle", icon: Compass },
    { name: "Collab", path: "/collab", icon: Zap },
    { name: "Squad", path: "/friends", icon: Users },
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-4 sm:px-3 bg-gradient-to-t from-[#0A0A0F]/95 via-[#0A0A0F]/70 to-transparent backdrop-blur-md border-t border-white/5">
      <div className="mx-auto grid max-w-xl grid-cols-5 items-center rounded-[1.6rem] px-1 py-1 bg-[#121620]/80 border border-white/8 backdrop-blur-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.5)] sm:rounded-[2rem] sm:px-1.5 sm:py-1.5">
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
                    "flex h-9 w-9 items-center justify-center rounded-2xl border transition-all duration-300 sm:h-10 sm:w-10",
                    isActive 
                      ? "border-transparent bg-gradient-to-br from-purple-500 to-cyan-400 text-white shadow-md shadow-purple-500/20" 
                      : "border-transparent bg-white/[0.02] text-white/40 hover:bg-white/5 hover:text-white"
                  )}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {isFriends && hasRequest && (
                    <span className="absolute -right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0f1420] bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.55)]"></span>
                  )}
                </div>
                <span className={clsx(
                  "mt-1 max-w-full truncate overflow-hidden text-[7px] font-black uppercase leading-none tracking-[0.08em] transition-all duration-300 sm:text-[8px] sm:tracking-[0.16em]",
                  isActive ? "opacity-100 max-h-4 scale-100 text-cyan-300" : "opacity-0 max-h-0 scale-75 text-white/35"
                )}>
                  {item.name}
                </span>

                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 -z-10 rounded-[1.35rem] bg-[linear-gradient(135deg,rgba(124,92,255,0.25),rgba(34,199,214,0.22))] ring-2 ring-purple-500/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-indicator"
                    className="absolute bottom-1 h-0.5 w-3 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,199,214,0.8)]"
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
