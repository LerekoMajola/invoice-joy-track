 import { useState, useEffect } from 'react';
 import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Badge } from '@/components/ui/badge';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Slider } from '@/components/ui/slider';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { Deal, DEAL_STAGES, DEAL_PRIORITIES, useDeals, calculateDealHealth } from '@/hooks/useDeals';
 import { useDealTasks } from '@/hooks/useDealTasks';
 import { useLeadActivities, ACTIVITY_TYPES } from '@/hooks/useLeadActivities';
 import { formatMaluti } from '@/lib/currency';
 import { format, formatDistanceToNow, parseISO } from 'date-fns';
 import { 
   Building2, Calendar, Star, UserPlus, Save, X, 
   FileText, Phone, Mail, Users, Send, Clock,
   CheckCircle2, Circle, Plus, Trash2, AlertTriangle,
   TrendingUp, Target
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface DealDetailPanelProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   deal: Deal | null;
   onAddActivity: () => void;
 }
 
 const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
   FileText, Phone, Mail, Users, Send, Clock,
 };
 
 export function DealDetailPanel({ open, onOpenChange, deal, onAddActivity }: DealDetailPanelProps) {
   const { updateDeal, convertToClient, deleteDeal } = useDeals();
   const { tasks, createTask, toggleTask, deleteTask, isLoading: tasksLoading } = useDealTasks(deal?.id);
   const { activities, isLoading: activitiesLoading, deleteActivity } = useLeadActivities(deal?.id);
   const [isEditing, setIsEditing] = useState(false);
   const [formData, setFormData] = useState<Partial<Deal>>({});
   const [newTaskTitle, setNewTaskTitle] = useState('');
 
   useEffect(() => {
     if (deal) {
       setFormData(deal);
       setIsEditing(false);
     }
   }, [deal]);
 
   if (!deal) return null;
 
   const stage = DEAL_STAGES.find(s => s.value === deal.status) || DEAL_STAGES[0];
   const health = calculateDealHealth(deal);
 
   const handleSave = async () => {
     const { id, user_id, created_at, updated_at, stage_entered_at, ...updates } = formData;
     await updateDeal({ id: deal.id, ...updates });
     setIsEditing(false);
   };
 
   const handleConvert = async () => {
     if (confirm('Convert this deal to a client? This will mark the deal as Won.')) {
       await convertToClient(deal);
       onOpenChange(false);
     }
   };
 
   const handleDelete = async () => {
     if (confirm('Are you sure you want to delete this deal?')) {
       await deleteDeal(deal.id);
       onOpenChange(false);
     }
   };
 
   const handleAddTask = async () => {
     if (!newTaskTitle.trim()) return;
     await createTask({ deal_id: deal.id, title: newTaskTitle.trim() });
     setNewTaskTitle('');
   };
 
   const getActivityIcon = (type: string) => {
     const activityType = ACTIVITY_TYPES.find(t => t.value === type);
     if (activityType) {
       const Icon = iconMap[activityType.icon];
       return Icon ? <Icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
     }
     return <FileText className="h-4 w-4" />;
   };
 
   return (
     <Sheet open={open} onOpenChange={onOpenChange}>
       <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
         <SheetHeader className="space-y-4 pb-4 border-b">
           {/* Deal Header */}
           <div className="flex items-start justify-between gap-4">
             <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                 <SheetTitle className="truncate">{deal.name}</SheetTitle>
                 {deal.priority === 'high' && (
                   <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                 )}
               </div>
               {deal.company && (
                 <div className="flex items-center gap-1 text-muted-foreground">
                   <Building2 className="h-4 w-4" />
                   <span>{deal.company}</span>
                 </div>
               )}
             </div>
             
             {/* Health Badge */}
             <Badge
               variant="outline"
               className={cn(
                 "shrink-0",
                 health.level === 'healthy' && "border-success text-success",
                 health.level === 'warning' && "border-warning text-warning",
                 health.level === 'critical' && "border-destructive text-destructive"
               )}
             >
               {health.score}% Health
             </Badge>
           </div>
 
           {/* Quick Stats */}
           <div className="grid grid-cols-3 gap-3">
             <div className="bg-muted/50 rounded-lg p-3 text-center">
               <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
               <p className="text-lg font-bold">
                 {deal.estimated_value ? formatMaluti(deal.estimated_value) : '-'}
               </p>
               <p className="text-xs text-muted-foreground">Value</p>
             </div>
             <div className="bg-muted/50 rounded-lg p-3 text-center">
               <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
               <p className="text-lg font-bold">{deal.win_probability || 50}%</p>
               <p className="text-xs text-muted-foreground">Probability</p>
             </div>
             <div className="bg-muted/50 rounded-lg p-3 text-center">
               <Calendar className="h-4 w-4 mx-auto mb-1 text-primary" />
               <p className="text-lg font-bold">
                 {deal.expected_close_date 
                   ? format(parseISO(deal.expected_close_date), 'MMM d')
                   : '-'
                 }
               </p>
               <p className="text-xs text-muted-foreground">Expected Close</p>
             </div>
           </div>
 
           {/* Action Buttons */}
           <div className="flex gap-2">
             {deal.status !== 'won' && deal.status !== 'lost' && (
               <Button variant="success" size="sm" className="flex-1" onClick={handleConvert}>
                 <UserPlus className="h-4 w-4 mr-1" />
                 Convert to Client
               </Button>
             )}
             <Button variant="outline" size="sm" onClick={onAddActivity}>
               <Plus className="h-4 w-4 mr-1" />
               Add Activity
             </Button>
           </div>
         </SheetHeader>
 
         <Tabs defaultValue="details" className="mt-6">
           <TabsList className="grid w-full grid-cols-3">
             <TabsTrigger value="details">Details</TabsTrigger>
             <TabsTrigger value="timeline">
               Timeline ({activities.length})
             </TabsTrigger>
             <TabsTrigger value="tasks">
               Tasks ({tasks.length})
             </TabsTrigger>
           </TabsList>
 
           {/* Details Tab */}
           <TabsContent value="details" className="space-y-4 mt-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Stage</Label>
                 <Select
                   value={formData.status}
                   onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                   disabled={!isEditing}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {DEAL_STAGES.map((s) => (
                       <SelectItem key={s.value} value={s.value}>
                         <div className="flex items-center gap-2">
                           <div className={cn("w-2 h-2 rounded-full", s.color)} />
                           {s.label}
                         </div>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               <div>
                 <Label>Priority</Label>
                 <Select
                   value={formData.priority || 'medium'}
                   onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                   disabled={!isEditing}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {DEAL_PRIORITIES.map((p) => (
                       <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               <div className="col-span-2">
                 <Label>Win Probability: {formData.win_probability || 50}%</Label>
                 <Slider
                   value={[formData.win_probability || 50]}
                   onValueChange={([value]) => setFormData(prev => ({ ...prev, win_probability: value }))}
                   max={100}
                   step={5}
                   disabled={!isEditing}
                   className="mt-2"
                 />
               </div>
 
               <div>
                 <Label>Deal Value (M)</Label>
                 <Input
                   type="number"
                   value={formData.estimated_value || ''}
                   onChange={(e) => setFormData(prev => ({ 
                     ...prev, 
                     estimated_value: e.target.value ? parseFloat(e.target.value) : null 
                   }))}
                   disabled={!isEditing}
                 />
               </div>
 
               <div>
                 <Label>Expected Close Date</Label>
                 <Input
                   type="date"
                   value={formData.expected_close_date || ''}
                   onChange={(e) => setFormData(prev => ({ ...prev, expected_close_date: e.target.value || null }))}
                   disabled={!isEditing}
                 />
               </div>
 
               <div>
                 <Label>Email</Label>
                 <Input
                   type="email"
                   value={formData.email || ''}
                   onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                   disabled={!isEditing}
                 />
               </div>
 
               <div>
                 <Label>Phone</Label>
                 <Input
                   value={formData.phone || ''}
                   onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                   disabled={!isEditing}
                 />
               </div>
 
               <div>
                 <Label>Next Follow-up</Label>
                 <Input
                   type="date"
                   value={formData.next_follow_up || ''}
                   onChange={(e) => setFormData(prev => ({ ...prev, next_follow_up: e.target.value || null }))}
                   disabled={!isEditing}
                 />
               </div>
 
               <div>
                 <Label>Company</Label>
                 <Input
                   value={formData.company || ''}
                   onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                   disabled={!isEditing}
                 />
               </div>
 
               {deal.status === 'lost' && (
                 <div className="col-span-2">
                   <Label>Loss Reason</Label>
                   <Textarea
                     value={formData.loss_reason || ''}
                     onChange={(e) => setFormData(prev => ({ ...prev, loss_reason: e.target.value }))}
                     disabled={!isEditing}
                     rows={2}
                   />
                 </div>
               )}
 
               <div className="col-span-2">
                 <Label>Notes</Label>
                 <Textarea
                   value={formData.notes || ''}
                   onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                   disabled={!isEditing}
                   rows={3}
                 />
               </div>
             </div>
 
             {/* Health Warnings */}
             {health.reasons.length > 0 && (
               <div className={cn(
                 "p-3 rounded-lg",
                 health.level === 'critical' ? "bg-destructive/10" : "bg-warning/10"
               )}>
                 <div className="flex items-center gap-2 mb-2">
                   <AlertTriangle className={cn(
                     "h-4 w-4",
                     health.level === 'critical' ? "text-destructive" : "text-warning"
                   )} />
                   <span className="font-medium text-sm">Deal Health Issues</span>
                 </div>
                 <ul className="text-sm space-y-1">
                   {health.reasons.map((reason, i) => (
                     <li key={i} className="text-muted-foreground">• {reason}</li>
                   ))}
                 </ul>
               </div>
             )}
 
             <div className="flex justify-between pt-4 border-t">
               <div className="text-sm text-muted-foreground">
                 Created {formatDistanceToNow(parseISO(deal.created_at), { addSuffix: true })}
               </div>
               <div className="flex gap-2">
                 {isEditing ? (
                   <>
                     <Button variant="outline" size="sm" onClick={() => { setFormData(deal); setIsEditing(false); }}>
                       <X className="h-4 w-4 mr-1" />
                       Cancel
                     </Button>
                     <Button size="sm" onClick={handleSave}>
                       <Save className="h-4 w-4 mr-1" />
                       Save
                     </Button>
                   </>
                 ) : (
                   <>
                     <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                       Edit
                     </Button>
                     <Button variant="destructive" size="sm" onClick={handleDelete}>
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </>
                 )}
               </div>
             </div>
           </TabsContent>
 
           {/* Timeline Tab */}
           <TabsContent value="timeline" className="mt-4">
             <ScrollArea className="h-[400px]">
               {activitiesLoading ? (
                 <div className="text-center text-muted-foreground py-8">Loading...</div>
               ) : activities.length === 0 ? (
                 <div className="text-center text-muted-foreground py-8">
                   <p>No activities recorded yet.</p>
                   <Button variant="outline" size="sm" className="mt-2" onClick={onAddActivity}>
                     Add First Activity
                   </Button>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {activities.map((activity) => {
                     const activityType = ACTIVITY_TYPES.find(t => t.value === activity.activity_type);
                     return (
                       <div key={activity.id} className="flex gap-3 group">
                         <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                           {getActivityIcon(activity.activity_type)}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between">
                             <Badge variant="secondary" className="text-xs">
                               {activityType?.label || activity.activity_type}
                             </Badge>
                             <div className="flex items-center gap-2">
                               <span className="text-xs text-muted-foreground">
                                 {formatDistanceToNow(parseISO(activity.created_at), { addSuffix: true })}
                               </span>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                 onClick={() => deleteActivity(activity.id)}
                               >
                                 <Trash2 className="h-3 w-3 text-destructive" />
                               </Button>
                             </div>
                           </div>
                           <p className="text-sm mt-1">{activity.content}</p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
             </ScrollArea>
           </TabsContent>
 
           {/* Tasks Tab */}
           <TabsContent value="tasks" className="mt-4">
             <div className="space-y-4">
               {/* Add Task */}
               <div className="flex gap-2">
                 <Input
                   placeholder="Add a task..."
                   value={newTaskTitle}
                   onChange={(e) => setNewTaskTitle(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                 />
                 <Button size="sm" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                   <Plus className="h-4 w-4" />
                 </Button>
               </div>
 
               <ScrollArea className="h-[350px]">
                 {tasksLoading ? (
                   <div className="text-center text-muted-foreground py-8">Loading...</div>
                 ) : tasks.length === 0 ? (
                   <div className="text-center text-muted-foreground py-8">
                     No tasks yet. Add one above!
                   </div>
                 ) : (
                   <div className="space-y-2">
                     {tasks.map((task) => (
                       <div 
                         key={task.id} 
                         className={cn(
                           "flex items-center gap-3 p-3 rounded-lg border bg-card group",
                           task.is_completed && "opacity-60"
                         )}
                       >
                         <button
                           onClick={() => toggleTask(task.id, !task.is_completed)}
                           className="shrink-0"
                         >
                           {task.is_completed ? (
                             <CheckCircle2 className="h-5 w-5 text-success" />
                           ) : (
                             <Circle className="h-5 w-5 text-muted-foreground" />
                           )}
                         </button>
                         <div className="flex-1 min-w-0">
                           <p className={cn(
                             "text-sm font-medium",
                             task.is_completed && "line-through"
                           )}>
                             {task.title}
                           </p>
                           {task.due_date && (
                             <p className="text-xs text-muted-foreground">
                               Due: {format(parseISO(task.due_date), 'MMM d, yyyy')}
                             </p>
                           )}
                         </div>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-6 w-6 opacity-0 group-hover:opacity-100"
                           onClick={() => deleteTask(task.id)}
                         >
                           <Trash2 className="h-3 w-3 text-destructive" />
                         </Button>
                       </div>
                     ))}
                   </div>
                 )}
               </ScrollArea>
             </div>
           </TabsContent>
         </Tabs>
       </SheetContent>
     </Sheet>
   );
 }