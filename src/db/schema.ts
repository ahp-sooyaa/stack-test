import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
} from "drizzle-orm/pg-core";

export const appRoleEnum = pgEnum("app_role", ["admin", "staff"]);
export const receiptStatusEnum = pgEnum("receipt_status", [
  "pending",
  "approved",
  "rejected",
]);

export const appUsers = pgTable("app_users", {
  userId: uuid("user_id").primaryKey(),
  role: appRoleEnum("role").notNull().default("staff"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  note: text("note"),
  status: receiptStatusEnum("status").notNull().default("pending"),
  uploadedByUserId: uuid("uploaded_by_user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
