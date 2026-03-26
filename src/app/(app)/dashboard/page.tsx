import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReceiptStatusBadge } from "@/components/receipt-status-badge";
import { MessageAlert } from "@/components/message-alert";
import { ReceiptsRealtimeListener } from "@/features/realtime/receipts-realtime-listener";
import { getSearchParam, type SearchParams } from "@/lib/search-params";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user, role } = await requireAuth();
  const params = await searchParams;

  const supabase = await createSupabaseServerClient();

  const baseQuery = supabase
    .from("receipts")
    .select("id, title, amount, status, created_at, uploaded_by_user_id")
    .order("created_at", { ascending: false })
    .limit(10);

  const receiptsQuery = role === "admin" ? baseQuery : baseQuery.eq("uploaded_by_user_id", user.id);

  const { data: receipts, error } = await receiptsQuery;

  return (
    <div className="space-y-6">
      <ReceiptsRealtimeListener channelName={`dashboard-${user.id}`} />

      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Signed in as <span className="font-medium">{user.email}</span> ({role})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MessageAlert
            error={getSearchParam(params, "error")}
            success={getSearchParam(params, "success")}
          />

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/receipts/new">Create Receipt</Link>
            </Button>
            {role === "admin" ? (
              <Button asChild variant="outline">
                <Link href="/admin">Open Admin Panel</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
          <CardDescription>
            {role === "admin" ? "All receipts in the system" : "Your latest submissions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <MessageAlert error={error.message} />
          ) : !receipts?.length ? (
            <p className="text-sm text-slate-500">No receipts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <Link className="font-medium underline" href={`/receipts/${receipt.id}`}>
                        {receipt.title}
                      </Link>
                    </TableCell>
                    <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                    <TableCell>
                      <ReceiptStatusBadge status={receipt.status} />
                    </TableCell>
                    <TableCell>{formatDate(receipt.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
