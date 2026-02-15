import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFleetDrivers } from '@/hooks/useFleetDrivers';
import { AddDriverDialog } from './AddDriverDialog';
import { Plus, Users, AlertTriangle, Trash2, Shield } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { PhoneInput } from '@/components/ui/phone-input';

interface DriversTabProps {}

export function DriversTab({}: DriversTabProps) {
  const { drivers, expiringLicenses, createDriver, deleteDriver } = useFleetDrivers();
  const [showAdd, setShowAdd] = useState(false);

  const getLicenseBadge = (expiry: string | null) => {
    if (!expiry) return <Badge variant="outline">No license</Badge>;
    const days = differenceInDays(parseISO(expiry), new Date());
    if (days < 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 30) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Expires in {days}d</Badge>;
    return <Badge variant="outline" className="text-emerald-600">Valid</Badge>;
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Low Risk</Badge>;
    if (score >= 50) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Medium Risk</Badge>;
    return <Badge variant="destructive">High Risk</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Driver Management</h3>
          <p className="text-sm text-muted-foreground">{drivers.length} drivers · {expiringLicenses.length} license alerts</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm"><Plus className="h-4 w-4 mr-1" />Add Driver</Button>
      </div>

      {expiringLicenses.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-600"><AlertTriangle className="h-4 w-4" />License Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expiringLicenses.map(d => (
              <div key={d.id} className="flex items-center justify-between p-2 rounded-lg border border-amber-500/20 bg-background text-sm">
                <span className="font-medium">{d.fullName}</span>
                {getLicenseBadge(d.licenseExpiry)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />All Drivers</CardTitle>
          <CardDescription>Driver profiles, licenses, and risk scoring</CardDescription>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No drivers registered yet.</p>
          ) : (
            <div className="space-y-2">
              {drivers.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{d.fullName}</p>
                      {getRiskBadge(d.riskScore)}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      {d.licenseNumber && <span>License: {d.licenseNumber}</span>}
                      <span>Type: {d.licenseType}</span>
                      {d.phone && <span>{d.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getLicenseBadge(d.licenseExpiry)}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteDriver(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddDriverDialog open={showAdd} onOpenChange={setShowAdd} onSubmit={createDriver} />
    </div>
  );
}
