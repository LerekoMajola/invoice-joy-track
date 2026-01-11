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

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Find all tasks that are due today or overdue and not done
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, due_date, priority, status, user_id')
      .lte('due_date', todayStr)
      .neq('status', 'done')
      .order('due_date', { ascending: true });

    if (tasksError) {
      throw tasksError;
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No tasks due for reminders', notificationsSent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group tasks by user
    const tasksByUser: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      if (!tasksByUser[task.user_id]) {
        tasksByUser[task.user_id] = [];
      }
      tasksByUser[task.user_id].push(task);
    }

    // Find users who have push subscriptions
    const userIds = Object.keys(tasksByUser);
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('user_id')
      .in('user_id', userIds);

    if (subError) {
      throw subError;
    }

    const usersWithPush = new Set(subscriptions?.map(s => s.user_id) || []);
    
    let notificationsSent = 0;
    const results = [];

    for (const userId of userIds) {
      if (!usersWithPush.has(userId)) {
        continue; // Skip users without push subscriptions
      }

      const userTasks = tasksByUser[userId];
      const overdueTasks = userTasks.filter(t => t.due_date < todayStr);
      const dueTodayTasks = userTasks.filter(t => t.due_date === todayStr);
      const highPriorityTasks = userTasks.filter(t => t.priority === 'high');

      let title = '';
      let body = '';

      if (overdueTasks.length > 0) {
        title = `⚠️ ${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`;
        body = overdueTasks.slice(0, 3).map(t => t.title).join(', ');
        if (overdueTasks.length > 3) {
          body += ` and ${overdueTasks.length - 3} more`;
        }
      } else if (highPriorityTasks.length > 0) {
        title = `🔴 ${highPriorityTasks.length} High Priority Task${highPriorityTasks.length > 1 ? 's' : ''} Due Today`;
        body = highPriorityTasks.slice(0, 3).map(t => t.title).join(', ');
        if (highPriorityTasks.length > 3) {
          body += ` and ${highPriorityTasks.length - 3} more`;
        }
      } else if (dueTodayTasks.length > 0) {
        title = `📋 ${dueTodayTasks.length} Task${dueTodayTasks.length > 1 ? 's' : ''} Due Today`;
        body = dueTodayTasks.slice(0, 3).map(t => t.title).join(', ');
        if (dueTodayTasks.length > 3) {
          body += ` and ${dueTodayTasks.length - 3} more`;
        }
      }

      if (title && body) {
        // Call send-push-notification function
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              user_id: userId,
              title,
              body,
              url: '/tasks',
            }),
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
        totalTasksDue: tasks.length,
        usersWithTasks: userIds.length,
        usersWithPush: usersWithPush.size,
        notificationsSent,
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
