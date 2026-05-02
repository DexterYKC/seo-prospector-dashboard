import type { Metadata } from "next";
import "../(app)/app.css";
import "../moderator/moderator.css";

export const metadata: Metadata = {
  title: "Espace Support — seoprospector",
};

export default function SupportAgentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
