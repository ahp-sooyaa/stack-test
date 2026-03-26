import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageAlert } from "@/components/message-alert";
import { ReceiptStatusBadge } from "@/components/receipt-status-badge";
import { ReceiptsRealtimeListener } from "@/features/realtime/receipts-realtime-listener";
import { getSearchParam, type SearchParams } from "@/lib/search-params";

export default async function ReceiptDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { user } = await requireAuth();
  const { id } = await params;
  const queryParams = await searchParams;

  const supabase = await createSupabaseServerClient();

  const { data: receipt, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !receipt) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ReceiptsRealtimeListener channelName={`receipt-${id}-${user.id}`} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Receipt Detail</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <MessageAlert success={getSearchParam(queryParams, "success")} />

      <Card>
        <CardHeader>
          <CardTitle>{receipt.title}</CardTitle>
          <CardDescription>
            Submitted {formatDate(receipt.created_at)} by {receipt.uploaded_by_user_id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="font-medium">Amount:</span> {formatCurrency(receipt.amount)}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <ReceiptStatusBadge status={receipt.status} />
            </p>
            <p className="sm:col-span-2">
              <span className="font-medium">Updated:</span> {formatDate(receipt.updated_at)}
            </p>
          </div>

          {receipt.note ? (
            <div>
              <p className="mb-1 text-sm font-medium">Note</p>
              <p className="rounded-md border bg-slate-50 p-3 text-sm">{receipt.note}</p>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-medium">Receipt Image</p>
            <Image
              alt={`Receipt ${receipt.title}`}
              src={receipt.image_url}
              unoptimized
              width={1400}
              height={1000}
              className="max-h-[640px] w-full rounded-md border object-contain bg-white"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
