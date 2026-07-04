"use client";
import React, { createContext, useContext, useState, useRef } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsExpanded(true), 100);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsExpanded(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        handleMouseEnter,
        handleMouseLeave,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
