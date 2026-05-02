"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/account?tab=profile"); }, [router]);
  return null;
}
