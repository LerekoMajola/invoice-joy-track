import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatMaluti } from '@/lib/currency';

interface CategoryData {
  name: string;
  total: number;
  color: string;
}

interface ExpenseCategoryChartProps {
  data: CategoryData[];
}

const CHART_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  yellow: '#eab308',
  pink: '#ec4899',
  indigo: '#6366f1',
  gray: '#6b7280',
  amber: '#f59e0b',
  green: '#22c55e',
  orange: '#f97316',
  sky: '#0ea5e9',
  slate: '#64748b',
};

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No expense data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.total,
    fill: CHART_COLORS[item.color] || CHART_COLORS.gray,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatMaluti(value)}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend
          formatter={(value, entry) => (
            <span className="text-sm">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
