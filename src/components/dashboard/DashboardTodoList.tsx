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
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'today' | 'overdue' | 'done';

const priorityConfig: Record<TaskPriority, { label: string; className: string; borderClass: string; gradient: string; flash?: boolean }> = {
  high: { 
    label: 'High', 
    className: 'bg-gradient-to-r from-destructive to-coral text-white border-0',
    borderClass: 'border-l-destructive',
    gradient: 'from-destructive to-coral',
    flash: true
  },
  medium: { 
    label: 'Medium', 
    className: 'bg-gradient-to-r from-amber-500 to-warning text-white border-0',
    borderClass: 'border-l-amber-500',
    gradient: 'from-amber-500 to-warning',
  },
  low: { 
    label: 'Low', 
    className: 'bg-gradient-to-r from-success to-accent text-white border-0',
    borderClass: 'border-l-emerald-500',
    gradient: 'from-success to-accent',
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
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-violet text-white">
              <ListTodo className="h-4 w-4" />
            </div>
            My Tasks
            {counts.all > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs rounded-full">
                {counts.all}
              </Badge>
            )}
          </CardTitle>
          {!isAdding && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAdding(true)}
              className="gap-1.5 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>

        {/* Filter Tabs - Horizontally scrollable on mobile */}
        <div className="flex gap-1 mt-3 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
          {filterTabs.map(tab => (
            <Button
              key={tab.key}
              variant={activeFilter === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "gap-1.5 h-9 md:h-8 text-xs min-touch shrink-0 rounded-xl transition-all duration-200",
                activeFilter === tab.key 
                  ? 'shadow-glow-sm' 
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
          <div className="p-3 md:p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-violet/5 space-y-3 animate-scale-in">
            <Input
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border-0 bg-background focus-visible:ring-2 focus-visible:ring-primary/30 h-11 md:h-10 rounded-xl"
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Priority Selector */}
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                    <Button
                      key={p}
                      variant={newTaskPriority === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewTaskPriority(p)}
                      className={cn(
                        "h-9 md:h-7 text-xs capitalize min-w-[60px] rounded-lg transition-all duration-200",
                        newTaskPriority === p && priorityConfig[p].className
                      )}
                    >
                      {p}
                    </Button>
                  ))}
                </div>

                {/* Due Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 md:h-7 gap-1.5 rounded-lg">
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

              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 md:flex-none h-10 md:h-8 rounded-lg"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTaskTitle('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="gradient"
                  className="flex-1 md:flex-none h-10 md:h-8 rounded-lg"
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
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-violet/10 flex items-center justify-center">
                  <ListTodo className="h-8 w-8 text-primary/50" />
                </div>
                <p>No tasks yet. Add one to get started!</p>
              </div>
            )}
            {activeFilter === 'today' && (
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="h-8 w-8 text-success animate-pulse" />
                <p>No tasks due today 🎉</p>
              </div>
            )}
            {activeFilter === 'overdue' && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <p>No overdue tasks 👍</p>
              </div>
            )}
            {activeFilter === 'done' && <p>No completed tasks yet</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => toggleTaskStatus.mutate({ id: task.id, currentStatus: task.status })}
                onDelete={() => deleteTask.mutate(task.id)}
                onUpdate={(updates) => updateTask.mutate({ id: task.id, ...updates })}
                index={index}
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
                {completedTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTaskStatus.mutate({ id: task.id, currentStatus: task.status })}
                    onDelete={() => deleteTask.mutate(task.id)}
                    onUpdate={(updates) => updateTask.mutate({ id: task.id, ...updates })}
                    index={index}
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
  index?: number;
}

function TaskCard({ task, onToggle, onDelete, index = 0 }: TaskCardProps) {
  const isDone = task.status === 'done';
  const priority = priorityConfig[task.priority];
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggle = () => {
    if (!isDone) {
      setIsCompleting(true);
      setTimeout(() => {
        setIsCompleting(false);
        onToggle();
      }, 300);
    } else {
      onToggle();
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 md:p-3 rounded-xl border-l-4 bg-card hover:bg-accent/30 transition-all duration-300 hover:shadow-card animate-slide-up",
        priority.borderClass,
        isDone && "opacity-60",
        isCompleting && "scale-95 opacity-50"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Checkbox
        checked={isDone}
        onCheckedChange={handleToggle}
        className={cn(
          "h-6 w-6 md:h-5 md:w-5 rounded-full shrink-0 transition-all duration-200",
          !isDone && "border-2 hover:border-primary hover:scale-110",
          isCompleting && "bg-success border-success animate-bounce-in"
        )}
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

      {/* Urgency Meter - Always Visible */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold capitalize shadow-sm",
            priority.className,
            priority.flash && !isDone && "animate-urgent-flash"
          )}
        >
          {task.priority}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-9 w-9 md:h-7 md:w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
