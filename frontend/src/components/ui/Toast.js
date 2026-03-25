import { jsx as _jsx } from "react/jsx-runtime";
export function Toast({ message }) {
    return (_jsx("div", { className: "fixed bottom-4 right-4 rounded-md bg-slate-900 px-4 py-2 text-sm text-white shadow-lg", children: message }));
}
