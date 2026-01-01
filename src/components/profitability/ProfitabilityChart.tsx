import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatMaluti } from '@/lib/currency';
import type { MonthlyProfitability } from '@/hooks/useJobProfitability';

interface ProfitabilityChartProps {
  data: MonthlyProfitability[];
}

export function ProfitabilityChart({ data }: ProfitabilityChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      month: new Date(d.month + '-01').toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      }),
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Revenue vs Cost vs Profit</h3>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No data available yet. Complete some paid invoices to see trends.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up">
      <h3 className="text-lg font-semibold mb-4">Revenue vs Cost vs Profit</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `M${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [formatMaluti(value), name]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="hsl(221, 83%, 53%)"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="cost"
              name="Cost"
              stroke="hsl(0, 84%, 60%)"
              fillOpacity={1}
              fill="url(#colorCost)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="hsl(142, 71%, 45%)"
              fillOpacity={1}
              fill="url(#colorProfit)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
