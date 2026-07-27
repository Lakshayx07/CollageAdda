"use client";
import React from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSidebar } from "@/context/SidebarContext";

export default function MainLayoutWrapper({ children }) {
  const pathname = usePathname();
  const { isExpanded } = useSidebar();
  
  // Exclude login/onboarding pages from sidebar layout shifting completely if needed
  if (pathname === "/login" || pathname === "/onboarding" || pathname === "/") {
    return (
      <main className="app-surface flex min-h-screen flex-col overflow-x-hidden overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>
    );
  }

  // Home keeps a fixed reserved rail so the feed doesn't reflow on hover
  if (pathname === "/home") {
    return (
      <main className="app-surface flex min-h-screen flex-col overflow-x-hidden overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:ml-[288px]">
        {children}
      </main>
    );
  }

  // Other pages ease the content margin in sync with the sidebar width
  return (
    <main
      className={clsx(
        "app-surface flex min-h-screen flex-col overflow-x-hidden overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-0",
        "lg:transition-[margin-left] lg:duration-400 lg:ease-[cubic-bezier(0.22,1,0.36,1)]",
        isExpanded ? "lg:ml-[288px]" : "lg:ml-20"
      )}
    >
      {children}
    </main>
  );
}
