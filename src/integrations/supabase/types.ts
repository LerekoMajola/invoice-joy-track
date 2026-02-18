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
      academic_terms: {
        Row: {
          company_profile_id: string | null
          created_at: string
          end_date: string
          id: string
          is_current: boolean
          name: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_profile_id?: string | null
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean
          name: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_profile_id?: string | null
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean
          name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_terms_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          company_profile_id: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          is_reconciled: boolean | null
          reconciled_at: string | null
          reference_id: string | null
          reference_type: string | null
          running_balance: number | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          is_reconciled?: boolean | null
          reconciled_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          running_balance?: number | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_reconciled?: boolean | null
          reconciled_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          running_balance?: number | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_transactions_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_invoices: {
        Row: {
          company_name: string
          company_profile_id: string | null
          created_at: string
          currency: string
          due_date: string
          email_sent_at: string | null
          email_sent_to: string | null
          id: string
          invoice_number: string
          issue_date: string
          line_items: Json
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string
          subtotal: number
          tax_rate: number
          tenant_email: string | null
          tenant_user_id: string
          total: number
          updated_at: string
        }
        Insert: {
          company_name: string
          company_profile_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string
          email_sent_at?: string | null
          email_sent_to?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          line_items?: Json
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          subtotal?: number
          tax_rate?: number
          tenant_email?: string | null
          tenant_user_id: string
          total?: number
          updated_at?: string
        }
        Update: {
          company_name?: string
          company_profile_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string
          email_sent_at?: string | null
          email_sent_to?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          line_items?: Json
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          subtotal?: number
          tax_rate?: number
          tenant_email?: string | null
          tenant_user_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_invoices_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          account_type: string | null
          bank_name: string | null
          company_profile_id: string | null
          created_at: string | null
          currency: string | null
          current_balance: number | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          opening_balance: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          currency?: string | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          opening_balance?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          currency?: string | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          opening_balance?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          actual_check_in: string | null
          actual_check_out: string | null
          booking_number: string
          check_in: string
          check_out: string
          company_profile_id: string | null
          created_at: string
          deposit_paid: number
          guest_email: string | null
          guest_id_number: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          meal_plan: string
          notes: string | null
          num_guests: number
          room_id: string
          special_requests: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_check_in?: string | null
          actual_check_out?: string | null
          booking_number: string
          check_in: string
          check_out: string
          company_profile_id?: string | null
          created_at?: string
          deposit_paid?: number
          guest_email?: string | null
          guest_id_number?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          meal_plan?: string
          notes?: string | null
          num_guests?: number
          room_id: string
          special_requests?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_check_in?: string | null
          actual_check_out?: string | null
          booking_number?: string
          check_in?: string
          check_out?: string
          company_profile_id?: string | null
          created_at?: string
          deposit_paid?: number
          guest_email?: string | null
          guest_id_number?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          meal_plan?: string
          notes?: string | null
          num_guests?: number
          room_id?: string
          special_requests?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      client_activities: {
        Row: {
          activity_type: string
          client_id: string
          content: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          client_id: string
          content: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          client_id?: string
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          company: string
          company_profile_id: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          last_activity_at: string | null
          phone: string | null
          source: string | null
          source_lead_id: string | null
          status: string | null
          total_revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company: string
          company_profile_id?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_activity_at?: string | null
          phone?: string | null
          source?: string | null
          source_lead_id?: string | null
          status?: string | null
          total_revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company?: string
          company_profile_id?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_activity_at?: string | null
          phone?: string | null
          source?: string | null
          source_lead_id?: string | null
          status?: string | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_source_lead_id_fkey"
            columns: ["source_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
          business_id_url: string | null
          city: string | null
          company_name: string
          company_profile_doc_url: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          currency: string
          default_tax_rate: number | null
          default_terms: string | null
          default_validity_days: number | null
          deleted_at: string | null
          email: string | null
          footer_text: string | null
          header_info: string | null
          id: string
          logo_url: string | null
          phone: string | null
          postal_code: string | null
          registration_number: string | null
          signature_url: string | null
          tax_clearance_expiry_date: string | null
          tax_clearance_url: string | null
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
          business_id_url?: string | null
          city?: string | null
          company_name: string
          company_profile_doc_url?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          default_tax_rate?: number | null
          default_terms?: string | null
          default_validity_days?: number | null
          deleted_at?: string | null
          email?: string | null
          footer_text?: string | null
          header_info?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          signature_url?: string | null
          tax_clearance_expiry_date?: string | null
          tax_clearance_url?: string | null
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
          business_id_url?: string | null
          city?: string | null
          company_name?: string
          company_profile_doc_url?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          default_tax_rate?: number | null
          default_terms?: string | null
          default_validity_days?: number | null
          deleted_at?: string | null
          email?: string | null
          footer_text?: string | null
          header_info?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          signature_url?: string | null
          tax_clearance_expiry_date?: string | null
          tax_clearance_url?: string | null
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
      contacts: {
        Row: {
          client_id: string | null
          company_profile_id: string | null
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          lead_id: string | null
          name: string
          notes: string | null
          phone: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          lead_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          lead_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stakeholders: {
        Row: {
          contact_id: string
          created_at: string | null
          deal_id: string
          engagement_level: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          deal_id: string
          engagement_level?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          deal_id?: string
          engagement_level?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_stakeholders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_stakeholders_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          deal_id: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          priority: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          deal_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          deal_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
          company_profile_id: string | null
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
          company_profile_id?: string | null
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
          company_profile_id?: string | null
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
            foreignKeyName: "delivery_notes_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
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
      equipment_items: {
        Row: {
          category: string
          company_profile_id: string | null
          condition: string
          created_at: string
          daily_rate: number
          deposit_amount: number
          description: string | null
          id: string
          image_url: string | null
          monthly_rate: number | null
          name: string
          notes: string | null
          quantity_total: number
          serial_number: string | null
          status: string
          updated_at: string
          user_id: string
          weekly_rate: number | null
        }
        Insert: {
          category?: string
          company_profile_id?: string | null
          condition?: string
          created_at?: string
          daily_rate?: number
          deposit_amount?: number
          description?: string | null
          id?: string
          image_url?: string | null
          monthly_rate?: number | null
          name: string
          notes?: string | null
          quantity_total?: number
          serial_number?: string | null
          status?: string
          updated_at?: string
          user_id: string
          weekly_rate?: number | null
        }
        Update: {
          category?: string
          company_profile_id?: string | null
          condition?: string
          created_at?: string
          daily_rate?: number
          deposit_amount?: number
          description?: string | null
          id?: string
          image_url?: string | null
          monthly_rate?: number | null
          name?: string
          notes?: string | null
          quantity_total?: number
          serial_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          weekly_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_items_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          color: string | null
          company_profile_id: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          bank_account_id: string | null
          category_id: string | null
          company_profile_id: string | null
          created_at: string | null
          currency: string | null
          date: string
          description: string
          id: string
          is_recurring: boolean | null
          payment_method: string | null
          receipt_url: string | null
          recurring_frequency: string | null
          reference_number: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category_id?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          currency?: string | null
          date: string
          description: string
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          receipt_url?: string | null
          recurring_frequency?: string | null
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category_id?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          receipt_url?: string | null
          recurring_frequency?: string | null
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_schedules: {
        Row: {
          amount: number
          class_id: string | null
          created_at: string
          fee_type: string
          id: string
          is_optional: boolean
          term_id: string
          user_id: string
        }
        Insert: {
          amount: number
          class_id?: string | null
          created_at?: string
          fee_type: string
          id?: string
          is_optional?: boolean
          term_id: string
          user_id: string
        }
        Update: {
          amount?: number
          class_id?: string | null
          created_at?: string
          fee_type?: string
          id?: string
          is_optional?: boolean
          term_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_schedules_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "academic_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_cost_entries: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          notes: string | null
          reference: string | null
          user_id: string
          vehicle_id: string
          vendor: string | null
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          reference?: string | null
          user_id: string
          vehicle_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          reference?: string | null
          user_id?: string
          vehicle_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fleet_cost_entries_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_documents: {
        Row: {
          created_at: string
          document_type: string
          expiry_date: string | null
          file_name: string | null
          file_url: string
          id: string
          notes: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          document_type?: string
          expiry_date?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          notes?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_drivers: {
        Row: {
          company_profile_id: string | null
          created_at: string
          full_name: string
          id: string
          license_expiry: string | null
          license_number: string | null
          license_type: string | null
          notes: string | null
          phone: string | null
          risk_score: number
          status: string
          user_id: string
        }
        Insert: {
          company_profile_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          license_type?: string | null
          notes?: string | null
          phone?: string | null
          risk_score?: number
          status?: string
          user_id: string
        }
        Update: {
          company_profile_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          license_type?: string | null
          notes?: string | null
          phone?: string | null
          risk_score?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_drivers_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_fuel_logs: {
        Row: {
          cost: number
          created_at: string
          date: string
          id: string
          litres: number
          odometer: number | null
          station: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          date?: string
          id?: string
          litres?: number
          odometer?: number | null
          station?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          date?: string
          id?: string
          litres?: number
          odometer?: number | null
          station?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_fuel_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_incidents: {
        Row: {
          cost: number | null
          created_at: string
          date: string
          description: string | null
          driver_name: string | null
          id: string
          incident_type: string
          insurance_claim_ref: string | null
          photo_urls: string[] | null
          resolved: boolean | null
          severity: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          date?: string
          description?: string | null
          driver_name?: string | null
          id?: string
          incident_type?: string
          insurance_claim_ref?: string | null
          photo_urls?: string[] | null
          resolved?: boolean | null
          severity?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          date?: string
          description?: string | null
          driver_name?: string | null
          id?: string
          incident_type?: string
          insurance_claim_ref?: string | null
          photo_urls?: string[] | null
          resolved?: boolean | null
          severity?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_incidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_maintenance_schedules: {
        Row: {
          created_at: string
          id: string
          interval_km: number | null
          interval_months: number | null
          is_active: boolean
          last_completed_date: string | null
          last_completed_odometer: number | null
          next_due_date: string | null
          next_due_odometer: number | null
          notes: string | null
          service_type: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interval_km?: number | null
          interval_months?: number | null
          is_active?: boolean
          last_completed_date?: string | null
          last_completed_odometer?: number | null
          next_due_date?: string | null
          next_due_odometer?: number | null
          notes?: string | null
          service_type?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interval_km?: number | null
          interval_months?: number | null
          is_active?: boolean
          last_completed_date?: string | null
          last_completed_odometer?: number | null
          next_due_date?: string | null
          next_due_odometer?: number | null
          notes?: string | null
          service_type?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_maintenance_schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_service_logs: {
        Row: {
          cost: number
          created_at: string
          id: string
          invoice_url: string | null
          notes: string | null
          parts_replaced: string | null
          provider: string | null
          service_date: string
          service_type: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          invoice_url?: string | null
          notes?: string | null
          parts_replaced?: string | null
          provider?: string | null
          service_date?: string
          service_type?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          invoice_url?: string | null
          notes?: string | null
          parts_replaced?: string | null
          provider?: string | null
          service_date?: string
          service_type?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_service_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_tyres: {
        Row: {
          brand: string | null
          cost: number | null
          created_at: string
          current_km: number | null
          date_fitted: string | null
          expected_km: number | null
          id: string
          last_rotation_date: string | null
          position: string
          replacement_date: string | null
          rotation_count: number | null
          size: string | null
          status: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          brand?: string | null
          cost?: number | null
          created_at?: string
          current_km?: number | null
          date_fitted?: string | null
          expected_km?: number | null
          id?: string
          last_rotation_date?: string | null
          position?: string
          replacement_date?: string | null
          rotation_count?: number | null
          size?: string | null
          status?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          brand?: string | null
          cost?: number | null
          created_at?: string
          current_km?: number | null
          date_fitted?: string | null
          expected_km?: number | null
          id?: string
          last_rotation_date?: string | null
          position?: string
          replacement_date?: string | null
          rotation_count?: number | null
          size?: string | null
          status?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_tyres_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_vehicles: {
        Row: {
          assigned_driver: string | null
          color: string | null
          company_profile_id: string | null
          created_at: string
          disposed_at: string | null
          engine_size: string | null
          finance_details: string | null
          fuel_type: string | null
          health_score: number | null
          id: string
          image_url: string | null
          insurance_expiry: string | null
          license_expiry: string | null
          license_plate: string | null
          make: string
          model: string
          notes: string | null
          odometer: number | null
          purchase_price: number | null
          status: string
          updated_at: string
          user_id: string
          vin: string | null
          warranty_expiry: string | null
          year: number
        }
        Insert: {
          assigned_driver?: string | null
          color?: string | null
          company_profile_id?: string | null
          created_at?: string
          disposed_at?: string | null
          engine_size?: string | null
          finance_details?: string | null
          fuel_type?: string | null
          health_score?: number | null
          id?: string
          image_url?: string | null
          insurance_expiry?: string | null
          license_expiry?: string | null
          license_plate?: string | null
          make: string
          model: string
          notes?: string | null
          odometer?: number | null
          purchase_price?: number | null
          status?: string
          updated_at?: string
          user_id: string
          vin?: string | null
          warranty_expiry?: string | null
          year: number
        }
        Update: {
          assigned_driver?: string | null
          color?: string | null
          company_profile_id?: string | null
          created_at?: string
          disposed_at?: string | null
          engine_size?: string | null
          finance_details?: string | null
          fuel_type?: string | null
          health_score?: number | null
          id?: string
          image_url?: string | null
          insurance_expiry?: string | null
          license_expiry?: string | null
          license_plate?: string | null
          make?: string
          model?: string
          notes?: string | null
          odometer?: number | null
          purchase_price?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          vin?: string | null
          warranty_expiry?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fleet_vehicles_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          source: string
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          source?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_attendance: {
        Row: {
          check_in: string
          check_out: string | null
          company_profile_id: string | null
          created_at: string
          id: string
          member_id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          check_in?: string
          check_out?: string | null
          company_profile_id?: string | null
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          check_in?: string
          check_out?: string | null
          company_profile_id?: string | null
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_attendance_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "gym_members"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_class_schedules: {
        Row: {
          class_id: string
          company_profile_id: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          instructor_override: string | null
          is_active: boolean
          max_capacity_override: number | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id: string
          company_profile_id?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          instructor_override?: string | null
          is_active?: boolean
          max_capacity_override?: number | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string
          company_profile_id?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          instructor_override?: string | null
          is_active?: boolean
          max_capacity_override?: number | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_class_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "gym_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_class_schedules_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_classes: {
        Row: {
          category: string
          color: string | null
          company_profile_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          instructor: string | null
          is_active: boolean
          max_capacity: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          color?: string | null
          company_profile_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor?: string | null
          is_active?: boolean
          max_capacity?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string | null
          company_profile_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor?: string | null
          is_active?: boolean
          max_capacity?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_classes_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_member_subscriptions: {
        Row: {
          amount_paid: number
          auto_renew: boolean
          company_profile_id: string | null
          created_at: string
          end_date: string
          freeze_end: string | null
          freeze_start: string | null
          freezes_used: number
          id: string
          member_id: string
          notes: string | null
          payment_status: string
          plan_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          auto_renew?: boolean
          company_profile_id?: string | null
          created_at?: string
          end_date: string
          freeze_end?: string | null
          freeze_start?: string | null
          freezes_used?: number
          id?: string
          member_id: string
          notes?: string | null
          payment_status?: string
          plan_id: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          auto_renew?: boolean
          company_profile_id?: string | null
          created_at?: string
          end_date?: string
          freeze_end?: string | null
          freeze_start?: string | null
          freezes_used?: number
          id?: string
          member_id?: string
          notes?: string | null
          payment_status?: string
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_member_subscriptions_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_member_subscriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "gym_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_member_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "gym_membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_members: {
        Row: {
          address: string | null
          company_profile_id: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: string | null
          health_conditions: string | null
          id: string
          join_date: string
          last_name: string
          member_number: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_profile_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender?: string | null
          health_conditions?: string | null
          id?: string
          join_date?: string
          last_name: string
          member_number: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_profile_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: string | null
          health_conditions?: string | null
          id?: string
          join_date?: string
          last_name?: string
          member_number?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_members_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_membership_plans: {
        Row: {
          category: string
          company_profile_id: string | null
          created_at: string
          description: string | null
          duration_days: number
          id: string
          is_active: boolean
          max_freezes: number
          name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          company_profile_id?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          max_freezes?: number
          name: string
          price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          company_profile_id?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          max_freezes?: number
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_membership_plans_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hire_order_items: {
        Row: {
          condition_in: string | null
          condition_out: string | null
          created_at: string
          daily_rate: number
          damage_charge: number
          damage_notes: string | null
          equipment_item_id: string | null
          equipment_name: string
          hire_order_id: string
          id: string
          quantity: number
          subtotal: number
        }
        Insert: {
          condition_in?: string | null
          condition_out?: string | null
          created_at?: string
          daily_rate?: number
          damage_charge?: number
          damage_notes?: string | null
          equipment_item_id?: string | null
          equipment_name: string
          hire_order_id: string
          id?: string
          quantity?: number
          subtotal?: number
        }
        Update: {
          condition_in?: string | null
          condition_out?: string | null
          created_at?: string
          daily_rate?: number
          damage_charge?: number
          damage_notes?: string | null
          equipment_item_id?: string | null
          equipment_name?: string
          hire_order_id?: string
          id?: string
          quantity?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "hire_order_items_equipment_item_id_fkey"
            columns: ["equipment_item_id"]
            isOneToOne: false
            referencedRelation: "equipment_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hire_order_items_hire_order_id_fkey"
            columns: ["hire_order_id"]
            isOneToOne: false
            referencedRelation: "hire_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      hire_orders: {
        Row: {
          actual_return_date: string | null
          client_id: string | null
          client_name: string
          client_phone: string | null
          company_profile_id: string | null
          created_at: string
          deposit_paid: number
          hire_end: string
          hire_start: string
          id: string
          notes: string | null
          order_number: string
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_return_date?: string | null
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          company_profile_id?: string | null
          created_at?: string
          deposit_paid?: number
          hire_end: string
          hire_start: string
          id?: string
          notes?: string | null
          order_number: string
          status?: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_return_date?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          company_profile_id?: string | null
          created_at?: string
          deposit_paid?: number
          hire_end?: string
          hire_start?: string
          id?: string
          notes?: string | null
          order_number?: string
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hire_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hire_orders_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      housekeeping_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          priority: string
          room_id: string
          status: string
          task_type: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string
          room_id: string
          status?: string
          task_type?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string
          room_id?: string
          status?: string
          task_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          cost_price: number | null
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number | null
          unit_price: number | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number | null
          unit_price?: number | null
        }
        Update: {
          cost_price?: number | null
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
          company_profile_id: string | null
          created_at: string
          date: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          purchase_order_number: string | null
          source_quote_id: string | null
          status: string | null
          student_id: string | null
          tax_rate: number | null
          total: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_id?: string | null
          client_name: string
          company_profile_id?: string | null
          created_at?: string
          date: string
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          purchase_order_number?: string | null
          source_quote_id?: string | null
          status?: string | null
          student_id?: string | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_id?: string | null
          client_name?: string
          company_profile_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          purchase_order_number?: string | null
          source_quote_id?: string | null
          status?: string | null
          student_id?: string | null
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
            foreignKeyName: "invoices_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_source_quote_id_fkey"
            columns: ["source_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      job_card_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          item_type: string
          job_card_id: string
          part_number: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          item_type?: string
          job_card_id: string
          part_number?: string | null
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          item_type?: string
          job_card_id?: string
          part_number?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_card_line_items_job_card_id_fkey"
            columns: ["job_card_id"]
            isOneToOne: false
            referencedRelation: "job_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      job_cards: {
        Row: {
          assigned_technician_id: string | null
          assigned_technician_name: string | null
          client_id: string | null
          client_name: string
          company_profile_id: string | null
          completed_at: string | null
          created_at: string
          diagnosis: string | null
          estimated_completion: string | null
          id: string
          invoice_id: string | null
          job_card_number: string
          notes: string | null
          priority: string
          recommended_work: string | null
          reported_issue: string | null
          source_quote_id: string | null
          status: string
          tax_rate: number
          total: number
          updated_at: string
          user_id: string
          vehicle_color: string | null
          vehicle_make: string | null
          vehicle_mileage: string | null
          vehicle_model: string | null
          vehicle_reg: string | null
          vehicle_vin: string | null
          vehicle_year: string | null
        }
        Insert: {
          assigned_technician_id?: string | null
          assigned_technician_name?: string | null
          client_id?: string | null
          client_name: string
          company_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          diagnosis?: string | null
          estimated_completion?: string | null
          id?: string
          invoice_id?: string | null
          job_card_number: string
          notes?: string | null
          priority?: string
          recommended_work?: string | null
          reported_issue?: string | null
          source_quote_id?: string | null
          status?: string
          tax_rate?: number
          total?: number
          updated_at?: string
          user_id: string
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_mileage?: string | null
          vehicle_model?: string | null
          vehicle_reg?: string | null
          vehicle_vin?: string | null
          vehicle_year?: string | null
        }
        Update: {
          assigned_technician_id?: string | null
          assigned_technician_name?: string | null
          client_id?: string | null
          client_name?: string
          company_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          diagnosis?: string | null
          estimated_completion?: string | null
          id?: string
          invoice_id?: string | null
          job_card_number?: string
          notes?: string | null
          priority?: string
          recommended_work?: string | null
          reported_issue?: string | null
          source_quote_id?: string | null
          status?: string
          tax_rate?: number
          total?: number
          updated_at?: string
          user_id?: string
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_mileage?: string | null
          vehicle_model?: string | null
          vehicle_reg?: string | null
          vehicle_vin?: string | null
          vehicle_year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_cards_assigned_technician_id_fkey"
            columns: ["assigned_technician_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_cards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_cards_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_cards_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_cards_source_quote_id_fkey"
            columns: ["source_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_type: string
          content: string
          created_at: string | null
          id: string
          lead_id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          content: string
          created_at?: string | null
          id?: string
          lead_id: string
          user_id: string
        }
        Update: {
          activity_type?: string
          content?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          company_profile_id: string | null
          created_at: string | null
          email: string | null
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          last_contacted_at: string | null
          loss_reason: string | null
          name: string
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          priority: string | null
          source: string | null
          stage_entered_at: string | null
          status: string
          updated_at: string | null
          user_id: string
          win_probability: number | null
        }
        Insert: {
          company?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          email?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          last_contacted_at?: string | null
          loss_reason?: string | null
          name: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          source?: string | null
          stage_entered_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          win_probability?: number | null
        }
        Update: {
          company?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          email?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          last_contacted_at?: string | null
          loss_reason?: string | null
          name?: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          source?: string | null
          stage_entered_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          win_probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_calendar_events: {
        Row: {
          case_id: string | null
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          is_completed: boolean | null
          location: string | null
          priority: string | null
          reminder_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string
          id?: string
          is_completed?: boolean | null
          location?: string | null
          priority?: string | null
          reminder_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          is_completed?: boolean | null
          location?: string | null
          priority?: string | null
          reminder_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_calendar_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_case_expenses: {
        Row: {
          amount: number
          case_id: string
          created_at: string
          date: string
          description: string
          expense_type: string
          id: string
          invoice_id: string | null
          is_billable: boolean | null
          is_invoiced: boolean | null
          receipt_url: string | null
          user_id: string
        }
        Insert: {
          amount: number
          case_id: string
          created_at?: string
          date?: string
          description: string
          expense_type?: string
          id?: string
          invoice_id?: string | null
          is_billable?: boolean | null
          is_invoiced?: boolean | null
          receipt_url?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          case_id?: string
          created_at?: string
          date?: string
          description?: string
          expense_type?: string
          id?: string
          invoice_id?: string | null
          is_billable?: boolean | null
          is_invoiced?: boolean | null
          receipt_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_case_expenses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_case_expenses_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_case_notes: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          is_confidential: boolean | null
          note_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          is_confidential?: boolean | null
          note_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          is_confidential?: boolean | null
          note_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_cases: {
        Row: {
          assigned_lawyer: string | null
          case_number: string
          case_type: string
          client_id: string | null
          company_profile_id: string | null
          court_case_number: string | null
          court_name: string | null
          created_at: string
          description: string | null
          estimated_value: number | null
          filing_date: string | null
          id: string
          judge_name: string | null
          next_hearing_date: string | null
          notes: string | null
          opposing_counsel: string | null
          opposing_party: string | null
          priority: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_lawyer?: string | null
          case_number: string
          case_type?: string
          client_id?: string | null
          company_profile_id?: string | null
          court_case_number?: string | null
          court_name?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          filing_date?: string | null
          id?: string
          judge_name?: string | null
          next_hearing_date?: string | null
          notes?: string | null
          opposing_counsel?: string | null
          opposing_party?: string | null
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_lawyer?: string | null
          case_number?: string
          case_type?: string
          client_id?: string | null
          company_profile_id?: string | null
          court_case_number?: string | null
          court_name?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          filing_date?: string | null
          id?: string
          judge_name?: string | null
          next_hearing_date?: string | null
          notes?: string | null
          opposing_counsel?: string | null
          opposing_party?: string | null
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_cases_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          case_id: string | null
          created_at: string
          document_type: string
          file_name: string | null
          file_size: number | null
          file_url: string
          id: string
          notes: string | null
          title: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          document_type?: string
          file_name?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          notes?: string | null
          title: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          document_type?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          notes?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_time_entries: {
        Row: {
          activity_type: string | null
          case_id: string
          created_at: string
          date: string
          description: string
          hourly_rate: number
          hours: number
          id: string
          invoice_id: string | null
          is_billable: boolean | null
          is_invoiced: boolean | null
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          case_id: string
          created_at?: string
          date?: string
          description: string
          hourly_rate?: number
          hours?: number
          id?: string
          invoice_id?: string | null
          is_billable?: boolean | null
          is_invoiced?: boolean | null
          user_id: string
        }
        Update: {
          activity_type?: string | null
          case_id?: string
          created_at?: string
          date?: string
          description?: string
          hourly_rate?: number
          hours?: number
          id?: string
          invoice_id?: string | null
          is_billable?: boolean | null
          is_invoiced?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_time_entries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_time_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category_preferences: Json
          created_at: string
          email_enabled: boolean
          id: string
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          category_preferences?: Json
          created_at?: string
          email_enabled?: boolean
          id?: string
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          category_preferences?: Json
          created_at?: string
          email_enabled?: boolean
          id?: string
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          company_profile_id: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          company_profile_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          company_profile_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          allowances: Json | null
          basic_salary: number
          created_at: string | null
          deductions: Json | null
          gross_pay: number
          id: string
          net_pay: number
          notes: string | null
          overtime_amount: number | null
          overtime_hours: number | null
          overtime_rate: number | null
          owner_user_id: string
          pay_period_end: string
          pay_period_start: string
          payment_date: string
          staff_member_id: string
          status: string
          total_allowances: number | null
          total_deductions: number | null
          updated_at: string | null
        }
        Insert: {
          allowances?: Json | null
          basic_salary?: number
          created_at?: string | null
          deductions?: Json | null
          gross_pay?: number
          id?: string
          net_pay?: number
          notes?: string | null
          overtime_amount?: number | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          owner_user_id: string
          pay_period_end: string
          pay_period_start: string
          payment_date: string
          staff_member_id: string
          status?: string
          total_allowances?: number | null
          total_deductions?: number | null
          updated_at?: string | null
        }
        Update: {
          allowances?: Json | null
          basic_salary?: number
          created_at?: string | null
          deductions?: Json | null
          gross_pay?: number
          id?: string
          net_pay?: number
          notes?: string | null
          overtime_amount?: number | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          owner_user_id?: string
          pay_period_end?: string
          pay_period_start?: string
          payment_date?: string
          staff_member_id?: string
          status?: string
          total_allowances?: number | null
          total_deductions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payslips_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_modules: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_core: boolean
          key: string
          monthly_price: number
          name: string
          sort_order: number
          system_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_core?: boolean
          key: string
          monthly_price?: number
          name: string
          sort_order?: number
          system_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_core?: boolean
          key?: string
          monthly_price?: number
          name?: string
          sort_order?: number
          system_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_line_items: {
        Row: {
          cost_price: number | null
          created_at: string
          description: string
          id: string
          quantity: number | null
          quote_id: string
          unit_price: number | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          description: string
          id?: string
          quantity?: number | null
          quote_id: string
          unit_price?: number | null
        }
        Update: {
          cost_price?: number | null
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
          company_profile_id: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          lead_time: string | null
          notes: string | null
          quote_number: string
          source_job_card_id: string | null
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
          company_profile_id?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          lead_time?: string | null
          notes?: string | null
          quote_number: string
          source_job_card_id?: string | null
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
          company_profile_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          lead_time?: string | null
          notes?: string | null
          quote_number?: string
          source_job_card_id?: string | null
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
          {
            foreignKeyName: "quotes_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_source_job_card_id_fkey"
            columns: ["source_job_card_id"]
            isOneToOne: false
            referencedRelation: "job_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_documents: {
        Row: {
          company_profile_id: string | null
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          last_generated_at: string | null
          next_run_date: string
          source_id: string
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_profile_id?: string | null
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          next_run_date: string
          source_id: string
          source_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_profile_id?: string | null
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          next_run_date?: string
          source_id?: string
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_documents_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string | null
          capacity: number
          company_profile_id: string | null
          created_at: string
          daily_rate: number
          description: string | null
          id: string
          name: string
          room_number: string
          room_type: string
          status: string
          user_id: string
        }
        Insert: {
          amenities?: string | null
          capacity?: number
          company_profile_id?: string | null
          created_at?: string
          daily_rate?: number
          description?: string | null
          id?: string
          name: string
          room_number: string
          room_type?: string
          status?: string
          user_id: string
        }
        Update: {
          amenities?: string | null
          capacity?: number
          company_profile_id?: string | null
          created_at?: string
          daily_rate?: number
          description?: string | null
          id?: string
          name?: string
          room_number?: string
          room_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_announcements: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          message: string
          published_at: string | null
          target_class_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          message: string
          published_at?: string | null
          target_class_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          message?: string
          published_at?: string | null
          target_class_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_announcements_target_class_id_fkey"
            columns: ["target_class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      school_classes: {
        Row: {
          capacity: number | null
          class_teacher_id: string | null
          company_profile_id: string | null
          created_at: string
          grade_level: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity?: number | null
          class_teacher_id?: string | null
          company_profile_id?: string | null
          created_at?: string
          grade_level?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          capacity?: number | null
          class_teacher_id?: string | null
          company_profile_id?: string | null
          created_at?: string
          grade_level?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_classes_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_classes_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_periods: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_break: boolean
          name: string
          sort_order: number
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_break?: boolean
          name: string
          sort_order?: number
          start_time: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_break?: boolean
          name?: string
          sort_order?: number
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      school_subjects: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          short_code: string | null
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          short_code?: string | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          short_code?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sms_credits: {
        Row: {
          created_at: string
          credits_allocated: number
          credits_used: number
          id: string
          month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_allocated?: number
          credits_used?: number
          id?: string
          month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_allocated?: number
          credits_used?: number
          id?: string
          month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_log: {
        Row: {
          at_message_id: string | null
          created_at: string
          id: string
          message: string
          notification_id: string | null
          phone_number: string
          status: string
          user_id: string
        }
        Insert: {
          at_message_id?: string | null
          created_at?: string
          id?: string
          message: string
          notification_id?: string | null
          phone_number: string
          status?: string
          user_id: string
        }
        Update: {
          at_message_id?: string | null
          created_at?: string
          id?: string
          message?: string
          notification_id?: string | null
          phone_number?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_members: {
        Row: {
          address: string | null
          avatar_url: string | null
          bank_account_number: string | null
          bank_branch_code: string | null
          bank_name: string | null
          bio: string | null
          city: string | null
          company_profile_id: string | null
          contract_type: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          department: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          gender: string | null
          hire_date: string | null
          id: string
          invited_at: string | null
          job_title: string | null
          joined_at: string | null
          name: string
          national_id: string | null
          notes: string | null
          owner_user_id: string
          phone: string | null
          postal_code: string | null
          probation_end_date: string | null
          salary_amount: number | null
          salary_currency: string | null
          salary_frequency: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          work_schedule: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bank_account_number?: string | null
          bank_branch_code?: string | null
          bank_name?: string | null
          bio?: string | null
          city?: string | null
          company_profile_id?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          gender?: string | null
          hire_date?: string | null
          id?: string
          invited_at?: string | null
          job_title?: string | null
          joined_at?: string | null
          name: string
          national_id?: string | null
          notes?: string | null
          owner_user_id: string
          phone?: string | null
          postal_code?: string | null
          probation_end_date?: string | null
          salary_amount?: number | null
          salary_currency?: string | null
          salary_frequency?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          work_schedule?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bank_account_number?: string | null
          bank_branch_code?: string | null
          bank_name?: string | null
          bio?: string | null
          city?: string | null
          company_profile_id?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          gender?: string | null
          hire_date?: string | null
          id?: string
          invited_at?: string | null
          job_title?: string | null
          joined_at?: string | null
          name?: string
          national_id?: string | null
          notes?: string | null
          owner_user_id?: string
          phone?: string | null
          postal_code?: string | null
          probation_end_date?: string | null
          salary_amount?: number | null
          salary_currency?: string | null
          salary_frequency?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          work_schedule?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_module_access: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          module_id: string
          staff_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          module_id: string
          staff_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          module_id?: string
          staff_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_module_access_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "platform_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_module_access_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["staff_role"]
          staff_member_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["staff_role"]
          staff_member_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          staff_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_roles_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          student_id: string
          term_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          reference_number?: string | null
          student_id: string
          term_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          student_id?: string
          term_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_payments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "academic_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_number: string
          class_id: string | null
          company_profile_id: string | null
          created_at: string
          date_of_birth: string | null
          enrollment_date: string | null
          first_name: string
          gender: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relationship: string | null
          id: string
          last_name: string
          medical_notes: string | null
          notes: string | null
          photo_url: string | null
          secondary_guardian_name: string | null
          secondary_guardian_phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          admission_number: string
          class_id?: string | null
          company_profile_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          enrollment_date?: string | null
          first_name: string
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          id?: string
          last_name: string
          medical_notes?: string | null
          notes?: string | null
          photo_url?: string | null
          secondary_guardian_name?: string | null
          secondary_guardian_phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          admission_number?: string
          class_id?: string | null
          company_profile_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          enrollment_date?: string | null
          first_name?: string
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          id?: string
          last_name?: string
          medical_notes?: string | null
          notes?: string | null
          photo_url?: string | null
          secondary_guardian_name?: string | null
          secondary_guardian_phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          month: string
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          month: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          subscription_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          month?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          deleted_at: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          system_type: string
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          deleted_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          system_type?: string
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          deleted_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          system_type?: string
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          company_profile_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          sort_order: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          company_profile_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          sort_order?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          company_profile_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          sort_order?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_clearance_documents: {
        Row: {
          activity_name: string
          created_at: string | null
          document_url: string
          expiry_date: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_name: string
          created_at?: string | null
          document_url: string
          expiry_date: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_name?: string
          created_at?: string | null
          document_url?: string
          expiry_date?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tender_source_links: {
        Row: {
          company_profile_id: string | null
          created_at: string
          description: string | null
          id: string
          last_visited_at: string | null
          name: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          company_profile_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_visited_at?: string | null
          name: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          company_profile_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_visited_at?: string | null
          name?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tender_source_links_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_entries: {
        Row: {
          class_id: string
          created_at: string
          day_of_week: number
          id: string
          period_id: string
          room: string | null
          subject_id: string
          teacher_id: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          day_of_week: number
          id?: string
          period_id: string
          room?: string | null
          subject_id: string
          teacher_id?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          day_of_week?: number
          id?: string
          period_id?: string
          room?: string | null
          subject_id?: string
          teacher_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "school_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "school_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          clients_count: number | null
          created_at: string | null
          id: string
          invoices_count: number | null
          period_end: string
          period_start: string
          quotes_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clients_count?: number | null
          created_at?: string | null
          id?: string
          invoices_count?: number | null
          period_end: string
          period_start: string
          quotes_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clients_count?: number | null
          created_at?: string | null
          id?: string
          invoices_count?: number | null
          period_end?: string
          period_start?: string
          quotes_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_modules: {
        Row: {
          activated_at: string
          created_at: string
          id: string
          is_active: boolean
          module_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          module_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          module_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "platform_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          active_company_id: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_company_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_company_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_active_company_id_fkey"
            columns: ["active_company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_staff_role: {
        Args: { p_owner_user_id: string; p_user_id: string }
        Returns: Database["public"]["Enums"]["staff_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "support_agent" | "user"
      staff_role: "admin" | "manager" | "staff" | "viewer"
      subscription_plan: "free_trial" | "basic" | "standard" | "pro" | "custom"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "cancelled"
        | "expired"
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
    Enums: {
      app_role: ["super_admin", "support_agent", "user"],
      staff_role: ["admin", "manager", "staff", "viewer"],
      subscription_plan: ["free_trial", "basic", "standard", "pro", "custom"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "cancelled",
        "expired",
      ],
    },
  },
} as const
