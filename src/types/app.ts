import type { User } from "@supabase/supabase-js";
import type { AppRole } from "@/types/database";

export type AuthContext = {
  user: User;
  role: AppRole;
};
