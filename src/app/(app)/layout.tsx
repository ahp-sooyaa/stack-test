import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, user } = await requireAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Receipt Ops Sandbox</p>
            <p className="text-xs text-slate-500">{user.email} · role: {role}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/receipts/new">New Receipt</Link>
            </Button>
            {role === "admin" ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">Admin</Link>
              </Button>
            ) : null}
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">Sign out</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl p-4 md:p-6">{children}</main>
    </div>
  );
}
