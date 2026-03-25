import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export function NotFoundPage() {
    return (_jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center gap-4", children: [_jsx("h1", { className: "text-3xl font-bold", children: "404" }), _jsx("p", { className: "text-slate-600", children: "Page not found" }), _jsx(Link, { to: "/", className: "text-blue-600", children: "Go home" })] }));
}
