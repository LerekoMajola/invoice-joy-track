import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEquipmentServices } from '@/hooks/useEquipmentServices';
import { useEquipmentIncidents } from '@/hooks/useEquipmentIncidents';
import { AddEquipmentServiceDialog } from './AddEquipmentServiceDialog';
import { AddEquipmentIncidentDialog } from './AddEquipmentIncidentDialog';
import { useCurrency } from '@/hooks/useCurrency';
import type { EquipmentItem } from '@/hooks/useEquipment';
import { Plus, Wrench, AlertTriangle, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const statusColor: Record<string, string> = {
  available: 'bg-success/10 text-success',
  on_hire: 'bg-info/10 text-info',
  maintenance: 'bg-warning/10 text-warning',
  retired: 'bg-muted text-muted-foreground',
};

const severityColor: Record<string, string> = {
  minor: 'bg-warning/10 text-warning',
  moderate: 'bg-orange-100 text-orange-700',
  major: 'bg-destructive/10 text-destructive',
};

interface Props {
  item: EquipmentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EquipmentDetailDialog({ item, open, onOpenChange }: Props) {
  const { fc } = useCurrency();
  const { services, isLoading: servicesLoading, createService, deleteService, isCreating: isCreatingService } = useEquipmentServices(item?.id);
  const { incidents, isLoading: incidentsLoading, createIncident, toggleResolved, deleteIncident, isCreating: isCreatingIncident } = useEquipmentIncidents(item?.id);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [addIncidentOpen, setAddIncidentOpen] = useState(false);

  if (!item) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {item.name}
              <Badge className={statusColor[item.status] || ''} variant="secondary">
                {item.status.replace('_', ' ')}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="services" className="flex-1">Services ({services.length})</TabsTrigger>
              <TabsTrigger value="incidents" className="flex-1">Incidents ({incidents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><span className="text-xs text-muted-foreground">Category</span><p className="font-medium text-sm">{item.category}</p></div>
                <div><span className="text-xs text-muted-foreground">Condition</span><p className="font-medium text-sm capitalize">{item.condition}</p></div>
                {item.serial_number && <div><span className="text-xs text-muted-foreground">Serial Number</span><p className="font-medium text-sm">{item.serial_number}</p></div>}
                <div><span className="text-xs text-muted-foreground">Quantity</span><p className="font-medium text-sm">{item.available_quantity} / {item.quantity_total} available</p></div>
              </div>
              {item.quantity_total > 1 && <Progress value={(item.available_quantity / item.quantity_total) * 100} className="h-2" />}
              <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t">
                <div><span className="text-xs text-muted-foreground">Daily Rate</span><p className="font-bold text-sm">{fc(item.daily_rate)}</p></div>
                {item.weekly_rate && <div><span className="text-xs text-muted-foreground">Weekly Rate</span><p className="font-semibold text-sm">{fc(item.weekly_rate)}</p></div>}
                {item.monthly_rate && <div><span className="text-xs text-muted-foreground">Monthly Rate</span><p className="font-semibold text-sm">{fc(item.monthly_rate)}</p></div>}
              </div>
              {item.deposit_amount > 0 && (
                <div><span className="text-xs text-muted-foreground">Deposit</span><p className="font-medium text-sm">{fc(item.deposit_amount)}</p></div>
              )}
              {item.description && <div><span className="text-xs text-muted-foreground">Description</span><p className="text-sm">{item.description}</p></div>}
            </TabsContent>

            <TabsContent value="services" className="space-y-3 mt-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setAddServiceOpen(true)}><Plus className="h-4 w-4 mr-1" />Add Service</Button>
              </div>
              {servicesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : services.length === 0 ? (
                <Card><CardContent className="text-center py-8 text-muted-foreground"><Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />No service logs yet.</CardContent></Card>
              ) : (
                services.map(s => (
                  <Card key={s.id}>
                    <CardContent className="p-3 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize text-xs">{s.service_type}</Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(s.service_date), 'dd MMM yyyy')}</span>
                        </div>
                        {s.provider && <p className="text-xs text-muted-foreground">Provider: {s.provider}</p>}
                        {s.parts_replaced && <p className="text-xs text-muted-foreground">Parts: {s.parts_replaced}</p>}
                        {s.notes && <p className="text-xs mt-1">{s.notes}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm">{fc(s.cost)}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7 mt-1" onClick={() => deleteService(s.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="incidents" className="space-y-3 mt-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setAddIncidentOpen(true)}><Plus className="h-4 w-4 mr-1" />Log Incident</Button>
              </div>
              {incidentsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : incidents.length === 0 ? (
                <Card><CardContent className="text-center py-8 text-muted-foreground"><AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />No incidents logged.</CardContent></Card>
              ) : (
                incidents.map(inc => (
                  <Card key={inc.id}>
                    <CardContent className="p-3 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize text-xs">{inc.incident_type}</Badge>
                          <Badge className={`${severityColor[inc.severity] || ''} text-xs`} variant="secondary">{inc.severity}</Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(inc.date), 'dd MMM yyyy')}</span>
                        </div>
                        {inc.description && <p className="text-xs mt-1">{inc.description}</p>}
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <p className="font-semibold text-sm">{fc(inc.cost)}</p>
                        <Button
                          variant={inc.resolved ? 'secondary' : 'outline'}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toggleResolved({ id: inc.id, resolved: !inc.resolved })}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {inc.resolved ? 'Resolved' : 'Open'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AddEquipmentServiceDialog
        open={addServiceOpen}
        onOpenChange={setAddServiceOpen}
        equipmentItemId={item.id}
        onSubmit={createService}
        isCreating={isCreatingService}
      />
      <AddEquipmentIncidentDialog
        open={addIncidentOpen}
        onOpenChange={setAddIncidentOpen}
        equipmentItemId={item.id}
        onSubmit={createIncident}
        isCreating={isCreatingIncident}
      />
    </>
  );
}
