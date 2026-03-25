import { jsx as _jsx } from "react/jsx-runtime";
export function Input(props) {
    return (_jsx("input", { ...props, className: `w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none ${props.className || ''}` }));
}
