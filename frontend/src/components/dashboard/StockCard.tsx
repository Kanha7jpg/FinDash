import type { StockCardData } from '@/types';

type StockCardProps = {
  data: StockCardData;
  compact?: boolean;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

export function StockCard({ data, compact = false }: StockCardProps) {
  const isPositive = data.change >= 0;

  return (
    <article
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
        compact ? 'min-w-[220px]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{data.symbol}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{data.name}</h3>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}
        >
          {isPositive ? '+' : ''}
          {data.changePercent.toFixed(2)}%
        </span>
      </div>
      <p className="mt-4 text-xl font-bold text-slate-900">{formatCurrency(data.price)}</p>
      <p className={`mt-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? '+' : ''}
        {data.change.toFixed(2)}
      </p>
    </article>
  );
}
