import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { WatchlistsPage } from '@/pages/WatchlistsPage';
function ProtectedRoute({ children }) {
    const { isAuthenticated, isInitializing } = useAuth();
    if (isInitializing) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-slate-100", children: _jsx(LoadingSpinner, {}) }));
    }
    return isAuthenticated ? children : _jsx(Navigate, { to: "/login", replace: true });
}
export default function App() {
    return (_jsx(ErrorBoundary, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(Layout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "portfolio", element: _jsx(PortfolioPage, {}) }), _jsx(Route, { path: "watchlists", element: _jsx(WatchlistsPage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }));
}
