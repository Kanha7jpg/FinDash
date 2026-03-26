import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function WatchlistSidebar({ watchlists, selectedWatchlistId, onSelect, onDelete }) {
    return (_jsxs("aside", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.14em] text-slate-500", children: "Your Watchlists" }), _jsx("div", { className: "mt-3 space-y-2", children: watchlists.map((watchlist) => {
                    const selected = watchlist.id === selectedWatchlistId;
                    return (_jsxs("div", { className: `rounded-xl border p-3 transition ${selected ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50'}`, children: [_jsxs("button", { type: "button", className: "w-full text-left", onClick: () => onSelect(watchlist.id), "aria-label": `Select watchlist ${watchlist.name}`, children: [_jsx("p", { className: "font-semibold text-slate-900", children: watchlist.name }), _jsxs("p", { className: "mt-0.5 text-xs text-slate-500", children: [watchlist.items.length, " stocks"] })] }), _jsx("div", { className: "mt-2 flex justify-end", children: _jsx("button", { type: "button", className: "text-xs font-semibold text-rose-600 hover:text-rose-700", onClick: () => onDelete(watchlist.id), children: "Delete" }) })] }, watchlist.id));
                }) })] }));
}
