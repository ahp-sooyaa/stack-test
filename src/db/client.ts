import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL or SUPABASE_DB_URL for Drizzle.");
}

const sql = postgres(connectionString, {
  prepare: false,
});

export const db = drizzle(sql, { schema });
