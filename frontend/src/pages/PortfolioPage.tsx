import { useEffect, useMemo, useState } from 'react';
import { AllocationCharts } from '@/components/portfolio/AllocationCharts';
import { GainLossChart } from '@/components/portfolio/GainLossChart';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { TransactionHistory } from '@/components/portfolio/TransactionHistory';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toast } from '@/components/ui/Toast';
import { usePortfolioStore } from '@/store/portfolioStore';

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

export function PortfolioPage() {
  const {
    portfolios,
    selectedPortfolioId,
    detail,
    loading,
    saving,
    error,
    loadPortfolios,
    selectPortfolio,
    createNewPortfolio,
    addTransaction,
    refreshSelectedDetail,
    clearError
  } = usePortfolioStore();

  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [txSymbol, setTxSymbol] = useState('');
  const [txType, setTxType] = useState<'BUY' | 'SELL'>('BUY');
  const [txQuantity, setTxQuantity] = useState('');
  const [txPrice, setTxPrice] = useState('');
  const [txFee, setTxFee] = useState('0');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void loadPortfolios();
  }, [loadPortfolios]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const holdings = detail?.holdings ?? [];
  const transactions = detail?.transactions ?? [];

  const totals = useMemo(
    () => ({
      costBasis: detail?.totals.totalCostBasis ?? 0,
      marketValue: detail?.totals.totalMarketValue ?? null,
      unrealizedPnl: detail?.totals.totalUnrealizedPnl ?? null
    }),
    [detail]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Portfolio Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Track holdings, allocations, and transaction-driven performance in one place.</p>
        </div>
        <Button
          className="rounded-xl bg-slate-900 px-5 py-2.5 hover:bg-slate-800"
          onClick={() => {
            void refreshSelectedDetail();
          }}
          disabled={loading || !selectedPortfolioId}
        >
          Refresh Data
        </Button>
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
          <button type="button" className="ml-2 font-semibold" onClick={() => clearError()}>
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <form
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            onSubmit={async (event) => {
              event.preventDefault();

              const name = portfolioName.trim();
              if (!name) {
                return;
              }

              await createNewPortfolio({
                name,
                description: portfolioDescription.trim() || undefined,
                baseCurrency: 'USD'
              });
              setPortfolioName('');
              setPortfolioDescription('');
              setToast('Portfolio created');
            }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Create Portfolio</h2>
            <div className="mt-3 space-y-2">
              <Input value={portfolioName} onChange={(event) => setPortfolioName(event.target.value)} placeholder="Long-term" required />
              <Input
                value={portfolioDescription}
                onChange={(event) => setPortfolioDescription(event.target.value)}
                placeholder="Description"
              />
              <Button type="submit" disabled={saving} className="w-full rounded-lg">
                {saving ? 'Saving...' : 'Create'}
              </Button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Portfolios</h2>
            <div className="mt-3 space-y-2">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio.id}
                  type="button"
                  className={`w-full rounded-lg border px-3 py-2 text-left ${
                    portfolio.id === selectedPortfolioId ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50'
                  }`}
                  onClick={() => {
                    void selectPortfolio(portfolio.id);
                  }}
                >
                  <p className="font-semibold text-slate-900">{portfolio.name}</p>
                  <p className="text-xs text-slate-500">
                    {portfolio.holdingsCount} holdings · {portfolio.transactionsCount} tx
                  </p>
                </button>
              ))}
              {portfolios.length === 0 ? <p className="text-sm text-slate-500">No portfolios yet.</p> : null}
            </div>
          </div>

          <form
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!selectedPortfolioId) {
                return;
              }

              await addTransaction(selectedPortfolioId, {
                symbol: txSymbol.trim().toUpperCase(),
                type: txType,
                quantity: Number(txQuantity),
                price: Number(txPrice),
                fee: Number(txFee || '0'),
                currency: 'USD',
                executedAt: new Date().toISOString()
              });

              setTxSymbol('');
              setTxQuantity('');
              setTxPrice('');
              setTxFee('0');
              setToast('Transaction added');
            }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Add Transaction</h2>
            <div className="mt-3 space-y-2">
              <Input placeholder="Symbol" value={txSymbol} onChange={(event) => setTxSymbol(event.target.value)} required />
              <Select value={txType} onChange={(event) => setTxType(event.target.value as 'BUY' | 'SELL')}>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </Select>
              <Input
                type="number"
                min="0"
                step="0.0001"
                placeholder="Quantity"
                value={txQuantity}
                onChange={(event) => setTxQuantity(event.target.value)}
                required
              />
              <Input
                type="number"
                min="0"
                step="0.0001"
                placeholder="Price"
                value={txPrice}
                onChange={(event) => setTxPrice(event.target.value)}
                required
              />
              <Input
                type="number"
                min="0"
                step="0.0001"
                placeholder="Fee"
                value={txFee}
                onChange={(event) => setTxFee(event.target.value)}
              />
              <Button type="submit" disabled={saving || !selectedPortfolioId} className="w-full rounded-lg">
                {saving ? 'Saving...' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading...</div> : null}

          {detail ? (
            <>
              <section className="grid gap-3 md:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Cost Basis</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totals.costBasis)}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Market Value</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totals.marketValue)}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Unrealized P&L</p>
                  <p className={`mt-2 text-xl font-semibold ${(totals.unrealizedPnl ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(totals.unrealizedPnl)}
                  </p>
                </article>
              </section>

              <GainLossChart holdings={holdings} />
              <AllocationCharts holdings={holdings} />

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Holdings</h2>
                <HoldingsTable holdings={holdings} />
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Transaction History</h2>
                <TransactionHistory transactions={transactions} />
              </section>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
              Select or create a portfolio to view analytics.
            </div>
          )}
        </div>
      </section>

      {toast ? <Toast message={toast} /> : null}
    </div>
  );
}
