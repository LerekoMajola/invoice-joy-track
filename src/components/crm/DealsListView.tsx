 import { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import { 
   Table, 
   TableBody, 
   TableCell, 
   TableHead, 
   TableHeader, 
   TableRow 
 } from '@/components/ui/table';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { Deal, DEAL_STAGES, DEAL_PRIORITIES, useDeals, calculateDealHealth } from '@/hooks/useDeals';
 import { formatMaluti } from '@/lib/currency';
 import { format, isPast, parseISO } from 'date-fns';
 import { Search, Filter, Loader2, Target, ArrowUpDown } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface DealsListViewProps {
   onDealClick: (deal: Deal) => void;
 }
 
 type SortField = 'name' | 'estimated_value' | 'win_probability' | 'expected_close_date' | 'created_at';
 type SortOrder = 'asc' | 'desc';
 
 export function DealsListView({ onDealClick }: DealsListViewProps) {
   const { deals, isLoading } = useDeals();
   const [searchQuery, setSearchQuery] = useState('');
   const [stageFilter, setStageFilter] = useState<string>('all');
   const [priorityFilter, setPriorityFilter] = useState<string>('all');
   const [sortField, setSortField] = useState<SortField>('created_at');
   const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
 
   const filteredDeals = deals
     .filter((deal) => {
       const matchesSearch = 
         deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (deal.company?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
         (deal.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
       
       const matchesStage = stageFilter === 'all' || deal.status === stageFilter;
       const matchesPriority = priorityFilter === 'all' || deal.priority === priorityFilter;
 
       return matchesSearch && matchesStage && matchesPriority;
     })
     .sort((a, b) => {
       let aVal: any, bVal: any;
       
       switch (sortField) {
         case 'name':
           aVal = a.name.toLowerCase();
           bVal = b.name.toLowerCase();
           break;
         case 'estimated_value':
           aVal = a.estimated_value || 0;
           bVal = b.estimated_value || 0;
           break;
         case 'win_probability':
           aVal = a.win_probability || 0;
           bVal = b.win_probability || 0;
           break;
         case 'expected_close_date':
           aVal = a.expected_close_date ? new Date(a.expected_close_date).getTime() : Infinity;
           bVal = b.expected_close_date ? new Date(b.expected_close_date).getTime() : Infinity;
           break;
         case 'created_at':
         default:
           aVal = new Date(a.created_at).getTime();
           bVal = new Date(b.created_at).getTime();
       }
 
       if (sortOrder === 'asc') {
         return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
       } else {
         return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
       }
     });
 
   const handleSort = (field: SortField) => {
     if (sortField === field) {
       setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
     } else {
       setSortField(field);
       setSortOrder('desc');
     }
   };
 
   const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
     <Button
       variant="ghost"
       size="sm"
       className="h-8 px-2 font-semibold hover:bg-transparent"
       onClick={() => handleSort(field)}
     >
       {children}
       <ArrowUpDown className={cn(
         "ml-1 h-3 w-3",
         sortField === field && "text-primary"
       )} />
     </Button>
   );
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-4">
       {/* Filters */}
       <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
         <div className="relative flex-1 sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Search deals..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-9"
           />
         </div>
         <div className="flex gap-2">
           <Select value={stageFilter} onValueChange={setStageFilter}>
             <SelectTrigger className="w-[130px]">
               <Filter className="h-4 w-4 mr-2" />
               <SelectValue placeholder="Stage" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Stages</SelectItem>
               {DEAL_STAGES.map((stage) => (
                 <SelectItem key={stage.value} value={stage.value}>
                   <div className="flex items-center gap-2">
                     <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                     {stage.label}
                   </div>
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
           <Select value={priorityFilter} onValueChange={setPriorityFilter}>
             <SelectTrigger className="w-[130px]">
               <SelectValue placeholder="Priority" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Priority</SelectItem>
               {DEAL_PRIORITIES.map((priority) => (
                 <SelectItem key={priority.value} value={priority.value}>
                   {priority.label}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
         </div>
       </div>
 
       {/* Deals Table */}
       {filteredDeals.length === 0 ? (
         <div className="rounded-xl border border-border bg-card shadow-card">
           <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
             <Target className="h-12 w-12 mb-4" />
             <p className="text-lg font-medium">No deals found</p>
             <p className="text-sm">
               {deals.length === 0 ? 'Add your first deal to get started' : 'Try adjusting your filters'}
             </p>
           </div>
         </div>
       ) : (
         <>
           {/* Mobile Cards */}
           <div className="md:hidden space-y-3">
             {filteredDeals.map((deal) => {
               const stage = DEAL_STAGES.find(s => s.value === deal.status);
               const health = calculateDealHealth(deal);
               
               return (
                 <div 
                   key={deal.id} 
                   className={cn(
                     "mobile-card cursor-pointer",
                     health.level === 'critical' && "border-destructive/50"
                   )}
                   onClick={() => onDealClick(deal)}
                 >
                   <div className="flex items-start justify-between gap-3">
                     <div className="min-w-0 flex-1">
                       <p className="font-medium truncate">{deal.name}</p>
                       {deal.company && (
                         <p className="text-sm text-muted-foreground">{deal.company}</p>
                       )}
                     </div>
                     <Badge className={cn("shrink-0 text-white", stage?.color)}>
                       {stage?.label}
                     </Badge>
                   </div>
                   <div className="mt-2 flex items-center justify-between text-sm">
                     {deal.estimated_value && (
                       <span className="font-medium text-primary">
                         {formatMaluti(deal.estimated_value)}
                       </span>
                     )}
                     <span>{deal.win_probability || 50}% probability</span>
                   </div>
                 </div>
               );
             })}
           </div>
 
           {/* Desktop Table */}
           <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
             <Table>
               <TableHeader>
                 <TableRow className="bg-secondary/50">
                   <TableHead>
                     <SortHeader field="name">Deal / Company</SortHeader>
                   </TableHead>
                   <TableHead>
                     <SortHeader field="estimated_value">Value</SortHeader>
                   </TableHead>
                   <TableHead>Stage</TableHead>
                   <TableHead>
                     <SortHeader field="win_probability">Probability</SortHeader>
                   </TableHead>
                   <TableHead>
                     <SortHeader field="expected_close_date">Expected Close</SortHeader>
                   </TableHead>
                   <TableHead>Health</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredDeals.map((deal) => {
                   const stage = DEAL_STAGES.find(s => s.value === deal.status);
                   const health = calculateDealHealth(deal);
                   const isCloseOverdue = deal.expected_close_date && isPast(parseISO(deal.expected_close_date));
                   
                   return (
                     <TableRow 
                       key={deal.id} 
                       className="cursor-pointer hover:bg-muted/50"
                       onClick={() => onDealClick(deal)}
                     >
                       <TableCell>
                         <div>
                           <p className="font-medium">{deal.name}</p>
                           {deal.company && (
                             <p className="text-sm text-muted-foreground">{deal.company}</p>
                           )}
                         </div>
                       </TableCell>
                       <TableCell>
                         {deal.estimated_value ? (
                           <div>
                             <p className="font-medium">{formatMaluti(deal.estimated_value)}</p>
                             <p className="text-xs text-muted-foreground">
                               {formatMaluti(deal.estimated_value * ((deal.win_probability || 50) / 100))} weighted
                             </p>
                           </div>
                         ) : (
                           <span className="text-muted-foreground">-</span>
                         )}
                       </TableCell>
                       <TableCell>
                         <Badge className={cn("text-white", stage?.color)}>
                           {stage?.label}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2">
                           <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                             <div 
                               className={cn(
                                 "h-full transition-all",
                                 (deal.win_probability || 50) >= 70 && "bg-success",
                                 (deal.win_probability || 50) >= 30 && (deal.win_probability || 50) < 70 && "bg-warning",
                                 (deal.win_probability || 50) < 30 && "bg-destructive"
                               )}
                               style={{ width: `${deal.win_probability || 50}%` }}
                             />
                           </div>
                           <span className="text-sm">{deal.win_probability || 50}%</span>
                         </div>
                       </TableCell>
                       <TableCell>
                         {deal.expected_close_date ? (
                           <span className={cn(isCloseOverdue && "text-destructive font-medium")}>
                             {format(parseISO(deal.expected_close_date), 'MMM d, yyyy')}
                             {isCloseOverdue && ' (overdue)'}
                           </span>
                         ) : (
                           <span className="text-muted-foreground">-</span>
                         )}
                       </TableCell>
                       <TableCell>
                         <Badge 
                           variant="outline"
                           className={cn(
                             health.level === 'healthy' && "border-success text-success",
                             health.level === 'warning' && "border-warning text-warning",
                             health.level === 'critical' && "border-destructive text-destructive"
                           )}
                         >
                           {health.score}%
                         </Badge>
                       </TableCell>
                     </TableRow>
                   );
                 })}
               </TableBody>
             </Table>
           </div>
         </>
       )}
     </div>
   );
 }