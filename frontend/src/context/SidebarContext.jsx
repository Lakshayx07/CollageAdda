"use client";
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const enterTimeoutRef = useRef(null);
  const leaveTimeoutRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    enterTimeoutRef.current = null;
    leaveTimeoutRef.current = null;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    enterTimeoutRef.current = setTimeout(() => setIsExpanded(true), 350);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    // Small delay so the rail doesn't snap shut when the cursor briefly leaves
    leaveTimeoutRef.current = setTimeout(() => setIsExpanded(false), 160);
  }, []);

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
