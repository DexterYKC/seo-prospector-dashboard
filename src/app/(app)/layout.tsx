"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProvider } from "@/contexts/UserContext";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useSession } from "@/contexts/SessionContext";
import "./app.css";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useSession();
  const router    = useRouter();

  useEffect(() => {
    if (!token) router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [token, router]);

  if (!token) return null;
  return <>{children}</>;
}

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthGuard>
        <UserProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </UserProvider>
      </AuthGuard>
    </ErrorBoundary>
  );
}
