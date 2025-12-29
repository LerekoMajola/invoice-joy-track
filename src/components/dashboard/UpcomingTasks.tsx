import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const tasks = [
  {
    id: 1,
    title: 'Submit tender for City Council project',
    dueDate: 'Today',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Follow up on Quote #QT-0087',
    dueDate: 'Tomorrow',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Prepare invoice for completed project',
    dueDate: 'Dec 31',
    priority: 'low',
  },
  {
    id: 4,
    title: 'Review RFQ from Manufacturing Co',
    dueDate: 'Jan 2',
    priority: 'high',
  },
];

const priorityStyles = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low: 'bg-muted text-muted-foreground border-border',
};

export function UpcomingTasks() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-card-foreground">
          Upcoming Tasks
        </h3>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-4 space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">
                {task.title}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{task.dueDate}</span>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn('ml-2 capitalize', priorityStyles[task.priority])}
            >
              {task.priority}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
