import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { MessageAlert } from "@/components/message-alert";
import { Button } from "@/components/ui/button";
import { ReceiptUploadForm } from "@/components/receipt-upload-form";
import { getSearchParam, type SearchParams } from "@/lib/search-params";

export default async function NewReceiptPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth();
  const params = await searchParams;
  const maxUploadSizeMb = Number.parseInt(process.env.R2_MAX_UPLOAD_SIZE_MB ?? "5", 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Receipt</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <MessageAlert error={getSearchParam(params, "error")} />
      <ReceiptUploadForm maxUploadSizeMb={maxUploadSizeMb} />
    </div>
  );
}
