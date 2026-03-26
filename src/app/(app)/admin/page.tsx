import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteReceiptAction, updateReceiptStatusAction } from "@/features/receipts/actions";
import { ReceiptsRealtimeListener } from "@/features/realtime/receipts-realtime-listener";
import { MessageAlert } from "@/components/message-alert";
import { ReceiptStatusBadge } from "@/components/receipt-status-badge";
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
import { getSearchParam, type SearchParams } from "@/lib/search-params";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user } = await requireRole("admin");
  const params = await searchParams;

  const supabase = await createSupabaseServerClient();
  const { data: receipts, error } = await supabase
    .from("receipts")
    .select("id, title, amount, status, uploaded_by_user_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <ReceiptsRealtimeListener channelName={`admin-${user.id}`} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <MessageAlert
        error={getSearchParam(params, "error")}
        success={getSearchParam(params, "success")}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Receipts</CardTitle>
          <CardDescription>
            Update receipt status and remove records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <MessageAlert error={error.message} />
          ) : !receipts?.length ? (
            <p className="text-sm text-slate-500">No receipts found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploader</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell className="max-w-[220px] truncate" title={receipt.uploaded_by_user_id}>
                      {receipt.uploaded_by_user_id}
                    </TableCell>
                    <TableCell>{formatDate(receipt.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <form action={updateReceiptStatusAction}>
                          <input type="hidden" name="receipt_id" value={receipt.id} />
                          <input type="hidden" name="status" value="approved" />
                          <Button type="submit" size="sm" variant="outline">Approve</Button>
                        </form>
                        <form action={updateReceiptStatusAction}>
                          <input type="hidden" name="receipt_id" value={receipt.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <Button type="submit" size="sm" variant="outline">Reject</Button>
                        </form>
                        <form action={updateReceiptStatusAction}>
                          <input type="hidden" name="receipt_id" value={receipt.id} />
                          <input type="hidden" name="status" value="pending" />
                          <Button type="submit" size="sm" variant="outline">Pending</Button>
                        </form>
                        <form action={deleteReceiptAction}>
                          <input type="hidden" name="receipt_id" value={receipt.id} />
                          <Button type="submit" size="sm" variant="destructive">Delete</Button>
                        </form>
                      </div>
                    </TableCell>
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
