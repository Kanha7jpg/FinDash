import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
export function WatchlistStocksTable({ items, busy, onRemove, onUpdateNotes }) {
    const [editingSymbol, setEditingSymbol] = useState(null);
    const [draftNotes, setDraftNotes] = useState('');
    if (items.length === 0) {
        return _jsx("p", { className: "rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600", children: "No stocks added yet." });
    }
    return (_jsx("div", { className: "overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm", children: _jsxs("table", { className: "min-w-full text-left text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3", children: "Symbol" }), _jsx("th", { className: "px-4 py-3", children: "Name" }), _jsx("th", { className: "px-4 py-3", children: "Exchange" }), _jsx("th", { className: "px-4 py-3", children: "Notes" }), _jsx("th", { className: "px-4 py-3", children: "Actions" })] }) }), _jsx("tbody", { children: items.map((item) => (_jsxs("tr", { className: "border-t border-slate-100", children: [_jsx("td", { className: "px-4 py-3 font-semibold text-slate-900", children: item.symbol }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: item.name }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: item.exchange }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: editingSymbol === item.symbol ? (_jsxs("div", { className: "space-y-2", children: [_jsx(Input, { value: draftNotes, onChange: (event) => setDraftNotes(event.target.value), maxLength: 400 }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", className: "rounded-md px-3 py-1", onClick: async () => {
                                                        await onUpdateNotes(item.symbol, draftNotes.trim() || undefined);
                                                        setEditingSymbol(null);
                                                    }, disabled: busy, children: "Save" }), _jsx("button", { type: "button", className: "text-xs font-semibold text-slate-500", onClick: () => setEditingSymbol(null), children: "Cancel" })] })] })) : (_jsx("span", { children: item.notes || '-' })) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", className: "text-xs font-semibold text-blue-700 hover:text-blue-800", onClick: () => {
                                                setEditingSymbol(item.symbol);
                                                setDraftNotes(item.notes || '');
                                            }, children: "Edit Notes" }), _jsx("button", { type: "button", className: "text-xs font-semibold text-rose-600 hover:text-rose-700", onClick: async () => {
                                                await onRemove(item.symbol);
                                            }, disabled: busy, children: "Remove" })] }) })] }, item.id))) })] }) }));
}
