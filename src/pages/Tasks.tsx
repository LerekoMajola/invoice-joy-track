 import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useTasks, Task, TaskPriority, TaskStatus } from '@/hooks/useTasks';
import { useStaff } from '@/hooks/useStaff';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Calendar } from '@/components/ui/calendar';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Badge } from '@/components/ui/badge';
 import { 
   Calendar as CalendarIcon, 
   Search, 
   ListTodo, 
   Clock, 
   AlertCircle, 
   CheckCircle2, 
   Grid3X3,
   Filter,
   X
 } from 'lucide-react';
 import { TaskListItem, TaskDetailPanel, TaskCalendarView } from '@/components/tasks';
 import { ConfirmDialog } from '@/components/ui/confirm-dialog';
 import { useConfirmDialog } from '@/hooks/useConfirmDialog';
 import { format, parseISO, isToday, startOfDay, isPast } from 'date-fns';
 import { toast } from 'sonner';
import { cn } from '@/lib/utils';

 type FilterTab = 'all' | 'today' | 'overdue' | 'done';
 type ViewMode = 'list' | 'calendar';

export default function Tasks() {
  const { tasks, isLoading, createTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  const { staff } = useStaff();
  const [isOpen, setIsOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: undefined as Date | undefined,
    priority: 'medium' as TaskPriority,
    assignedTo: '' as string,
  });
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { confirmDialog, openConfirmDialog, closeConfirmDialog, handleConfirm } = useConfirmDialog();
 
   const { filteredTasks, counts } = useMemo(() => {
     const today = startOfDay(new Date());
     const active = tasks.filter(t => t.status !== 'done');
     const completed = tasks.filter(t => t.status === 'done');
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
 
     // Apply search filter
     if (searchQuery.trim()) {
       const query = searchQuery.toLowerCase();
       filtered = filtered.filter(t => 
         t.title.toLowerCase().includes(query) ||
         t.description?.toLowerCase().includes(query)
       );
     }
 
     // Apply priority filter
      if (priorityFilter !== 'all') {
        filtered = filtered.filter(t => t.priority === priorityFilter);
      }

      // Apply assignee filter
      if (assigneeFilter === 'unassigned') {
        filtered = filtered.filter(t => !t.assigned_to);
      } else if (assigneeFilter !== 'all') {
        filtered = filtered.filter(t => t.assigned_to === assigneeFilter);
      }
 
     return {
       filteredTasks: filtered,
       counts: {
         all: active.length,
         today: todayTasks.length,
         overdue: overdueTasks.length,
         done: completed.length,
       },
     };
   }, [tasks, activeFilter, searchQuery, priorityFilter, assigneeFilter]);
 
  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    const selectedStaff = staff.find(s => s.id === newTask.assignedTo);
    
    await createTask.mutateAsync({
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      due_date: newTask.dueDate ? format(newTask.dueDate, 'yyyy-MM-dd') : undefined,
      priority: newTask.priority,
      assigned_to: selectedStaff?.id,
      assigned_to_name: selectedStaff?.name,
    });

    setNewTask({ title: '', description: '', dueDate: undefined, priority: 'medium', assignedTo: '' });
    setIsOpen(false);
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    openConfirmDialog({
      title: 'Delete Task',
      description: `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
       action: () => {
         deleteTask.mutate(taskId);
         if (selectedTask?.id === taskId) {
           setDetailOpen(false);
           setSelectedTask(null);
         }
       },
    });
  };

   const handleTaskClick = (task: Task) => {
     setSelectedTask(task);
     setDetailOpen(true);
   };
 
   const handleTaskUpdate = (updates: Partial<Task>) => {
     if (selectedTask) {
       updateTask.mutate({ id: selectedTask.id, ...updates });
       setSelectedTask({ ...selectedTask, ...updates } as Task);
     }
   };
 
   const filterTabs: { key: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
     { key: 'all', label: 'All', icon: <ListTodo className="h-4 w-4" />, count: counts.all },
     { key: 'today', label: 'Today', icon: <Clock className="h-4 w-4" />, count: counts.today },
     { key: 'overdue', label: 'Overdue', icon: <AlertCircle className="h-4 w-4" />, count: counts.overdue },
     { key: 'done', label: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, count: counts.done },
   ];

  return (
    <DashboardLayout>
      <Header 
        title="Tasks" 
         subtitle={`${counts.all} active tasks`}
        action={{
          label: 'Add Task',
          onClick: () => setIsOpen(true),
        }}
      />
      
       <div className="p-4 md:p-6 space-y-4">
         {/* Search and Filters Bar */}
         <div className="flex flex-col sm:flex-row gap-3">
           {/* Search */}
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search tasks..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 h-10 rounded-xl"
             />
             {searchQuery && (
               <Button
                 variant="ghost"
                 size="icon"
                 className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                 onClick={() => setSearchQuery('')}
               >
                 <X className="h-4 w-4" />
               </Button>
             )}
           </div>
 
           {/* Priority Filter */}
           <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
             <SelectTrigger className="w-full sm:w-[140px] rounded-xl">
               <Filter className="h-4 w-4 mr-2" />
               <SelectValue placeholder="Priority" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Priorities</SelectItem>
               <SelectItem value="high">High</SelectItem>
               <SelectItem value="medium">Medium</SelectItem>
               <SelectItem value="low">Low</SelectItem>
             </SelectContent>
            </Select>

            {/* Assignee Filter */}
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-full sm:w-[160px] rounded-xl">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

           {/* View Toggle */}
           <div className="flex border rounded-xl overflow-hidden">
             <Button
               variant={viewMode === 'list' ? 'default' : 'ghost'}
               size="sm"
               className="rounded-none gap-1.5"
               onClick={() => setViewMode('list')}
             >
               <ListTodo className="h-4 w-4" />
               <span className="hidden sm:inline">List</span>
             </Button>
             <Button
               variant={viewMode === 'calendar' ? 'default' : 'ghost'}
               size="sm"
               className="rounded-none gap-1.5"
               onClick={() => setViewMode('calendar')}
             >
               <CalendarIcon className="h-4 w-4" />
               <span className="hidden sm:inline">Calendar</span>
             </Button>
           </div>
         </div>
 
         {/* Filter Tabs */}
         <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
           {filterTabs.map((tab) => (
             <Button
               key={tab.key}
               variant={activeFilter === tab.key ? 'default' : 'outline'}
               size="sm"
               onClick={() => setActiveFilter(tab.key)}
               className={cn(
                 'gap-1.5 shrink-0 rounded-xl transition-all',
                 activeFilter === tab.key && 'shadow-glow-sm'
               )}
             >
               {tab.icon}
               {tab.label}
               {tab.count > 0 && (
                 <Badge variant={activeFilter === tab.key ? 'secondary' : 'outline'} className="ml-1 text-xs">
                   {tab.count}
                 </Badge>
               )}
             </Button>
           ))}
         </div>
 
         {/* Content */}
         {isLoading ? (
           <div className="space-y-3">
             {[1, 2, 3, 4, 5].map((i) => (
               <Skeleton key={i} className="h-16 w-full rounded-xl" />
             ))}
            </div>
         ) : viewMode === 'calendar' ? (
           <TaskCalendarView tasks={tasks} onTaskClick={handleTaskClick} />
         ) : filteredTasks.length === 0 ? (
           <div className="py-16 text-center">
             <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-violet/10 flex items-center justify-center mb-4">
               <ListTodo className="h-10 w-10 text-primary/50" />
             </div>
             <p className="text-muted-foreground">
               {searchQuery || priorityFilter !== 'all'
                 ? 'No tasks match your filters'
                 : activeFilter === 'today'
                 ? 'No tasks due today 🎉'
                 : activeFilter === 'overdue'
                 ? 'No overdue tasks 👍'
                 : activeFilter === 'done'
                 ? 'No completed tasks yet'
                 : 'No tasks yet. Add one to get started!'}
             </p>
           </div>
         ) : (
           <div className="space-y-2">
             {filteredTasks.map((task, index) => (
               <TaskListItem
                 key={task.id}
                 task={task}
                 onToggle={() => toggleTaskStatus.mutate({ id: task.id, currentStatus: task.status })}
                  onDelete={() => handleDeleteTask(task.id, task.title)}
                 onClick={() => handleTaskClick(task)}
                 index={index}
                />
             ))}
          </div>
         )}
      </div>

       {/* Add Task Dialog */}
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
               <Label htmlFor="description">Description (optional)</Label>
               <Input
                 id="description"
                 value={newTask.description}
                 onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                 placeholder="Add details..."
               />
             </div>
             <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
               <Popover>
                 <PopoverTrigger asChild>
                   <Button variant="outline" className={cn('justify-start text-left font-normal', !newTask.dueDate && 'text-muted-foreground')}>
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {newTask.dueDate ? format(newTask.dueDate, 'PPP') : 'Pick a date'}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0" align="start">
                   <Calendar
                     mode="single"
                     selected={newTask.dueDate}
                     onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                     initialFocus
                   />
                 </PopoverContent>
               </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={newTask.priority}
                 onValueChange={(value: TaskPriority) => setNewTask({ ...newTask, priority: value })}
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
            <div className="grid gap-2">
              <Label>Assign To (optional)</Label>
              <Select
                value={newTask.assignedTo || 'none'}
                onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
             <Button onClick={handleAddTask} disabled={!newTask.title.trim() || createTask.isPending}>
               Add Task
             </Button>
          </div>
        </DialogContent>
      </Dialog>

       {/* Task Detail Panel */}
       <TaskDetailPanel
         task={selectedTask}
         open={detailOpen}
         onOpenChange={setDetailOpen}
         onUpdate={handleTaskUpdate}
         onDelete={() => selectedTask && handleDeleteTask(selectedTask.id, selectedTask.title)}
       />
 
      <ConfirmDialog
        open={confirmDialog?.open ?? false}
        onOpenChange={closeConfirmDialog}
        title={confirmDialog?.title ?? ''}
        description={confirmDialog?.description ?? ''}
        onConfirm={handleConfirm}
        variant={confirmDialog?.variant}
        confirmLabel={confirmDialog?.confirmLabel}
      />
    </DashboardLayout>
  );
}
