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

    // Group tasks by user
    const tasksByUser: Record<string, typeof eligibleTasks> = {};
    for (const task of eligibleTasks) {
      if (!tasksByUser[task.user_id]) tasksByUser[task.user_id] = [];
      tasksByUser[task.user_id].push(task);
    }

    const userIds = Object.keys(tasksByUser);

    // Find users with push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('user_id')
      .in('user_id', userIds);
    if (subError) throw subError;
    const usersWithPush = new Set(subscriptions?.map(s => s.user_id) || []);

    // Create in-app notifications
    const inAppNotifications: Array<{
      user_id: string; type: string; title: string; message: string;
      link: string; reference_id: string; reference_type: string;
    }> = [];

    for (const userId of userIds) {
      const userTasks = tasksByUser[userId];
      const overdueTasks = userTasks.filter(t => t.due_date < todayStr);
      const dueTodayTasks = userTasks.filter(t => t.due_date === todayStr);

      for (const task of overdueTasks) {
        inAppNotifications.push({
          user_id: userId, type: 'task', title: 'Overdue Task',
          message: `"${task.title}" was due on ${task.due_date}`,
          link: '/tasks', reference_id: task.id, reference_type: 'task',
        });
      }
      for (const task of dueTodayTasks) {
        const timeStr = task.due_time ? ` at ${task.due_time.slice(0, 5)}` : '';
        inAppNotifications.push({
          user_id: userId, type: 'task', title: 'Task Due Today',
          message: `"${task.title}" is due today${timeStr}`,
          link: '/tasks', reference_id: task.id, reference_type: 'task',
        });
      }
    }

    let inAppNotificationsCreated = 0;
    if (inAppNotifications.length > 0) {
      const { error: insertError } = await supabase.from('notifications').insert(inAppNotifications);
      if (insertError) {
        console.error('Failed to create in-app notifications:', insertError);
      } else {
        inAppNotificationsCreated = inAppNotifications.length;
        console.log(`Created ${inAppNotificationsCreated} in-app notifications`);
      }
    }

    // Send push notifications
    let notificationsSent = 0;
    const results: Array<{ userId: string; status: string; result?: unknown; error?: string }> = [];

    for (const userId of userIds) {
      if (!usersWithPush.has(userId)) continue;

      const userTasks = tasksByUser[userId];
      const overdueTasks = userTasks.filter(t => t.due_date < todayStr);
      const dueTodayTasks = userTasks.filter(t => t.due_date === todayStr);
      const highPriorityTasks = userTasks.filter(t => t.priority === 'high');

      let title = '';
      let body = '';

      if (overdueTasks.length > 0) {
        title = `⚠️ ${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`;
        body = overdueTasks.slice(0, 3).map(t => t.title).join(', ');
        if (overdueTasks.length > 3) body += ` and ${overdueTasks.length - 3} more`;
      } else if (highPriorityTasks.length > 0) {
        title = `🔴 ${highPriorityTasks.length} High Priority Task${highPriorityTasks.length > 1 ? 's' : ''} Due`;
        body = highPriorityTasks.slice(0, 3).map(t => t.title).join(', ');
        if (highPriorityTasks.length > 3) body += ` and ${highPriorityTasks.length - 3} more`;
      } else if (dueTodayTasks.length > 0) {
        title = `📋 ${dueTodayTasks.length} Task${dueTodayTasks.length > 1 ? 's' : ''} Due Today`;
        body = dueTodayTasks.slice(0, 3).map(t => t.title).join(', ');
        if (dueTodayTasks.length > 3) body += ` and ${dueTodayTasks.length - 3} more`;
      }

      if (title && body) {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ user_id: userId, title, body, url: '/tasks' }),
          });
          const result = await response.json();
          results.push({ userId, status: 'sent', result });
          notificationsSent++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Failed to send notification to user ${userId}:`, error);
          results.push({ userId, status: 'failed', error: errorMessage });
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Task reminder check complete',
        totalTasksDue: eligibleTasks.length,
        usersWithTasks: userIds.length,
        usersWithPush: usersWithPush.size,
        notificationsSent,
        inAppNotificationsCreated,
        results,
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
