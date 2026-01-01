import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  sourceQuoteId: string | null;
  clientId: string | null;
  clientName: string;
  clientAddress: string | null;
  date: string;
  dueDate: string;
  description: string | null;
  total: number;
  taxRate: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  purchaseOrderNumber: string | null;
  lineItems: LineItem[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceInsert {
  sourceQuoteId?: string;
  clientId?: string;
  clientName: string;
  clientAddress?: string;
  date: string;
  dueDate: string;
  description?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
  taxRate?: number;
  purchaseOrderNumber?: string;
  lineItems: Omit<LineItem, 'id'>[];
}

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getActiveUser = async (): Promise<User | null> => {
    if (user) return user;

    // Prefer local session (no network) to avoid timing issues on first load
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user ?? null;
    if (sessionUser) return sessionUser;

    // Fallback to fetching the user from the API
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  };

  const fetchInvoices = async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Fetch line items for all invoices
      const invoiceIds = (invoicesData || []).map((i) => i.id);
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .in('invoice_id', invoiceIds.length > 0 ? invoiceIds : ['']);

      if (lineItemsError) throw lineItemsError;

      // Group line items by invoice_id
      const lineItemsByInvoice: Record<string, LineItem[]> = {};
      (lineItemsData || []).forEach((item) => {
        if (!lineItemsByInvoice[item.invoice_id]) {
          lineItemsByInvoice[item.invoice_id] = [];
        }
        lineItemsByInvoice[item.invoice_id].push({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          costPrice: Number(item.cost_price) || 0,
        });
      });

      setInvoices(
        (invoicesData || []).map((i) => ({
          id: i.id,
          invoiceNumber: i.invoice_number,
          sourceQuoteId: i.source_quote_id,
          clientId: i.client_id,
          clientName: i.client_name,
          clientAddress: i.client_address,
          date: i.date,
          dueDate: i.due_date,
          description: i.description,
          total: Number(i.total),
          taxRate: Number(i.tax_rate),
          status: i.status as Invoice['status'],
          purchaseOrderNumber: i.purchase_order_number,
          lineItems: lineItemsByInvoice[i.id] || [],
          createdAt: i.created_at,
          updatedAt: i.updated_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const generateInvoiceNumber = async (): Promise<string> => {
    const { data } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let lastNum = 0;
    if (data && data.length > 0) {
      const match = data[0].invoice_number.match(/INV-(\d+)/);
      if (match) {
        lastNum = parseInt(match[1], 10);
      }
    }
    return `INV-${String(lastNum + 1).padStart(4, '0')}`;
  };

  const createInvoice = async (invoice: InvoiceInsert): Promise<Invoice | null> => {
    const activeUser = await getActiveUser();
    if (!activeUser) {
      toast.error('You must be logged in to create an invoice');
      return null;
    }

    try {
      const invoiceNumber = await generateInvoiceNumber();
      const total = invoice.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const totalWithTax = total * (1 + (invoice.taxRate || 0) / 100);

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: activeUser.id,
          invoice_number: invoiceNumber,
          source_quote_id: invoice.sourceQuoteId || null,
          client_id: invoice.clientId || null,
          client_name: invoice.clientName,
          client_address: invoice.clientAddress || null,
          date: invoice.date,
          due_date: invoice.dueDate,
          description: invoice.description || null,
          total: totalWithTax,
          tax_rate: invoice.taxRate || 0,
          status: invoice.status || 'draft',
          purchase_order_number: invoice.purchaseOrderNumber || null,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert line items
      const lineItemsToInsert = invoice.lineItems.map((item) => ({
        invoice_id: invoiceData.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        cost_price: item.costPrice || 0,
      }));

      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsToInsert)
        .select();

      if (lineItemsError) throw lineItemsError;

      const newInvoice: Invoice = {
        id: invoiceData.id,
        invoiceNumber: invoiceData.invoice_number,
        sourceQuoteId: invoiceData.source_quote_id,
        clientId: invoiceData.client_id,
        clientName: invoiceData.client_name,
        clientAddress: invoiceData.client_address,
        date: invoiceData.date,
        dueDate: invoiceData.due_date,
        description: invoiceData.description,
        total: Number(invoiceData.total),
        taxRate: Number(invoiceData.tax_rate),
        status: invoiceData.status as Invoice['status'],
        purchaseOrderNumber: invoiceData.purchase_order_number,
        lineItems: (lineItemsData || []).map((item) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          costPrice: Number(item.cost_price) || 0,
        })),
        createdAt: invoiceData.created_at,
        updatedAt: invoiceData.updated_at,
      };

      setInvoices((prev) => [newInvoice, ...prev]);
      toast.success('Invoice created successfully');
      return newInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
      return null;
    }
  };

  const updateInvoice = async (
    id: string,
    updates: Partial<Omit<InvoiceInsert, 'lineItems'>> & { lineItems?: LineItem[] }
  ): Promise<boolean> => {
    try {
      const total =
        updates.lineItems?.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) || 0;
      const taxRate = updates.taxRate ?? invoices.find((i) => i.id === id)?.taxRate ?? 0;
      const totalWithTax = total * (1 + taxRate / 100);

      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          client_id: updates.clientId,
          client_name: updates.clientName,
          client_address: updates.clientAddress,
          date: updates.date,
          due_date: updates.dueDate,
          description: updates.description,
          total: updates.lineItems ? totalWithTax : undefined,
          tax_rate: updates.taxRate,
          status: updates.status,
          purchase_order_number: updates.purchaseOrderNumber,
        })
        .eq('id', id);

      if (invoiceError) throw invoiceError;

      // Update line items if provided
      if (updates.lineItems) {
        // Delete existing line items
        await supabase.from('invoice_line_items').delete().eq('invoice_id', id);

        // Insert new line items
        const lineItemsToInsert = updates.lineItems.map((item) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          cost_price: item.costPrice || 0,
        }));

        await supabase.from('invoice_line_items').insert(lineItemsToInsert);
      }

      // Refetch to get updated data
      await fetchInvoices();
      toast.success('Invoice updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
      return false;
    }
  };

  const deleteInvoice = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);

      if (error) throw error;

      setInvoices((prev) => prev.filter((i) => i.id !== id));
      toast.success('Invoice deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
      return false;
    }
  };

  return {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refetch: fetchInvoices,
    generateInvoiceNumber,
  };
}
