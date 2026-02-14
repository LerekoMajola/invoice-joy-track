import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Default SMS credits per plan
const PLAN_DEFAULTS: Record<string, number> = {
  free_trial: 10,
  basic: 50,
  standard: 200,
  pro: 500,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notification_id, user_id, title, message } = await req.json();

    if (!user_id || !message) {
      return new Response(
        JSON.stringify({ error: "user_id and message required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user's phone from company_profiles
    const { data: profile } = await supabaseAdmin
      .from("company_profiles")
      .select("phone")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!profile?.phone) {
      console.log("No phone number for user", user_id);
      return new Response(
        JSON.stringify({ skipped: true, reason: "no_phone" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auto-create credits for current month if they don't exist
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    const { data: existingCredits } = await supabaseAdmin
      .from("sms_credits")
      .select("id")
      .eq("user_id", user_id)
      .eq("month", currentMonth)
      .maybeSingle();

    if (!existingCredits) {
      // Look up subscription plan to determine default credits
      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user_id)
        .maybeSingle();

      const defaultCredits = PLAN_DEFAULTS[sub?.plan || "free_trial"] || 10;

      await supabaseAdmin.from("sms_credits").insert({
        user_id,
        month: currentMonth,
        credits_allocated: defaultCredits,
        credits_used: 0,
      });
    }

    // Build SMS text
    const smsText = title ? `${title}: ${message}` : message;
    const truncated = smsText.length > 160 ? smsText.slice(0, 157) + "..." : smsText;

    // Call the send-sms function
    const sendResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-sms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          user_id,
          phone: profile.phone,
          message: truncated,
          notification_id,
        }),
      }
    );

    const result = await sendResponse.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-sms-on-notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
