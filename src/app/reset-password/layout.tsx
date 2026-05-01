import type { Metadata } from "next";
import "../(app)/app.css";

export const metadata: Metadata = {
  title: "Reset password — seoprospector",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
