import { useEffect, useMemo, useState } from 'react';
import { searchStocks } from '@/api/market';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AddWatchlistStockPayload, StockSearchResult } from '@/types';

type AddStockFormProps = {
  onAdd: (payload: AddWatchlistStockPayload) => Promise<void>;
  busy: boolean;
};

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

export function AddStockForm({ onAdd, busy }: AddStockFormProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const [notes, setNotes] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);

  useEffect(() => {
    let mounted = true;

    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    void searchStocks(debouncedQuery, 8)
      .then((items) => {
        if (mounted) {
          setResults(items);
        }
      })
      .catch(() => {
        if (mounted) {
          setResults([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [debouncedQuery]);

  const suggestionsVisible = useMemo(() => results.length > 0 && !selected, [results.length, selected]);

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={async (event) => {
        event.preventDefault();

        const payload: AddWatchlistStockPayload = {
          symbol: (selected?.symbol || query).trim().toUpperCase(),
          name: selected?.description,
          exchange: selected?.exchange,
          notes: notes.trim() || undefined
        };

        if (!payload.symbol) {
          return;
        }

        await onAdd(payload);
        setQuery('');
        setSelected(null);
        setResults([]);
        setNotes('');
      }}
    >
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Add Stock</h3>
      <div className="mt-3 space-y-2">
        <Input
          placeholder="Search symbol or company"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
          }}
        />
        {suggestionsVisible ? (
          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
            {results.map((result) => (
              <li key={`${result.symbol}-${result.exchange || 'global'}`}>
                <button
                  type="button"
                  className="w-full rounded-md px-2 py-2 text-left hover:bg-white"
                  onClick={() => {
                    setSelected(result);
                    setQuery(result.symbol);
                  }}
                >
                  <p className="text-sm font-semibold text-slate-900">{result.symbol}</p>
                  <p className="text-xs text-slate-600">{result.description}</p>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <Input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={400}
        />
        <Button type="submit" disabled={busy || !query.trim()} className="w-full rounded-lg">
          {busy ? 'Saving...' : 'Add to Watchlist'}
        </Button>
      </div>
    </form>
  );
}
