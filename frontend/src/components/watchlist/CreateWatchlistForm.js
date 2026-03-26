import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
export function CreateWatchlistForm({ onCreate, busy }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    return (_jsxs("form", { className: "space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", onSubmit: async (event) => {
            event.preventDefault();
            const normalizedName = name.trim();
            if (!normalizedName) {
                return;
            }
            await onCreate(normalizedName, description.trim() || undefined);
            setName('');
            setDescription('');
        }, children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.14em] text-slate-500", children: "Create Watchlist" }), _jsx(Input, { value: name, onChange: (event) => setName(event.target.value), placeholder: "Growth Picks", maxLength: 60, required: true }), _jsx(Input, { value: description, onChange: (event) => setDescription(event.target.value), placeholder: "Optional description", maxLength: 280 }), _jsx(Button, { type: "submit", disabled: busy || !name.trim(), className: "w-full rounded-lg", children: busy ? 'Saving...' : 'Create' })] }));
}
