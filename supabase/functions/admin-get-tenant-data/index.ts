import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller's identity
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerUserId = claimsData.claims.sub;

    // Use service role to check admin status
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUserId)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { tenant_user_id } = await req.json();
    if (!tenant_user_id) {
      return new Response(JSON.stringify({ error: "tenant_user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch tenant data using service role (bypasses RLS)
    const [clientsRes, invoicesRes, quotesRes] = await Promise.all([
      adminClient
        .from("clients")
        .select("id, company, contact_person, email, phone, total_revenue, status, created_at")
        .eq("user_id", tenant_user_id)
        .order("total_revenue", { ascending: false, nullsFirst: false })
        .limit(50),
      adminClient
        .from("invoices")
        .select("id, invoice_number, client_name, date, due_date, total, status, payment_date")
        .eq("user_id", tenant_user_id)
        .order("created_at", { ascending: false })
        .limit(50),
      adminClient
        .from("quotes")
        .select("id, quote_number, client_name, date, valid_until, total, status")
        .eq("user_id", tenant_user_id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const clients = clientsRes.data || [];
    const invoices = invoicesRes.data || [];
    const quotes = quotesRes.data || [];

    // Compute summary
    const totalRevenue = invoices
      .filter((i: any) => i.status === "paid")
      .reduce((sum: number, i: any) => sum + (i.total || 0), 0);

    const activeInvoices = invoices.filter((i: any) => i.status === "sent" || i.status === "overdue").length;

    const avgInvoiceValue =
      invoices.length > 0
        ? invoices.reduce((sum: number, i: any) => sum + (i.total || 0), 0) / invoices.length
        : 0;

    const acceptedQuotes = quotes.filter((q: any) => q.status === "accepted").length;
    const totalQuotes = quotes.filter((q: any) => q.status !== "draft").length;
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;

    const summary = {
      total_clients: clients.length,
      total_revenue: totalRevenue,
      active_invoices: activeInvoices,
      avg_invoice_value: avgInvoiceValue,
      quote_conversion_rate: conversionRate,
      total_invoices: invoices.length,
      total_quotes: quotes.length,
    };

    return new Response(
      JSON.stringify({ clients, invoices, quotes, summary }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in admin-get-tenant-data:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
