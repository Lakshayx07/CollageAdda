"use client";
import { useEffect, useState } from "react";
import { Home, Compass, User, Users, MessageSquare, Search, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();
  const [hasRequest, setHasRequest] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Squad", path: "/friends", icon: Users },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: "Hustle", path: "/hustle", icon: Compass },
    { name: "Explore", path: "/explore", icon: Search },
  ];

  useEffect(() => {
    if (pathname === "/login" || pathname === "/onboarding") return;
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

  if (pathname === "/login" || pathname === "/onboarding") return null;

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        const isFriends = item.name === "Squad";

        return (
          <Link
            key={item.name}
            href={item.path}
            onClick={() => { if (isFriends) localStorage.setItem("collegeadda_friends_viewed", "true"); }}
            className={clsx("nav-item", isActive && "active")}
            aria-label={item.name}
          >
            <div className="relative">
              <Icon className="icon" />
              {isFriends && hasRequest && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-orange-400"></span>
              )}
            </div>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
