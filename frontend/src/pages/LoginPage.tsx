import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { login } from '@/api/auth';
import { isValidEmail } from '@/utils/validators';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }

    try {
      const response = await login({ email, password });
      setAuth(response.user, response.tokens.accessToken);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card>
        <form onSubmit={onSubmit} className="w-80 space-y-4">
          <h1 className="text-xl font-bold">Sign in</h1>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full">
            Login
          </Button>
          <p className="text-sm text-slate-600">
            No account? <Link to="/register" className="text-blue-600">Register</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
