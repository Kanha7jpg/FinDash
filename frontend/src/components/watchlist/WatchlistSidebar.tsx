import type { Watchlist } from '@/types';

type WatchlistSidebarProps = {
  watchlists: Watchlist[];
  selectedWatchlistId: string | null;
  onSelect: (watchlistId: string) => void;
  onDelete: (watchlistId: string) => void;
};

export function WatchlistSidebar({ watchlists, selectedWatchlistId, onSelect, onDelete }: WatchlistSidebarProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Your Watchlists</h2>
      <div className="mt-3 space-y-2">
        {watchlists.map((watchlist) => {
          const selected = watchlist.id === selectedWatchlistId;

          return (
            <div
              key={watchlist.id}
              className={`rounded-xl border p-3 transition ${
                selected ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => onSelect(watchlist.id)}
                aria-label={`Select watchlist ${watchlist.name}`}
              >
                <p className="font-semibold text-slate-900">{watchlist.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{watchlist.items.length} stocks</p>
              </button>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                  onClick={() => onDelete(watchlist.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
