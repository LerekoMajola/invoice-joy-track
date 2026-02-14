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
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const dayOfMonth = now.getDate();
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // Only send reminders after the 5th of the month
    if (dayOfMonth < 5) {
      return new Response(JSON.stringify({ message: 'Too early in month for reminders' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all active/past_due subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status')
      .in('status', ['active', 'past_due']);

    if (subsError) throw subsError;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscriptions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get payments for current month
    const subIds = subscriptions.map(s => s.id);
    const { data: payments, error: payError } = await supabase
      .from('subscription_payments')
      .select('subscription_id, status')
      .in('subscription_id', subIds)
      .eq('month', currentMonthStart);

    if (payError) throw payError;

    const paidSubIds = new Set(
      (payments || []).filter(p => p.status === 'paid').map(p => p.subscription_id)
    );

    // Get company names for unpaid subscriptions
    const unpaidSubs = subscriptions.filter(s => !paidSubIds.has(s.id));
    if (unpaidSubs.length === 0) {
      return new Response(JSON.stringify({ message: 'All payments received' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const unpaidUserIds = unpaidSubs.map(s => s.user_id);
    const { data: profiles } = await supabase
      .from('company_profiles')
      .select('user_id, company_name')
      .in('user_id', unpaidUserIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p.company_name]));

    // Get admin user IDs
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin');

    const adminIds = (adminRoles || []).map(r => r.user_id);
    const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    let notificationsCreated = 0;

    for (const sub of unpaidSubs) {
      const companyName = profileMap.get(sub.user_id) || 'Unknown Company';

      // Notify the client
      await supabase.from('notifications').insert({
        user_id: sub.user_id,
        type: 'invoice',
        title: 'Subscription Payment Outstanding',
        message: `Your subscription payment for ${monthLabel} is outstanding. Please make your payment to avoid service interruption.`,
        link: '/billing',
      });
      notificationsCreated++;

      // Notify all admins
      for (const adminId of adminIds) {
        await supabase.from('notifications').insert({
          user_id: adminId,
          type: 'invoice',
          title: 'Payment Outstanding',
          message: `Payment outstanding from ${companyName} for ${monthLabel}`,
          link: '/admin',
        });
        notificationsCreated++;
      }

      // If past the 7th, update status to past_due
      if (dayOfMonth > 7 && sub.status === 'active') {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('id', sub.id);
      }
    }

    return new Response(
      JSON.stringify({ message: `Processed ${unpaidSubs.length} unpaid subscriptions, created ${notificationsCreated} notifications` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-payment-reminders:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
