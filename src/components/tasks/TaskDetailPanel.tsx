 import { useState } from 'react';
 import { format, parseISO } from 'date-fns';
 import { X, Calendar as CalendarIcon, Flag, Clock, Edit2, Trash2, Save } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Badge } from '@/components/ui/badge';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { Calendar } from '@/components/ui/calendar';
 import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
 import { cn } from '@/lib/utils';
 import type { Task, TaskPriority, TaskStatus } from '@/hooks/useTasks';
 
 interface TaskDetailPanelProps {
   task: Task | null;
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onUpdate: (updates: Partial<Task>) => void;
   onDelete: () => void;
 }
 
 const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
   high: { label: 'High', className: 'bg-destructive text-white' },
   medium: { label: 'Medium', className: 'bg-amber-500 text-white' },
   low: { label: 'Low', className: 'bg-emerald-500 text-white' },
 };
 
 const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
   todo: { label: 'To Do', className: 'bg-muted-foreground/20 text-muted-foreground' },
   'in-progress': { label: 'In Progress', className: 'bg-info/20 text-info' },
   done: { label: 'Done', className: 'bg-success/20 text-success' },
 };
 
 export function TaskDetailPanel({
   task,
   open,
   onOpenChange,
   onUpdate,
   onDelete,
 }: TaskDetailPanelProps) {
   const [isEditing, setIsEditing] = useState(false);
   const [editTitle, setEditTitle] = useState('');
   const [editDescription, setEditDescription] = useState('');
 
   const handleStartEdit = () => {
     if (task) {
       setEditTitle(task.title);
       setEditDescription(task.description || '');
       setIsEditing(true);
     }
   };
 
   const handleSaveEdit = () => {
     onUpdate({ title: editTitle, description: editDescription || null });
     setIsEditing(false);
   };
 
   const handlePriorityChange = (priority: TaskPriority) => {
     onUpdate({ priority });
   };
 
   const handleStatusChange = (status: TaskStatus) => {
     onUpdate({ status });
   };
 
   const handleDueDateChange = (date: Date | undefined) => {
     onUpdate({ due_date: date ? format(date, 'yyyy-MM-dd') : null });
   };
 
   if (!task) return null;
 
   return (
     <Sheet open={open} onOpenChange={onOpenChange}>
       <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
         <SheetHeader className="space-y-4">
           <div className="flex items-start justify-between gap-4">
             <SheetTitle className="text-left font-display">Task Details</SheetTitle>
             <div className="flex items-center gap-1">
               {isEditing ? (
                 <Button size="sm" variant="default" onClick={handleSaveEdit} className="gap-1">
                   <Save className="h-4 w-4" />
                   Save
                 </Button>
               ) : (
                 <Button size="sm" variant="ghost" onClick={handleStartEdit} className="gap-1">
                   <Edit2 className="h-4 w-4" />
                   Edit
                 </Button>
               )}
               <Button
                 size="sm"
                 variant="ghost"
                 className="text-destructive hover:bg-destructive/10"
                 onClick={onDelete}
               >
                 <Trash2 className="h-4 w-4" />
               </Button>
             </div>
           </div>
         </SheetHeader>
 
         <div className="mt-6 space-y-6">
           {/* Title */}
           <div>
             <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
               Title
             </label>
             {isEditing ? (
               <Input
                 value={editTitle}
                 onChange={(e) => setEditTitle(e.target.value)}
                 className="mt-1.5"
               />
             ) : (
               <p className="mt-1.5 text-lg font-semibold text-foreground">{task.title}</p>
             )}
           </div>
 
           {/* Status & Priority */}
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                 Status
               </label>
               <div className="flex gap-1.5 mt-2 flex-wrap">
                 {(['todo', 'in-progress', 'done'] as TaskStatus[]).map((s) => (
                   <Button
                     key={s}
                     variant="outline"
                     size="sm"
                     onClick={() => handleStatusChange(s)}
                     className={cn(
                       'text-xs capitalize',
                       task.status === s && statusConfig[s].className
                     )}
                   >
                     {statusConfig[s].label}
                   </Button>
                 ))}
               </div>
             </div>
 
             <div>
               <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                 Priority
               </label>
               <div className="flex gap-1.5 mt-2">
                 {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                   <Button
                     key={p}
                     variant="outline"
                     size="sm"
                     onClick={() => handlePriorityChange(p)}
                     className={cn(
                       'text-xs capitalize flex-1',
                       task.priority === p && priorityConfig[p].className
                     )}
                   >
                     {p}
                   </Button>
                 ))}
               </div>
             </div>
           </div>
 
           {/* Due Date */}
           <div>
             <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
               Due Date
             </label>
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant="outline"
                   className={cn(
                     'w-full justify-start text-left font-normal mt-2',
                     !task.due_date && 'text-muted-foreground'
                   )}
                 >
                   <CalendarIcon className="mr-2 h-4 w-4" />
                   {task.due_date ? format(parseISO(task.due_date), 'PPP') : 'No due date'}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="start">
                 <Calendar
                   mode="single"
                   selected={task.due_date ? parseISO(task.due_date) : undefined}
                   onSelect={handleDueDateChange}
                   initialFocus
                 />
               </PopoverContent>
             </Popover>
           </div>
 
           {/* Description */}
           <div>
             <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
               Description
             </label>
             {isEditing ? (
               <Textarea
                 value={editDescription}
                 onChange={(e) => setEditDescription(e.target.value)}
                 placeholder="Add a description..."
                 className="mt-1.5 min-h-[120px]"
               />
             ) : (
               <p className="mt-1.5 text-sm text-muted-foreground whitespace-pre-wrap">
                 {task.description || 'No description'}
               </p>
             )}
           </div>
 
           {/* Metadata */}
           <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
             <p>
               Created: {format(parseISO(task.created_at), 'PPP p')}
             </p>
             <p>
               Updated: {format(parseISO(task.updated_at), 'PPP p')}
             </p>
           </div>
         </div>
       </SheetContent>
     </Sheet>
   );
 }