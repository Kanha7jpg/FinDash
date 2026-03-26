import { memo } from 'react';
import type { PortfolioHolding } from '@/types';

type HoldingsTableProps = {
  holdings: PortfolioHolding[];
};

function formatCurrency(value: number | null): string {
  if (value === null) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

export const HoldingsTable = memo(function HoldingsTable({ holdings }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">No holdings yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Avg Cost</th>
            <th className="px-4 py-3">Current</th>
            <th className="px-4 py-3">Cost Basis</th>
            <th className="px-4 py-3">Unrealized P&L</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const pnlPositive = (holding.unrealizedPnl || 0) >= 0;

            return (
              <tr key={holding.symbol} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">{holding.symbol}</td>
                <td className="px-4 py-3 text-slate-700">{holding.name}</td>
                <td className="px-4 py-3 text-slate-700">{holding.quantity.toFixed(4)}</td>
                <td className="px-4 py-3 text-slate-700">{formatCurrency(holding.averagePrice)}</td>
                <td className="px-4 py-3 text-slate-700">{formatCurrency(holding.currentPrice)}</td>
                <td className="px-4 py-3 text-slate-700">{formatCurrency(holding.costBasis)}</td>
                <td className={`px-4 py-3 font-semibold ${pnlPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(holding.unrealizedPnl)}
                  {holding.unrealizedPnlPercent !== null ? ` (${holding.unrealizedPnlPercent.toFixed(2)}%)` : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
