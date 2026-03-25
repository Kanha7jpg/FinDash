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

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  async function onSubmit(values: RegisterFormValues) {
    setError(null);

    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password
      });
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to register.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-cyan-50 to-sky-100 p-4">
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="w-80 space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Create account</h1>
          <div className="space-y-1">
            <Input {...register('firstName')} placeholder="First name" />
            {errors.firstName ? <p className="text-xs text-red-600">{errors.firstName.message}</p> : null}
          </div>
          <div className="space-y-1">
            <Input {...register('lastName')} placeholder="Last name" />
            {errors.lastName ? <p className="text-xs text-red-600">{errors.lastName.message}</p> : null}
          </div>
          <div className="space-y-1">
            <Input {...register('email')} placeholder="Email" type="email" />
            {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-1">
            <Input {...register('password')} placeholder="Password" type="password" />
            {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
          </div>
          <div className="space-y-1">
            <Input {...register('confirmPassword')} placeholder="Confirm password" type="password" />
            {errors.confirmPassword ? <p className="text-xs text-red-600">{errors.confirmPassword.message}</p> : null}
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full disabled:cursor-not-allowed disabled:opacity-70" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </Button>
          <p className="text-sm text-slate-600">
            Have an account? <Link to="/login" className="text-blue-600">Login</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
