 import { useMemo } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { useDeals, DEAL_STAGES, calculateDealHealth } from '@/hooks/useDeals';
 import { formatMaluti } from '@/lib/currency';
 import { 
   TrendingUp, 
   Target, 
   DollarSign, 
   BarChart3, 
   AlertTriangle,
   Calendar,
   Award,
   XCircle,
   Loader2
 } from 'lucide-react';
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
 import { format, parseISO, isThisMonth, isThisWeek, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
 import { cn } from '@/lib/utils';
 
 interface ForecastTabProps {
   onDealClick: (deal: any) => void;
 }
 
 const CHART_COLORS = [
   'hsl(var(--primary))',
   'hsl(var(--violet))',
   'hsl(var(--cyan))',
   'hsl(var(--warning))',
   'hsl(var(--coral))',
   'hsl(var(--success))',
   'hsl(var(--destructive))',
 ];
 
 export function ForecastTab({ onDealClick }: ForecastTabProps) {
   const { deals, metrics, dealsByStage, isLoading } = useDeals();
 
   // Calculate forecast scenarios
   const forecast = useMemo(() => {
     const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.status));
     
     // Best case: all active deals close at full value
     const bestCase = activeDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
     
     // Committed: deals with 70%+ probability
     const committed = activeDeals
       .filter(d => (d.win_probability || 50) >= 70)
       .reduce((sum, d) => sum + (d.estimated_value || 0), 0);
     
     // Weighted: sum of value * probability
     const weighted = metrics.weightedPipelineValue;
     
     // Worst case: only deals with 90%+ probability
     const worstCase = activeDeals
       .filter(d => (d.win_probability || 50) >= 90)
       .reduce((sum, d) => sum + (d.estimated_value || 0), 0);
 
     return { bestCase, committed, weighted, worstCase };
   }, [deals, metrics]);
 
   // Stage conversion data for chart
   const stageData = useMemo(() => {
     return DEAL_STAGES.filter(s => !['won', 'lost'].includes(s.value)).map(stage => {
       const stageDeals = dealsByStage[stage.value] || [];
       const totalValue = stageDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
       const weightedValue = stageDeals.reduce((sum, d) => {
         return sum + (d.estimated_value || 0) * ((d.win_probability || stage.defaultProbability) / 100);
       }, 0);
       
       return {
         name: stage.label,
         count: stageDeals.length,
         value: totalValue,
         weighted: weightedValue,
         color: stage.color,
       };
     });
   }, [dealsByStage]);
 
   // Win/Loss analysis
   const winLossData = useMemo(() => {
     const wonDeals = dealsByStage['won'] || [];
     const lostDeals = dealsByStage['lost'] || [];
     
     return [
       { name: 'Won', value: wonDeals.length, color: 'hsl(var(--success))' },
       { name: 'Lost', value: lostDeals.length, color: 'hsl(var(--destructive))' },
     ];
   }, [dealsByStage]);
 
   // Deals closing this month/week
   const closingDeals = useMemo(() => {
     const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.status));
     
     const thisWeek = activeDeals.filter(d => 
       d.expected_close_date && isThisWeek(parseISO(d.expected_close_date))
     );
     
     const thisMonth = activeDeals.filter(d => 
       d.expected_close_date && isThisMonth(parseISO(d.expected_close_date))
     );
 
     return { thisWeek, thisMonth };
   }, [deals]);
 
   // Deals at risk
   const dealsAtRisk = useMemo(() => {
     return deals
       .filter(d => !['won', 'lost'].includes(d.status))
       .filter(d => {
         const health = calculateDealHealth(d);
         return health.level === 'critical' || health.level === 'warning';
       })
       .sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0))
       .slice(0, 5);
   }, [deals]);
 
   // Sales velocity
   const salesVelocity = useMemo(() => {
     const wonDeals = dealsByStage['won'] || [];
     if (wonDeals.length === 0) return null;
 
     const avgDealSize = wonDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0) / wonDeals.length;
     
     // Approximate sales cycle (days from created to won)
     const avgCycle = wonDeals.reduce((sum, d) => {
       const created = parseISO(d.created_at);
       const updated = parseISO(d.updated_at); // approximation for won date
       return sum + differenceInDays(updated, created);
     }, 0) / wonDeals.length;
 
     return {
       avgDealSize,
       avgCycle: Math.round(avgCycle),
       winRate: metrics.winRate,
     };
   }, [dealsByStage, metrics]);
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Forecast Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
           <CardContent className="pt-6">
             <div className="flex items-center gap-2 mb-2">
               <Target className="h-4 w-4 text-success" />
               <span className="text-sm font-medium text-muted-foreground">Best Case</span>
             </div>
             <p className="text-2xl font-bold">{formatMaluti(forecast.bestCase)}</p>
             <p className="text-xs text-muted-foreground mt-1">All deals close</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
           <CardContent className="pt-6">
             <div className="flex items-center gap-2 mb-2">
               <TrendingUp className="h-4 w-4 text-primary" />
               <span className="text-sm font-medium text-muted-foreground">Weighted</span>
             </div>
             <p className="text-2xl font-bold">{formatMaluti(forecast.weighted)}</p>
             <p className="text-xs text-muted-foreground mt-1">By probability</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
           <CardContent className="pt-6">
             <div className="flex items-center gap-2 mb-2">
               <DollarSign className="h-4 w-4 text-warning" />
               <span className="text-sm font-medium text-muted-foreground">Committed</span>
             </div>
             <p className="text-2xl font-bold">{formatMaluti(forecast.committed)}</p>
             <p className="text-xs text-muted-foreground mt-1">70%+ probability</p>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-2 mb-2">
               <BarChart3 className="h-4 w-4 text-muted-foreground" />
               <span className="text-sm font-medium text-muted-foreground">Worst Case</span>
             </div>
             <p className="text-2xl font-bold">{formatMaluti(forecast.worstCase)}</p>
             <p className="text-xs text-muted-foreground mt-1">90%+ probability</p>
           </CardContent>
         </Card>
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Pipeline by Stage Chart */}
         <Card>
           <CardHeader>
             <CardTitle className="text-base">Pipeline by Stage</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stageData} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                   <XAxis type="number" tickFormatter={(v) => `M${(v / 1000).toFixed(0)}k`} />
                   <YAxis type="category" dataKey="name" width={80} />
                   <Tooltip 
                     formatter={(value: number) => formatMaluti(value)}
                     labelFormatter={(label) => `${label}`}
                   />
                   <Bar dataKey="value" name="Total Value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                   <Bar dataKey="weighted" name="Weighted" fill="hsl(var(--primary) / 0.5)" radius={[0, 4, 4, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
 
         {/* Win/Loss + Velocity */}
         <div className="space-y-6">
           {/* Win Rate */}
           <Card>
             <CardHeader>
               <CardTitle className="text-base">Win Rate</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex items-center gap-6">
                 <div className="h-[120px] w-[120px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={winLossData}
                         cx="50%"
                         cy="50%"
                         innerRadius={35}
                         outerRadius={55}
                         paddingAngle={2}
                         dataKey="value"
                       >
                         {winLossData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <Award className="h-4 w-4 text-success" />
                     <span className="text-sm">Won: {metrics.wonDeals}</span>
                     <span className="text-sm font-bold text-success">
                       {formatMaluti(metrics.wonValue)}
                     </span>
                   </div>
                   <div className="flex items-center gap-2">
                     <XCircle className="h-4 w-4 text-destructive" />
                     <span className="text-sm">Lost: {metrics.lostDeals}</span>
                     <span className="text-sm font-bold text-destructive">
                       {formatMaluti(metrics.lostValue)}
                     </span>
                   </div>
                   <div className="pt-2 border-t">
                     <p className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</p>
                     <p className="text-xs text-muted-foreground">Win Rate</p>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           {/* Sales Velocity */}
           {salesVelocity && (
             <Card>
               <CardHeader>
                 <CardTitle className="text-base">Sales Velocity</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-2xl font-bold">{formatMaluti(salesVelocity.avgDealSize)}</p>
                     <p className="text-xs text-muted-foreground">Avg Deal Size</p>
                   </div>
                   <div>
                     <p className="text-2xl font-bold">{salesVelocity.avgCycle} days</p>
                     <p className="text-xs text-muted-foreground">Avg Sales Cycle</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           )}
         </div>
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Deals Closing Soon */}
         <Card>
           <CardHeader>
             <div className="flex items-center justify-between">
               <CardTitle className="text-base flex items-center gap-2">
                 <Calendar className="h-4 w-4" />
                 Closing Soon
               </CardTitle>
               <div className="flex gap-2">
                 <Badge variant="outline">{closingDeals.thisWeek.length} this week</Badge>
                 <Badge variant="secondary">{closingDeals.thisMonth.length} this month</Badge>
               </div>
             </div>
           </CardHeader>
           <CardContent>
             <div className="space-y-2">
               {closingDeals.thisMonth.slice(0, 5).map((deal) => (
                 <div 
                   key={deal.id}
                   className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                   onClick={() => onDealClick(deal)}
                 >
                   <div>
                     <p className="font-medium text-sm">{deal.name}</p>
                     <p className="text-xs text-muted-foreground">
                       {deal.expected_close_date && format(parseISO(deal.expected_close_date), 'MMM d')}
                     </p>
                   </div>
                   <div className="text-right">
                     <p className="font-medium text-sm">{formatMaluti(deal.estimated_value || 0)}</p>
                     <p className="text-xs text-muted-foreground">{deal.win_probability || 50}%</p>
                   </div>
                 </div>
               ))}
               {closingDeals.thisMonth.length === 0 && (
                 <p className="text-center text-muted-foreground py-4 text-sm">
                   No deals with expected close dates this month
                 </p>
               )}
             </div>
           </CardContent>
         </Card>
 
         {/* Deals at Risk */}
         <Card className={dealsAtRisk.length > 0 ? "border-warning/50" : ""}>
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2">
               <AlertTriangle className={cn("h-4 w-4", dealsAtRisk.length > 0 && "text-warning")} />
               Deals at Risk
               {dealsAtRisk.length > 0 && (
                 <Badge variant="outline" className="border-warning text-warning ml-2">
                   {dealsAtRisk.length}
                 </Badge>
               )}
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-2">
               {dealsAtRisk.map((deal) => {
                 const health = calculateDealHealth(deal);
                 return (
                   <div 
                     key={deal.id}
                     className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                     onClick={() => onDealClick(deal)}
                   >
                     <div className="min-w-0 flex-1">
                       <p className="font-medium text-sm truncate">{deal.name}</p>
                       <p className="text-xs text-muted-foreground truncate">
                         {health.reasons[0]}
                       </p>
                     </div>
                     <div className="text-right shrink-0 ml-2">
                       <p className="font-medium text-sm">{formatMaluti(deal.estimated_value || 0)}</p>
                       <Badge 
                         variant="outline" 
                         className={cn(
                           "text-xs",
                           health.level === 'critical' && "border-destructive text-destructive",
                           health.level === 'warning' && "border-warning text-warning"
                         )}
                       >
                         {health.score}%
                       </Badge>
                     </div>
                   </div>
                 );
               })}
               {dealsAtRisk.length === 0 && (
                 <p className="text-center text-success py-4 text-sm">
                   ✓ All deals are healthy!
                 </p>
               )}
             </div>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }