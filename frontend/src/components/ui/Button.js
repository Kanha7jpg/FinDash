import { jsx as _jsx } from "react/jsx-runtime";
export function Button(props) {
    return (_jsx("button", { ...props, className: `rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 ${props.className || ''}` }));
}
