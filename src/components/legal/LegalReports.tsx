import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { type LegalCase } from '@/hooks/useLegalCases';
import { type LegalTimeEntry } from '@/hooks/useLegalTimeEntries';
import { formatMaluti } from '@/lib/currency';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(217, 91%, 60%)', 'hsl(45, 93%, 47%)', 'hsl(0, 0%, 60%)'];
const TYPE_COLORS = ['hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)', 'hsl(217, 91%, 60%)', 'hsl(45, 93%, 47%)', 'hsl(280, 65%, 60%)', 'hsl(180, 60%, 45%)', 'hsl(0, 0%, 60%)'];

interface Props {
  cases: LegalCase[];
  entries: LegalTimeEntry[];
}

export function LegalReports({ cases, entries }: Props) {
  const casesByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  }, [cases]);

  const revenueByType = useMemo(() => {
    const typeRevenue: Record<string, number> = {};
    const caseLookup: Record<string, string> = {};
    cases.forEach(c => { caseLookup[c.id] = c.caseType; });
    entries.forEach(e => {
      const type = caseLookup[e.caseId] || 'other';
      typeRevenue[type] = (typeRevenue[type] || 0) + e.hours * e.hourlyRate;
    });
    return Object.entries(typeRevenue).map(([name, value]) => ({ name, value }));
  }, [cases, entries]);

  const billableUtilization = useMemo(() => {
    const totalHours = entries.reduce((s, e) => s + e.hours, 0);
    const billableHours = entries.filter(e => e.isBillable).reduce((s, e) => s + e.hours, 0);
    const rate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
    return { totalHours, billableHours, rate };
  }, [entries]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Cases by Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={casesByStatus}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} className="capitalize" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Revenue by Case Type</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={revenueByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${formatMaluti(value)}`}>
                {revenueByType.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatMaluti(v)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="text-base">Billable Hours Utilization</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${billableUtilization.rate}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Billable: {billableUtilization.billableHours.toFixed(1)}h</span>
                <span>Total: {billableUtilization.totalHours.toFixed(1)}h</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{billableUtilization.rate.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Utilization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
