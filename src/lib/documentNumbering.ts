import { supabase } from '@/integrations/supabase/client';

export type DocumentType = 'invoice' | 'quote' | 'delivery_note';

const FALLBACK_PREFIX: Record<DocumentType, string> = {
  invoice: 'INV-',
  quote: 'QT-',
  delivery_note: 'DN-',
};

const TABLE: Record<DocumentType, { table: 'invoices' | 'quotes' | 'delivery_notes'; column: 'invoice_number' | 'quote_number' | 'note_number' }> = {
  invoice: { table: 'invoices', column: 'invoice_number' },
  quote: { table: 'quotes', column: 'quote_number' },
  delivery_note: { table: 'delivery_notes', column: 'note_number' },
};

/**
 * Reserve the next document number atomically per company.
 * Falls back to a legacy "max + 1" scan if the company has no profile id
 * (e.g. legacy single-tenant accounts) so behaviour stays stable.
 */
export async function reserveDocumentNumber(
  docType: DocumentType,
  companyProfileId: string | null | undefined
): Promise<string> {
  if (companyProfileId) {
    const { data, error } = await supabase.rpc('reserve_document_number', {
      p_company_profile_id: companyProfileId,
      p_doc_type: docType,
    });
    if (!error && typeof data === 'string' && data.length > 0) {
      return data;
    }
    // fall through to legacy scan if RPC failed for any reason
    if (error) console.warn('reserve_document_number RPC failed; falling back', error);
  }

  // Legacy fallback — scan latest doc and increment trailing integer
  const { table, column } = TABLE[docType];
  const { data: rows } = await supabase
    .from(table)
    .select(column)
    .order('created_at', { ascending: false })
    .limit(1);

  let lastNum = 0;
  if (rows && rows.length > 0) {
    const value = (rows[0] as any)[column] as string | undefined;
    if (value) {
      const match = value.match(/(\d+)\s*$/);
      if (match) lastNum = parseInt(match[1], 10);
    }
  }
  return `${FALLBACK_PREFIX[docType]}${String(lastNum + 1).padStart(4, '0')}`;
}
