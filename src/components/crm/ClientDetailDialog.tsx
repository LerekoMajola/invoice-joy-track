import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Pencil, 
  Save, 
  X,
  Plus,
  Trash2,
  FileText,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { CRMClient, useCRMClients, CLIENT_STATUSES } from '@/hooks/useCRMClients';
import { useContacts, Contact } from '@/hooks/useContacts';
import { useClientActivities, ClientActivity, CLIENT_ACTIVITY_TYPES } from '@/hooks/useClientActivities';
import { formatMaluti } from '@/lib/currency';
import { format, parseISO } from 'date-fns';

interface ClientDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: CRMClient | null;
}

export function ClientDetailDialog({ open, onOpenChange, client }: ClientDetailDialogProps) {
  const { updateClient } = useCRMClients();
  const { contacts, createContact, deleteContact, setPrimaryContact } = useContacts(client?.id);
  const { activities, createActivity, deleteActivity } = useClientActivities(client?.id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
  });

  const [newContact, setNewContact] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
  });
  const [showAddContact, setShowAddContact] = useState(false);

  const [newActivity, setNewActivity] = useState({
    activity_type: 'note',
    content: '',
  });
  const [showAddActivity, setShowAddActivity] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        company: client.company,
        contactPerson: client.contactPerson || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        status: client.status,
      });
    }
  }, [client]);

  const handleSave = async () => {
    if (!client) return;
    await updateClient({
      id: client.id,
      company: formData.company,
      contactPerson: formData.contactPerson || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      status: formData.status,
    });
    setIsEditing(false);
  };

  const handleAddContact = async () => {
    if (!client || !newContact.name.trim()) return;
    await createContact({
      client_id: client.id,
      name: newContact.name,
      title: newContact.title || undefined,
      email: newContact.email || undefined,
      phone: newContact.phone || undefined,
      is_primary: contacts.length === 0,
    });
    setNewContact({ name: '', title: '', email: '', phone: '' });
    setShowAddContact(false);
  };

  const handleAddActivity = async () => {
    if (!client || !newActivity.content.trim()) return;
    await createActivity({
      client_id: client.id,
      activity_type: newActivity.activity_type,
      content: newActivity.content,
    });
    setNewActivity({ activity_type: 'note', content: '' });
    setShowAddActivity(false);
  };

  const getActivityIcon = (type: string) => {
    const activityType = CLIENT_ACTIVITY_TYPES.find(t => t.value === type);
    switch (activityType?.icon) {
      case 'Phone': return <Phone className="h-4 w-4" />;
      case 'Mail': return <Mail className="h-4 w-4" />;
      case 'Users': return <Users className="h-4 w-4" />;
      case 'Receipt': return <DollarSign className="h-4 w-4" />;
      case 'Clock': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-left">{client.company}</DialogTitle>
                <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
              </div>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="contacts">
              Contacts ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="activities">
              Activities ({activities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Organisation Name</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Contact Person</Label>
                    <Input
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLIENT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={CLIENT_STATUSES.find(s => s.value === client.status)?.color + ' text-white'}>
                    {CLIENT_STATUSES.find(s => s.value === client.status)?.label}
                  </Badge>
                  {client.source && (
                    <Badge variant="outline">Source: {client.source}</Badge>
                  )}
                </div>

                <div className="grid gap-3">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${client.email}`} className="hover:underline">
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${client.phone}`} className="hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {client.address}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatMaluti(client.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Activity</p>
                    <p className="text-sm">
                      {client.lastActivityAt 
                        ? format(parseISO(client.lastActivityAt), 'MMM d, yyyy')
                        : 'No activities yet'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
              </p>
              <Button size="sm" onClick={() => setShowAddContact(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>

            {showAddContact && (
              <div className="p-4 border rounded-lg space-y-3 bg-secondary/20">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Name *"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                  <Input
                    placeholder="Title (e.g. CEO)"
                    value={newContact.title}
                    onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  />
                  <Input
                    placeholder="Phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddContact} disabled={!newContact.name.trim()}>
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddContact(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{contact.name}</p>
                        {contact.is_primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      {contact.title && (
                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                      )}
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        {contact.email && <span>{contact.email}</span>}
                        {contact.phone && <span>{contact.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!contact.is_primary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPrimaryContact(contact.id)}
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && !showAddContact && (
                <p className="text-center text-muted-foreground py-8">
                  No contacts added yet
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Activity history
              </p>
              <Button size="sm" onClick={() => setShowAddActivity(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Activity
              </Button>
            </div>

            {showAddActivity && (
              <div className="p-4 border rounded-lg space-y-3 bg-secondary/20">
                <Select 
                  value={newActivity.activity_type}
                  onValueChange={(value) => setNewActivity({ ...newActivity, activity_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENT_ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Activity details..."
                  value={newActivity.content}
                  onChange={(e) => setNewActivity({ ...newActivity, content: e.target.value })}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddActivity} disabled={!newActivity.content.trim()}>
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddActivity(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        {CLIENT_ACTIVITY_TYPES.find(t => t.value === activity.activity_type)?.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(activity.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{activity.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={() => deleteActivity(activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {activities.length === 0 && !showAddActivity && (
                <p className="text-center text-muted-foreground py-8">
                  No activities logged yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
