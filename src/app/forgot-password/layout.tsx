import type { Metadata } from "next";
import "../(app)/app.css";

export const metadata: Metadata = {
  title: "Forgot password — seoprospector",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
