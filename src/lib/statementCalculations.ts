import type { Invoice } from '@/hooks/useInvoices';

export type StatementRow = {
  date: string; // ISO date
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

export type AgingBuckets = {
  current: number;
  d1_30: number;
  d31_60: number;
  d61_90: number;
  d90_plus: number;
};

export type StatementSummary = {
  openingBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  closingBalance: number;
  rows: StatementRow[];
  aging: AgingBuckets;
};

const dateOnly = (d: string) => d.split('T')[0];

export function buildStatement(
  invoices: Invoice[],
  periodStart: Date,
  periodEnd: Date
): StatementSummary {
  const startStr = periodStart.toISOString().split('T')[0];
  const endStr = periodEnd.toISOString().split('T')[0];

  // Opening balance: invoices issued BEFORE periodStart that are not yet paid,
  // PLUS invoices paid before periodStart contribute zero (already settled).
  // Effective: sum of (total) of unpaid invoices dated < periodStart,
  // minus payments before periodStart for invoices paid before then (always net 0).
  const openingBalance = invoices
    .filter((inv) => dateOnly(inv.date) < startStr)
    .reduce((sum, inv) => {
      const issued = inv.total;
      const paidBeforeStart =
        inv.status === 'paid' && inv.paymentDate && dateOnly(inv.paymentDate) < startStr
          ? inv.total
          : 0;
      return sum + issued - paidBeforeStart;
    }, 0);

  // Build period rows: invoices issued in period + payments received in period
  type Event = StatementRow & { sortKey: string };
  const events: Event[] = [];

  for (const inv of invoices) {
    const d = dateOnly(inv.date);
    if (d >= startStr && d <= endStr) {
      events.push({
        sortKey: d + '-1',
        date: d,
        reference: inv.invoiceNumber,
        description: inv.description?.slice(0, 80) || `Invoice ${inv.invoiceNumber}`,
        debit: inv.total,
        credit: 0,
        balance: 0,
      });
    }
    if (inv.status === 'paid' && inv.paymentDate) {
      const pd = dateOnly(inv.paymentDate);
      if (pd >= startStr && pd <= endStr) {
        events.push({
          sortKey: pd + '-2',
          date: pd,
          reference: inv.paymentReference || `PAY-${inv.invoiceNumber}`,
          description: `Payment received — ${inv.invoiceNumber}${inv.paymentMethod ? ` (${inv.paymentMethod.replace('_', ' ')})` : ''}`,
          debit: 0,
          credit: inv.total,
          balance: 0,
        });
      }
    }
  }

  events.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  let running = openingBalance;
  const rows: StatementRow[] = events.map((e) => {
    running = running + e.debit - e.credit;
    return { ...e, balance: running };
  });

  const totalInvoiced = events.reduce((s, e) => s + e.debit, 0);
  const totalPaid = events.reduce((s, e) => s + e.credit, 0);
  const closingBalance = openingBalance + totalInvoiced - totalPaid;

  // Aging on outstanding invoices as of periodEnd
  const aging: AgingBuckets = {
    current: 0,
    d1_30: 0,
    d31_60: 0,
    d61_90: 0,
    d90_plus: 0,
  };
  const endMs = periodEnd.getTime();
  for (const inv of invoices) {
    const isOutstanding =
      inv.status !== 'paid' &&
      inv.status !== 'draft' &&
      dateOnly(inv.date) <= endStr;
    if (!isOutstanding) continue;
    const due = new Date(inv.dueDate).getTime();
    const overdueDays = Math.floor((endMs - due) / (1000 * 60 * 60 * 24));
    if (overdueDays <= 0) aging.current += inv.total;
    else if (overdueDays <= 30) aging.d1_30 += inv.total;
    else if (overdueDays <= 60) aging.d31_60 += inv.total;
    else if (overdueDays <= 90) aging.d61_90 += inv.total;
    else aging.d90_plus += inv.total;
  }

  return { openingBalance, totalInvoiced, totalPaid, closingBalance, rows, aging };
}

export function buildStatementNumber(clientId: string, asOf: Date): string {
  const y = asOf.getFullYear();
  const m = String(asOf.getMonth() + 1).padStart(2, '0');
  const d = String(asOf.getDate()).padStart(2, '0');
  return `STM-${y}${m}${d}-${clientId.slice(0, 6).toUpperCase()}`;
}
