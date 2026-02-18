import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Trash2, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminRole } from '@/hooks/useAdminRole';

interface DeletedTenant {
  id: string;
  user_id: string;
  company_name: string;
  email: string | null;
  deleted_at: string;
}

const RECYCLE_BIN_DAYS = 90;

export function RecycleBinSection() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAdminRole();
  const queryClient = useQueryClient();

  const { data: deletedTenants } = useQuery({
    queryKey: ['admin-tenants-deleted'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('company_profiles')
        .select('id, user_id, company_name, email, deleted_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;

      // Deduplicate by user_id — pick the primary profile per user
      const byUser: Record<string, typeof profiles[0]> = {};
      (profiles || []).forEach((p: any) => {
        if (!byUser[p.user_id]) byUser[p.user_id] = p;
      });

      return Object.values(byUser) as DeletedTenant[];
    },
    enabled: isAdmin,
  });

  const restoreMutation = useMutation({
    mutationFn: async (tenant: DeletedTenant) => {
      const { error: cpError } = await supabase
        .from('company_profiles')
        .update({ deleted_at: null } as any)
        .eq('user_id', tenant.user_id);
      if (cpError) throw cpError;

      const { error: subError } = await supabase
        .from('subscriptions')
        .update({ deleted_at: null } as any)
        .eq('user_id', tenant.user_id);
      if (subError) throw subError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tenants-deleted'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Tenant restored successfully');
    },
    onError: () => {
      toast.error('Failed to restore tenant');
    },
  });

  const count = deletedTenants?.length || 0;

  if (count === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Recycle Bin ({count})
          </span>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Deleted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedTenants?.map((tenant) => {
                const daysSinceDelete = differenceInDays(new Date(), new Date(tenant.deleted_at));
                const daysRemaining = RECYCLE_BIN_DAYS - daysSinceDelete;
                const isExpired = daysRemaining <= 0;

                return (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.company_name}</TableCell>
                    <TableCell>{tenant.email || '-'}</TableCell>
                    <TableCell>{format(new Date(tenant.deleted_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          {daysRemaining} days remaining
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreMutation.mutate(tenant)}
                        disabled={restoreMutation.isPending}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
