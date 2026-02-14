import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TenantClient {
  id: string;
  company: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  total_revenue: number | null;
  status: string | null;
  created_at: string;
}

interface TenantInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  date: string;
  due_date: string;
  total: number | null;
  status: string | null;
  payment_date: string | null;
}

interface TenantQuote {
  id: string;
  quote_number: string;
  client_name: string;
  date: string;
  valid_until: string;
  total: number | null;
  status: string | null;
}

interface TenantSummary {
  total_clients: number;
  total_revenue: number;
  active_invoices: number;
  avg_invoice_value: number;
  quote_conversion_rate: number;
  total_invoices: number;
  total_quotes: number;
}

interface TenantData {
  clients: TenantClient[];
  invoices: TenantInvoice[];
  quotes: TenantQuote[];
  summary: TenantSummary;
}

export function useAdminTenantData(tenantUserId: string | null) {
  return useQuery<TenantData>({
    queryKey: ['admin-tenant-data', tenantUserId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('admin-get-tenant-data', {
        body: { tenant_user_id: tenantUserId },
      });

      if (response.error) throw response.error;
      return response.data as TenantData;
    },
    enabled: !!tenantUserId,
  });
}
