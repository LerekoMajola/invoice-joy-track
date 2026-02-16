import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Trash2, CheckCircle, XCircle, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminSignups, type AdminSignup } from '@/hooks/useAdminSignups';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

const systemColors: Record<string, string> = {
  business: 'bg-primary/10 text-primary',
  workshop: 'bg-accent/50 text-accent-foreground',
  school: 'bg-secondary text-secondary-foreground',
  legal: 'bg-muted text-muted-foreground',
  hire: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  guesthouse: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
  fleet: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
  gym: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
};

export function SignupsTab() {
  const { data: signups, isLoading } = useAdminSignups();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [onboardFilter, setOnboardFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<AdminSignup | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-get-signups', {
        body: { action: 'delete', userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-signups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const filtered = (signups || []).filter((s) => {
    const q = search.toLowerCase();
    if (search && !s.email.toLowerCase().includes(q) && !(s.first_name || '').toLowerCase().includes(q) && !(s.surname || '').toLowerCase().includes(q) && !(s.phone || '').toLowerCase().includes(q)) return false;
    if (onboardFilter === 'yes' && !s.onboarded) return false;
    if (onboardFilter === 'no' && s.onboarded) return false;
    if (systemFilter !== 'all' && s.system_type !== systemFilter) return false;
    return true;
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading sign-ups...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={onboardFilter} onValueChange={setOnboardFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Onboarding" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Onboarded</SelectItem>
            <SelectItem value="no">Not Onboarded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={systemFilter} onValueChange={setSystemFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="school">School</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="hire">HirePro</SelectItem>
            <SelectItem value="guesthouse">StayPro</SelectItem>
            <SelectItem value="fleet">FleetPro</SelectItem>
            <SelectItem value="gym">GymPro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">{filtered.length} sign-ups</div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>System</TableHead>
            <TableHead>Onboarded</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Signed Up</TableHead>
            <TableHead className="w-[60px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No sign-ups found
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((signup) => (
              <TableRow key={signup.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {signup.first_name || signup.surname
                    ? `${signup.first_name || ''} ${signup.surname || ''}`.trim()
                    : <span className="text-muted-foreground text-sm">—</span>}
                </TableCell>
                <TableCell>{signup.email}</TableCell>
                <TableCell>
                  {signup.phone || <span className="text-muted-foreground text-sm">—</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={systemColors[signup.system_type] || ''}>
                    {signup.system_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {signup.onboarded ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </TableCell>
                <TableCell>
                  {signup.subscription_status ? (
                    <Badge variant="outline">{signup.subscription_status}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(signup.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(signup)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User"
        description={`This will permanently delete ${deleteTarget?.email} and all their data. This cannot be undone.`}
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
