import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { searchStocks } from '@/api/market';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
function useDebouncedValue(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timeout = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(timeout);
    }, [value, delay]);
    return debounced;
}
export function AddStockForm({ onAdd, busy }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
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
    return (_jsxs("form", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", onSubmit: async (event) => {
            event.preventDefault();
            const payload = {
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
        }, children: [_jsx("h3", { className: "text-sm font-semibold uppercase tracking-[0.14em] text-slate-500", children: "Add Stock" }), _jsxs("div", { className: "mt-3 space-y-2", children: [_jsx(Input, { placeholder: "Search symbol or company", value: query, onChange: (event) => {
                            setQuery(event.target.value);
                            setSelected(null);
                        } }), suggestionsVisible ? (_jsx("ul", { className: "max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2", children: results.map((result) => (_jsx("li", { children: _jsxs("button", { type: "button", className: "w-full rounded-md px-2 py-2 text-left hover:bg-white", onClick: () => {
                                    setSelected(result);
                                    setQuery(result.symbol);
                                }, children: [_jsx("p", { className: "text-sm font-semibold text-slate-900", children: result.symbol }), _jsx("p", { className: "text-xs text-slate-600", children: result.description })] }) }, `${result.symbol}-${result.exchange || 'global'}`))) })) : null, _jsx(Input, { placeholder: "Notes (optional)", value: notes, onChange: (event) => setNotes(event.target.value), maxLength: 400 }), _jsx(Button, { type: "submit", disabled: busy || !query.trim(), className: "w-full rounded-lg", children: busy ? 'Saving...' : 'Add to Watchlist' })] })] }));
}
