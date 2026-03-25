import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDisplayName } from '@/utils/helpers';
export function Header() {
    const { user } = useAuth();
    return (_jsxs("header", { className: "flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4", children: [_jsx(Link, { to: "/", className: "text-lg font-bold text-blue-700", children: "Financial Dashboard" }), _jsx("div", { className: "text-sm text-slate-600", children: getDisplayName(user?.firstName, user?.lastName) })] }));
}
