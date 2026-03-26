export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Enums: {
      app_role: "admin" | "staff";
      receipt_status: "pending" | "approved" | "rejected";
    };
    Tables: {
      app_users: {
        Row: {
          created_at: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "app_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      receipts: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          image_url: string;
          note: string | null;
          status: Database["public"]["Enums"]["receipt_status"];
          title: string;
          updated_at: string;
          uploaded_by_user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          image_url: string;
          note?: string | null;
          status?: Database["public"]["Enums"]["receipt_status"];
          title: string;
          updated_at?: string;
          uploaded_by_user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          image_url?: string;
          note?: string | null;
          status?: Database["public"]["Enums"]["receipt_status"];
          title?: string;
          updated_at?: string;
          uploaded_by_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receipts_uploaded_by_user_id_fkey";
            columns: ["uploaded_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
    };
  };
};

export type AppRole = Database["public"]["Enums"]["app_role"];
export type ReceiptStatus = Database["public"]["Enums"]["receipt_status"];
export type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"];
