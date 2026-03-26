import { Badge } from "@/components/ui/badge";
import type { ReceiptStatus } from "@/types/database";

const LABELS: Record<ReceiptStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STYLES: Record<ReceiptStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

export function ReceiptStatusBadge({ status }: { status: ReceiptStatus }) {
  return <Badge className={STYLES[status]}>{LABELS[status]}</Badge>;
}
