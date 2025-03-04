export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      collections: {
        Row: {
          amount_paid: number
          collected_by: string
          collection_date: string
          id: number
          location_id: number
          material: Database["public"]["Enums"]["material_type"]
          notes: string | null
          quantity: number
          unit: string
        }
        Insert: {
          amount_paid: number
          collected_by: string
          collection_date?: string
          id?: number
          location_id: number
          material: Database["public"]["Enums"]["material_type"]
          notes?: string | null
          quantity: number
          unit: string
        }
        Update: {
          amount_paid?: number
          collected_by?: string
          collection_date?: string
          id?: number
          location_id?: number
          material?: Database["public"]["Enums"]["material_type"]
          notes?: string | null
          quantity?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          expense_date: string
          id: number
          location_id: number | null
          notes: string | null
          paid_by: string
          paid_to: string
        }
        Insert: {
          amount: number
          category: string
          expense_date?: string
          id?: number
          location_id?: number | null
          notes?: string | null
          paid_by: string
          paid_to: string
        }
        Update: {
          amount?: number
          category?: string
          expense_date?: string
          id?: number
          location_id?: number | null
          notes?: string | null
          paid_by?: string
          paid_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          godown_id: number
          id: number
          last_updated: string
          material: Database["public"]["Enums"]["material_type"]
          quantity: number
        }
        Insert: {
          godown_id: number
          id?: number
          last_updated?: string
          material: Database["public"]["Enums"]["material_type"]
          quantity: number
        }
        Update: {
          godown_id?: number
          id?: number
          last_updated?: string
          material?: Database["public"]["Enums"]["material_type"]
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_godown_id_fkey"
            columns: ["godown_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          contact_phone: string | null
          created_at: string
          district: string
          id: number
          name: string
          type: Database["public"]["Enums"]["location_type"]
        }
        Insert: {
          address: string
          contact_phone?: string | null
          created_at?: string
          district: string
          id?: number
          name: string
          type: Database["public"]["Enums"]["location_type"]
        }
        Update: {
          address?: string
          contact_phone?: string | null
          created_at?: string
          district?: string
          id?: number
          name?: string
          type?: Database["public"]["Enums"]["location_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount_due: number | null
          buyer_name: string
          godown_id: number
          id: number
          material: Database["public"]["Enums"]["material_type"]
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          quantity: number
          sale_amount: number
          sale_date: string
          unit: string
        }
        Insert: {
          amount_due?: number | null
          buyer_name: string
          godown_id: number
          id?: number
          material: Database["public"]["Enums"]["material_type"]
          notes?: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          quantity: number
          sale_amount: number
          sale_date?: string
          unit: string
        }
        Update: {
          amount_due?: number | null
          buyer_name?: string
          godown_id?: number
          id?: number
          material?: Database["public"]["Enums"]["material_type"]
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quantity?: number
          sale_amount?: number
          sale_date?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_godown_id_fkey"
            columns: ["godown_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          from_godown_id: number
          id: number
          material: Database["public"]["Enums"]["material_type"]
          notes: string | null
          quantity: number
          to_godown_id: number
          transfer_date: string
          transferred_by: string
        }
        Insert: {
          from_godown_id: number
          id?: number
          material: Database["public"]["Enums"]["material_type"]
          notes?: string | null
          quantity: number
          to_godown_id: number
          transfer_date?: string
          transferred_by: string
        }
        Update: {
          from_godown_id?: number
          id?: number
          material?: Database["public"]["Enums"]["material_type"]
          notes?: string | null
          quantity?: number
          to_godown_id?: number
          transfer_date?: string
          transferred_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_godown_id_fkey"
            columns: ["from_godown_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_godown_id_fkey"
            columns: ["to_godown_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_transferred_by_fkey"
            columns: ["transferred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      location_type: "godown" | "collection_point"
      material_type:
        | "plastic"
        | "metal"
        | "paper"
        | "glass"
        | "organic"
        | "other"
      payment_status: "paid" | "pending" | "payment_required"
      user_role: "admin" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
