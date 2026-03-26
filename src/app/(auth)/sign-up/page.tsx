import Link from "next/link";
import { signUpAction } from "@/features/auth/actions";
import { MessageAlert } from "@/components/message-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSearchParam, type SearchParams } from "@/lib/search-params";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>New users default to the staff role.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MessageAlert
          error={getSearchParam(params, "error")}
          success={getSearchParam(params, "success")}
        />

        <form action={signUpAction} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <Button type="submit" className="w-full">Sign up</Button>
        </form>

        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-slate-900 underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
