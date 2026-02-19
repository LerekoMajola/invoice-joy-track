import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find subscriptions expiring in exactly 2 days
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const { data: expiringSubs, error: subsError } = await supabase
      .from('gym_member_subscriptions')
      .select('id, member_id, plan_name, end_date, amount_paid, user_id, company_profile_id')
      .eq('end_date', targetDateStr)
      .eq('status', 'active');

    if (subsError) throw subsError;
    if (!expiringSubs || expiringSubs.length === 0) {
      return new Response(JSON.stringify({ message: 'No memberships expiring in 2 days' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let emailsSent = 0;
    let notificationsCreated = 0;

    for (const sub of expiringSubs) {
      // Get member details
      const { data: member } = await supabase
        .from('gym_members')
        .select('first_name, last_name, email, member_number')
        .eq('id', sub.member_id)
        .maybeSingle();

      if (!member?.email) continue;

      // Get gym company profile
      const { data: company } = await supabase
        .from('company_profiles')
        .select('company_name, email')
        .eq('user_id', sub.user_id)
        .maybeSingle();

      const gymName = company?.company_name || 'Your Gym';
      const planName = sub.plan_name || 'Membership Plan';
      const expiryFormatted = new Date(sub.end_date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      const portalUrl = 'https://invoice-joy-track.lovable.app/portal';

      // Send email via Resend
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Orion Labs <updates@updates.orionlabslesotho.com>',
          to: [member.email],
          subject: `Your ${gymName} membership expires in 2 days`,
          html: `
            <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
              <div style="background: #1a1a2e; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="color: #a0aec0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Member Portal</p>
                <h1 style="color: #ffffff; font-size: 22px; margin: 0;">${gymName}</h1>
              </div>

              <p style="color: #374151; font-size: 16px;">Hi ${member.first_name},</p>

              <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="color: #c2410c; font-weight: 600; margin: 0 0 4px;">⏰ Membership Expiring Soon</p>
                <p style="color: #92400e; margin: 0;">Your <strong>${planName}</strong> expires on <strong>${expiryFormatted}</strong>.</p>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                To continue enjoying access to ${gymName}, please make your renewal payment and attach your proof of payment in the member portal.
              </p>

              <div style="margin: 24px 0; text-align: center;">
                <a href="${portalUrl}" style="background: #1a1a2e; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
                  Open Member Portal →
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                Member #${member.member_number} · ${gymName}
              </p>
            </div>
          `,
        }),
      });

      if (emailRes.ok) emailsSent++;

      // Notify the gym owner
      if (sub.user_id) {
        await supabase.from('notifications').insert({
          user_id: sub.user_id,
          type: 'reminder',
          title: 'Membership Expiring Soon',
          message: `${member.first_name} ${member.last_name}'s ${planName} membership expires in 2 days (${expiryFormatted}).`,
          link: '/gym-members',
          company_profile_id: sub.company_profile_id || null,
        });
        notificationsCreated++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${expiringSubs.length} expiring memberships`,
        emailsSent,
        notificationsCreated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-gym-membership-reminders:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
