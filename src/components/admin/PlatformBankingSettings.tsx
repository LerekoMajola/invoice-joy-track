import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Building2 } from 'lucide-react';
import { usePlatformBanking, BankingDetails } from '@/hooks/usePlatformSettings';
import { toast } from 'sonner';

export function PlatformBankingSettings() {
  const { banking, isLoading, updateAll, defaults } = usePlatformBanking();
  const [form, setForm] = useState<BankingDetails>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) setForm(banking);
  }, [isLoading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAll(form);
      toast.success('Banking details saved!');
    } catch {
      toast.error('Failed to save banking details');
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof BankingDetails; label: string }[] = [
    { key: 'bank_name', label: 'Bank Name' },
    { key: 'bank_account_name', label: 'Account Name' },
    { key: 'bank_account_number', label: 'Account Number' },
    { key: 'bank_branch_code', label: 'Branch Code' },
    { key: 'bank_branch_name', label: 'Branch Name' },
    { key: 'bank_pop_email', label: 'POP Email Address' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Platform Banking Details
        </CardTitle>
        <CardDescription>
          These details appear on all invoices, billing pages, and payment emails sent to tenants.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{label}</label>
                  <Input
                    value={form[key]}
                    onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={defaults[key]}
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Banking Details</>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
