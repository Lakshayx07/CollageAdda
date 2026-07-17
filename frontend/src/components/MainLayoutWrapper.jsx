"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSidebar } from "@/context/SidebarContext";

export default function MainLayoutWrapper({ children }) {
  const pathname = usePathname();
  const { isExpanded } = useSidebar();
  
  // Exclude login/onboarding pages from sidebar layout shifting completely if needed
  if (pathname === "/login" || pathname === "/onboarding" || pathname === "/") {
    return (
      <main className="app-surface flex min-h-screen flex-col overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-0 w-full">
        {children}
      </main>
    );
  }

  // Home page uses fixed reserved space (288px)
  if (pathname === "/home") {
    return (
      <main className="app-surface flex min-h-screen flex-col overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:ml-[288px] w-full">
        {children}
      </main>
    );
  }

  // All other pages use dynamic margin based on expanded state
  return (
    <motion.main
      initial={false}
      animate={{ "--sidebar-width": isExpanded ? "288px" : "80px" }}
      transition={{ type: "spring", bounce: 0, duration: 0.22 }}
      style={{ "--sidebar-width": isExpanded ? "288px" : "80px" }}
      className="app-surface flex min-h-screen flex-col overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:ml-[var(--sidebar-width,80px)] w-full"
    >
      {children}
    </motion.main>
  );
}
