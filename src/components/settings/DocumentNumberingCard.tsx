import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Hash, Loader2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

interface NumberingState {
  invoice_prefix: string;
  invoice_next_number: number;
  invoice_padding: number;
  quote_prefix: string;
  quote_next_number: number;
  quote_padding: number;
  delivery_note_prefix: string;
  delivery_note_next_number: number;
  delivery_note_padding: number;
}

const DEFAULTS: NumberingState = {
  invoice_prefix: 'INV-',
  invoice_next_number: 1,
  invoice_padding: 4,
  quote_prefix: 'QT-',
  quote_next_number: 1,
  quote_padding: 4,
  delivery_note_prefix: 'DN-',
  delivery_note_next_number: 1,
  delivery_note_padding: 4,
};

function format(prefix: string, num: number, padding: number) {
  const safeNum = Number.isFinite(num) && num > 0 ? num : 1;
  const safePad = Math.max(0, Math.min(8, padding || 0));
  return `${prefix || ''}${String(safeNum).padStart(safePad, '0')}`;
}

export function DocumentNumberingCard() {
  const { activeCompanyId } = useActiveCompany();
  const [state, setState] = useState<NumberingState>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maxUsed, setMaxUsed] = useState({ invoice: 0, quote: 0, delivery_note: 0 });

  useEffect(() => {
    if (!activeCompanyId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('company_profiles')
        .select('invoice_prefix, invoice_next_number, invoice_padding, quote_prefix, quote_next_number, quote_padding, delivery_note_prefix, delivery_note_next_number, delivery_note_padding')
        .eq('id', activeCompanyId)
        .maybeSingle();
      if (data) setState({ ...DEFAULTS, ...(data as any) });

      // Determine max used per doc type so we can warn against lowering
      const [inv, qt, dn] = await Promise.all([
        supabase.from('invoices').select('invoice_number').eq('company_profile_id', activeCompanyId),
        supabase.from('quotes').select('quote_number').eq('company_profile_id', activeCompanyId),
        supabase.from('delivery_notes').select('note_number').eq('company_profile_id', activeCompanyId),
      ]);
      const maxOf = (rows: any[] | null, key: string) => {
        if (!rows) return 0;
        let max = 0;
        for (const r of rows) {
          const m = String(r[key] ?? '').match(/(\d+)\s*$/);
          if (m) max = Math.max(max, parseInt(m[1], 10));
        }
        return max;
      };
      setMaxUsed({
        invoice: maxOf(inv.data as any, 'invoice_number'),
        quote: maxOf(qt.data as any, 'quote_number'),
        delivery_note: maxOf(dn.data as any, 'note_number'),
      });
      setLoading(false);
    })();
  }, [activeCompanyId]);

  const update = (patch: Partial<NumberingState>) => setState(prev => ({ ...prev, ...patch }));

  const handleSave = async () => {
    if (!activeCompanyId) return;
    // Guard: prevent setting next_number <= max used
    if (state.invoice_next_number <= maxUsed.invoice) {
      toast.error(`Invoice next number must be greater than ${maxUsed.invoice} (already in use)`);
      return;
    }
    if (state.quote_next_number <= maxUsed.quote) {
      toast.error(`Quote next number must be greater than ${maxUsed.quote} (already in use)`);
      return;
    }
    if (state.delivery_note_next_number <= maxUsed.delivery_note) {
      toast.error(`Delivery note next number must be greater than ${maxUsed.delivery_note} (already in use)`);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('company_profiles')
      .update({
        invoice_prefix: state.invoice_prefix.trim(),
        invoice_next_number: state.invoice_next_number,
        invoice_padding: state.invoice_padding,
        quote_prefix: state.quote_prefix.trim(),
        quote_next_number: state.quote_next_number,
        quote_padding: state.quote_padding,
        delivery_note_prefix: state.delivery_note_prefix.trim(),
        delivery_note_next_number: state.delivery_note_next_number,
        delivery_note_padding: state.delivery_note_padding,
      })
      .eq('id', activeCompanyId);
    setSaving(false);
    if (error) {
      toast.error('Failed to save numbering settings');
      return;
    }
    toast.success('Document numbering updated');
  };

  const Row = ({
    title,
    prefix, prefixKey,
    next, nextKey,
    padding, paddingKey,
  }: {
    title: string;
    prefix: string; prefixKey: keyof NumberingState;
    next: number; nextKey: keyof NumberingState;
    padding: number; paddingKey: keyof NumberingState;
  }) => (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{title}</h4>
        <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-mono">
          Next: {format(prefix, next, padding)}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Prefix</Label>
          <Input
            value={prefix}
            onChange={(e) => update({ [prefixKey]: e.target.value } as any)}
            placeholder="INV-"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Next Number</Label>
          <Input
            type="number"
            min={1}
            value={next}
            onChange={(e) => update({ [nextKey]: parseInt(e.target.value, 10) || 1 } as any)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Padding (digits)</Label>
          <Input
            type="number"
            min={0}
            max={8}
            value={padding}
            onChange={(e) => update({ [paddingKey]: Math.max(0, Math.min(8, parseInt(e.target.value, 10) || 0)) } as any)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Hash className="h-5 w-5 text-primary" />Document Numbering</CardTitle>
        <CardDescription>Customise how quotes, invoices and delivery notes are numbered</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
          <p>
            <span className="font-medium text-foreground">Migrating from another system?</span>{' '}
            Set <span className="font-mono">Next Number</span> to one above your last issued document so your sequence continues seamlessly. You can also change the prefix (e.g. <span className="font-mono">2025/</span>) or remove it entirely for purely numeric IDs.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
          </div>
        ) : (
          <>
            <Row
              title="Invoices"
              prefix={state.invoice_prefix} prefixKey="invoice_prefix"
              next={state.invoice_next_number} nextKey="invoice_next_number"
              padding={state.invoice_padding} paddingKey="invoice_padding"
            />
            <Row
              title="Quotes"
              prefix={state.quote_prefix} prefixKey="quote_prefix"
              next={state.quote_next_number} nextKey="quote_next_number"
              padding={state.quote_padding} paddingKey="quote_padding"
            />
            <Row
              title="Delivery Notes"
              prefix={state.delivery_note_prefix} prefixKey="delivery_note_prefix"
              next={state.delivery_note_next_number} nextKey="delivery_note_next_number"
              padding={state.delivery_note_padding} paddingKey="delivery_note_padding"
            />

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Numbering
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
