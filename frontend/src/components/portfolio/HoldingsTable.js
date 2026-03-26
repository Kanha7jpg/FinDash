import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
function formatCurrency(value) {
    if (value === null) {
        return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    }).format(value);
}
export const HoldingsTable = memo(function HoldingsTable({ holdings }) {
    if (holdings.length === 0) {
        return _jsx("p", { className: "rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600", children: "No holdings yet." });
    }
    return (_jsx("div", { className: "overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm", children: _jsxs("table", { className: "min-w-full text-left text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3", children: "Symbol" }), _jsx("th", { className: "px-4 py-3", children: "Name" }), _jsx("th", { className: "px-4 py-3", children: "Qty" }), _jsx("th", { className: "px-4 py-3", children: "Avg Cost" }), _jsx("th", { className: "px-4 py-3", children: "Current" }), _jsx("th", { className: "px-4 py-3", children: "Cost Basis" }), _jsx("th", { className: "px-4 py-3", children: "Unrealized P&L" })] }) }), _jsx("tbody", { children: holdings.map((holding) => {
                        const pnlPositive = (holding.unrealizedPnl || 0) >= 0;
                        return (_jsxs("tr", { className: "border-t border-slate-100", children: [_jsx("td", { className: "px-4 py-3 font-semibold text-slate-900", children: holding.symbol }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: holding.name }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: holding.quantity.toFixed(4) }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: formatCurrency(holding.averagePrice) }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: formatCurrency(holding.currentPrice) }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: formatCurrency(holding.costBasis) }), _jsxs("td", { className: `px-4 py-3 font-semibold ${pnlPositive ? 'text-emerald-600' : 'text-rose-600'}`, children: [formatCurrency(holding.unrealizedPnl), holding.unrealizedPnlPercent !== null ? ` (${holding.unrealizedPnlPercent.toFixed(2)}%)` : ''] })] }, holding.symbol));
                    }) })] }) }));
});
