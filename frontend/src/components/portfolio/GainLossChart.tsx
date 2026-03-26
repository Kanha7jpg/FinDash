import { memo, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PortfolioHolding } from '@/types';

type GainLossChartProps = {
  holdings: PortfolioHolding[];
};

export const GainLossChart = memo(function GainLossChart({ holdings }: GainLossChartProps) {
  const chartData = useMemo(
    () =>
      holdings.map((holding) => ({
        symbol: holding.symbol,
        pnl: holding.unrealizedPnl ?? 0
      })),
    [holdings]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Unrealized P&L by Holding</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="symbol" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : String(value ?? ''))} />
            <Bar dataKey="pnl" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
