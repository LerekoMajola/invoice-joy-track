import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Package, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { formatMaluti } from '@/lib/currency';

interface PlatformModule {
  id: string;
  name: string;
  key: string;
  description: string | null;
  monthly_price: number;
  icon: string;
  is_core: boolean;
  is_active: boolean;
  sort_order: number;
}

export function ModuleManagement() {
  const queryClient = useQueryClient();
  const [editModule, setEditModule] = useState<PlatformModule | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['admin-platform-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_modules')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as PlatformModule[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('platform_modules')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-modules'] });
      queryClient.invalidateQueries({ queryKey: ['platform-modules'] });
      toast.success('Module updated');
    },
    onError: () => toast.error('Failed to update module'),
  });

  const updateModule = useMutation({
    mutationFn: async ({ id, name, description, monthly_price }: {
      id: string; name: string; description: string; monthly_price: number;
    }) => {
      const { error } = await supabase
        .from('platform_modules')
        .update({ name, description, monthly_price })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-modules'] });
      queryClient.invalidateQueries({ queryKey: ['platform-modules'] });
      toast.success('Module updated');
      setEditModule(null);
    },
    onError: () => toast.error('Failed to update module'),
  });

  const openEdit = (mod: PlatformModule) => {
    setEditModule(mod);
    setEditName(mod.name);
    setEditDesc(mod.description || '');
    setEditPrice(mod.monthly_price.toString());
  };

  const handleSave = () => {
    if (!editModule) return;
    updateModule.mutate({
      id: editModule.id,
      name: editName,
      description: editDesc,
      monthly_price: parseFloat(editPrice) || 0,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Module Management
          </CardTitle>
          <CardDescription>
            Manage available modules, pricing, and availability for all tenants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{mod.name}</p>
                      {mod.is_core && (
                        <Badge variant="secondary" className="text-[10px]">Core</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-2">
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatMaluti(mod.monthly_price)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(mod)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Switch
                    checked={mod.is_active}
                    onCheckedChange={(checked) => toggleActive.mutate({ id: mod.id, is_active: checked })}
                    disabled={mod.is_core}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editModule} onOpenChange={(open) => !open && setEditModule(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Price (Maluti)</Label>
              <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModule(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateModule.isPending}>
              {updateModule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
