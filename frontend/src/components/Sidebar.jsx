"use client";
import { useEffect, useState } from "react";
import { Home, Compass, User, LogOut, Users, MessageSquare, Zap, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Live Hub", path: "/messages", icon: MessageSquare },
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

  const handleLogout = () => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 glass border-r border-white/5 p-6 z-50">
      {/* Brand */}
      <div className="mb-12 flex items-center space-x-3">
        <div className="w-10 h-10 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          <Zap size={22} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tighter leading-none">
            Campus Adda<span className="text-purple-500">.</span>
          </h1>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Student Social</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          const isFriends = item.name === "Squad";

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => { if (isFriends) localStorage.setItem("collegeadda_friends_viewed", "true"); }}
              className="relative group"
            >
              <div className={clsx(
                "flex items-center space-x-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 relative z-10",
                isActive 
                  ? "text-white" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {isFriends && hasRequest && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0A0A0F] shadow-lg shadow-red-500/40"></span>
                  )}
                </div>
                <span className="text-sm font-black uppercase tracking-[0.1em]">{item.name}</span>
                
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 gradient-bg rounded-[1.5rem] -z-10 shadow-lg shadow-purple-500/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto pt-8 border-t border-white/5">
        <motion.button
          whileHover={{ x: 5 }}
          onClick={handleLogout}
          className="flex items-center space-x-4 px-5 py-4 w-full rounded-[1.5rem] text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest text-[11px]"
        >
          <LogOut size={20} />
          <span>Logout System</span>
        </motion.button>
      </div>
    </aside>
  );
}
