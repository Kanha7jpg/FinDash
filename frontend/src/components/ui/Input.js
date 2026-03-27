import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
export const Input = forwardRef((props, ref) => {
    return (_jsx("input", { ref: ref, ...props, className: `w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none ${props.className || ''}` }));
});
Input.displayName = 'Input';
