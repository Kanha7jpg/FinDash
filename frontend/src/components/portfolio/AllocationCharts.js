import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
const COLORS = ['#0284c7', '#0ea5e9', '#22d3ee', '#6366f1', '#818cf8', '#34d399', '#f59e0b', '#f97316'];
function toAllocation(holdings, key) {
    const bucket = new Map();
    for (const holding of holdings) {
        const label = holding[key] || 'Unknown';
        const value = holding.marketValue ?? holding.costBasis;
        bucket.set(label, (bucket.get(label) || 0) + value);
    }
    return Array.from(bucket.entries()).map(([name, value]) => ({ name, value }));
}
function AllocationPie({ title, data }) {
    return (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h3", { className: "text-sm font-semibold uppercase tracking-[0.12em] text-slate-500", children: title }), _jsx("div", { className: "mt-4 h-72", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, dataKey: "value", nameKey: "name", outerRadius: 100, innerRadius: 55, paddingAngle: 2, children: data.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, entry.name))) }), _jsx(Tooltip, { formatter: (value) => (typeof value === 'number' ? value.toFixed(2) : String(value ?? '')) })] }) }) }), _jsx("div", { className: "mt-2 grid grid-cols-2 gap-2", children: data.map((entry, index) => (_jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-600", children: [_jsx("span", { className: "inline-block h-2.5 w-2.5 rounded-full", style: { backgroundColor: COLORS[index % COLORS.length] } }), _jsx("span", { children: entry.name })] }, entry.name))) })] }));
}
export const AllocationCharts = memo(function AllocationCharts({ holdings }) {
    const exchangeData = useMemo(() => toAllocation(holdings, 'exchange'), [holdings]);
    const countryData = useMemo(() => toAllocation(holdings, 'country'), [holdings]);
    return (_jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [_jsx(AllocationPie, { title: "Allocation by Sector Proxy (Exchange)", data: exchangeData }), _jsx(AllocationPie, { title: "Allocation by Country", data: countryData })] }));
});
