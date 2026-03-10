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
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // Get all active/past_due subscriptions (exclude owner-perpetual)
    const { data: allSubscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, trial_ends_at, payment_reference')
      .in('status', ['active', 'past_due']);

    const subscriptions = (allSubscriptions || []).filter(
      s => s.payment_reference !== 'OWNER-PERPETUAL'
    );

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

    // Helper: get the due date for a subscription in the current month
    const getDueDate = (sub: { trial_ends_at: string | null }) => {
      const anniversaryDay = sub.trial_ends_at ? new Date(sub.trial_ends_at).getDate() : 1;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return new Date(now.getFullYear(), now.getMonth(), Math.min(anniversaryDay, lastDay));
    };

    // Fix: Restore past_due subs back to active if their due date hasn't arrived yet
    // (corrects subscriptions incorrectly marked by old hardcoded logic)
    let restored = 0;
    for (const sub of subscriptions) {
      if (sub.status !== 'past_due') continue;
      const dueDate = getDueDate(sub);
      const isPaid = paidSubIds.has(sub.id);
      // If paid or due date hasn't arrived, restore to active
      if (isPaid || now < dueDate) {
        await supabase
          .from('subscriptions')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', sub.id);
        restored++;
      }
    }

    // Filter unpaid subs whose due date has arrived
    const unpaidSubs = subscriptions.filter(s => {
      if (paidSubIds.has(s.id)) return false;
      // If trial_ends_at exists, only expect payment from that month onward
      if (s.trial_ends_at) {
        const trialEnd = new Date(s.trial_ends_at);
        const anniversaryMonthStart = new Date(trialEnd.getFullYear(), trialEnd.getMonth(), 1);
        const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
        if (currentMonthDate < anniversaryMonthStart) return false;
      }
      // Only send reminders once the due date has arrived
      const dueDate = getDueDate(s);
      if (now < dueDate) return false;
      return true;
    });

    if (unpaidSubs.length === 0) {
      return new Response(JSON.stringify({ message: `All payments received or not yet due. Restored ${restored} subscriptions.` }), {
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
      const dueDate = getDueDate(sub);

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

      // Mark as past_due if more than 7 days past the anniversary due date
      const msSinceDue = now.getTime() - dueDate.getTime();
      const daysPastDue = msSinceDue / (1000 * 60 * 60 * 24);
      if (daysPastDue > 7 && sub.status === 'active') {
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
