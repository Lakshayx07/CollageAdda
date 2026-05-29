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
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Squad", path: "/friends", icon: Users },
    { name: "Hustle", path: "/hustle", icon: Compass },
    { name: "Collab", path: "/collab", icon: Zap },
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
    <aside className="nav-rail hidden lg:flex fixed left-0 top-0 z-50 h-full w-72 flex-col px-6 py-7">
      <div className="mb-10 space-y-5">
        <div className="flex items-center gap-3">
          <div className="brand-mark flex h-12 w-12 items-center justify-center rounded-2xl text-white">
            <Zap size={22} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-[1.35rem] font-black tracking-tight text-white">
              Campus Adda<span className="text-cyan-300">.</span>
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
              className="relative"
            >
              <div
                className={clsx(
                  "relative z-10 flex items-center gap-4 rounded-[1.35rem] px-4 py-3.5 transition-all duration-300",
                  isActive ? "text-white" : "text-white/42 hover:bg-white/[0.035] hover:text-white/88"
                )}
              >
                <div className={clsx(
                  "relative flex h-10 w-10 items-center justify-center rounded-2xl border transition-all",
                  isActive
                    ? "border-white/12 bg-white/10"
                    : "border-white/6 bg-white/[0.03]"
                )}>
                  <Icon size={20} strokeWidth={isActive ? 2.45 : 2} />
                  {isFriends && hasRequest && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0f1420] bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.65)]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black uppercase tracking-[0.12em]">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-white/36">
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
                    className="absolute inset-0 rounded-[1.35rem] bg-[linear-gradient(135deg,rgba(124,92,255,0.2),rgba(34,199,214,0.18))] ring-1 ring-white/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t app-divider pt-6">
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
