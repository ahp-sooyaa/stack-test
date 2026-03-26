"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters."),
});

function redirectWithMessage(
  path: string,
  type: "error" | "success",
  message: string,
): never {
  const encoded = encodeURIComponent(message);
  redirect(`${path}?${type}=${encoded}`);
}

export async function signInAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirectWithMessage("/sign-in", "error", parsed.error.issues[0]?.message ?? "Invalid credentials.");
  }

  const credentials = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    redirectWithMessage("/sign-in", "error", error.message);
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirectWithMessage("/sign-up", "error", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const credentials = parsed.data;
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      emailRedirectTo: `${origin}/dashboard`,
    },
  });

  if (error) {
    redirectWithMessage("/sign-up", "error", error.message);
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirectWithMessage(
    "/sign-in",
    "success",
    "Account created. Check your inbox if email confirmation is enabled.",
  );
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in?success=Signed%20out");
}
