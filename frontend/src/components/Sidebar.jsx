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
  const [hasRequest, setHasRequest] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Squad", path: "/friends", icon: Users },
    { name: "Hustle", path: "/hustle", icon: Compass },
    { name: "Collab", path: "/collab", icon: Zap },
    { name: "Profile", path: "/profile", icon: User },
  ];

  useEffect(() => {
    if (pathname === "/login" || pathname === "/onboarding" || pathname === "/welcome-tour") return;
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

  const handleLogout = () => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/login");
  };

  if (pathname === "/login" || pathname === "/onboarding" || pathname === "/welcome-tour") return null;

  return (
    <aside className="nav-rail hidden lg:flex fixed left-0 top-0 z-50 h-full w-72 flex-col px-6 py-7 bg-[#0d0f1a] border-r border-purple-900/20">
      <div className="mb-10 space-y-5">
        <div className="flex items-center gap-3">
          <div className="brand-mark flex h-12 w-12 items-center justify-center rounded-2xl text-white">
            <Zap size={22} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-[1.35rem] tracking-tight">
              <span className="text-white font-bold">Campus</span>
              <span className="text-purple-400 font-bold">Adda</span>
            </h1>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/38 uppercase">
              Student Social Network
            </p>
          </div>
        </div>

        <div className="app-panel rounded-[1.4rem] px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/80">
            Your campus pulse
          </p>
          <p className="mt-2 text-sm leading-6 text-white/72">
            Explore people, conversations, projects, and campus energy without the clutter.
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
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
              <div
                className={clsx(
                  "relative z-10 flex items-center gap-4 px-4 py-3.5",
                  isActive 
                    ? "ca-nav-active" 
                    : "text-slate-400 hover:text-white hover:bg-purple-900/20 rounded-xl transition-all duration-200 group"
                )}
              >
                <div className={clsx(
                  "relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 shrink-0",
                  isActive
                    ? "text-white"
                    : "text-inherit"
                )}>
                  <Icon size={20} strokeWidth={isActive ? 2.45 : 2} />
                  {isFriends && hasRequest && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0f1420] bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.65)]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 relative z-20">
                  <p className={clsx(
                    "text-sm font-black uppercase tracking-[0.12em] transition-colors duration-300",
                    isActive ? "text-white" : "text-inherit"
                  )}>
                    {item.name}
                  </p>
                  <p className={clsx(
                    "mt-0.5 text-[11px] font-medium transition-all duration-300 ease-in-out opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-8",
                    isActive ? "text-cyan-300/60" : "text-white/30"
                  )}>
                    {item.name === "Home" && "Feed and campus updates"}
                    {item.name === "Explore" && "Browse colleges and students"}
                    {item.name === "Messages" && "Private conversations"}
                    {item.name === "Squad" && "Friends and requests"}
                    {item.name === "Hustle" && "Projects, gigs, ideas"}
                    {item.name === "Collab" && "Teams and shared work"}
                    {item.name === "Profile" && "Your identity and vibe"}
                  </p>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-[0.75rem] shadow-[0_0_15px_rgba(124,58,237,0.3)] ring-1 ring-purple-500/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t app-divider pt-6 flex flex-col gap-4">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={handleLogout}
          className="flex w-full items-center gap-4 rounded-[1.35rem] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-red-300/70 transition-all hover:bg-red-400/10 hover:text-red-200"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-300/10 bg-red-400/5">
            <LogOut size={18} />
          </div>
          <span>Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}
