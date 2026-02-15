import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { useFleetDocuments } from '@/hooks/useFleetDocuments';
import { AddFleetDocumentDialog } from './AddFleetDocumentDialog';
import { Plus, FileText, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FleetDocumentsTabProps {
  vehicles: FleetVehicle[];
}

export function FleetDocumentsTab({ vehicles }: FleetDocumentsTabProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const { documents, expiringDocuments, uploadDocument, deleteDocument } = useFleetDocuments(selectedVehicle === 'all' ? undefined : selectedVehicle);
  const [showAdd, setShowAdd] = useState(false);

  const getVehicleLabel = (vid: string) => {
    const v = vehicles.find(v => v.id === vid);
    return v ? `${v.make} ${v.model}` : 'Unknown';
  };

  const getExpiryBadge = (expiry: string | null) => {
    if (!expiry) return null;
    const days = differenceInDays(parseISO(expiry), new Date());
    if (days < 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 30) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Expires in {days}d</Badge>;
    return <Badge variant="outline" className="text-emerald-600">{format(parseISO(expiry), 'dd MMM yyyy')}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All vehicles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.make} {v.model}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAdd(true)} size="sm"><Plus className="h-4 w-4 mr-1" />Upload Document</Button>
      </div>

      {expiringDocuments.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-600"><AlertTriangle className="h-4 w-4" />Expiring Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expiringDocuments.map(d => (
              <div key={d.id} className="flex items-center justify-between p-2 rounded-lg border border-amber-500/20 bg-background text-sm">
                <span>{d.documentType} — {getVehicleLabel(d.vehicleId)}</span>
                {getExpiryBadge(d.expiryDate)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Document Archive</CardTitle>
          <CardDescription>Insurance, roadworthy certificates, service invoices, and more</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {documents.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="font-medium text-sm truncate">{d.fileName || d.documentType}</p>
                      <Badge variant="outline" className="text-xs">{d.documentType}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{getVehicleLabel(d.vehicleId)} · {format(parseISO(d.createdAt), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getExpiryBadge(d.expiryDate)}
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost"><ExternalLink className="h-3.5 w-3.5" /></Button>
                    </a>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteDocument(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddFleetDocumentDialog open={showAdd} onOpenChange={setShowAdd} vehicles={vehicles} onSubmit={uploadDocument} />
    </div>
  );
}
