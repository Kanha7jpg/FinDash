import { useEffect } from 'react';
import { CountrySection } from '@/components/dashboard/CountrySection';
import { MarketIndexCard } from '@/components/dashboard/MarketIndexCard';
import { SearchModal } from '@/components/dashboard/SearchModal';
import { StockCard } from '@/components/dashboard/StockCard';
import { Button } from '@/components/ui/Button';
import { useMarketStore } from '@/store/marketStore';

export function DashboardPage() {
  const {
    marketIndices,
    countrySections,
    trendingStocks,
    markets,
    isLoading,
    error,
    loadDashboard,
    refreshDashboard,
    openSearchModal
  } = useMarketStore();

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-100 via-cyan-50 to-emerald-100 p-6 shadow-sm">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute -bottom-20 left-20 h-44 w-44 rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Global Snapshot</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">Financial Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-700 md:text-base">
              Track major indices, scan countries, and surface trending symbols from one fast view.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => openSearchModal()} className="rounded-xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800">
              Global Search
            </Button>
            <Button
              onClick={() => {
                void refreshDashboard();
              }}
              className="rounded-xl bg-white px-5 py-2.5 text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Market Overview</h2>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {marketIndices.map((indexData) => (
              <MarketIndexCard key={indexData.symbol} data={indexData} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Trending Stocks</h2>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Volatility Radar</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {trendingStocks.map((stock) => (
            <StockCard key={stock.symbol} data={stock} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Countries</h2>
        <div className="grid gap-4">
          {countrySections.map((section) => (
            <CountrySection key={section.country} section={section} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Connected Markets</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {markets.slice(0, 8).map((market) => (
            <article key={market.code} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{market.code}</p>
              <p className="mt-1 font-semibold text-slate-900">{market.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                {market.currency} • {market.timezone}
              </p>
            </article>
          ))}
        </div>
      </section>

      <SearchModal />
    </div>
  );
}
