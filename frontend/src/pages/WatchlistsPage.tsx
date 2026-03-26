import { useEffect, useMemo, useState } from 'react';
import { AddStockForm } from '@/components/watchlist/AddStockForm';
import { CreateWatchlistForm } from '@/components/watchlist/CreateWatchlistForm';
import { WatchlistSidebar } from '@/components/watchlist/WatchlistSidebar';
import { WatchlistStocksTable } from '@/components/watchlist/WatchlistStocksTable';
import { Toast } from '@/components/ui/Toast';
import { useWatchlistStore } from '@/store/watchlistStore';

export function WatchlistsPage() {
  const {
    watchlists,
    selectedWatchlistId,
    loading,
    saving,
    error,
    loadWatchlists,
    setSelectedWatchlist,
    createNewWatchlist,
    deleteExistingWatchlist,
    addStock,
    removeStock,
    updateStockNotes,
    clearError
  } = useWatchlistStore();
  const [toast, setToast] = useState<string | null>(null);

  const selectedWatchlist = useMemo(
    () => watchlists.find((watchlist) => watchlist.id === selectedWatchlistId) || null,
    [selectedWatchlistId, watchlists]
  );

  useEffect(() => {
    void loadWatchlists();
  }, [loadWatchlists]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Watchlists</h1>
        <p className="mt-1 text-sm text-slate-600">Build focused baskets, attach notes, and track symbols you care about.</p>
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
          <button type="button" onClick={() => clearError()} className="ml-3 text-xs font-semibold text-rose-800">
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <CreateWatchlistForm
            busy={saving}
            onCreate={async (name, description) => {
              await createNewWatchlist({ name, description });
              setToast('Watchlist created');
            }}
          />
          <WatchlistSidebar
            watchlists={watchlists}
            selectedWatchlistId={selectedWatchlistId}
            onSelect={setSelectedWatchlist}
            onDelete={async (watchlistId) => {
              await deleteExistingWatchlist(watchlistId);
              setToast('Watchlist deleted');
            }}
          />
        </div>

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading watchlists...</div>
          ) : selectedWatchlist ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">{selectedWatchlist.name}</h2>
                {selectedWatchlist.description ? <p className="mt-1 text-sm text-slate-600">{selectedWatchlist.description}</p> : null}
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-500">
                  {selectedWatchlist.items.length} symbols tracked
                </p>
              </div>

              <AddStockForm
                busy={saving}
                onAdd={async (payload) => {
                  await addStock(selectedWatchlist.id, payload);
                  setToast('Stock added to watchlist');
                }}
              />

              <WatchlistStocksTable
                items={selectedWatchlist.items}
                busy={saving}
                onRemove={async (symbol) => {
                  await removeStock(selectedWatchlist.id, symbol);
                  setToast('Stock removed');
                }}
                onUpdateNotes={async (symbol, notes) => {
                  await updateStockNotes(selectedWatchlist.id, symbol, notes);
                  setToast('Notes updated');
                }}
              />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
              No watchlists yet. Create one to start tracking stocks.
            </div>
          )}
        </section>
      </div>

      {toast ? <Toast message={toast} /> : null}
    </div>
  );
}
