import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Modal({ title, onClose, children }) {
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50", children: _jsxs("div", { className: "w-full max-w-lg rounded-xl bg-white p-6 shadow-xl", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold", children: title }), _jsx("button", { onClick: onClose, className: "text-slate-500 hover:text-slate-700", type: "button", children: "x" })] }), children] }) }));
}
