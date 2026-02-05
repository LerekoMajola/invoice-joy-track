 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Deal, DEAL_STAGES, calculateDealHealth } from '@/hooks/useDeals';
 import { formatMaluti } from '@/lib/currency';
 import { format, formatDistanceToNow, parseISO, isPast, differenceInDays } from 'date-fns';
 import { 
   Building2, 
   Calendar, 
   Clock, 
   AlertCircle,
   Phone,
   Mail,
   MessageSquare,
   TrendingUp
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface DealCardProps {
   deal: Deal;
   onClick: () => void;
   onQuickAction?: (action: 'call' | 'email' | 'note', deal: Deal) => void;
   isDragging?: boolean;
 }
 
 export function DealCard({ deal, onClick, onQuickAction, isDragging }: DealCardProps) {
   const health = calculateDealHealth(deal);
   const isOverdue = deal.next_follow_up && isPast(parseISO(deal.next_follow_up));
   const stage = DEAL_STAGES.find(s => s.value === deal.status);
   
   // Calculate days in stage
   const daysInStage = deal.stage_entered_at 
     ? differenceInDays(new Date(), parseISO(deal.stage_entered_at))
     : 0;
   
   // Get probability ring color
   const getProbabilityColor = (probability: number) => {
     if (probability >= 70) return 'text-success';
     if (probability >= 30) return 'text-warning';
     return 'text-destructive';
   };
 
   const probability = deal.win_probability ?? stage?.defaultProbability ?? 50;
 
   return (
     <div
       onClick={onClick}
       className={cn(
         "group p-3 rounded-xl border bg-card cursor-pointer transition-all duration-200",
         "hover:shadow-elevated hover:-translate-y-0.5",
         isDragging && "opacity-50 rotate-2 shadow-lg",
         health.level === 'critical' && "border-destructive/50 bg-destructive/5",
         health.level === 'warning' && "border-warning/50 bg-warning/5",
         deal.priority === 'high' && "border-l-4 border-l-coral"
       )}
     >
       <div className="space-y-2">
         {/* Header Row */}
         <div className="flex items-start justify-between gap-2">
           <div className="flex-1 min-w-0">
             <p className="font-semibold text-sm leading-tight truncate">{deal.name}</p>
             {deal.company && (
               <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                 <Building2 className="h-3 w-3 shrink-0" />
                 <span className="truncate">{deal.company}</span>
               </p>
             )}
           </div>
           
           {/* Probability Ring */}
           <div className="relative shrink-0">
             <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
               <circle
                 cx="18"
                 cy="18"
                 r="15.5"
                 fill="none"
                 strokeWidth="3"
                 className="stroke-muted"
               />
               <circle
                 cx="18"
                 cy="18"
                 r="15.5"
                 fill="none"
                 strokeWidth="3"
                 strokeDasharray={`${probability} ${100 - probability}`}
                 strokeLinecap="round"
                 className={cn("transition-all duration-500", getProbabilityColor(probability))}
                 style={{ stroke: 'currentColor' }}
               />
             </svg>
             <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
               {probability}%
             </span>
           </div>
         </div>
 
         {/* Deal Value */}
         {deal.estimated_value && (
           <div className="flex items-center gap-1">
             <TrendingUp className="h-3.5 w-3.5 text-primary" />
             <span className="text-sm font-bold text-primary">
               {formatMaluti(deal.estimated_value)}
             </span>
             <span className="text-[10px] text-muted-foreground">
               ({formatMaluti(deal.estimated_value * (probability / 100))} weighted)
             </span>
           </div>
         )}
 
         {/* Expected Close / Follow-up */}
         <div className="flex items-center justify-between text-xs text-muted-foreground">
           {deal.expected_close_date ? (
             <span className={cn(
               "flex items-center gap-1",
               isPast(parseISO(deal.expected_close_date)) && "text-destructive"
             )}>
               <Calendar className="h-3 w-3" />
               Close: {format(parseISO(deal.expected_close_date), 'MMM d')}
             </span>
           ) : deal.next_follow_up ? (
             <span className={cn("flex items-center gap-1", isOverdue && "text-destructive font-medium")}>
               {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
               {format(parseISO(deal.next_follow_up), 'MMM d')}
               {isOverdue && ' (overdue)'}
             </span>
           ) : (
             <span className="text-muted-foreground/50">No date set</span>
           )}
           
           {daysInStage > 0 && (
             <Badge 
               variant="outline" 
               className={cn(
                 "text-[10px] px-1.5 py-0",
                 daysInStage > 14 && "border-warning text-warning",
                 daysInStage > 30 && "border-destructive text-destructive animate-pulse"
               )}
             >
               {daysInStage}d
             </Badge>
           )}
         </div>
 
         {/* Health Warning */}
         {health.level !== 'healthy' && health.reasons.length > 0 && (
           <div className={cn(
             "text-[10px] px-2 py-1 rounded-md",
             health.level === 'critical' ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
           )}>
             {health.reasons[0]}
           </div>
         )}
 
         {/* Quick Actions - visible on hover */}
         <div className="flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <Button
             variant="ghost"
             size="sm"
             className="h-7 px-2 text-xs"
             onClick={(e) => {
               e.stopPropagation();
               onQuickAction?.('call', deal);
             }}
           >
             <Phone className="h-3 w-3" />
           </Button>
           <Button
             variant="ghost"
             size="sm"
             className="h-7 px-2 text-xs"
             onClick={(e) => {
               e.stopPropagation();
               onQuickAction?.('email', deal);
             }}
           >
             <Mail className="h-3 w-3" />
           </Button>
           <Button
             variant="ghost"
             size="sm"
             className="h-7 px-2 text-xs"
             onClick={(e) => {
               e.stopPropagation();
               onQuickAction?.('note', deal);
             }}
           >
             <MessageSquare className="h-3 w-3" />
           </Button>
         </div>
       </div>
     </div>
   );
 }