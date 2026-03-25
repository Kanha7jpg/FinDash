import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useMarketStore } from '@/store/marketStore';
function useDebouncedValue(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}
export function SearchModal({ onSelectSymbol }) {
    const { searchModalOpen, closeSearchModal, searchQuery, setSearchQuery, searchResults, searchLoading, runStockSearch } = useMarketStore();
    const debouncedQuery = useDebouncedValue(searchQuery, 250);
    useEffect(() => {
        if (searchModalOpen) {
            void runStockSearch(debouncedQuery);
        }
    }, [debouncedQuery, runStockSearch, searchModalOpen]);
    const content = useMemo(() => {
        if (searchLoading) {
            return _jsx("p", { className: "text-sm text-slate-500", children: "Searching global markets..." });
        }
        if (!searchResults.length && searchQuery.trim()) {
            return _jsx("p", { className: "text-sm text-slate-500", children: "No matching symbols found." });
        }
        if (!searchQuery.trim()) {
            return _jsx("p", { className: "text-sm text-slate-500", children: "Search by symbol, company name, or exchange." });
        }
        return (_jsx("ul", { className: "space-y-2", children: searchResults.map((result) => (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => {
                        onSelectSymbol?.(result.symbol);
                        closeSearchModal();
                    }, className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50", children: [_jsx("p", { className: "text-sm font-semibold text-slate-900", children: result.symbol }), _jsx("p", { className: "text-sm text-slate-600", children: result.description }), _jsx("p", { className: "mt-1 text-xs uppercase tracking-[0.12em] text-slate-500", children: result.exchange || 'Global' })] }) }, `${result.symbol}-${result.exchange || 'global'}`))) }));
    }, [closeSearchModal, onSelectSymbol, searchLoading, searchQuery, searchResults]);
    if (!searchModalOpen) {
        return null;
    }
    return (_jsx(Modal, { title: "Global Stock Search", onClose: closeSearchModal, children: _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { placeholder: "Search for AAPL, Tesla, SAP, Reliance...", autoFocus: true, value: searchQuery, onChange: (event) => setSearchQuery(event.target.value), className: "h-11 rounded-xl border-slate-300" }), _jsx("div", { className: "max-h-80 overflow-y-auto pr-1", children: content })] }) }));
}
