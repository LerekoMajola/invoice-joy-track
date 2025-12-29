export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  createdAt: Date;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientName: string;
  date: Date;
  validUntil: Date;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  date: Date;
  dueDate: Date;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
}

export interface DeliveryNote {
  id: string;
  noteNumber: string;
  clientId: string;
  clientName: string;
  date: Date;
  items: LineItem[];
  deliveryAddress: string;
  status: 'pending' | 'delivered';
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Date;
}

export interface Tender {
  id: string;
  title: string;
  organization: string;
  dueDate: Date;
  value?: number;
  status: 'open' | 'submitted' | 'won' | 'lost';
  notes?: string;
  createdAt: Date;
}
