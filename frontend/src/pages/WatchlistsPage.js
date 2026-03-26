import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { AddStockForm } from '@/components/watchlist/AddStockForm';
import { CreateWatchlistForm } from '@/components/watchlist/CreateWatchlistForm';
import { WatchlistSidebar } from '@/components/watchlist/WatchlistSidebar';
import { WatchlistStocksTable } from '@/components/watchlist/WatchlistStocksTable';
import { Toast } from '@/components/ui/Toast';
import { useWatchlistStore } from '@/store/watchlistStore';
export function WatchlistsPage() {
    const { watchlists, selectedWatchlistId, loading, saving, error, loadWatchlists, setSelectedWatchlist, createNewWatchlist, deleteExistingWatchlist, addStock, removeStock, updateStockNotes, clearError } = useWatchlistStore();
    const [toast, setToast] = useState(null);
    const selectedWatchlist = useMemo(() => watchlists.find((watchlist) => watchlist.id === selectedWatchlistId) || null, [selectedWatchlistId, watchlists]);
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("header", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Watchlists" }), _jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Build focused baskets, attach notes, and track symbols you care about." })] }), error ? (_jsxs("div", { className: "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700", children: [error, _jsx("button", { type: "button", onClick: () => clearError(), className: "ml-3 text-xs font-semibold text-rose-800", children: "Dismiss" })] })) : null, _jsxs("div", { className: "grid gap-4 xl:grid-cols-[300px_1fr]", children: [_jsxs("div", { className: "space-y-4", children: [_jsx(CreateWatchlistForm, { busy: saving, onCreate: async (name, description) => {
                                    await createNewWatchlist({ name, description });
                                    setToast('Watchlist created');
                                } }), _jsx(WatchlistSidebar, { watchlists: watchlists, selectedWatchlistId: selectedWatchlistId, onSelect: setSelectedWatchlist, onDelete: async (watchlistId) => {
                                    await deleteExistingWatchlist(watchlistId);
                                    setToast('Watchlist deleted');
                                } })] }), _jsx("section", { className: "space-y-4", children: loading ? (_jsx("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500", children: "Loading watchlists..." })) : selectedWatchlist ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: selectedWatchlist.name }), selectedWatchlist.description ? _jsx("p", { className: "mt-1 text-sm text-slate-600", children: selectedWatchlist.description }) : null, _jsxs("p", { className: "mt-2 text-xs uppercase tracking-[0.12em] text-slate-500", children: [selectedWatchlist.items.length, " symbols tracked"] })] }), _jsx(AddStockForm, { busy: saving, onAdd: async (payload) => {
                                        await addStock(selectedWatchlist.id, payload);
                                        setToast('Stock added to watchlist');
                                    } }), _jsx(WatchlistStocksTable, { items: selectedWatchlist.items, busy: saving, onRemove: async (symbol) => {
                                        await removeStock(selectedWatchlist.id, symbol);
                                        setToast('Stock removed');
                                    }, onUpdateNotes: async (symbol, notes) => {
                                        await updateStockNotes(selectedWatchlist.id, symbol, notes);
                                        setToast('Notes updated');
                                    } })] })) : (_jsx("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600", children: "No watchlists yet. Create one to start tracking stocks." })) })] }), toast ? _jsx(Toast, { message: toast }) : null] }));
}
