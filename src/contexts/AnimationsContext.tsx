"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AnimationsCtx {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const Ctx = createContext<AnimationsCtx>({ enabled: true, setEnabled: () => {} });

export function AnimationsProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("animations");
    const isEnabled = saved !== "off";
    setEnabledState(isEnabled);
    document.documentElement.classList.toggle("no-animations", !isEnabled);
  }, []);

  function setEnabled(value: boolean) {
    setEnabledState(value);
    localStorage.setItem("animations", value ? "on" : "off");
    document.documentElement.classList.toggle("no-animations", !value);
  }

  return (
    <Ctx.Provider value={{ enabled, setEnabled }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAnimations() {
  return useContext(Ctx);
}
