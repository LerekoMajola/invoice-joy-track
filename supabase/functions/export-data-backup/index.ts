import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tables shared across all system types
const SHARED_TABLES = [
  { name: "company_profiles", userIdCol: "user_id" },
  { name: "invoices", userIdCol: "user_id" },
  { name: "invoice_line_items", userIdCol: null, joinTable: "invoices", joinCol: "invoice_id" },
  { name: "staff_members", userIdCol: "owner_user_id" },
  { name: "expenses", userIdCol: "user_id" },
  { name: "tasks", userIdCol: "user_id" },
  { name: "bank_accounts", userIdCol: "user_id" },
  { name: "contacts", userIdCol: "user_id" },
  { name: "tax_clearance_documents", userIdCol: "user_id" },
];

// School-specific tables
const SCHOOL_TABLES = [
  { name: "students", userIdCol: "user_id" },
  { name: "school_classes", userIdCol: "user_id" },
  { name: "school_subjects", userIdCol: "user_id" },
  { name: "school_periods", userIdCol: "user_id" },
  { name: "timetable_entries", userIdCol: "user_id" },
  { name: "academic_terms", userIdCol: "user_id" },
  { name: "school_announcements", userIdCol: "user_id" },
  { name: "fee_schedules", userIdCol: "user_id" },
  { name: "student_fee_payments", userIdCol: "user_id" },
];

// Business-specific tables
const BUSINESS_TABLES = [
  { name: "clients", userIdCol: "user_id" },
  { name: "leads", userIdCol: "user_id" },
  { name: "lead_activities", userIdCol: "user_id" },
  { name: "quotes", userIdCol: "user_id" },
  { name: "quote_line_items", userIdCol: null, joinTable: "quotes", joinCol: "quote_id" },
  { name: "delivery_note_items", userIdCol: null, joinTable: "delivery_notes", joinCol: "delivery_note_id" },
  { name: "deal_stakeholders", userIdCol: "user_id" },
  { name: "deal_tasks", userIdCol: "user_id" },
  { name: "tender_source_links", userIdCol: "user_id" },
];

// Workshop-specific tables
const WORKSHOP_TABLES = [
  { name: "clients", userIdCol: "user_id" },
  { name: "leads", userIdCol: "user_id" },
  { name: "job_cards", userIdCol: "user_id" },
  { name: "quotes", userIdCol: "user_id" },
  { name: "quote_line_items", userIdCol: null, joinTable: "quotes", joinCol: "quote_id" },
];

type SystemType = "business" | "workshop" | "school";

interface TableConfig {
  name: string;
  userIdCol: string | null;
  joinTable?: string;
  joinCol?: string;
}

function getTablesForSystem(systemType: SystemType): TableConfig[] {
  const systemTables: Record<SystemType, TableConfig[]> = {
    school: SCHOOL_TABLES,
    business: BUSINESS_TABLES,
    workshop: WORKSHOP_TABLES,
  };
  return [...SHARED_TABLES, ...(systemTables[systemType] || systemTables.business)];
}

function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function convertToCSV(rows: Record<string, unknown>[]): string {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerRow = headers.map(escapeCSVField).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => escapeCSVField(row[h])).join(",")
  );
  return [headerRow, ...dataRows].join("\n");
}

function btoa(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let binary = "";
  for (const byte of data) {
    binary += String.fromCharCode(byte);
  }
  return globalThis.btoa(binary);
}

const SYSTEM_LABELS: Record<SystemType, string> = {
  business: "BizPro",
  workshop: "ShopPro",
  school: "EduPro",
};

async function exportUserData(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  userEmail: string,
  systemType: SystemType,
  resend: InstanceType<typeof Resend>
): Promise<{ success: boolean; error?: string; tablesExported: number }> {
  const tables = getTablesForSystem(systemType);
  const attachments: { filename: string; content: string }[] = [];
  const summary: string[] = [];
  const errors: string[] = [];

  for (const table of tables) {
    try {
      let data: Record<string, unknown>[] | null = null;

      if (table.userIdCol) {
        // Direct user_id filter
        const result = await supabaseAdmin
          .from(table.name)
          .select("*")
          .eq(table.userIdCol, userId);
        if (result.error) throw result.error;
        data = result.data;
      } else if (table.joinTable && table.joinCol) {
        // Join-based filter: get parent IDs first, then fetch child rows
        const parentResult = await supabaseAdmin
          .from(table.joinTable)
          .select("id")
          .eq("user_id", userId);
        if (parentResult.error) throw parentResult.error;

        const parentIds = (parentResult.data || []).map((r: { id: string }) => r.id);
        if (parentIds.length > 0) {
          const result = await supabaseAdmin
            .from(table.name)
            .select("*")
            .in(table.joinCol, parentIds);
          if (result.error) throw result.error;
          data = result.data;
        } else {
          data = [];
        }
      }

      if (data && data.length > 0) {
        const csv = convertToCSV(data);
        attachments.push({
          filename: `${table.name}.csv`,
          content: btoa(csv),
        });
        summary.push(`${table.name}: ${data.length} row${data.length !== 1 ? "s" : ""}`);
      }
    } catch (err) {
      const msg = `Failed to export ${table.name}: ${(err as Error).message}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  if (attachments.length === 0 && errors.length === 0) {
    console.log(`No data to backup for user ${userId}`);
    return { success: true, tablesExported: 0 };
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const label = SYSTEM_LABELS[systemType] || "Business";

  const emailBody = `
    <h2>Your ${label} Data Backup</h2>
    <p>Here is your complete data backup generated on <strong>${dateStr}</strong>.</p>
    
    <h3>📊 Data Summary</h3>
    <ul>
      ${summary.map((s) => `<li>${s}</li>`).join("")}
    </ul>
    ${attachments.length > 0 ? `<p><strong>${attachments.length} CSV file${attachments.length !== 1 ? "s" : ""}</strong> attached.</p>` : ""}
    ${errors.length > 0 ? `<h3>⚠️ Some tables could not be exported</h3><ul>${errors.map((e) => `<li>${e}</li>`).join("")}</ul>` : ""}
    <p style="color: #666; font-size: 12px;">This is an automated backup from your ${label} Management System.</p>
  `;

  try {
    const emailResponse = await resend.emails.send({
      from: "Data Backup <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Your ${label} Data Backup - ${dateStr}`,
      html: emailBody,
      attachments: attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });

    console.log(`Backup email sent to ${userEmail}:`, emailResponse);
    return { success: true, tablesExported: attachments.length };
  } catch (err) {
    const errMsg = `Failed to send email to ${userEmail}: ${(err as Error).message}`;
    console.error(errMsg);
    return { success: false, error: errMsg, tablesExported: 0 };
  }
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    const resend = new Resend(resendApiKey);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // ===== MANUAL MODE: Single user backup =====
      console.log("Manual backup triggered");

      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getUser(token);

      if (claimsError || !claimsData?.user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const user = claimsData.user;
      const userId = user.id;
      const userEmail = user.email;

      if (!userEmail) {
        return new Response(
          JSON.stringify({ error: "No email found for user" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get system type from subscription
      const { data: subscription } = await supabaseAdmin
        .from("subscriptions")
        .select("system_type")
        .eq("user_id", userId)
        .maybeSingle();

      const systemType = (subscription?.system_type as SystemType) || "business";

      console.log(`Exporting ${systemType} data for user ${userId} (${userEmail})`);

      const result = await exportUserData(supabaseAdmin, userId, userEmail, systemType, resend);

      if (result.success) {
        return new Response(
          JSON.stringify({
            message: `Backup sent to ${userEmail}`,
            tablesExported: result.tablesExported,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // ===== CRON MODE: All users backup =====
      console.log("Cron backup triggered - processing all users");

      const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

      if (usersError) {
        throw new Error(`Failed to list users: ${usersError.message}`);
      }

      const users = usersData?.users || [];
      console.log(`Found ${users.length} users to process`);

      const results: { email: string; success: boolean; error?: string }[] = [];

      for (const user of users) {
        if (!user.email) {
          console.log(`Skipping user ${user.id} - no email`);
          continue;
        }

        try {
          // Get system type
          const { data: subscription } = await supabaseAdmin
            .from("subscriptions")
            .select("system_type")
            .eq("user_id", user.id)
            .maybeSingle();

          const systemType = (subscription?.system_type as SystemType) || "business";

          console.log(`Processing user ${user.email} (${systemType})`);

          const result = await exportUserData(
            supabaseAdmin,
            user.id,
            user.email,
            systemType,
            resend
          );

          results.push({
            email: user.email,
            success: result.success,
            error: result.error,
          });
        } catch (err) {
          const errMsg = (err as Error).message;
          console.error(`Error processing user ${user.email}: ${errMsg}`);
          results.push({ email: user.email, success: false, error: errMsg });
        }
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      console.log(`Cron backup complete: ${successful} succeeded, ${failed} failed`);

      return new Response(
        JSON.stringify({
          message: `Processed ${results.length} users: ${successful} succeeded, ${failed} failed`,
          results,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const errMsg = (error as Error).message;
    console.error("Export backup error:", errMsg);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
