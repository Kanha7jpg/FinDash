import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { register } from '@/api/auth';
import { isStrongPassword, isValidEmail } from '@/utils/validators';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      const response = await register({ email, password, firstName, lastName });
      setAuth(response.user, response.tokens.accessToken);
      navigate('/dashboard');
    } catch {
      setError('Unable to register.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card>
        <form onSubmit={onSubmit} className="w-80 space-y-4">
          <h1 className="text-xl font-bold">Create account</h1>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full">
            Register
          </Button>
          <p className="text-sm text-slate-600">
            Have an account? <Link to="/login" className="text-blue-600">Login</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
