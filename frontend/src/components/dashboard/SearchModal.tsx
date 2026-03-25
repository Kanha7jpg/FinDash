import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useMarketStore } from '@/store/marketStore';

type SearchModalProps = {
  onSelectSymbol?: (symbol: string) => void;
};

function useDebouncedValue(value: string, delay = 300): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function SearchModal({ onSelectSymbol }: SearchModalProps) {
  const { searchModalOpen, closeSearchModal, searchQuery, setSearchQuery, searchResults, searchLoading, runStockSearch } =
    useMarketStore();
  const debouncedQuery = useDebouncedValue(searchQuery, 250);

  useEffect(() => {
    if (searchModalOpen) {
      void runStockSearch(debouncedQuery);
    }
  }, [debouncedQuery, runStockSearch, searchModalOpen]);

  const content = useMemo(() => {
    if (searchLoading) {
      return <p className="text-sm text-slate-500">Searching global markets...</p>;
    }

    if (!searchResults.length && searchQuery.trim()) {
      return <p className="text-sm text-slate-500">No matching symbols found.</p>;
    }

    if (!searchQuery.trim()) {
      return <p className="text-sm text-slate-500">Search by symbol, company name, or exchange.</p>;
    }

    return (
      <ul className="space-y-2">
        {searchResults.map((result) => (
          <li key={`${result.symbol}-${result.exchange || 'global'}`}>
            <button
              type="button"
              onClick={() => {
                onSelectSymbol?.(result.symbol);
                closeSearchModal();
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
            >
              <p className="text-sm font-semibold text-slate-900">{result.symbol}</p>
              <p className="text-sm text-slate-600">{result.description}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">{result.exchange || 'Global'}</p>
            </button>
          </li>
        ))}
      </ul>
    );
  }, [closeSearchModal, onSelectSymbol, searchLoading, searchQuery, searchResults]);

  if (!searchModalOpen) {
    return null;
  }

  return (
    <Modal title="Global Stock Search" onClose={closeSearchModal}>
      <div className="space-y-4">
        <Input
          placeholder="Search for AAPL, Tesla, SAP, Reliance..."
          autoFocus
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-11 rounded-xl border-slate-300"
        />
        <div className="max-h-80 overflow-y-auto pr-1">{content}</div>
      </div>
    </Modal>
  );
}
