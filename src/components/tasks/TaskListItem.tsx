import { format, parseISO, isToday, isPast, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, Trash2, User } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
 import type { Task, TaskPriority } from '@/hooks/useTasks';
 
 interface TaskListItemProps {
   task: Task;
   onToggle: () => void;
   onDelete: () => void;
   onClick: () => void;
   index?: number;
 }
 
 const priorityConfig: Record<TaskPriority, { className: string; borderClass: string }> = {
   high: { 
     className: 'bg-destructive text-white',
     borderClass: 'border-l-destructive',
   },
   medium: { 
     className: 'bg-amber-500 text-white',
     borderClass: 'border-l-amber-500',
   },
   low: { 
     className: 'bg-emerald-500 text-white',
     borderClass: 'border-l-emerald-500',
   },
 };
 
 function formatDueDate(dateStr: string | null): string {
   if (!dateStr) return '';
   const date = parseISO(dateStr);
   if (isToday(date)) return 'Today';
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
 
 export function TaskListItem({ task, onToggle, onDelete, onClick, index = 0 }: TaskListItemProps) {
   const isDone = task.status === 'done';
   const priority = priorityConfig[task.priority];
 
   return (
     <div
       className={cn(
         'group flex items-center gap-3 p-3 md:p-4 rounded-xl border-l-4 bg-card hover:bg-accent/30 transition-all duration-200 hover:shadow-card cursor-pointer animate-slide-up',
         priority.borderClass,
         isDone && 'opacity-60'
       )}
       style={{ animationDelay: `${index * 30}ms` }}
       onClick={onClick}
     >
       <Checkbox
         checked={isDone}
         onCheckedChange={() => {
           onToggle();
         }}
         onClick={(e) => e.stopPropagation()}
         className={cn(
           'h-5 w-5 rounded-full shrink-0 transition-all',
           !isDone && 'border-2 hover:border-primary'
         )}
       />
 
       <div className="flex-1 min-w-0">
         <p
           className={cn(
             'font-medium text-sm truncate',
             isDone && 'line-through text-muted-foreground'
           )}
         >
           {task.title}
         </p>
         {task.description && (
           <p className="text-xs text-muted-foreground truncate mt-0.5">
             {task.description}
           </p>
         )}
       </div>
 
       <div className="flex items-center gap-2 shrink-0">
         {task.due_date && (
           <span
             className={cn(
               'text-xs flex items-center gap-1 hidden sm:flex',
               getDueDateColor(task.due_date, task.status)
             )}
           >
             <CalendarIcon className="h-3 w-3" />
             {formatDueDate(task.due_date)}
           </span>
          )}
          {task.assigned_to_name && (
            <div className="hidden sm:flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                  {task.assigned_to_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                {task.assigned_to_name}
              </span>
            </div>
          )}
         <div
           className={cn(
             'px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
             priority.className,
             task.priority === 'high' && !isDone && 'animate-urgent-flash'
           )}
         >
           {task.priority}
         </div>
         <Button
           variant="ghost"
           size="icon"
           onClick={(e) => {
             e.stopPropagation();
             onDelete();
           }}
           className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
         >
           <Trash2 className="h-4 w-4" />
         </Button>
       </div>
     </div>
   );
 }