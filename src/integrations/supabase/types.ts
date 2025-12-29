export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          company: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_branch_code: string | null
          bank_name: string | null
          bank_swift_code: string | null
          city: string | null
          company_name: string
          country: string | null
          created_at: string
          default_tax_rate: number | null
          default_terms: string | null
          email: string | null
          footer_text: string | null
          header_info: string | null
          id: string
          logo_url: string | null
          phone: string | null
          postal_code: string | null
          registration_number: string | null
          signature_url: string | null
          template_accent_color: string | null
          template_font_family: string | null
          template_font_url: string | null
          template_header_style: string | null
          template_primary_color: string | null
          template_secondary_color: string | null
          template_table_style: string | null
          updated_at: string
          user_id: string
          vat_enabled: boolean | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_branch_code?: string | null
          bank_name?: string | null
          bank_swift_code?: string | null
          city?: string | null
          company_name: string
          country?: string | null
          created_at?: string
          default_tax_rate?: number | null
          default_terms?: string | null
          email?: string | null
          footer_text?: string | null
          header_info?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          signature_url?: string | null
          template_accent_color?: string | null
          template_font_family?: string | null
          template_font_url?: string | null
          template_header_style?: string | null
          template_primary_color?: string | null
          template_secondary_color?: string | null
          template_table_style?: string | null
          updated_at?: string
          user_id: string
          vat_enabled?: boolean | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_branch_code?: string | null
          bank_name?: string | null
          bank_swift_code?: string | null
          city?: string | null
          company_name?: string
          country?: string | null
          created_at?: string
          default_tax_rate?: number | null
          default_terms?: string | null
          email?: string | null
          footer_text?: string | null
          header_info?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          signature_url?: string | null
          template_accent_color?: string | null
          template_font_family?: string | null
          template_font_url?: string | null
          template_header_style?: string | null
          template_primary_color?: string | null
          template_secondary_color?: string | null
          template_table_style?: string | null
          updated_at?: string
          user_id?: string
          vat_enabled?: boolean | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      delivery_note_items: {
        Row: {
          created_at: string
          delivery_note_id: string
          description: string
          id: string
          quantity: number | null
        }
        Insert: {
          created_at?: string
          delivery_note_id: string
          description: string
          id?: string
          quantity?: number | null
        }
        Update: {
          created_at?: string
          delivery_note_id?: string
          description?: string
          id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_note_items_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "delivery_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_notes: {
        Row: {
          client_id: string | null
          client_name: string
          created_at: string
          date: string
          delivery_address: string | null
          id: string
          invoice_id: string | null
          note_number: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          client_name: string
          created_at?: string
          date: string
          delivery_address?: string | null
          id?: string
          invoice_id?: string | null
          note_number: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          date?: string
          delivery_address?: string | null
          id?: string
          invoice_id?: string | null
          note_number?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_id: string | null
          client_name: string
          created_at: string
          date: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          purchase_order_number: string | null
          source_quote_id: string | null
          status: string | null
          tax_rate: number | null
          total: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_id?: string | null
          client_name: string
          created_at?: string
          date: string
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          purchase_order_number?: string | null
          source_quote_id?: string | null
          status?: string | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          date?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          purchase_order_number?: string | null
          source_quote_id?: string | null
          status?: string | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_source_quote_id_fkey"
            columns: ["source_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          quantity: number | null
          quote_id: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          quantity?: number | null
          quote_id: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          quantity?: number | null
          quote_id?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_line_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          client_name: string
          created_at: string
          date: string
          description: string | null
          id: string
          quote_number: string
          status: string | null
          tax_rate: number | null
          terms_and_conditions: string | null
          total: number | null
          updated_at: string
          user_id: string
          valid_until: string
        }
        Insert: {
          client_id?: string | null
          client_name: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          quote_number: string
          status?: string | null
          tax_rate?: number | null
          terms_and_conditions?: string | null
          total?: number | null
          updated_at?: string
          user_id: string
          valid_until: string
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          quote_number?: string
          status?: string | null
          tax_rate?: number | null
          terms_and_conditions?: string | null
          total?: number | null
          updated_at?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
