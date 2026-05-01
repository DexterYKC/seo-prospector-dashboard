"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ThemeCtx {
  dark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
}

const Ctx = createContext<ThemeCtx>({ dark: false, toggle: () => {}, setDark: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDarkState] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDarkState(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  function applyDark(value: boolean) {
    setDarkState(value);
    localStorage.setItem("theme", value ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", value ? "dark" : "light");
  }

  return (
    <Ctx.Provider value={{ dark, toggle: () => applyDark(!dark), setDark: applyDark }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  return useContext(Ctx);
}
