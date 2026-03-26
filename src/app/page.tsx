import { redirect } from "next/navigation";
import { getCurrentAuthContext } from "@/lib/auth";

export default async function HomePage() {
  const auth = await getCurrentAuthContext();

  if (!auth) {
    redirect("/sign-in");
  }

  redirect("/dashboard");
}
