import type { Metadata } from "next";
import "../(app)/app.css";

export const metadata: Metadata = {
  title: "Create account — seoprospector",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
