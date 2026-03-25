import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}
export function MarketIndexCard({ data }) {
    const isPositive = data.change >= 0;
    return (_jsxs("article", { className: "rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.16em] text-slate-500", children: data.symbol }), _jsx("h3", { className: "mt-1 text-lg font-semibold text-slate-900", children: data.name })] }), _jsxs("span", { className: `rounded-full px-2.5 py-1 text-xs font-semibold ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`, children: [isPositive ? '+' : '', data.changePercent.toFixed(2), "%"] })] }), _jsx("p", { className: "mt-4 text-2xl font-bold text-slate-900", children: formatNumber(data.value) }), _jsxs("p", { className: `mt-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`, children: [isPositive ? '+' : '', formatNumber(data.change), " today"] })] }));
}
