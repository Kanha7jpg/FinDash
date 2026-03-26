import { memo } from 'react';
import type { PortfolioTransaction } from '@/types';

type TransactionHistoryProps = {
  transactions: PortfolioTransaction[];
};

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export const TransactionHistory = memo(function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">No transactions yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Fee</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-700">{new Date(transaction.executedAt).toLocaleString()}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">{transaction.symbol}</td>
              <td className={`px-4 py-3 font-semibold ${transaction.type === 'BUY' ? 'text-blue-700' : 'text-amber-700'}`}>
                {transaction.type}
              </td>
              <td className="px-4 py-3 text-slate-700">{transaction.quantity.toFixed(4)}</td>
              <td className="px-4 py-3 text-slate-700">{formatCurrency(transaction.price, transaction.currency)}</td>
              <td className="px-4 py-3 text-slate-700">{formatCurrency(transaction.fee, transaction.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
