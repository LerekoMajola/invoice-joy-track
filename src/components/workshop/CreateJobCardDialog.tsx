import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { useStaff } from '@/hooks/useStaff';
import { Loader2, UserPlus, Plus } from 'lucide-react';
import { AddStaffDialog } from '@/components/staff/AddStaffDialog';
import { AddClientDialog } from '@/components/crm/AddClientDialog';

interface CreateJobCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    clientId?: string;
    clientName: string;
    vehicleReg?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleVin?: string;
    vehicleMileage?: string;
    vehicleColor?: string;
    reportedIssue?: string;
    priority?: string;
    assignedTechnicianId?: string;
    assignedTechnicianName?: string;
    estimatedCompletion?: string;
    notes?: string;
  }) => Promise<any>;
}

export function CreateJobCardDialog({ open, onOpenChange, onSubmit }: CreateJobCardDialogProps) {
  const { clients, refetch: refetchClients } = useClients();
  const { staff: staffMembers, refetch: refetchStaff } = useStaff();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);

  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleVin, setVehicleVin] = useState('');
  const [vehicleMileage, setVehicleMileage] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [reportedIssue, setReportedIssue] = useState('');
  const [priority, setPriority] = useState('medium');
  const [technicianId, setTechnicianId] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [notes, setNotes] = useState('');

  const hasStaff = staffMembers.length > 0;

  const resetForm = () => {
    setClientId('');
    setClientName('');
    setVehicleReg('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleYear('');
    setVehicleVin('');
    setVehicleMileage('');
    setVehicleColor('');
    setReportedIssue('');
    setPriority('medium');
    setTechnicianId('');
    setTechnicianName('');
    setEstimatedCompletion('');
    setNotes('');
  };

  const handleClientSelect = (selectedId: string) => {
    setClientId(selectedId);
    const client = clients.find((c) => c.id === selectedId);
    if (client) setClientName(client.company);
  };

  const handleSubmit = async () => {
    if (!clientName.trim()) return;
    setIsSubmitting(true);

    const technician = hasStaff ? staffMembers.find((s) => s.id === technicianId) : null;

    await onSubmit({
      clientId: clientId || undefined,
      clientName,
      vehicleReg: vehicleReg || undefined,
      vehicleMake: vehicleMake || undefined,
      vehicleModel: vehicleModel || undefined,
      vehicleYear: vehicleYear || undefined,
      vehicleVin: vehicleVin || undefined,
      vehicleMileage: vehicleMileage || undefined,
      vehicleColor: vehicleColor || undefined,
      reportedIssue: reportedIssue || undefined,
      priority,
      assignedTechnicianId: technician?.id || undefined,
      assignedTechnicianName: technician?.name || technicianName || undefined,
      estimatedCompletion: estimatedCompletion || undefined,
      notes: notes || undefined,
    });

    resetForm();
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleAddStaffClose = (isOpen: boolean) => {
    setShowAddStaff(isOpen);
    if (!isOpen) refetchStaff();
  };

  const [pendingAutoSelect, setPendingAutoSelect] = useState(false);

  const handleAddClientClose = (isOpen: boolean) => {
    setShowAddClient(isOpen);
    if (!isOpen) {
      setPendingAutoSelect(true);
      refetchClients();
    }
  };

  // Auto-select newest client after AddClientDialog closes
  if (pendingAutoSelect && clients.length > 0) {
    const newest = clients[0]; // clients are ordered by created_at desc
    setClientId(newest.id);
    setClientName(newest.company);
    setPendingAutoSelect(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Job Card</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Client */}
            <div className="space-y-2">
              <Label>Client *</Label>
              {clients.length > 0 ? (
                <Select value={clientId} onValueChange={handleClientSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client name"
                />
              )}
              {clientId && (
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client display name"
                  className="mt-1"
                />
              )}
              <button
                type="button"
                onClick={() => setShowAddClient(true)}
                className="flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
              >
                <Plus className="h-3 w-3" />
                Add new client
              </button>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Vehicle Details
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Registration</Label>
                  <Input value={vehicleReg} onChange={(e) => setVehicleReg(e.target.value)} placeholder="e.g. ABC 123" />
                </div>
                <div>
                  <Label className="text-xs">Make</Label>
                  <Input value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="e.g. Toyota" />
                </div>
                <div>
                  <Label className="text-xs">Model</Label>
                  <Input value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="e.g. Hilux" />
                </div>
                <div>
                  <Label className="text-xs">Year</Label>
                  <Input value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} placeholder="e.g. 2022" />
                </div>
                <div>
                  <Label className="text-xs">VIN</Label>
                  <Input value={vehicleVin} onChange={(e) => setVehicleVin(e.target.value)} placeholder="Vehicle ID number" />
                </div>
                <div>
                  <Label className="text-xs">Mileage</Label>
                  <Input value={vehicleMileage} onChange={(e) => setVehicleMileage(e.target.value)} placeholder="e.g. 85000 km" />
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <Input value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} placeholder="e.g. White" />
                </div>
              </div>
            </div>

            {/* Reported Issue */}
            <div>
              <Label>Reported Issue</Label>
              <Textarea
                value={reportedIssue}
                onChange={(e) => setReportedIssue(e.target.value)}
                placeholder="What does the customer say is wrong?"
                rows={3}
              />
            </div>

            {/* Priority & Technician */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned Technician</Label>
                {hasStaff ? (
                  <Select value={technicianId} onValueChange={setTechnicianId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder="Enter technician name"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setShowAddStaff(true)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
                >
                  <UserPlus className="h-3 w-3" />
                  Add to your team
                </button>
              </div>
            </div>

            {/* Estimated Completion */}
            <div>
              <Label>Estimated Completion</Label>
              <Input
                type="date"
                value={estimatedCompletion}
                onChange={(e) => setEstimatedCompletion(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={2}
              />
            </div>

            <Button onClick={handleSubmit} disabled={!clientName.trim() || isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Job Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddStaffDialog open={showAddStaff} onOpenChange={handleAddStaffClose} />
      <AddClientDialog open={showAddClient} onOpenChange={handleAddClientClose} />
    </>
  );
}
