"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth, requireRole } from "@/lib/auth";
import { deleteReceiptImageByUrl, uploadReceiptImage, validateImageFile } from "@/lib/r2";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createReceiptSchema,
  receiptIdSchema,
  receiptStatusSchema,
} from "@/lib/validation/receipts";

function toStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function revalidateReceiptViews(id?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/admin");

  if (id) {
    revalidatePath(`/receipts/${id}`);
  }
}

export async function createReceiptAction(formData: FormData) {
  const { user } = await requireAuth();

  const parsed = createReceiptSchema.safeParse({
    title: toStringValue(formData.get("title")),
    amount: toStringValue(formData.get("amount")),
    note: toStringValue(formData.get("note")),
  });

  if (!parsed.success) {
    redirectWithError("/receipts/new", parsed.error.issues[0]?.message ?? "Invalid receipt data.");
  }

  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    redirectWithError("/receipts/new", "Receipt image is required.");
  }

  try {
    validateImageFile(image);
  } catch (error) {
    redirectWithError(
      "/receipts/new",
      error instanceof Error ? error.message : "Invalid image upload.",
    );
  }

  const upload = await uploadReceiptImage({
    file: image,
    userId: user.id,
  });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("receipts")
    .insert({
      title: parsed.data.title,
      amount: parsed.data.amount,
      note: parsed.data.note || null,
      uploaded_by_user_id: user.id,
      image_url: upload.imageUrl,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    try {
      await deleteReceiptImageByUrl(upload.imageUrl);
    } catch {
      // Ignore cleanup failure if the database write failed.
    }

    redirectWithError("/receipts/new", error?.message ?? "Failed to create receipt.");
  }

  revalidateReceiptViews(data.id);
  redirect(`/receipts/${data.id}?success=created`);
}

export async function updateReceiptStatusAction(formData: FormData) {
  await requireRole("admin");

  const parsedId = receiptIdSchema.safeParse(toStringValue(formData.get("receipt_id")));
  const parsedStatus = receiptStatusSchema.safeParse(toStringValue(formData.get("status")));

  if (!parsedId.success || !parsedStatus.success) {
    redirectWithError("/admin", "Invalid status update payload.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("receipts")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data);

  if (error) {
    redirectWithError("/admin", error.message);
  }

  revalidateReceiptViews(parsedId.data);
  redirect("/admin?success=status_updated");
}

export async function deleteReceiptAction(formData: FormData) {
  await requireRole("admin");

  const parsedId = receiptIdSchema.safeParse(toStringValue(formData.get("receipt_id")));

  if (!parsedId.success) {
    redirectWithError("/admin", "Invalid receipt id.");
  }

  const supabase = await createSupabaseServerClient();

  const { data: record, error: readError } = await supabase
    .from("receipts")
    .select("id, image_url")
    .eq("id", parsedId.data)
    .single();

  if (readError || !record) {
    redirectWithError("/admin", readError?.message ?? "Receipt not found.");
  }

  const { error: deleteError } = await supabase.from("receipts").delete().eq("id", parsedId.data);

  if (deleteError) {
    redirectWithError("/admin", deleteError.message);
  }

  try {
    await deleteReceiptImageByUrl(record.image_url);
  } catch {
    // Keep request successful even if object cleanup fails.
  }

  revalidateReceiptViews(parsedId.data);
  redirect("/admin?success=deleted");
}
