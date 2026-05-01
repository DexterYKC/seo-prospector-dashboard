import type { Metadata } from "next";
import "../(app)/app.css";

export const metadata: Metadata = {
  title: "Sign in — seoprospector",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
