"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSidebar } from "@/context/SidebarContext";
import { getDefaultAvatar } from "@/utils/defaultAvatars";

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

  // Community chat pages manage their own internal scrolling — use a fixed-height container
  // so that h-screen / h-full chains work correctly inside the chat layout.
  const isCommunityChat = /^\/community\/[^/]+/.test(pathname);
  if (isCommunityChat) {
    return (
      <main
        className={clsx(
          "app-surface flex flex-col overflow-hidden",
          // On mobile use full height; on desktop use full viewport height
          "h-[100dvh] lg:h-screen lg:ml-20"
        )}
      >
        {children}
      </main>
    );
  }

  // Other pages use a fixed margin so the feed doesn't reflow on hover
  return (
    <main
      className="app-surface flex min-h-screen flex-col overflow-x-hidden overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:ml-20"
    >
      {children}
    </main>
  );
}
