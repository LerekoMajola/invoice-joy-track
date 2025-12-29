import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Building2, Mail, Phone, MapPin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Client {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  invoices: number;
}

const initialClients: Client[] = [
  {
    id: '1',
    company: 'Acme Corporation',
    contactPerson: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '+266 2231 1234',
    address: '123 Kingsway, Maseru',
    totalSpent: 15420,
    invoices: 8,
  },
  {
    id: '2',
    company: 'TechStart Inc',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@techstart.io',
    phone: '+266 2231 5678',
    address: '456 Pioneer Mall, Maseru',
    totalSpent: 28750,
    invoices: 12,
  },
  {
    id: '3',
    company: 'Global Solutions Ltd',
    contactPerson: 'Michael Chen',
    email: 'michael@globalsolutions.com',
    phone: '+266 2231 9012',
    address: '789 LNDC Building, Maseru',
    totalSpent: 9800,
    invoices: 5,
  },
  {
    id: '4',
    company: 'StartUp Labs',
    contactPerson: 'Emily Davis',
    email: 'emily@startuplabs.co',
    phone: '+266 2231 3456',
    address: '321 Ha Hoohlo, Maseru',
    totalSpent: 42100,
    invoices: 18,
  },
];

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isOpen, setIsOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    company: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleAddClient = () => {
    const client: Client = {
      id: Date.now().toString(),
      ...newClient,
      totalSpent: 0,
      invoices: 0,
    };
    setClients([...clients, client]);
    setNewClient({ company: '', contactPerson: '', email: '', phone: '', address: '' });
    setIsOpen(false);
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
      
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-semibold">Organisation</TableHead>
                <TableHead className="font-semibold">Contact Person</TableHead>
                <TableHead className="font-semibold">Contact Details</TableHead>
                <TableHead className="font-semibold text-right">Total Spent</TableHead>
                <TableHead className="font-semibold text-center">Invoices</TableHead>
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
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {client.address}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{client.contactPerson}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {client.email}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {client.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    M{client.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{client.invoices}</Badge>
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
                        <DropdownMenuItem className="text-destructive">
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
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClient}>Add Client</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
