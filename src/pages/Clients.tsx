import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Building2, Mail, Phone, MapPin, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClients } from '@/hooks/useClients';

// Mobile Client Card Component
function ClientCard({ 
  client, 
  onDelete 
}: { 
  client: { id: string; company: string; contactPerson: string | null; email: string | null; phone: string | null; address: string | null }; 
  onDelete: (id: string) => void 
}) {
  return (
    <div className="mobile-card animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-card-foreground truncate">{client.company}</p>
            {client.contactPerson && (
              <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(client.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mt-3 space-y-1.5 text-sm">
        {client.email && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </p>
        )}
        {client.phone && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{client.phone}</span>
          </p>
        )}
        {client.address && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{client.address}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function Clients() {
  const { clients, isLoading, createClient, deleteClient } = useClients();
  const [isOpen, setIsOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    company: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleAddClient = async () => {
    if (!newClient.company) return;
    
    await createClient({
      company: newClient.company,
      contactPerson: newClient.contactPerson || undefined,
      email: newClient.email || undefined,
      phone: newClient.phone || undefined,
      address: newClient.address || undefined,
    });
    
    setNewClient({ company: '', contactPerson: '', email: '', phone: '', address: '' });
    setIsOpen(false);
  };

  const handleDeleteClient = async (id: string) => {
    await deleteClient(id);
  };

  return (
    <DashboardLayout>
      <Header 
        title="Clients" 
        subtitle="Manage your client profiles and contact information"
        action={{
          label: 'Add Client',
          onClick: () => setIsOpen(true),
        }}
      />
      
      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Building2 className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No clients yet</p>
              <p className="text-sm">Add your first client to get started</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {clients.map((client) => (
                <ClientCard 
                  key={client.id} 
                  client={client} 
                  onDelete={handleDeleteClient} 
                />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="font-semibold">Organisation</TableHead>
                    <TableHead className="font-semibold">Contact Person</TableHead>
                    <TableHead className="font-semibold">Contact Details</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client, index) => (
                    <TableRow 
                      key={client.id} 
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{client.company}</p>
                            {client.address && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {client.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{client.contactPerson || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.email && (
                            <p className="text-sm flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {client.email}
                            </p>
                          )}
                          {client.phone && (
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {client.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClient(client.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[calc(100%-2rem)] mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Organisation Name</Label>
              <Input
                id="company"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                placeholder="Company / Organisation Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={newClient.contactPerson}
                onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                placeholder="John Smith"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                placeholder="+266 2231 1234"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                placeholder="123 Kingsway, Maseru"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleAddClient} disabled={!newClient.company} className="w-full sm:w-auto">
              Add Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
