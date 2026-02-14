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
    const { user_id, phone, message, notification_id } = await req.json();

    if (!user_id || !phone || !message) {
      return new Response(
        JSON.stringify({ error: "user_id, phone, and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check SMS credits for current month
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    const { data: credits } = await supabaseAdmin
      .from("sms_credits")
      .select("*")
      .eq("user_id", user_id)
      .eq("month", currentMonth)
      .maybeSingle();

    if (!credits || credits.credits_used >= credits.credits_allocated) {
      // Log the failed attempt
      await supabaseAdmin.from("sms_log").insert({
        user_id,
        phone_number: phone,
        message,
        status: "no_credits",
        notification_id,
      });

      return new Response(
        JSON.stringify({ error: "No SMS credits remaining" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Africa's Talking API
    const atApiKey = Deno.env.get("AT_API_KEY")!;
    const atUsername = Deno.env.get("AT_USERNAME")!;

    const formBody = new URLSearchParams({
      username: atUsername,
      to: phone,
      message: message,
    });

    const atResponse = await fetch(
      "https://api.africastalking.com/version1/messaging",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          apiKey: atApiKey,
          Accept: "application/json",
        },
        body: formBody.toString(),
      }
    );

    const atResult = await atResponse.json();
    const recipients = atResult?.SMSMessageData?.Recipients || [];
    const firstRecipient = recipients[0];
    const status = firstRecipient?.statusCode === 101 ? "sent" : "failed";
    const atMessageId = firstRecipient?.messageId || null;

    // Log the SMS
    await supabaseAdmin.from("sms_log").insert({
      user_id,
      phone_number: phone,
      message,
      status,
      at_message_id: atMessageId,
      notification_id,
    });

    // Decrement credits on success
    if (status === "sent") {
      await supabaseAdmin
        .from("sms_credits")
        .update({ credits_used: credits.credits_used + 1 })
        .eq("id", credits.id);
    }

    return new Response(
      JSON.stringify({ success: status === "sent", status, at_message_id: atMessageId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-sms error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
