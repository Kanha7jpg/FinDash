import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
export const GainLossChart = memo(function GainLossChart({ holdings }) {
    const chartData = useMemo(() => holdings.map((holding) => ({
        symbol: holding.symbol,
        pnl: holding.unrealizedPnl ?? 0
    })), [holdings]);
    return (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h3", { className: "text-sm font-semibold uppercase tracking-[0.12em] text-slate-500", children: "Unrealized P&L by Holding" }), _jsx("div", { className: "mt-4 h-72", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }), _jsx(XAxis, { dataKey: "symbol", tick: { fontSize: 12 } }), _jsx(YAxis, { tick: { fontSize: 12 } }), _jsx(Tooltip, { formatter: (value) => (typeof value === 'number' ? value.toFixed(2) : String(value ?? '')) }), _jsx(Bar, { dataKey: "pnl", fill: "#0ea5e9", radius: [6, 6, 0, 0] })] }) }) })] }));
});
