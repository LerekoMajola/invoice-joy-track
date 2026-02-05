 import { useState } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
 import { Deal, DEAL_STAGES, useDeals } from '@/hooks/useDeals';
 import { DealCard } from './DealCard';
 import { formatMaluti } from '@/lib/currency';
 import { Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface PipelineBoardProps {
   onDealClick: (deal: Deal) => void;
   onAddDeal: () => void;
   onQuickAction: (action: 'call' | 'email' | 'note', deal: Deal) => void;
 }
 
 export function PipelineBoard({ onDealClick, onAddDeal, onQuickAction }: PipelineBoardProps) {
   const { deals, dealsByStage, updateDeal, isLoading } = useDeals();
   const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
   const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set(['won', 'lost']));
 
   const handleDragStart = (e: React.DragEvent, deal: Deal) => {
     setDraggedDeal(deal);
     e.dataTransfer.effectAllowed = 'move';
   };
 
   const handleDragOver = (e: React.DragEvent) => {
     e.preventDefault();
     e.dataTransfer.dropEffect = 'move';
   };
 
   const handleDrop = async (e: React.DragEvent, newStatus: string) => {
     e.preventDefault();
     if (draggedDeal && draggedDeal.status !== newStatus) {
       // Get default probability for new stage
       const stage = DEAL_STAGES.find(s => s.value === newStatus);
       await updateDeal({ 
         id: draggedDeal.id, 
         status: newStatus,
         win_probability: stage?.defaultProbability ?? draggedDeal.win_probability,
       });
     }
     setDraggedDeal(null);
   };
 
   const toggleStageCollapse = (stageValue: string) => {
     setCollapsedStages(prev => {
       const next = new Set(prev);
       if (next.has(stageValue)) {
         next.delete(stageValue);
       } else {
         next.add(stageValue);
       }
       return next;
     });
   };
 
   const getStageValue = (stageDeals: Deal[]) => {
     return stageDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
   };
 
   const getWeightedValue = (stageDeals: Deal[]) => {
     return stageDeals.reduce((sum, d) => {
       const value = d.estimated_value || 0;
       const probability = (d.win_probability || 50) / 100;
       return sum + (value * probability);
     }, 0);
   };
 
   // Filter active stages (exclude won/lost by default but keep them accessible)
   const activeStages = DEAL_STAGES.filter(s => !['won', 'lost'].includes(s.value));
   const closedStages = DEAL_STAGES.filter(s => ['won', 'lost'].includes(s.value));
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-4">
       {/* Pipeline Overview Stats */}
       <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
         {DEAL_STAGES.map((stage, index) => {
           const stageDeals = dealsByStage[stage.value] || [];
           const count = stageDeals.length;
           const isCollapsed = collapsedStages.has(stage.value);
           
           return (
             <div 
               key={stage.value} 
               className={cn(
                 "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer",
                 isCollapsed ? "bg-muted/50" : "bg-secondary/50 hover:bg-secondary"
               )}
               onClick={() => toggleStageCollapse(stage.value)}
             >
               <div className={cn("w-2 h-2 rounded-full", stage.color)} />
               <span className="text-sm font-medium whitespace-nowrap">{stage.label}</span>
               <Badge variant="outline" className="ml-1">{count}</Badge>
               {isCollapsed ? (
                 <ChevronDown className="h-3 w-3 text-muted-foreground" />
               ) : (
                 <ChevronUp className="h-3 w-3 text-muted-foreground" />
               )}
             </div>
           );
         })}
       </div>
 
       {/* Kanban Board */}
       <ScrollArea className="w-full">
         <div className="flex gap-4 pb-4" style={{ minWidth: `${activeStages.length * 300}px` }}>
           {activeStages.map((stage) => {
             const stageDeals = dealsByStage[stage.value] || [];
             const totalValue = getStageValue(stageDeals);
             const weightedValue = getWeightedValue(stageDeals);
             const isCollapsed = collapsedStages.has(stage.value);
             
             return (
               <div
                 key={stage.value}
                 className={cn(
                   "flex-1 min-w-[280px] max-w-[340px] transition-all",
                   isCollapsed && "min-w-[80px] max-w-[80px]"
                 )}
                 onDragOver={handleDragOver}
                 onDrop={(e) => handleDrop(e, stage.value)}
               >
                 <Card className={cn(
                   "h-full transition-all",
                   draggedDeal && draggedDeal.status !== stage.value && "ring-2 ring-primary/20"
                 )}>
                   <CardHeader className="pb-3">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                         {!isCollapsed && (
                           <CardTitle className="text-base">{stage.label}</CardTitle>
                         )}
                       </div>
                       <Badge variant="secondary">{stageDeals.length}</Badge>
                     </div>
                     
                     {!isCollapsed && totalValue > 0 && (
                       <div className="space-y-1 mt-2">
                         <div className="flex items-center justify-between text-sm">
                           <span className="text-muted-foreground">Total</span>
                           <span className="font-medium">{formatMaluti(totalValue)}</span>
                         </div>
                         <div className="flex items-center justify-between text-xs">
                           <span className="text-muted-foreground">Weighted</span>
                           <span className="text-primary font-medium">{formatMaluti(weightedValue)}</span>
                         </div>
                         {/* Visual capacity indicator */}
                         <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                           <div 
                             className={cn("h-full transition-all", stage.color)}
                             style={{ width: `${Math.min((stageDeals.length / 10) * 100, 100)}%` }}
                           />
                         </div>
                       </div>
                     )}
                   </CardHeader>
                   
                   {!isCollapsed && (
                     <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                       {stageDeals.map((deal) => (
                         <div
                           key={deal.id}
                           draggable
                           onDragStart={(e) => handleDragStart(e, deal)}
                         >
                           <DealCard
                             deal={deal}
                             onClick={() => onDealClick(deal)}
                             onQuickAction={onQuickAction}
                             isDragging={draggedDeal?.id === deal.id}
                           />
                         </div>
                       ))}
 
                       {stageDeals.length === 0 && (
                         <div className="py-8 text-center text-sm text-muted-foreground">
                           <p>No deals</p>
                           {stage.value === 'new' && (
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="mt-2"
                               onClick={onAddDeal}
                             >
                               <Plus className="h-4 w-4 mr-1" />
                               Add Deal
                             </Button>
                           )}
                         </div>
                       )}
                     </CardContent>
                   )}
                 </Card>
               </div>
             );
           })}
         </div>
         <ScrollBar orientation="horizontal" />
       </ScrollArea>
 
       {/* Closed Deals Section */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {closedStages.map((stage) => {
           const stageDeals = dealsByStage[stage.value] || [];
           const isCollapsed = collapsedStages.has(stage.value);
           
           return (
             <Card key={stage.value} className="overflow-hidden">
               <CardHeader 
                 className={cn(
                   "pb-3 cursor-pointer transition-colors hover:bg-muted/50",
                   stage.value === 'won' && "bg-success/5",
                   stage.value === 'lost' && "bg-destructive/5"
                 )}
                 onClick={() => toggleStageCollapse(stage.value)}
               >
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                     <CardTitle className="text-base">{stage.label}</CardTitle>
                   </div>
                   <div className="flex items-center gap-2">
                     <Badge variant="secondary">{stageDeals.length}</Badge>
                     <span className="text-sm font-medium">
                       {formatMaluti(getStageValue(stageDeals))}
                     </span>
                     {isCollapsed ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronUp className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                 </div>
               </CardHeader>
               
               {!isCollapsed && (
                 <CardContent className="max-h-[300px] overflow-y-auto">
                   <div className="grid gap-2">
                     {stageDeals.slice(0, 5).map((deal) => (
                       <DealCard
                         key={deal.id}
                         deal={deal}
                         onClick={() => onDealClick(deal)}
                       />
                     ))}
                     {stageDeals.length > 5 && (
                       <p className="text-sm text-center text-muted-foreground py-2">
                         +{stageDeals.length - 5} more deals
                       </p>
                     )}
                     {stageDeals.length === 0 && (
                       <p className="text-sm text-center text-muted-foreground py-4">
                         No {stage.value} deals yet
                       </p>
                     )}
                   </div>
                 </CardContent>
               )}
             </Card>
           );
         })}
       </div>
     </div>
   );
 }