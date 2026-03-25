import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    }).format(value);
}
export function StockCard({ data, compact = false }) {
    const isPositive = data.change >= 0;
    return (_jsxs("article", { className: `rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${compact ? 'min-w-[220px]' : ''}`, children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.16em] text-slate-500", children: data.symbol }), _jsx("h3", { className: "mt-1 text-base font-semibold text-slate-900", children: data.name })] }), _jsxs("span", { className: `rounded-full px-2 py-1 text-xs font-semibold ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`, children: [isPositive ? '+' : '', data.changePercent.toFixed(2), "%"] })] }), _jsx("p", { className: "mt-4 text-xl font-bold text-slate-900", children: formatCurrency(data.price) }), _jsxs("p", { className: `mt-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`, children: [isPositive ? '+' : '', data.change.toFixed(2)] })] }));
}
