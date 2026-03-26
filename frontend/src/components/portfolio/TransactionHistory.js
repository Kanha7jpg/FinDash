import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2
    }).format(value);
}
export const TransactionHistory = memo(function TransactionHistory({ transactions }) {
    if (transactions.length === 0) {
        return _jsx("p", { className: "rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600", children: "No transactions yet." });
    }
    return (_jsx("div", { className: "overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm", children: _jsxs("table", { className: "min-w-full text-left text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3", children: "Date" }), _jsx("th", { className: "px-4 py-3", children: "Symbol" }), _jsx("th", { className: "px-4 py-3", children: "Type" }), _jsx("th", { className: "px-4 py-3", children: "Quantity" }), _jsx("th", { className: "px-4 py-3", children: "Price" }), _jsx("th", { className: "px-4 py-3", children: "Fee" })] }) }), _jsx("tbody", { children: transactions.map((transaction) => (_jsxs("tr", { className: "border-t border-slate-100", children: [_jsx("td", { className: "px-4 py-3 text-slate-700", children: new Date(transaction.executedAt).toLocaleString() }), _jsx("td", { className: "px-4 py-3 font-semibold text-slate-900", children: transaction.symbol }), _jsx("td", { className: `px-4 py-3 font-semibold ${transaction.type === 'BUY' ? 'text-blue-700' : 'text-amber-700'}`, children: transaction.type }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: transaction.quantity.toFixed(4) }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: formatCurrency(transaction.price, transaction.currency) }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: formatCurrency(transaction.fee, transaction.currency) })] }, transaction.id))) })] }) }));
});
