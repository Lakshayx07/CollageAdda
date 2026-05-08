"use client";
import { useEffect, useState } from "react";
import { Home, Compass, User, Users, MessageSquare, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Chat", path: "/messages", icon: MessageSquare },
    { name: "Squad", path: "/friends", icon: Users },
    { name: "Me", path: "/profile", icon: User },
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2">
      <div className="glass border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/50 p-2 flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          const isFriends = item.name === "Squad";

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => { if (isFriends) localStorage.setItem("collegeadda_friends_viewed", "true"); }}
              className="relative flex-1"
            >
              <div className={clsx(
                "flex flex-col items-center justify-center py-3 px-1 rounded-3xl transition-all duration-300 relative z-10",
                isActive ? "text-white" : "text-white/30"
              )}>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {isFriends && hasRequest && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0A0F] shadow-lg"></span>
                  )}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-0 group-active:opacity-100 transition-opacity">
                  {item.name}
                </span>

                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 gradient-bg rounded-3xl -z-10 shadow-lg shadow-purple-500/20"
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
