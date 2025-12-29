import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Flag, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
}

const initialTasks: Task[] = [
  { id: '1', title: 'Submit tender for City Council project', dueDate: 'Today', priority: 'high', status: 'todo' },
  { id: '2', title: 'Follow up on Quote #QT-0087', dueDate: 'Tomorrow', priority: 'medium', status: 'todo' },
  { id: '3', title: 'Prepare invoice for completed project', dueDate: 'Dec 31', priority: 'low', status: 'in-progress' },
  { id: '4', title: 'Review RFQ from Manufacturing Co', dueDate: 'Jan 2', priority: 'high', status: 'todo' },
  { id: '5', title: 'Update client contact information', dueDate: 'Jan 3', priority: 'low', status: 'done' },
  { id: '6', title: 'Send project proposal to TechCorp', dueDate: 'Jan 5', priority: 'medium', status: 'todo' },
];

const priorityStyles = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low: 'bg-muted text-muted-foreground border-border',
};

const statusColors = {
  todo: 'border-l-muted-foreground',
  'in-progress': 'border-l-info',
  done: 'border-l-success',
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isOpen, setIsOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    priority: 'medium' as Task['priority'],
  });

  const handleAddTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      status: 'todo',
    };
    setTasks([task, ...tasks]);
    setNewTask({ title: '', dueDate: '', priority: 'medium' });
    setIsOpen(false);
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <DashboardLayout>
      <Header 
        title="Tasks" 
        subtitle="Manage your to-do list and track progress"
        action={{
          label: 'Add Task',
          onClick: () => setIsOpen(true),
        }}
      />
      
      <div className="p-6">
        {/* Task Columns */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* To Do */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                To Do
                <Badge variant="secondary" className="ml-1">{todoTasks.length}</Badge>
              </h3>
            </div>
            <div className="space-y-3">
              {todoTasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={() => toggleTaskStatus(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  delay={index * 50}
                />
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-info" />
                In Progress
                <Badge variant="secondary" className="ml-1">{inProgressTasks.length}</Badge>
              </h3>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={() => toggleTaskStatus(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  delay={index * 50}
                />
              ))}
            </div>
          </div>

          {/* Done */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                Done
                <Badge variant="secondary" className="ml-1">{doneTasks.length}</Badge>
              </h3>
            </div>
            <div className="space-y-3">
              {doneTasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={() => toggleTaskStatus(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  delay={index * 50}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                placeholder="e.g., Tomorrow, Jan 5"
              />
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value: Task['priority']) => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function TaskCard({ 
  task, 
  onToggle, 
  onDelete,
  delay = 0 
}: { 
  task: Task; 
  onToggle: () => void; 
  onDelete: () => void;
  delay?: number;
}) {
  return (
    <div 
      className={cn(
        'rounded-lg border border-border bg-card p-4 shadow-card border-l-4 transition-all hover:shadow-elevated animate-slide-up',
        statusColors[task.status]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={task.status === 'done'}
          onCheckedChange={onToggle}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium text-card-foreground',
            task.status === 'done' && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.dueDate}
            </span>
            <Badge 
              variant="outline" 
              className={cn('text-xs capitalize', priorityStyles[task.priority])}
            >
              <Flag className="h-3 w-3 mr-1" />
              {task.priority}
            </Badge>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
