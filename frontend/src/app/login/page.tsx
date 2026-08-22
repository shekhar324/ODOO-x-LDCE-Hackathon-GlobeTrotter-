import { redirect } from "next/navigation";

// Legacy /login route — redirect to the unified /auth page
export default function LoginPage() {
  redirect("/auth");
}
