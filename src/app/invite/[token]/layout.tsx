import type { Metadata } from "next";
import "../../(app)/app.css";

export const metadata: Metadata = {
  title: "You've been invited — seoprospector",
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
