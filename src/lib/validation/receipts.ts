import { z } from "zod";

export const receiptStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const createReceiptSchema = z.object({
  title: z
    .string({ message: "Title is required." })
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title must be at most 120 characters."),
  amount: z.coerce
    .number({ message: "Amount is required." })
    .positive("Amount must be greater than 0.")
    .max(1_000_000, "Amount is too large."),
  note: z
    .string()
    .trim()
    .max(1000, "Note must be at most 1000 characters.")
    .optional()
    .or(z.literal("")),
});

export const receiptIdSchema = z.string().uuid("Invalid receipt id.");
