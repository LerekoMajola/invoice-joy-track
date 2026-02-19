import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useStaff, StaffMember, StaffRole, StaffStatus } from '@/hooks/useStaff';
import { useModules } from '@/hooks/useModules';
import { useStaffModuleAccess } from '@/hooks/useStaffModuleAccess';
import { Loader2, Pencil, Trash2, UserCheck, UserX, Shield, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const editSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email').max(255),
  phone: z.string().max(20).optional().or(z.literal('')),
  jobTitle: z.string().max(100).optional().or(z.literal('')),
  employeeNumber: z.string().max(50).optional().or(z.literal('')),
  department: z.string().optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type EditFormData = z.infer<typeof editSchema>;

interface StaffDetailDialogProps {
  staff: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const departments = [
  { value: 'operations', label: 'Operations' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Other' },
];

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
  { value: 'viewer', label: 'Viewer' },
];

const getStatusBadge = (status: StaffStatus) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>;
    case 'invited':
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Invited</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getRoleBadge = (role: StaffRole) => {
  switch (role) {
    case 'admin':
      return <Badge className="bg-red-500/10 text-red-600 border-red-200">Admin</Badge>;
    case 'manager':
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Manager</Badge>;
    case 'staff':
      return <Badge className="bg-green-500/10 text-green-600 border-green-200">Staff</Badge>;
    case 'viewer':
      return <Badge variant="secondary">Viewer</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

export function StaffDetailDialog({ staff, open, onOpenChange }: StaffDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [editModuleIds, setEditModuleIds] = useState<string[]>([]);
  const [isSavingModule, setIsSavingModule] = useState(false);
  const { updateStaff, updateStaffRole, deleteStaff } = useStaff();
  const { toast } = useToast();
  const { userModules } = useModules();
  const { moduleIds, saveModuleAccess, isLoading: moduleAccessLoading } = useStaffModuleAccess(staff?.id);

  // Sync edit module selection when entering edit mode or when moduleIds load
  useEffect(() => {
    if (isEditing) {
      setEditModuleIds(moduleIds);
    }
  }, [isEditing, moduleIds]);

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: staff?.name || '',
      email: staff?.email || '',
      phone: staff?.phone || '',
      jobTitle: staff?.jobTitle || '',
      employeeNumber: staff?.employeeNumber || '',
      department: staff?.department || '',
      notes: staff?.notes || '',
    },
  });

  // Reset form when staff changes
  if (staff && form.getValues('name') !== staff.name) {
    form.reset({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      jobTitle: staff.jobTitle || '',
      employeeNumber: staff.employeeNumber || '',
      department: staff.department || '',
      notes: staff.notes || '',
    });
  }

  const toggleEditModule = (moduleId: string) => {
    setEditModuleIds((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleInlineModuleToggle = async (moduleId: string) => {
    if (!staff) return;
    const newIds = moduleIds.includes(moduleId)
      ? moduleIds.filter((id) => id !== moduleId)
      : [...moduleIds, moduleId];
    setIsSavingModule(true);
    await saveModuleAccess(staff.id, newIds);
    setIsSavingModule(false);
  };

  const onSubmit = async (data: EditFormData) => {
    if (!staff) return;

    setIsSubmitting(true);
    try {
      const success = await updateStaff(staff.id, {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        jobTitle: data.jobTitle || undefined,
        employeeNumber: data.employeeNumber || undefined,
        department: data.department || undefined,
        notes: data.notes || undefined,
      });

      if (success) {
        // Also save module access changes
        await saveModuleAccess(staff.id, editModuleIds);
        setIsEditing(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (role: StaffRole) => {
    if (!staff) return;
    await updateStaffRole(staff.id, role);
  };

  const handleStatusToggle = async () => {
    if (!staff) return;
    const newStatus: StaffStatus = staff.status === 'active' ? 'inactive' : 'active';
    await updateStaff(staff.id, { status: newStatus });
  };

  const handleDelete = async () => {
    if (!staff) return;
    const success = await deleteStaff(staff.id);
    if (success) {
      setShowDeleteAlert(false);
      onOpenChange(false);
    }
  };

  if (!staff) return null;

  // Map moduleIds to module names for the view mode
  const accessibleModules = userModules.filter((um) => moduleIds.includes(um.module_id));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Staff Member Details</span>
              <div className="flex items-center gap-2">
                {getStatusBadge(staff.status)}
                {getRoleBadge(staff.role)}
              </div>
            </DialogTitle>
          </DialogHeader>

          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. EMP001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea className="resize-none" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Module Access (Edit Mode) */}
                {userModules.length > 0 && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Module Access</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select which modules this staff member can access.
                    </p>
                    <div className="space-y-2">
                      {userModules.map((um) => (
                        <div key={um.module_id} className="flex items-center gap-3">
                          <Checkbox
                            id={`edit-module-${um.module_id}`}
                            checked={editModuleIds.includes(um.module_id)}
                            onCheckedChange={() => toggleEditModule(um.module_id)}
                          />
                          <Label
                            htmlFor={`edit-module-${um.module_id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {um.module?.name || 'Unknown Module'}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Left Column: Staff Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{staff.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{staff.email}</p>
                </div>
                {staff.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{staff.phone}</p>
                  </div>
                )}
                {staff.jobTitle && (
                  <div>
                    <p className="text-sm text-muted-foreground">Job Title</p>
                    <p className="font-medium">{staff.jobTitle}</p>
                  </div>
                )}
                {staff.employeeNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Employee Number</p>
                    <p className="font-medium">{staff.employeeNumber}</p>
                  </div>
                )}
                {staff.department && (
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium capitalize">{staff.department}</p>
                  </div>
                )}
                {staff.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium">{staff.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Invited</p>
                  <p className="font-medium">{format(new Date(staff.invitedAt), 'PPP')}</p>
                </div>
                {staff.joinedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{format(new Date(staff.joinedAt), 'PPP')}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Role, Modules, Actions */}
              <div className="space-y-4">
                {/* Role Selector */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Role</p>
                  <Select value={staff.role} onValueChange={(v) => handleRoleChange(v as StaffRole)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Module Access (Inline Checkboxes) */}
                {userModules.length > 0 && (
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Module Access</p>
                      {isSavingModule && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                    </div>
                    {moduleAccessLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {userModules.map((um) => (
                          <div key={um.module_id} className="flex items-center gap-3">
                            <Checkbox
                              id={`view-module-${um.module_id}`}
                              checked={moduleIds.includes(um.module_id)}
                              onCheckedChange={() => handleInlineModuleToggle(um.module_id)}
                              disabled={isSavingModule}
                            />
                            <Label
                              htmlFor={`view-module-${um.module_id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {um.module?.name || 'Unknown Module'}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {staff.userId && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isResending}
                      onClick={async () => {
                        setIsResending(true);
                        try {
                          const { data, error } = await supabase.functions.invoke('resend-staff-credentials', {
                            body: { staffMemberId: staff.id },
                          });
                          if (error) throw error;
                          if (data?.error) throw new Error(data.error);
                          toast({ title: 'Credentials sent', description: `New login credentials emailed to ${staff.email}` });
                        } catch (err: any) {
                          toast({ title: 'Error', description: err.message || 'Failed to resend credentials', variant: 'destructive' });
                        } finally {
                          setIsResending(false);
                        }
                      }}
                    >
                      {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                      Resend Credentials
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleStatusToggle}>
                    {staff.status === 'active' ? (
                      <>
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteAlert(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {staff.name} from your team. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
