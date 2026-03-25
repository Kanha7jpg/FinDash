import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email.'),
    password: z.string().min(8, 'Password must be at least 8 characters.')
});
export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });
    async function onSubmit(values) {
        setError(null);
        try {
            await login(values);
            navigate('/dashboard');
        }
        catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Invalid credentials.');
        }
    }
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4", children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "w-80 space-y-4", children: [_jsx("h1", { className: "text-xl font-bold text-slate-900", children: "Sign in" }), _jsxs("div", { className: "space-y-1", children: [_jsx(Input, { ...register('email'), placeholder: "Email", type: "email" }), errors.email ? _jsx("p", { className: "text-xs text-red-600", children: errors.email.message }) : null] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Input, { ...register('password'), placeholder: "Password", type: "password" }), errors.password ? _jsx("p", { className: "text-xs text-red-600", children: errors.password.message }) : null] }), error ? _jsx("p", { className: "text-sm text-red-600", children: error }) : null, _jsx(Button, { type: "submit", className: "w-full disabled:cursor-not-allowed disabled:opacity-70", disabled: isSubmitting, children: isSubmitting ? 'Signing in...' : 'Login' }), _jsxs("p", { className: "text-sm text-slate-600", children: ["No account? ", _jsx(Link, { to: "/register", className: "text-blue-600", children: "Register" })] })] }) }) }));
}
