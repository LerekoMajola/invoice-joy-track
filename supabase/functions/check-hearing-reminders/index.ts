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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting hearing reminder check...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const in1Day = new Date(today);
    in1Day.setDate(in1Day.getDate() + 1);
    const in1DayStr = in1Day.toISOString().split('T')[0];

    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    const in7DaysStr = in7Days.toISOString().split('T')[0];

    // 1. Query legal_cases with upcoming hearing dates
    const { data: cases, error: casesError } = await supabase
      .from('legal_cases')
      .select('id, case_number, title, next_hearing_date, user_id')
      .neq('status', 'closed')
      .not('next_hearing_date', 'is', null)
      .gte('next_hearing_date', todayStr)
      .lte('next_hearing_date', in7DaysStr);

    if (casesError) throw casesError;

    // 2. Query legal_calendar_events with upcoming dates
    const { data: events, error: eventsError } = await supabase
      .from('legal_calendar_events')
      .select('id, case_id, title, event_date, event_time, event_type, user_id')
      .eq('is_completed', false)
      .gte('event_date', todayStr)
      .lte('event_date', in7DaysStr);

    if (eventsError) throw eventsError;

    console.log(`Found ${cases?.length || 0} cases and ${events?.length || 0} calendar events within reminder window`);

    // Collect all notifications to create
    const notifications: Array<{
      user_id: string;
      type: string;
      title: string;
      message: string;
      link: string;
      reference_id: string;
      reference_type: string;
    }> = [];

    const pushTargets: Array<{ user_id: string; title: string; body: string; url: string }> = [];

    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getReminderInfo = (dateStr: string) => {
      if (dateStr === todayStr) return { label: 'Today', prefix: '⚖️ Hearing Today' };
      if (dateStr === in1DayStr) return { label: 'Tomorrow', prefix: '⏰ Hearing Tomorrow' };
      if (dateStr === in7DaysStr) return { label: 'in 7 days', prefix: '📅 Hearing in 7 days' };
      return null; // Not on an exact reminder day
    };

    // Process cases
    for (const c of cases || []) {
      const info = getReminderInfo(c.next_hearing_date);
      if (!info) continue;

      const refId = `hearing-case-${c.id}-${c.next_hearing_date}-${info.label}`;
      const message = info.label === 'Today'
        ? `${c.case_number} - ${c.title}`
        : info.label === 'Tomorrow'
          ? `${c.case_number} - ${c.title}`
          : `${c.case_number} - ${c.title} on ${formatDate(c.next_hearing_date)}`;

      notifications.push({
        user_id: c.user_id,
        type: 'system',
        title: info.prefix,
        message,
        link: `/legal-cases/${c.id}`,
        reference_id: refId,
        reference_type: 'hearing_reminder',
      });

      pushTargets.push({
        user_id: c.user_id,
        title: info.prefix,
        body: message,
        url: `/legal-cases/${c.id}`,
      });
    }

    // Process calendar events
    for (const e of events || []) {
      const info = getReminderInfo(e.event_date);
      if (!info) continue;

      const refId = `hearing-event-${e.id}-${e.event_date}-${info.label}`;
      const timeStr = e.event_time ? ` at ${e.event_time.slice(0, 5)}` : '';
      const message = info.label === 'Today'
        ? `${e.title}${timeStr}`
        : info.label === 'Tomorrow'
          ? `${e.title}`
          : `${e.title} on ${formatDate(e.event_date)}`;

      const link = e.case_id ? `/legal-cases/${e.case_id}` : '/legal-calendar';

      notifications.push({
        user_id: e.user_id,
        type: 'system',
        title: info.prefix,
        message,
        link,
        reference_id: refId,
        reference_type: 'hearing_reminder',
      });

      pushTargets.push({
        user_id: e.user_id,
        title: info.prefix,
        body: message,
        url: link,
      });
    }

    if (notifications.length === 0) {
      console.log('No hearing reminders to send');
      return new Response(
        JSON.stringify({ message: 'No hearing reminders needed', notificationsCreated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Deduplicate - check which reference_ids already exist
    const refIds = notifications.map(n => n.reference_id);
    const { data: existing, error: existError } = await supabase
      .from('notifications')
      .select('reference_id')
      .in('reference_id', refIds);

    if (existError) throw existError;

    const existingRefs = new Set((existing || []).map(e => e.reference_id));
    const newNotifications = notifications.filter(n => !existingRefs.has(n.reference_id));
    const newPushTargets = pushTargets.filter((_, i) => !existingRefs.has(notifications[i].reference_id));

    console.log(`${newNotifications.length} new notifications (${existingRefs.size} duplicates skipped)`);

    // 4. Insert in-app notifications
    let inAppCreated = 0;
    if (newNotifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(newNotifications);

      if (insertError) {
        console.error('Failed to insert notifications:', insertError);
      } else {
        inAppCreated = newNotifications.length;
      }
    }

    // 5. Send push notifications
    const userIds = [...new Set(newPushTargets.map(t => t.user_id))];
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('user_id')
      .in('user_id', userIds);

    const usersWithPush = new Set(subscriptions?.map(s => s.user_id) || []);
    let pushSent = 0;

    for (const target of newPushTargets) {
      if (!usersWithPush.has(target.user_id)) continue;

      try {
        await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            user_id: target.user_id,
            title: target.title,
            body: target.body,
            url: target.url,
          }),
        });
        pushSent++;
      } catch (err) {
        console.error(`Push failed for user ${target.user_id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Hearing reminder check complete',
        inAppCreated,
        pushSent,
        duplicatesSkipped: existingRefs.size,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in check-hearing-reminders:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
