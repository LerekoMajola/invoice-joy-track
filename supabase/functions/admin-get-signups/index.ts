import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// All public tables with user_id column, ordered to respect FK dependencies
// (child tables first, parent tables last)
const ALL_USER_TABLES = [
  // Child / leaf tables first
  "notifications",
  "push_subscriptions",
  "lead_activities",
  "client_activities",
  "client_documents",
  "deal_tasks",
  "deal_stakeholders",
  "contacts",
  "delivery_notes",
  "equipment_incidents",
  "equipment_service_logs",
  "equipment_items",
  "fleet_cost_entries",
  "fleet_documents",
  "fleet_drivers",
  "fleet_fuel_logs",
  "fleet_incidents",
  "fleet_maintenance_schedules",
  "fleet_service_logs",
  "fleet_tyres",
  "fleet_vehicles",
  "guest_reviews",
  "gym_attendance",
  "gym_class_bookings",
  "gym_class_schedules",
  "gym_classes",
  "gym_invoice_logs",
  "gym_member_subscriptions",
  "gym_member_vitals",
  "gym_members",
  "gym_membership_plans",
  "hire_orders",
  "housekeeping_tasks",
  "bookings",
  "rooms",
  "accounting_transactions",
  "bank_accounts",
  "expense_categories",
  "expenses",
  "fee_schedules",
  "student_fee_payments",
  "student_report_cards",
  "students",
  "school_announcements",
  "school_periods",
  "school_subjects",
  "timetable_entries",
  "school_classes",
  "academic_terms",
  "legal_calendar_events",
  "legal_case_expenses",
  "legal_case_notes",
  "legal_documents",
  "legal_time_entries",
  "legal_cases",
  "job_cards",
  "invoices",
  "quotes",
  "leads",
  "clients",
  "recurring_documents",
  "scraped_tenders",
  "sms_credits",
  "sms_log",
  "staff_members",
  "tasks",
  "tax_clearance_documents",
  "tender_source_links",
  "usage_tracking",
  "notification_preferences",
  "user_preferences",
  "user_modules",
  "package_change_requests",
  "subscription_payments",
  // Parent tables last
  "subscriptions",
  "company_profiles",
  "user_roles",
];

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return { error: "Unauthorized", status: 401 };
  }

  const userId = claimsData.claims.sub;

  const { data: roleData } = await anonClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();

  if (!roleData) {
    return { error: "Forbidden", status: 403 };
  }

  return { userId, anonClient };
}

async function handlePermanentDelete(adminClient: ReturnType<typeof createClient>, deleteUserId: string, callerUserId: string) {
  if (deleteUserId === callerUserId) {
    return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Delete from all tables in dependency-safe order
  const errors: string[] = [];
  for (const table of ALL_USER_TABLES) {
    const { error } = await adminClient.from(table).delete().eq("user_id", deleteUserId);
    if (error) {
      console.error(`Failed to delete from ${table}:`, error.message);
      errors.push(`${table}: ${error.message}`);
    }
  }

  // Also delete admin_invoices which uses tenant_user_id
  await adminClient.from("admin_invoices").delete().eq("tenant_user_id", deleteUserId);

  // Delete auth user
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(deleteUserId);
  if (deleteError) {
    console.error("deleteUser failed for", deleteUserId, deleteError.message);
    return new Response(JSON.stringify({ error: `Failed to delete auth user: ${deleteError.message}`, table_errors: errors }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, permanent: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleSoftDelete(adminClient: ReturnType<typeof createClient>, deleteUserId: string, callerUserId: string) {
  if (deleteUserId === callerUserId) {
    return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Guard: if user has ANY company profile (active or soft-deleted), soft-delete
  const { data: existingProfiles } = await adminClient
    .from("company_profiles")
    .select("id")
    .eq("user_id", deleteUserId);

  if (existingProfiles && existingProfiles.length > 0) {
    await adminClient
      .from("company_profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", deleteUserId)
      .is("deleted_at", null);
    await adminClient
      .from("subscriptions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", deleteUserId)
      .is("deleted_at", null);
    return new Response(JSON.stringify({ success: true, soft_deleted: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // For non-onboarded users: clean up orphan rows then delete auth user
  await adminClient.from("subscriptions").delete().eq("user_id", deleteUserId);
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(deleteUserId);
  if (deleteError) {
    console.error("deleteUser failed for", deleteUserId, deleteError.message);
    return new Response(JSON.stringify({ error: `Failed to delete user: ${deleteError.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleListSignups(adminClient: ReturnType<typeof createClient>) {
  const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  });

  if (usersError) {
    return new Response(JSON.stringify({ error: usersError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: profiles } = await adminClient
    .from("company_profiles")
    .select("user_id, company_name")
    .is("deleted_at", null);

  const { data: subscriptions } = await adminClient
    .from("subscriptions")
    .select("user_id, plan, status, system_type");

  const { data: staffMembers } = await adminClient
    .from("staff_members")
    .select("user_id");

  const { data: adminRoles } = await adminClient
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin");

  const excludedUserIds = new Set([
    ...(staffMembers || []).map((s) => s.user_id).filter(Boolean),
    ...(adminRoles || []).map((r) => r.user_id).filter(Boolean),
  ]);

  const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
  const subMap = new Map((subscriptions || []).map((s) => [s.user_id, s]));

  const signups = usersData.users
    .filter((user) => {
      if (excludedUserIds.has(user.id)) return false;
      const meta = (user.user_metadata || {}) as Record<string, unknown>;
      if (meta.portal_type) return false;
      return true;
    })
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
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await verifyAdmin(req);
    if ("error" in result) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId } = result;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Parse body
    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    const action = body.action as string | undefined;
    const deleteUserId = body.userId as string | undefined;

    if (action === "permanent_delete") {
      if (!deleteUserId) {
        return new Response(JSON.stringify({ error: "userId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return handlePermanentDelete(adminClient, deleteUserId, userId);
    }

    if (action === "delete") {
      if (!deleteUserId) {
        return new Response(JSON.stringify({ error: "userId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return handleSoftDelete(adminClient, deleteUserId, userId);
    }

    // Default: list signups
    return handleListSignups(adminClient);
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
