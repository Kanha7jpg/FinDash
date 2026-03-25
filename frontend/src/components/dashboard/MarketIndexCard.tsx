import type { MarketOverviewCard } from '@/types';

type MarketIndexCardProps = {
  data: MarketOverviewCard;
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function MarketIndexCard({ data }: MarketIndexCardProps) {
  const isPositive = data.change >= 0;

  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{data.symbol}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{data.name}</h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}
        >
          {isPositive ? '+' : ''}
          {data.changePercent.toFixed(2)}%
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{formatNumber(data.value)}</p>
      <p className={`mt-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? '+' : ''}
        {formatNumber(data.change)} today
      </p>
    </article>
  );
}
