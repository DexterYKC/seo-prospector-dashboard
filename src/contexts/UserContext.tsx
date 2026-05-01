"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchMe } from "@/lib/api";
import type { EntitlementsResponse } from "@/lib/api";
import { useSession } from "./SessionContext";

type UserContextValue = {
  data: EntitlementsResponse | null;
  loading: boolean;
  refresh: () => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { token } = useSession();
  const [data, setData] = useState<EntitlementsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) { setData(null); return; }
    setLoading(true);
    try {
      const out = await fetchMe(token);
      setData(out);
    } catch {
      // Keep stale data on refresh failure
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <UserContext.Provider value={{ data, loading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserData must be inside UserProvider");
  return ctx;
}
