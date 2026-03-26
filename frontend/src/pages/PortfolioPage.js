import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { AllocationCharts } from '@/components/portfolio/AllocationCharts';
import { GainLossChart } from '@/components/portfolio/GainLossChart';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { TransactionHistory } from '@/components/portfolio/TransactionHistory';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toast } from '@/components/ui/Toast';
import { usePortfolioStore } from '@/store/portfolioStore';
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
export function PortfolioPage() {
    const { portfolios, selectedPortfolioId, detail, loading, saving, error, loadPortfolios, selectPortfolio, createNewPortfolio, addTransaction, refreshSelectedDetail, clearError } = usePortfolioStore();
    const [portfolioName, setPortfolioName] = useState('');
    const [portfolioDescription, setPortfolioDescription] = useState('');
    const [txSymbol, setTxSymbol] = useState('');
    const [txType, setTxType] = useState('BUY');
    const [txQuantity, setTxQuantity] = useState('');
    const [txPrice, setTxPrice] = useState('');
    const [txFee, setTxFee] = useState('0');
    const [toast, setToast] = useState(null);
    useEffect(() => {
        void loadPortfolios();
    }, [loadPortfolios]);
    useEffect(() => {
        if (!toast) {
            return;
        }
        const timeout = window.setTimeout(() => setToast(null), 2200);
        return () => window.clearTimeout(timeout);
    }, [toast]);
    const holdings = detail?.holdings ?? [];
    const transactions = detail?.transactions ?? [];
    const totals = useMemo(() => ({
        costBasis: detail?.totals.totalCostBasis ?? 0,
        marketValue: detail?.totals.totalMarketValue ?? null,
        unrealizedPnl: detail?.totals.totalUnrealizedPnl ?? null
    }), [detail]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("header", { className: "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Portfolio Dashboard" }), _jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Track holdings, allocations, and transaction-driven performance in one place." })] }), _jsx(Button, { className: "rounded-xl bg-slate-900 px-5 py-2.5 hover:bg-slate-800", onClick: () => {
                            void refreshSelectedDetail();
                        }, disabled: loading || !selectedPortfolioId, children: "Refresh Data" })] }), error ? (_jsxs("div", { className: "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700", children: [error, _jsx("button", { type: "button", className: "ml-2 font-semibold", onClick: () => clearError(), children: "Dismiss" })] })) : null, _jsxs("section", { className: "grid gap-4 xl:grid-cols-[360px_1fr]", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("form", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", onSubmit: async (event) => {
                                    event.preventDefault();
                                    const name = portfolioName.trim();
                                    if (!name) {
                                        return;
                                    }
                                    await createNewPortfolio({
                                        name,
                                        description: portfolioDescription.trim() || undefined,
                                        baseCurrency: 'USD'
                                    });
                                    setPortfolioName('');
                                    setPortfolioDescription('');
                                    setToast('Portfolio created');
                                }, children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.12em] text-slate-500", children: "Create Portfolio" }), _jsxs("div", { className: "mt-3 space-y-2", children: [_jsx(Input, { value: portfolioName, onChange: (event) => setPortfolioName(event.target.value), placeholder: "Long-term", required: true }), _jsx(Input, { value: portfolioDescription, onChange: (event) => setPortfolioDescription(event.target.value), placeholder: "Description" }), _jsx(Button, { type: "submit", disabled: saving, className: "w-full rounded-lg", children: saving ? 'Saving...' : 'Create' })] })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.12em] text-slate-500", children: "Portfolios" }), _jsxs("div", { className: "mt-3 space-y-2", children: [portfolios.map((portfolio) => (_jsxs("button", { type: "button", className: `w-full rounded-lg border px-3 py-2 text-left ${portfolio.id === selectedPortfolioId ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50'}`, onClick: () => {
                                                    void selectPortfolio(portfolio.id);
                                                }, children: [_jsx("p", { className: "font-semibold text-slate-900", children: portfolio.name }), _jsxs("p", { className: "text-xs text-slate-500", children: [portfolio.holdingsCount, " holdings \u00B7 ", portfolio.transactionsCount, " tx"] })] }, portfolio.id))), portfolios.length === 0 ? _jsx("p", { className: "text-sm text-slate-500", children: "No portfolios yet." }) : null] })] }), _jsxs("form", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", onSubmit: async (event) => {
                                    event.preventDefault();
                                    if (!selectedPortfolioId) {
                                        return;
                                    }
                                    await addTransaction(selectedPortfolioId, {
                                        symbol: txSymbol.trim().toUpperCase(),
                                        type: txType,
                                        quantity: Number(txQuantity),
                                        price: Number(txPrice),
                                        fee: Number(txFee || '0'),
                                        currency: 'USD',
                                        executedAt: new Date().toISOString()
                                    });
                                    setTxSymbol('');
                                    setTxQuantity('');
                                    setTxPrice('');
                                    setTxFee('0');
                                    setToast('Transaction added');
                                }, children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.12em] text-slate-500", children: "Add Transaction" }), _jsxs("div", { className: "mt-3 space-y-2", children: [_jsx(Input, { placeholder: "Symbol", value: txSymbol, onChange: (event) => setTxSymbol(event.target.value), required: true }), _jsxs(Select, { value: txType, onChange: (event) => setTxType(event.target.value), children: [_jsx("option", { value: "BUY", children: "BUY" }), _jsx("option", { value: "SELL", children: "SELL" })] }), _jsx(Input, { type: "number", min: "0", step: "0.0001", placeholder: "Quantity", value: txQuantity, onChange: (event) => setTxQuantity(event.target.value), required: true }), _jsx(Input, { type: "number", min: "0", step: "0.0001", placeholder: "Price", value: txPrice, onChange: (event) => setTxPrice(event.target.value), required: true }), _jsx(Input, { type: "number", min: "0", step: "0.0001", placeholder: "Fee", value: txFee, onChange: (event) => setTxFee(event.target.value) }), _jsx(Button, { type: "submit", disabled: saving || !selectedPortfolioId, className: "w-full rounded-lg", children: saving ? 'Saving...' : 'Add Transaction' })] })] })] }), _jsxs("div", { className: "space-y-4", children: [loading ? _jsx("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500", children: "Loading..." }) : null, detail ? (_jsxs(_Fragment, { children: [_jsxs("section", { className: "grid gap-3 md:grid-cols-3", children: [_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-slate-500", children: "Cost Basis" }), _jsx("p", { className: "mt-2 text-xl font-semibold text-slate-900", children: formatCurrency(totals.costBasis) })] }), _jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-slate-500", children: "Market Value" }), _jsx("p", { className: "mt-2 text-xl font-semibold text-slate-900", children: formatCurrency(totals.marketValue) })] }), _jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-slate-500", children: "Unrealized P&L" }), _jsx("p", { className: `mt-2 text-xl font-semibold ${(totals.unrealizedPnl ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`, children: formatCurrency(totals.unrealizedPnl) })] })] }), _jsx(GainLossChart, { holdings: holdings }), _jsx(AllocationCharts, { holdings: holdings }), _jsxs("section", { className: "space-y-2", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Holdings" }), _jsx(HoldingsTable, { holdings: holdings })] }), _jsxs("section", { className: "space-y-2", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Transaction History" }), _jsx(TransactionHistory, { transactions: transactions })] })] })) : (_jsx("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600", children: "Select or create a portfolio to view analytics." }))] })] }), toast ? _jsx(Toast, { message: toast }) : null] }));
}
