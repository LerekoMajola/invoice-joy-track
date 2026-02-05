 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
 import { Resend } from "https://esm.sh/resend@2.0.0";
 
 const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 interface PasswordResetRequest {
   email: string;
   redirectUrl: string;
 }
 
 const handler = async (req: Request): Promise<Response> => {
   // Handle CORS preflight requests
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { email, redirectUrl }: PasswordResetRequest = await req.json();
 
     // Validate required fields
     if (!email) {
       throw new Error("Email is required");
     }
 
     console.log(`Processing password reset request for: ${email}`);
 
     // Create Supabase admin client to generate reset link
     const supabaseAdmin = createClient(
       Deno.env.get("SUPABASE_URL") ?? "",
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
       { auth: { autoRefreshToken: false, persistSession: false } }
     );
 
     // Generate password reset link
     const { data, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
       type: "recovery",
       email: email,
       options: {
         redirectTo: redirectUrl || `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}/reset-password`,
       },
     });
 
     if (resetError) {
       console.error("Error generating reset link:", resetError);
       // Don't reveal if email exists or not for security
       return new Response(
         JSON.stringify({ success: true, message: "If an account exists, a reset email has been sent." }),
         { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     const resetLink = data?.properties?.action_link;
 
     if (!resetLink) {
       console.error("No reset link generated");
       return new Response(
         JSON.stringify({ success: true, message: "If an account exists, a reset email has been sent." }),
         { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     console.log("Reset link generated successfully");
 
     // Send email via Resend
     const emailResponse = await resend.emails.send({
       from: "Orion Labs <noreply@orionlabs.co.bw>",
       to: [email],
       subject: "Reset your password - Orion Labs",
       html: `
         <!DOCTYPE html>
         <html>
         <head>
           <meta charset="utf-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
         </head>
         <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
           <div style="text-align: center; margin-bottom: 30px;">
             <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Orion Labs</h1>
           </div>
           
           <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
             <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">Reset Your Password</h2>
             <p style="color: #4b5563; margin-bottom: 20px;">
               You requested to reset your password. Click the button below to set a new password:
             </p>
             <div style="text-align: center; margin: 30px 0;">
               <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                 Reset Password
               </a>
             </div>
             <p style="color: #6b7280; font-size: 14px;">
               Or copy and paste this link into your browser:
             </p>
             <p style="color: #2563eb; font-size: 14px; word-break: break-all;">
               ${resetLink}
             </p>
           </div>
           
           <div style="text-align: center; color: #9ca3af; font-size: 12px;">
             <p>If you didn't request this password reset, you can safely ignore this email.</p>
             <p>This link will expire in 1 hour.</p>
             <p style="margin-top: 20px;">© ${new Date().getFullYear()} Orion Labs. All rights reserved.</p>
           </div>
         </body>
         </html>
       `,
     });
 
     console.log("Password reset email sent successfully:", emailResponse);
 
     return new Response(
       JSON.stringify({ success: true, message: "If an account exists, a reset email has been sent." }),
       { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
     );
   } catch (error: any) {
     console.error("Error in send-password-reset function:", error);
     return new Response(
       JSON.stringify({ error: error.message }),
       { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
     );
   }
 };
 
 serve(handler);