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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller identity
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check super_admin role
    const { data: roleData } = await anonClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client to access auth.users
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if this is a delete action (via POST body)
    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    if (body.action === "delete") {
      const deleteUserId = body.userId as string;
      if (!deleteUserId) {
        return new Response(JSON.stringify({ error: "userId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Don't allow deleting yourself
      if (deleteUserId === userId) {
        return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete subscription first
      await adminClient.from("subscriptions").delete().eq("user_id", deleteUserId);
      // Delete company profile
      await adminClient.from("company_profiles").delete().eq("user_id", deleteUserId);
      // Delete auth user (cascades other FK references)
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(deleteUserId);
      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET: List all signups
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });

    if (usersError) {
      return new Response(JSON.stringify({ error: usersError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all company profiles
    const { data: profiles } = await adminClient
      .from("company_profiles")
      .select("user_id, company_name");

    // Get all subscriptions
    const { data: subscriptions } = await adminClient
      .from("subscriptions")
      .select("user_id, plan, status, system_type");

    // Get all staff member user_ids to exclude them
    const { data: staffMembers } = await adminClient
      .from("staff_members")
      .select("user_id");

    const staffUserIds = new Set(
      (staffMembers || [])
        .map((s) => s.user_id)
        .filter(Boolean)
    );

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
    const subMap = new Map((subscriptions || []).map((s) => [s.user_id, s]));

    const signups = usersData.users
      .filter((user) => !staffUserIds.has(user.id)) // Exclude staff/workers
      .map((user) => {
        const profile = profileMap.get(user.id);
        const sub = subMap.get(user.id);
        const meta = (user.user_metadata || {}) as Record<string, unknown>;

        return {
          id: user.id,
          email: user.email || "",
          first_name: (meta.first_name as string) || null,
          surname: (meta.surname as string) || null,
          phone: (meta.phone as string) || null,
          system_type: (meta.system_type as string) || sub?.system_type || "unknown",
          onboarded: !!profile,
          company_name: profile?.company_name || null,
          subscription_status: sub?.status || null,
          subscription_plan: sub?.plan || null,
          created_at: user.created_at,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return new Response(JSON.stringify(signups), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
