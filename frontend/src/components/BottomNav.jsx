"use client";

import { Home, Compass, PlusSquare, BookOpen, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Feed", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Create", path: "/create", icon: PlusSquare },
    { name: "Resources", path: "/resources", icon: BookOpen },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-b-0 border-l-0 border-r-0 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                isActive ? "text-primary" : "text-muted hover:text-foreground"
              )}
            >
              <Icon
                size={isActive ? 24 : 22}
                strokeWidth={isActive ? 2.5 : 2}
                className={clsx(isActive && "animate-fade-in")}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
