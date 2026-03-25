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

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);

    try {
      await login(values);
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Invalid credentials.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="w-80 space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Sign in</h1>
          <div className="space-y-1">
            <Input {...register('email')} placeholder="Email" type="email" />
            {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-1">
            <Input {...register('password')} placeholder="Password" type="password" />
            {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full disabled:cursor-not-allowed disabled:opacity-70" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </Button>
          <p className="text-sm text-slate-600">
            No account? <Link to="/register" className="text-blue-600">Register</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
