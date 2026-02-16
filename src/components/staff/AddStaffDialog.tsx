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
import { PhoneInput } from '@/components/ui/phone-input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStaff, CreateStaffData, StaffRole } from '@/hooks/useStaff';
import { useModules } from '@/hooks/useModules';
import { useStaffModuleAccess } from '@/hooks/useStaffModuleAccess';
import { Loader2, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StaffCredentialsDialog } from './StaffCredentialsDialog';
import { supabase } from '@/integrations/supabase/client';

const staffSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional().or(z.literal('')),
  jobTitle: z.string().max(100, 'Job title must be less than 100 characters').optional().or(z.literal('')),
  department: z.string().optional(),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().or(z.literal('')),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const departments = [
  { value: 'operations', label: 'Operations' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'admin', label: 'Admin' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
];

const jobTitleSuggestions = [
  'Technician',
  'Senior Technician',
  'Workshop Foreman',
];

const roles = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'manager', label: 'Manager', description: 'Can manage team data' },
  { value: 'staff', label: 'Staff', description: 'Can create and edit' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

export function AddStaffDialog({ open, onOpenChange }: AddStaffDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [credentialsData, setCredentialsData] = useState<{ name: string; email: string; tempPassword: string } | null>(null);
  const { createStaff, staff } = useStaff();
  const isAtLimit = staff.length >= 5;
  const { userModules } = useModules();
  const { saveModuleAccess } = useStaffModuleAccess();

  // Pre-select all of the tenant's active modules
  useEffect(() => {
    if (open && userModules.length > 0) {
      setSelectedModuleIds(userModules.map((um) => um.module_id));
    }
  }, [open, userModules]);

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      jobTitle: '',
      department: '',
      role: 'staff',
      notes: '',
    },
  });

  const toggleModule = (moduleId: string) => {
    setSelectedModuleIds((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      const staffData: CreateStaffData = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        jobTitle: data.jobTitle || undefined,
        department: data.department || undefined,
        role: data.role as StaffRole,
        notes: data.notes || undefined,
      };

      const result = await createStaff(staffData);
      if (result) {
        // Save module access for the new staff member
        await saveModuleAccess(result.id, selectedModuleIds);

        // Create auth account for the staff member
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const response = await supabase.functions.invoke('create-staff-account', {
            body: {
              staffMemberId: result.id,
              name: data.name,
              email: data.email,
            },
          });

          if (response.data?.tempPassword) {
            setCredentialsData({
              name: data.name,
              email: data.email,
              tempPassword: response.data.tempPassword,
            });
          }
        } catch (err) {
          console.error('Failed to create staff account:', err);
        }

        form.reset();
        setSelectedModuleIds([]);
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                    <Input type="email" placeholder="john@company.com" {...field} />
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
                    <PhoneInput
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
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
                    <Input placeholder="e.g. Technician, Sales Manager" {...field} />
                  </FormControl>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {jobTitleSuggestions.map((title) => (
                      <Badge
                        key={title}
                        variant={field.value === title ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => form.setValue('jobTitle', title, { shouldValidate: true })}
                      >
                        {title}
                      </Badge>
                    ))}
                  </div>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col">
                            <span>{role.label}</span>
                            <span className="text-xs text-muted-foreground">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Module Access Section */}
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
                        id={`module-${um.module_id}`}
                        checked={selectedModuleIds.includes(um.module_id)}
                        onCheckedChange={() => toggleModule(um.module_id)}
                      />
                      <Label
                        htmlFor={`module-${um.module_id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {um.module?.name || 'Unknown Module'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this staff member..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAtLimit && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                Staff limit reached. Maximum 5 staff members allowed.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isAtLimit}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Staff Member
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    {credentialsData && (
      <StaffCredentialsDialog
        open={!!credentialsData}
        onOpenChange={(open) => { if (!open) setCredentialsData(null); }}
        staffName={credentialsData.name}
        email={credentialsData.email}
        tempPassword={credentialsData.tempPassword}
      />
    )}
    </>
  );
}

