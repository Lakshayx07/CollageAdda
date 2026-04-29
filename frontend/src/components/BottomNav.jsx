"use client";

import { Home, Compass, PlusSquare, BookOpen, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const INSTA_GRADIENT = "url(#instaGrad)";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Feed", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Compass, insta: true },
    { name: "Create", path: "/create", icon: PlusSquare },
    { name: "Friends", path: "/friends", icon: Users },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-b-0 border-l-0 border-r-0 pb-safe">
      {/* SVG def for Instagram gradient */}
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

          return (
            <Link
              key={item.name}
              href={item.path}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                !isExplore && (isActive ? "text-primary" : "text-muted hover:text-foreground")
              )}
            >
              {isExplore ? (
                <svg width={isActive ? 24 : 22} height={isActive ? 24 : 22} viewBox="0 0 24 24" fill="none" strokeWidth={isActive ? 2.5 : 2} stroke={INSTA_GRADIENT}>
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
              ) : (
                <Icon
                  size={isActive ? 24 : 22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={clsx(isActive && "animate-fade-in")}
                />
              )}
              <span className={clsx(
                "text-[10px] font-medium",
                isExplore && "bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent"
              )}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
