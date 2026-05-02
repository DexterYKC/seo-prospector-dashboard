import type { Metadata } from "next";
import "../(app)/app.css";
import "./moderator.css";

export const metadata: Metadata = {
  title: "Espace Modérateur — seoprospector",
};

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
