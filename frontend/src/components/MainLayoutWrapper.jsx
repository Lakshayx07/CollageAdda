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
      <main className="app-surface flex min-h-screen flex-col overflow-x-hidden overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-[264px]">
        {children}
      </main>
    );
  }

  // All authenticated pages keep a fixed reserved padding rail so the content doesn't reflow or collide, and the background color spans the gap
  return (
    <main
      className="app-surface flex min-h-screen flex-col overflow-x-hidden overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-[264px]"
    >
      {children}
    </main>
  );
}
