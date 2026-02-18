import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TYPE_TO_CATEGORY: Record<string, string> = {
  task: "task",
  invoice: "invoice",
  quote: "quote",
  lead: "lead",
  tender: "tender",
  system: "system",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notification_id, user_id, title, message, type, link } = await req.json();

    if (!user_id || !message) {
      return new Response(
        JSON.stringify({ error: "user_id and message required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check user's notification preferences
    const { data: prefs } = await supabaseAdmin
      .from("notification_preferences")
      .select("email_enabled, category_preferences")
      .eq("user_id", user_id)
      .maybeSingle();

    // If email is globally disabled or no prefs (default is disabled), skip
    if (!prefs || !prefs.email_enabled) {
      console.log("Email disabled for user", user_id);
      return new Response(
        JSON.stringify({ skipped: true, reason: "email_disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check per-category preference
    const notifType = type || null;
    if (notifType) {
      const category = TYPE_TO_CATEGORY[notifType] || notifType;
      const catPrefs = (prefs.category_preferences as Record<string, any>)?.[category];
      if (catPrefs && catPrefs.email === false) {
        console.log(`Email disabled for category ${category}, user ${user_id}`);
        return new Response(
          JSON.stringify({ skipped: true, reason: "category_email_disabled" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get user's email from auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    if (authError || !authUser?.user?.email) {
      console.log("No email for user", user_id);
      return new Response(
        JSON.stringify({ skipped: true, reason: "no_email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipientEmail = authUser.user.email;

    // Build email HTML
    const appUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "").replace("https://", "") || "";
    const linkUrl = link ? `https://invoice-joy-track.lovable.app${link}` : "";

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1a1a2e; margin: 0; font-size: 20px;">Orion Labs</h2>
        </div>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 16px;">${title || "Notification"}</h3>
          <p style="color: #4a4a5a; margin: 0; font-size: 14px; line-height: 1.6;">${message}</p>
        </div>
        ${linkUrl ? `<div style="text-align: center; margin-bottom: 24px;">
          <a href="${linkUrl}" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">View Details</a>
        </div>` : ""}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          You received this because email notifications are enabled in your settings.
        </p>
      </div>
    `;

    // Send via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Orion Labs <updates@updates.orionlabslesotho.com>",
        to: [recipientEmail],
        subject: title || "Notification from Orion Labs",
        html: emailHtml,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendResult);
      throw new Error(`Resend error: ${JSON.stringify(resendResult)}`);
    }

    console.log(`Email sent to ${recipientEmail} for notification ${notification_id}`);

    return new Response(
      JSON.stringify({ success: true, emailId: resendResult.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-email-notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
