 import { useMemo, useState } from 'react';
 import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
 import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { cn } from '@/lib/utils';
 import type { Task, TaskPriority } from '@/hooks/useTasks';
 
 interface TaskCalendarViewProps {
   tasks: Task[];
   onTaskClick: (task: Task) => void;
 }
 
 const priorityColors: Record<TaskPriority, string> = {
   high: 'bg-destructive',
   medium: 'bg-amber-500',
   low: 'bg-emerald-500',
 };
 
 export function TaskCalendarView({ tasks, onTaskClick }: TaskCalendarViewProps) {
   const [currentMonth, setCurrentMonth] = useState(new Date());
 
   const tasksByDate = useMemo(() => {
     const map = new Map<string, Task[]>();
     tasks.forEach((task) => {
       if (task.due_date) {
         const dateKey = task.due_date;
         if (!map.has(dateKey)) map.set(dateKey, []);
         map.get(dateKey)!.push(task);
       }
     });
     return map;
   }, [tasks]);
 
   const calendarDays = useMemo(() => {
     const monthStart = startOfMonth(currentMonth);
     const monthEnd = endOfMonth(currentMonth);
     const calendarStart = startOfWeek(monthStart);
     const calendarEnd = endOfWeek(monthEnd);
     return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
   }, [currentMonth]);
 
   const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 
   return (
     <div className="bg-card border border-border rounded-xl overflow-hidden">
       {/* Calendar Header */}
       <div className="flex items-center justify-between p-4 border-b bg-muted/30">
         <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
           <ChevronLeft className="h-5 w-5" />
         </Button>
         <h3 className="font-display font-semibold text-lg">
           {format(currentMonth, 'MMMM yyyy')}
         </h3>
         <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
           <ChevronRight className="h-5 w-5" />
         </Button>
       </div>
 
       {/* Week Days Header */}
       <div className="grid grid-cols-7 border-b bg-muted/20">
         {weekDays.map((day) => (
           <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
             {day}
           </div>
         ))}
       </div>
 
       {/* Calendar Grid */}
       <div className="grid grid-cols-7">
         {calendarDays.map((day, i) => {
           const dateKey = format(day, 'yyyy-MM-dd');
           const dayTasks = tasksByDate.get(dateKey) || [];
           const isCurrentMonth = isSameMonth(day, currentMonth);
           const isCurrentDay = isToday(day);
 
           return (
             <div
               key={i}
               className={cn(
                 'min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-b border-r last:border-r-0',
                 !isCurrentMonth && 'bg-muted/30 text-muted-foreground'
               )}
             >
               <div
                 className={cn(
                   'text-xs md:text-sm font-medium mb-1 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full',
                   isCurrentDay && 'bg-primary text-primary-foreground'
                 )}
               >
                 {format(day, 'd')}
               </div>
               <div className="space-y-0.5">
                 {dayTasks.slice(0, 3).map((task) => (
                   <button
                     key={task.id}
                     onClick={() => onTaskClick(task)}
                     className={cn(
                       'w-full text-left text-[10px] md:text-xs px-1.5 py-0.5 rounded truncate transition-opacity hover:opacity-80',
                       task.status === 'done' ? 'bg-muted text-muted-foreground line-through' : 'text-white',
                       task.status !== 'done' && priorityColors[task.priority]
                     )}
                   >
                     {task.title}
                   </button>
                 ))}
                 {dayTasks.length > 3 && (
                   <p className="text-[10px] text-muted-foreground px-1">
                     +{dayTasks.length - 3} more
                   </p>
                 )}
               </div>
             </div>
           );
         })}
       </div>
     </div>
   );
 }