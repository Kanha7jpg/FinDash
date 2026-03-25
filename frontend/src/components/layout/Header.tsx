import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDisplayName } from '@/utils/helpers';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <Link to="/" className="text-lg font-bold text-blue-700">
        Financial Dashboard
      </Link>
      <div className="text-sm text-slate-600">{getDisplayName(user?.firstName, user?.lastName)}</div>
    </header>
  );
}
