import { useState, useEffect } from 'react';
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

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string | null;
  clientName: string;
  date: string;
  validUntil: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  lineItems: LineItem[];
  taxRate: number;
  termsAndConditions: string | null;
  description: string | null;
  leadTime: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface QuoteInsert {
  clientId?: string;
  clientName: string;
  date: string;
  validUntil: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected';
  taxRate?: number;
  termsAndConditions?: string;
  description?: string;
  leadTime?: string;
  notes?: string;
  lineItems: Omit<LineItem, 'id'>[];
}

export function useQuotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuotes = async () => {
    if (!user) {
      setQuotes([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;

      // Fetch line items for all quotes
      const quoteIds = (quotesData || []).map((q) => q.id);
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('quote_line_items')
        .select('*')
        .in('quote_id', quoteIds.length > 0 ? quoteIds : ['']);

      if (lineItemsError) throw lineItemsError;

      // Group line items by quote_id
      const lineItemsByQuote: Record<string, LineItem[]> = {};
      (lineItemsData || []).forEach((item) => {
        if (!lineItemsByQuote[item.quote_id]) {
          lineItemsByQuote[item.quote_id] = [];
        }
        lineItemsByQuote[item.quote_id].push({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          costPrice: Number(item.cost_price) || 0,
        });
      });

      setQuotes(
        (quotesData || []).map((q: any): Quote => ({
          id: q.id,
          quoteNumber: q.quote_number,
          clientId: q.client_id,
          clientName: q.client_name,
          date: q.date,
          validUntil: q.valid_until,
          total: Number(q.total),
          status: q.status as Quote['status'],
          lineItems: lineItemsByQuote[q.id] || [],
          taxRate: Number(q.tax_rate),
          termsAndConditions: q.terms_and_conditions,
          description: q.description,
          leadTime: q.lead_time,
          notes: q.notes,
          createdAt: q.created_at,
          updatedAt: q.updated_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [user]);

  const generateQuoteNumber = async (): Promise<string> => {
    const { data } = await supabase
      .from('quotes')
      .select('quote_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let lastNum = 0;
    if (data && data.length > 0) {
      const match = data[0].quote_number.match(/QT-(\d+)/);
      if (match) {
        lastNum = parseInt(match[1], 10);
      }
    }
    return `QT-${String(lastNum + 1).padStart(4, '0')}`;
  };

  const createQuote = async (quote: QuoteInsert): Promise<Quote | null> => {
    if (!user) {
      toast.error('You must be logged in to create a quote');
      return null;
    }

    try {
      const quoteNumber = await generateQuoteNumber();
      const total = quote.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const totalWithTax = total * (1 + (quote.taxRate || 0) / 100);

      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          quote_number: quoteNumber,
          client_id: quote.clientId || null,
          client_name: quote.clientName,
          date: quote.date,
          valid_until: quote.validUntil,
          total: totalWithTax,
          status: quote.status || 'draft',
          tax_rate: quote.taxRate || 0,
          terms_and_conditions: quote.termsAndConditions || null,
          description: quote.description || null,
          lead_time: quote.leadTime || null,
          notes: quote.notes || null,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Insert line items
      const lineItemsToInsert = quote.lineItems.map((item) => ({
        quote_id: quoteData.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        cost_price: item.costPrice || 0,
      }));

      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('quote_line_items')
        .insert(lineItemsToInsert)
        .select();

      if (lineItemsError) throw lineItemsError;

      const quoteDataAny = quoteData as any;
      const newQuote: Quote = {
        id: quoteDataAny.id,
        quoteNumber: quoteDataAny.quote_number,
        clientId: quoteDataAny.client_id,
        clientName: quoteDataAny.client_name,
        date: quoteDataAny.date,
        validUntil: quoteDataAny.valid_until,
        total: Number(quoteDataAny.total),
        status: quoteDataAny.status as Quote['status'],
        lineItems: (lineItemsData || []).map((item) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          costPrice: Number(item.cost_price) || 0,
        })),
        taxRate: Number(quoteDataAny.tax_rate),
        termsAndConditions: quoteDataAny.terms_and_conditions,
        description: quoteDataAny.description,
        leadTime: quoteDataAny.lead_time,
        notes: quoteDataAny.notes,
        createdAt: quoteDataAny.created_at,
        updatedAt: quoteDataAny.updated_at,
      };

      setQuotes((prev) => [newQuote, ...prev]);
      toast.success('Quote created successfully');
      return newQuote;
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Failed to create quote');
      return null;
    }
  };

  const updateQuote = async (
    id: string,
    updates: Partial<Omit<QuoteInsert, 'lineItems'>> & { lineItems?: LineItem[] }
  ): Promise<boolean> => {
    try {
      const total =
        updates.lineItems?.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) || 0;
      const taxRate = updates.taxRate ?? quotes.find((q) => q.id === id)?.taxRate ?? 0;
      const totalWithTax = total * (1 + taxRate / 100);

      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          client_id: updates.clientId,
          client_name: updates.clientName,
          date: updates.date,
          valid_until: updates.validUntil,
          total: updates.lineItems ? totalWithTax : undefined,
          status: updates.status,
          tax_rate: updates.taxRate,
          terms_and_conditions: updates.termsAndConditions,
          description: updates.description,
          lead_time: updates.leadTime,
          notes: updates.notes,
        })
        .eq('id', id);

      if (quoteError) throw quoteError;

      // Update line items if provided
      if (updates.lineItems) {
        // Delete existing line items
        await supabase.from('quote_line_items').delete().eq('quote_id', id);

        // Insert new line items
        const lineItemsToInsert = updates.lineItems.map((item) => ({
          quote_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          cost_price: item.costPrice || 0,
        }));

        await supabase.from('quote_line_items').insert(lineItemsToInsert);
      }

      // Refetch to get updated data
      await fetchQuotes();
      toast.success('Quote updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote');
      return false;
    }
  };

  const deleteQuote = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('quotes').delete().eq('id', id);

      if (error) throw error;

      setQuotes((prev) => prev.filter((q) => q.id !== id));
      toast.success('Quote deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Failed to delete quote');
      return false;
    }
  };

  return {
    quotes,
    isLoading,
    createQuote,
    updateQuote,
    deleteQuote,
    refetch: fetchQuotes,
  };
}
