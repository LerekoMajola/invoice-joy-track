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

    console.log('Starting task reminder check...');

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Get all tasks that are due today or overdue, not done, and have a reminder set
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, due_date, due_time, reminder_minutes_before, priority, status, user_id')
      .lte('due_date', todayStr)
      .neq('status', 'done')
      .not('reminder_minutes_before', 'is', null)
      .order('due_date', { ascending: true });

    if (tasksError) throw tasksError;

    if (!tasks || tasks.length === 0) {
      console.log('No tasks due for reminders');
      return new Response(
        JSON.stringify({ message: 'No tasks due for reminders', notificationsSent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${tasks.length} candidate tasks for reminders`);

    // Filter tasks whose reminder window has been reached
    const eligibleTasks = tasks.filter((task) => {
      if (task.due_date < todayStr) return true; // overdue tasks always qualify

      // For today's tasks, check if reminder time has passed
      if (task.due_time) {
        const [h, m] = task.due_time.split(':').map(Number);
        const taskDateTime = new Date(now);
        taskDateTime.setHours(h, m, 0, 0);
        const reminderTime = new Date(taskDateTime.getTime() - (task.reminder_minutes_before || 0) * 60000);
        return now >= reminderTime;
      }

      // No specific time set — treat as all-day, always eligible on due date
      return true;
    });

    if (eligibleTasks.length === 0) {
      console.log('No tasks have reached their reminder window yet');
      return new Response(
        JSON.stringify({ message: 'No tasks ready for reminders yet', notificationsSent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build notifications with unique reference_ids
    const notifications: Array<{
      user_id: string; type: string; title: string; message: string;
      link: string; reference_id: string; reference_type: string;
    }> = [];

    const pushTargets: Array<{ user_id: string; title: string; body: string; url: string }> = [];

    for (const task of eligibleTasks) {
      const isOverdue = task.due_date < todayStr;
      const timeStr = task.due_time ? ` at ${task.due_time.slice(0, 5)}` : '';

      const title = isOverdue ? 'Overdue Task' : 'Task Due Today';
      const message = isOverdue
        ? `"${task.title}" was due on ${task.due_date}`
        : `"${task.title}" is due today${timeStr}`;

      notifications.push({
        user_id: task.user_id,
        type: 'task',
        title,
        message,
        link: '/tasks',
        reference_id: task.id,
        reference_type: `task_reminder_${task.due_date}`,
      });
    }

    if (notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No notifications to create', notificationsSent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduplicate — check which (reference_id, reference_type) combos already exist
    const refIds = [...new Set(notifications.map(n => n.reference_id))];
    const refTypes = [...new Set(notifications.map(n => n.reference_type))];
    const { data: existing, error: existError } = await supabase
      .from('notifications')
      .select('reference_id, reference_type')
      .in('reference_id', refIds)
      .in('reference_type', refTypes);

    if (existError) throw existError;

    const existingKeys = new Set((existing || []).map(e => `${e.reference_id}::${e.reference_type}`));
    const newNotifications = notifications.filter(n => !existingKeys.has(`${n.reference_id}::${n.reference_type}`));

    console.log(`${newNotifications.length} new notifications (${existingKeys.size} duplicates skipped)`);

    // Insert in-app notifications
    let inAppCreated = 0;
    if (newNotifications.length > 0) {
      const { error: insertError } = await supabase.from('notifications').insert(newNotifications);
      if (insertError) {
        console.error('Failed to create in-app notifications:', insertError);
      } else {
        inAppCreated = newNotifications.length;
        console.log(`Created ${inAppCreated} in-app notifications`);
      }
    }

    // Send push notifications for new notifications only
    const userIds = [...new Set(newNotifications.map(n => n.user_id))];
    let usersWithPush = new Set<string>();

    if (userIds.length > 0) {
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('user_id')
        .in('user_id', userIds);
      if (subError) throw subError;
      usersWithPush = new Set(subscriptions?.map(s => s.user_id) || []);
    }

    // Group new notifications by user for push
    const tasksByUser: Record<string, typeof newNotifications> = {};
    for (const n of newNotifications) {
      if (!tasksByUser[n.user_id]) tasksByUser[n.user_id] = [];
      tasksByUser[n.user_id].push(n);
    }

    let pushSent = 0;
    for (const userId of userIds) {
      if (!usersWithPush.has(userId)) continue;

      const userNotifs = tasksByUser[userId];
      const overdueCount = userNotifs.filter(n => n.title === 'Overdue Task').length;
      const dueTodayCount = userNotifs.filter(n => n.title === 'Task Due Today').length;

      let pushTitle = '';
      let pushBody = '';

      if (overdueCount > 0) {
        pushTitle = `⚠️ ${overdueCount} Overdue Task${overdueCount > 1 ? 's' : ''}`;
        pushBody = userNotifs.filter(n => n.title === 'Overdue Task').slice(0, 3).map(n => n.message).join('; ');
      } else if (dueTodayCount > 0) {
        pushTitle = `📋 ${dueTodayCount} Task${dueTodayCount > 1 ? 's' : ''} Due Today`;
        pushBody = userNotifs.filter(n => n.title === 'Task Due Today').slice(0, 3).map(n => n.message).join('; ');
      }

      if (pushTitle && pushBody) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ user_id: userId, title: pushTitle, body: pushBody, url: '/tasks' }),
          });
          pushSent++;
        } catch (error) {
          console.error(`Push failed for user ${userId}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Task reminder check complete',
        totalEligible: eligibleTasks.length,
        inAppCreated,
        pushSent,
        duplicatesSkipped: existingKeys.size,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in check-task-reminders:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
