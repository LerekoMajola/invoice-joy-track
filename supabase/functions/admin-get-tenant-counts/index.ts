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

    // Verify caller identity
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

    // Verify super_admin role
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

    // Query all 5 tables for user_id counts using service role (bypasses RLS)
    const [clientsRes, quotesRes, invoicesRes, gymRes, studentsRes] = await Promise.all([
      adminClient.from("clients").select("user_id"),
      adminClient.from("quotes").select("user_id"),
      adminClient.from("invoices").select("user_id"),
      adminClient.from("gym_members").select("user_id"),
      adminClient.from("students").select("user_id"),
    ]);

    // Aggregate counts per user_id
    const counts: Record<string, { clients: number; quotes: number; invoices: number; gym_members: number; students: number }> = {};

    const increment = (userId: string, field: keyof typeof counts[string]) => {
      if (!counts[userId]) {
        counts[userId] = { clients: 0, quotes: 0, invoices: 0, gym_members: 0, students: 0 };
      }
      counts[userId][field]++;
    };

    (clientsRes.data || []).forEach((r: any) => increment(r.user_id, "clients"));
    (quotesRes.data || []).forEach((r: any) => increment(r.user_id, "quotes"));
    (invoicesRes.data || []).forEach((r: any) => increment(r.user_id, "invoices"));
    (gymRes.data || []).forEach((r: any) => increment(r.user_id, "gym_members"));
    (studentsRes.data || []).forEach((r: any) => increment(r.user_id, "students"));

    return new Response(JSON.stringify(counts), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in admin-get-tenant-counts:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
