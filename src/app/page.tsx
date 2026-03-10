import { redirect } from "next/navigation";

// Root redirect to landing page
export default function RootPage() {
  redirect("/home");
}
