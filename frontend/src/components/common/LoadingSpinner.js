import { jsx as _jsx } from "react/jsx-runtime";
export function LoadingSpinner() {
    return (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" }) }));
}
