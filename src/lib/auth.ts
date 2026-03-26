import { redirect } from "next/navigation";
import type { AuthContext } from "@/types/app";
import type { AppRole } from "@/types/database";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: existing } = await supabase
    .from("app_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.role) {
    return { user, role: existing.role };
  }

  const { data: inserted } = await supabase
    .from("app_users")
    .insert({ user_id: user.id, role: "staff" })
    .select("role")
    .single();

  return {
    user,
    role: inserted?.role ?? "staff",
  };
}

export async function requireAuth(): Promise<AuthContext> {
  const auth = await getCurrentAuthContext();

  if (!auth) {
    redirect("/sign-in");
  }

  return auth;
}

export async function requireRole(requiredRole: AppRole): Promise<AuthContext> {
  const auth = await requireAuth();

  if (auth.role !== requiredRole) {
    redirect("/dashboard?error=admin_only");
  }

  return auth;
}
