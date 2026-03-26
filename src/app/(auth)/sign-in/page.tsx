import Link from "next/link";
import { signInAction } from "@/features/auth/actions";
import { MessageAlert } from "@/components/message-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSearchParam, type SearchParams } from "@/lib/search-params";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your Supabase email/password account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MessageAlert
          error={getSearchParam(params, "error")}
          success={getSearchParam(params, "success")}
        />

        <form action={signInAction} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <Button type="submit" className="w-full">Sign in</Button>
        </form>

        <p className="text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link className="font-medium text-slate-900 underline" href="/sign-up">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
