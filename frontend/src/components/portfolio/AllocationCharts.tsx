import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { PortfolioHolding } from '@/types';

type AllocationChartsProps = {
  holdings: PortfolioHolding[];
};

const COLORS = ['#0284c7', '#0ea5e9', '#22d3ee', '#6366f1', '#818cf8', '#34d399', '#f59e0b', '#f97316'];

function toAllocation(holdings: PortfolioHolding[], key: 'exchange' | 'country') {
  const bucket = new Map<string, number>();

  for (const holding of holdings) {
    const label = holding[key] || 'Unknown';
    const value = holding.marketValue ?? holding.costBasis;
    bucket.set(label, (bucket.get(label) || 0) + value);
  }

  return Array.from(bucket.entries()).map(([name, value]) => ({ name, value }));
}

function AllocationPie({ title, data }: { title: string; data: Array<{ name: string; value: number }> }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} innerRadius={55} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : String(value ?? ''))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const AllocationCharts = memo(function AllocationCharts({ holdings }: AllocationChartsProps) {
  const exchangeData = useMemo(() => toAllocation(holdings, 'exchange'), [holdings]);
  const countryData = useMemo(() => toAllocation(holdings, 'country'), [holdings]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AllocationPie title="Allocation by Sector Proxy (Exchange)" data={exchangeData} />
      <AllocationPie title="Allocation by Country" data={countryData} />
    </div>
  );
});
