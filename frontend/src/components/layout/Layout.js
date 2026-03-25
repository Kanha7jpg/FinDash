import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
export function Layout() {
    return (_jsxs("div", { className: "min-h-screen bg-slate-100", children: [_jsx(Header, {}), _jsxs("div", { className: "flex", children: [_jsx(Sidebar, {}), _jsx("main", { className: "flex-1 p-6", children: _jsx(Outlet, {}) })] })] }));
}
