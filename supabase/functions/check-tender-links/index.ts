 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
 };
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     console.log("Checking for stale tender source links...");
 
     // Get all tender source links that haven't been visited in 2+ days
     const twoDaysAgo = new Date();
     twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
     const twoDaysAgoISO = twoDaysAgo.toISOString();
 
     // Get links that are stale (last_visited_at is null or older than 2 days)
     const { data: staleLinks, error: linksError } = await supabase
       .from("tender_source_links")
       .select("id, user_id, name, last_visited_at, company_profile_id")
       .or(`last_visited_at.is.null,last_visited_at.lt.${twoDaysAgoISO}`);
 
     if (linksError) {
       console.error("Error fetching stale links:", linksError);
       throw linksError;
     }
 
     console.log(`Found ${staleLinks?.length || 0} stale tender links`);
 
     let notificationsCreated = 0;
 
     for (const link of staleLinks || []) {
       // Check if we already have an unread notification for this link
       const { data: existingNotification } = await supabase
         .from("notifications")
         .select("id")
         .eq("user_id", link.user_id)
         .eq("reference_id", link.id)
         .eq("reference_type", "tender_source_link")
         .eq("is_read", false)
         .single();
 
       if (existingNotification) {
         console.log(`Notification already exists for link: ${link.name}`);
         continue;
       }
 
       // Create notification
       const daysStale = link.last_visited_at
         ? Math.floor(
             (Date.now() - new Date(link.last_visited_at).getTime()) /
               (1000 * 60 * 60 * 24)
           )
         : null;
 
       const message = daysStale
         ? `You haven't checked "${link.name}" in ${daysStale} days. New tenders may be available!`
         : `You've never visited "${link.name}". Check it for tender opportunities!`;
 
       const { error: notifError } = await supabase
         .from("notifications")
         .insert({
            user_id: link.user_id,
            company_profile_id: link.company_profile_id,
            type: "system",
           title: "🔔 Tender Source Needs Attention",
           message,
           reference_id: link.id,
           reference_type: "tender_source_link",
           link: "/dashboard",
         });
 
       if (notifError) {
         console.error(`Error creating notification for ${link.name}:`, notifError);
       } else {
         notificationsCreated++;
         console.log(`Created notification for stale link: ${link.name}`);
       }
     }
 
     console.log(`Created ${notificationsCreated} new notifications`);
 
     return new Response(
       JSON.stringify({
         success: true,
         staleLinksFound: staleLinks?.length || 0,
         notificationsCreated,
       }),
       {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
         status: 200,
       }
     );
   } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     console.error("Error in check-tender-links:", errorMessage);
     return new Response(
       JSON.stringify({ error: errorMessage }),
       {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
         status: 500,
       }
     );
   }
 });