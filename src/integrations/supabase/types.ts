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
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean
          name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      accounting_transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
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
        ]
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          account_type: string | null
          bank_name: string | null
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
        Relationships: []
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
      clients: {
        Row: {
          address: string | null
          company: string
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
          country: string | null
          created_at: string
          default_tax_rate: number | null
          default_terms: string | null
          default_validity_days: number | null
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
          country?: string | null
          created_at?: string
          default_tax_rate?: number | null
          default_terms?: string | null
          default_validity_days?: number | null
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
          country?: string | null
          created_at?: string
          default_tax_rate?: number | null
          default_terms?: string | null
          default_validity_days?: number | null
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
      expense_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          bank_account_id: string | null
          category_id: string | null
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
          created_at: string
          date: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
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
          created_at?: string
          date: string
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
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
          created_at?: string
          date?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
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
        Relationships: []
      }
      notifications: {
        Row: {
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
        Relationships: []
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
            foreignKeyName: "quotes_source_job_card_id_fkey"
            columns: ["source_job_card_id"]
            isOneToOne: false
            referencedRelation: "job_cards"
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
      staff_members: {
        Row: {
          address: string | null
          avatar_url: string | null
          bank_account_number: string | null
          bank_branch_code: string | null
          bank_name: string | null
          bio: string | null
          city: string | null
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
        Relationships: []
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
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
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
        Relationships: []
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
          created_at?: string
          description?: string | null
          id?: string
          last_visited_at?: string | null
          name?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
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
      subscription_plan: "free_trial" | "basic" | "standard" | "pro"
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
      subscription_plan: ["free_trial", "basic", "standard", "pro"],
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
