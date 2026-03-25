import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StockCard } from '@/components/dashboard/StockCard';
export function CountrySection({ section }) {
    return (_jsxs("section", { className: "space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900", children: section.country }), _jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-slate-500", children: "Top Movers" })] }), _jsx("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: section.stocks.map((stock) => (_jsx(StockCard, { data: stock, compact: true }, `${section.country}-${stock.symbol}`))) })] }));
}
