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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Loader2, Package, Pencil, Plus, Trash2 } from 'lucide-react';
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

const emptyForm = {
  name: '',
  key: '',
  description: '',
  monthly_price: '',
  icon: 'package',
  is_core: false,
  sort_order: '',
};

function nameToKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export function ModuleManagement() {
  const queryClient = useQueryClient();
  const [editModule, setEditModule] = useState<PlatformModule | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Add module state
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<PlatformModule | null>(null);

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

  const invalidateModules = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-platform-modules'] });
    queryClient.invalidateQueries({ queryKey: ['platform-modules'] });
  };

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('platform_modules')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateModules();
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
      invalidateModules();
      toast.success('Module updated');
      setEditModule(null);
    },
    onError: () => toast.error('Failed to update module'),
  });

  const insertModule = useMutation({
    mutationFn: async (mod: {
      name: string; key: string; description: string;
      monthly_price: number; icon: string; is_core: boolean; sort_order: number;
    }) => {
      const { error } = await supabase
        .from('platform_modules')
        .insert(mod);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateModules();
      toast.success('Module created');
      closeAddDialog();
    },
    onError: (err: any) => {
      if (err?.message?.includes('duplicate key') || err?.message?.includes('unique')) {
        toast.error('A module with that key already exists');
      } else {
        toast.error('Failed to create module');
      }
    },
  });

  const deleteModule = useMutation({
    mutationFn: async (id: string) => {
      // Check if any users have this module
      const { count, error: countErr } = await supabase
        .from('user_modules')
        .select('id', { count: 'exact', head: true })
        .eq('module_id', id);
      if (countErr) throw countErr;
      if (count && count > 0) {
        throw new Error(`Cannot delete: ${count} user(s) are subscribed to this module.`);
      }
      const { error } = await supabase
        .from('platform_modules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateModules();
      toast.success('Module deleted');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete module');
      setDeleteTarget(null);
    },
  });

  // Edit handlers
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

  // Add handlers
  const closeAddDialog = () => {
    setAddOpen(false);
    setAddForm(emptyForm);
    setKeyManuallyEdited(false);
  };

  const handleAddNameChange = (name: string) => {
    setAddForm(prev => ({
      ...prev,
      name,
      ...(keyManuallyEdited ? {} : { key: nameToKey(name) }),
    }));
  };

  const handleAddSubmit = () => {
    if (!addForm.name.trim() || !addForm.key.trim()) {
      toast.error('Name and key are required');
      return;
    }
    insertModule.mutate({
      name: addForm.name.trim(),
      key: addForm.key.trim(),
      description: addForm.description.trim(),
      monthly_price: parseFloat(addForm.monthly_price) || 0,
      icon: addForm.icon.trim() || 'package',
      is_core: addForm.is_core,
      sort_order: parseInt(addForm.sort_order) || modules.length,
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Module Management
              </CardTitle>
              <CardDescription>
                Manage available modules, pricing, and availability for all tenants.
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Module
            </Button>
          </div>
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

                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatMaluti(mod.monthly_price)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(mod)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {!mod.is_core && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(mod)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
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

      {/* Edit Module Dialog */}
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

      {/* Add Module Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => !open && closeAddDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Inventory Management"
                value={addForm.name}
                onChange={(e) => handleAddNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                placeholder="e.g. inventory_management"
                value={addForm.key}
                onChange={(e) => {
                  setKeyManuallyEdited(true);
                  setAddForm(prev => ({ ...prev, key: e.target.value }));
                }}
              />
              <p className="text-xs text-muted-foreground">Auto-generated from name. Edit if needed.</p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Short description shown during signup"
                value={addForm.description}
                onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Price (Maluti)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={addForm.monthly_price}
                  onChange={(e) => setAddForm(prev => ({ ...prev, monthly_price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  placeholder={modules.length.toString()}
                  value={addForm.sort_order}
                  onChange={(e) => setAddForm(prev => ({ ...prev, sort_order: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Icon (Lucide name)</Label>
              <Input
                placeholder="e.g. Package, Warehouse, Truck"
                value={addForm.icon}
                onChange={(e) => setAddForm(prev => ({ ...prev, icon: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={addForm.is_core}
                onCheckedChange={(checked) => setAddForm(prev => ({ ...prev, is_core: checked }))}
              />
              <Label>Core module (required for all users)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAddDialog}>Cancel</Button>
            <Button onClick={handleAddSubmit} disabled={insertModule.isPending}>
              {insertModule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Module"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone. Modules with active subscribers cannot be deleted.`}
        onConfirm={() => deleteTarget && deleteModule.mutate(deleteTarget.id)}
        variant="destructive"
        confirmLabel="Delete"
      />
    </>
  );
}
