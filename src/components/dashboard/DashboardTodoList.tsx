import { useState, useMemo } from 'react';
import { useTasks, Task, TaskPriority } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  ListTodo,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'today' | 'overdue' | 'done';

const priorityConfig: Record<TaskPriority, { label: string; className: string; borderClass: string }> = {
  high: { 
    label: 'High', 
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    borderClass: 'border-l-destructive'
  },
  medium: { 
    label: 'Medium', 
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    borderClass: 'border-l-amber-500'
  },
  low: { 
    label: 'Low', 
    className: 'bg-muted text-muted-foreground border-border',
    borderClass: 'border-l-muted-foreground'
  },
};

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
}

function getDueDateColor(dateStr: string | null, status: string): string {
  if (!dateStr || status === 'done') return 'text-muted-foreground';
  const date = startOfDay(parseISO(dateStr));
  const today = startOfDay(new Date());
  if (date < today) return 'text-destructive';
  if (isToday(date)) return 'text-amber-600';
  return 'text-muted-foreground';
}

export function DashboardTodoList() {
  const { tasks, isLoading, createTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { activeTasks, completedTasks, filteredTasks, counts } = useMemo(() => {
    const active = tasks.filter(t => t.status !== 'done');
    const completed = tasks.filter(t => t.status === 'done');
    
    const today = startOfDay(new Date());
    const todayTasks = active.filter(t => t.due_date && isToday(parseISO(t.due_date)));
    const overdueTasks = active.filter(t => {
      if (!t.due_date) return false;
      return startOfDay(parseISO(t.due_date)) < today;
    });

    let filtered: Task[];
    switch (activeFilter) {
      case 'today':
        filtered = todayTasks;
        break;
      case 'overdue':
        filtered = overdueTasks;
        break;
      case 'done':
        filtered = completed;
        break;
      default:
        filtered = active;
    }

    return {
      activeTasks: active,
      completedTasks: completed,
      filteredTasks: filtered,
      counts: {
        all: active.length,
        today: todayTasks.length,
        overdue: overdueTasks.length,
        done: completed.length,
      },
    };
  }, [tasks, activeFilter]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    await createTask.mutateAsync({
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      due_date: newTaskDueDate ? format(newTaskDueDate, 'yyyy-MM-dd') : undefined,
    });

    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskDueDate(undefined);
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskTitle('');
    }
  };

  const filterTabs: { key: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'all', label: 'All', icon: <ListTodo className="h-3.5 w-3.5" />, count: counts.all },
    { key: 'today', label: 'Today', icon: <Clock className="h-3.5 w-3.5" />, count: counts.today },
    { key: 'overdue', label: 'Overdue', icon: <AlertCircle className="h-3.5 w-3.5" />, count: counts.overdue },
    { key: 'done', label: 'Done', icon: <CheckCircle2 className="h-3.5 w-3.5" />, count: counts.done },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListTodo className="h-5 w-5 text-primary" />
            My Tasks
            {counts.all > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {counts.all}
              </Badge>
            )}
          </CardTitle>
          {!isAdding && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAdding(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {filterTabs.map(tab => (
            <Button
              key={tab.key}
              variant={activeFilter === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "gap-1.5 h-8 text-xs",
                activeFilter === tab.key 
                  ? '' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "ml-0.5 text-xs",
                  activeFilter === tab.key 
                    ? 'text-primary-foreground/80' 
                    : 'text-muted-foreground'
                )}>
                  ({tab.count})
                </span>
              )}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Quick Add Form */}
        {isAdding && (
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-3 animate-fade-in">
            <Input
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border-0 bg-background focus-visible:ring-1"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Priority Selector */}
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                    <Button
                      key={p}
                      variant={newTaskPriority === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewTaskPriority(p)}
                      className={cn(
                        "h-7 text-xs capitalize",
                        newTaskPriority !== p && priorityConfig[p].className
                      )}
                    >
                      {p}
                    </Button>
                  ))}
                </div>

                {/* Due Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {newTaskDueDate ? format(newTaskDueDate, 'MMM d') : 'Due date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTaskDueDate}
                      onSelect={setNewTaskDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTaskTitle('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim() || createTask.isPending}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {activeFilter === 'all' && !isAdding && (
              <div className="space-y-2">
                <ListTodo className="h-10 w-10 mx-auto opacity-40" />
                <p>No tasks yet. Add one to get started!</p>
              </div>
            )}
            {activeFilter === 'today' && <p>No tasks due today 🎉</p>}
            {activeFilter === 'overdue' && <p>No overdue tasks 👍</p>}
            {activeFilter === 'done' && <p>No completed tasks yet</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => toggleTaskStatus.mutate({ id: task.id, currentStatus: task.status })}
                onDelete={() => deleteTask.mutate(task.id)}
                onUpdate={(updates) => updateTask.mutate({ id: task.id, ...updates })}
              />
            ))}
          </div>
        )}

        {/* Completed Tasks Toggle (only show in 'all' filter) */}
        {activeFilter === 'all' && completedTasks.length > 0 && (
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full justify-start text-muted-foreground hover:text-foreground gap-2"
            >
              {showCompleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showCompleted ? 'Hide' : 'Show'} {completedTasks.length} completed
            </Button>
            {showCompleted && (
              <div className="mt-2 space-y-2 animate-fade-in">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTaskStatus.mutate({ id: task.id, currentStatus: task.status })}
                    onDelete={() => deleteTask.mutate(task.id)}
                    onUpdate={(updates) => updateTask.mutate({ id: task.id, ...updates })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
}

function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const isDone = task.status === 'done';
  const priority = priorityConfig[task.priority];

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border-l-4 bg-card hover:bg-accent/50 transition-all duration-200",
        priority.borderClass,
        isDone && "opacity-60"
      )}
    >
      <Checkbox
        checked={isDone}
        onCheckedChange={onToggle}
        className="h-5 w-5 rounded-full"
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-sm truncate transition-all",
          isDone && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        {task.due_date && (
          <p className={cn(
            "text-xs mt-0.5 flex items-center gap-1",
            getDueDateColor(task.due_date, task.status)
          )}>
            <CalendarIcon className="h-3 w-3" />
            {formatDueDate(task.due_date)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Badge 
          variant="outline" 
          className={cn("text-xs capitalize", priority.className)}
        >
          {task.priority}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
