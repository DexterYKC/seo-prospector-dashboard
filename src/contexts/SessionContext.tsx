"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TOKEN_KEY = "seoprospector_user_token";

type SessionContextValue = {
  token: string | null;
  setToken: (token: string | null) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    const token = String(raw || "").trim();
    return token || null;
  } catch {
    return null;
  }
}

function persistToken(token: string | null) {
  try {
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore storage failures
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [tokenState, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredToken();
    if (stored) setTokenState(stored);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      token: tokenState,
      setToken: (token) => {
        const clean = String(token || "").trim() || null;
        setTokenState(clean);
        persistToken(clean);
      },
    }),
    [tokenState]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
