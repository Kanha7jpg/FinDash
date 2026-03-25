import { StockCard } from '@/components/dashboard/StockCard';
import type { CountrySectionData } from '@/types';

type CountrySectionProps = {
  section: CountrySectionData;
};

export function CountrySection({ section }: CountrySectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{section.country}</h2>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Top Movers</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {section.stocks.map((stock) => (
          <StockCard key={`${section.country}-${stock.symbol}`} data={stock} compact />
        ))}
      </div>
    </section>
  );
}
