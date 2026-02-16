import { useState } from 'react';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export function CompanySwitcher() {
  const { companies, activeCompany, switchCompany, addCompany, canAddMore, isLoading } = useActiveCompany();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) return;
    setIsAdding(true);
    const result = await addCompany(newCompanyName.trim());
    if (result) {
      setShowAddDialog(false);
      setNewCompanyName('');
    }
    setIsAdding(false);
  };

  if (isLoading) {
    return <Skeleton className="h-9 w-32" />;
  }

  // If user has only one company, show simple display (no dropdown)
  if (companies.length <= 1) {
    return (
      <div className="flex items-center">
        <div className="bg-card border border-border rounded-xl px-3 py-1.5 shadow-card">
          {activeCompany?.logo_url ? (
            <img
              src={activeCompany.logo_url}
              alt={activeCompany.company_name || 'Company'}
              className="h-7 w-auto max-w-[120px] object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-semibold text-xs truncate text-foreground max-w-[80px]">
                {activeCompany?.company_name || 'My Business'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 shadow-card h-auto hover:bg-accent/50">
            {activeCompany?.logo_url ? (
              <img
                src={activeCompany.logo_url}
                alt={activeCompany.company_name || 'Company'}
                className="h-7 w-auto max-w-[100px] object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-semibold text-xs truncate max-w-[80px]">
                  {activeCompany?.company_name || 'My Business'}
                </span>
              </div>
            )}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => switchCompany(company.id)}
              className="flex items-center gap-2"
            >
              {company.logo_url ? (
                <img src={company.logo_url} alt="" className="h-5 w-5 object-contain rounded" />
              ) : (
                <Building2 className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="flex-1 truncate text-sm">{company.company_name}</span>
              {company.id === activeCompany?.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          {canAddMore && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Company</span>
                <span className="text-xs text-muted-foreground ml-auto">{companies.length}/5</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-company-name">Company Name</Label>
              <Input
                id="new-company-name"
                placeholder="Enter company name"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCompany()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You can manage up to 5 companies under one subscription. Each company has its own branding, clients, and financial data.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCompany} disabled={isAdding || !newCompanyName.trim()}>
              {isAdding ? 'Creating...' : 'Create Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
