"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ isDark: false, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(false);
    localStorage.setItem("campus_adda_theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  const toggle = () => {
    // Theme is locked to light warm UI
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
