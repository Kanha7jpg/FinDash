import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { WatchlistStockItem } from '@/types';

type WatchlistStocksTableProps = {
  items: WatchlistStockItem[];
  busy: boolean;
  onRemove: (symbol: string) => Promise<void>;
  onUpdateNotes: (symbol: string, notes?: string) => Promise<void>;
};

export function WatchlistStocksTable({ items, busy, onRemove, onUpdateNotes }: WatchlistStocksTableProps) {
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState('');

  if (items.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">No stocks added yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Exchange</th>
            <th className="px-4 py-3">Notes</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-semibold text-slate-900">{item.symbol}</td>
              <td className="px-4 py-3 text-slate-700">{item.name}</td>
              <td className="px-4 py-3 text-slate-700">{item.exchange}</td>
              <td className="px-4 py-3 text-slate-700">
                {editingSymbol === item.symbol ? (
                  <div className="space-y-2">
                    <Input value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} maxLength={400} />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="rounded-md px-3 py-1"
                        onClick={async () => {
                          await onUpdateNotes(item.symbol, draftNotes.trim() || undefined);
                          setEditingSymbol(null);
                        }}
                        disabled={busy}
                      >
                        Save
                      </Button>
                      <button
                        type="button"
                        className="text-xs font-semibold text-slate-500"
                        onClick={() => setEditingSymbol(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <span>{item.notes || '-'}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                    onClick={() => {
                      setEditingSymbol(item.symbol);
                      setDraftNotes(item.notes || '');
                    }}
                  >
                    Edit Notes
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    onClick={async () => {
                      await onRemove(item.symbol);
                    }}
                    disabled={busy}
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
