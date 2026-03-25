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
const registerSchema = z
    .object({
    firstName: z.string().min(1, 'First name is required.').max(100),
    lastName: z.string().min(1, 'Last name is required.').max(100),
    email: z.string().email('Please enter a valid email.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Please confirm your password.')
})
    .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
});
export function RegisterPage() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [error, setError] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });
    async function onSubmit(values) {
        setError(null);
        try {
            await registerUser({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password
            });
            navigate('/dashboard');
        }
        catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Unable to register.');
        }
    }
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-cyan-50 to-sky-100 p-4", children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "w-80 space-y-4", children: [_jsx("h1", { className: "text-xl font-bold text-slate-900", children: "Create account" }), _jsxs("div", { className: "space-y-1", children: [_jsx(Input, { ...register('firstName'), placeholder: "First name" }), errors.firstName ? _jsx("p", { className: "text-xs text-red-600", children: errors.firstName.message }) : null] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Input, { ...register('lastName'), placeholder: "Last name" }), errors.lastName ? _jsx("p", { className: "text-xs text-red-600", children: errors.lastName.message }) : null] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Input, { ...register('email'), placeholder: "Email", type: "email" }), errors.email ? _jsx("p", { className: "text-xs text-red-600", children: errors.email.message }) : null] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Input, { ...register('password'), placeholder: "Password", type: "password" }), errors.password ? _jsx("p", { className: "text-xs text-red-600", children: errors.password.message }) : null] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Input, { ...register('confirmPassword'), placeholder: "Confirm password", type: "password" }), errors.confirmPassword ? _jsx("p", { className: "text-xs text-red-600", children: errors.confirmPassword.message }) : null] }), error ? _jsx("p", { className: "text-sm text-red-600", children: error }) : null, _jsx(Button, { type: "submit", className: "w-full disabled:cursor-not-allowed disabled:opacity-70", disabled: isSubmitting, children: isSubmitting ? 'Creating account...' : 'Register' }), _jsxs("p", { className: "text-sm text-slate-600", children: ["Have an account? ", _jsx(Link, { to: "/login", className: "text-blue-600", children: "Login" })] })] }) }) }));
}
