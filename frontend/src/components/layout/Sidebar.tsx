import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside className="min-h-screen w-64 border-r border-slate-200 bg-slate-50 p-4">
      <nav className="space-y-2 text-sm">
        <Link to="/dashboard" className="block rounded px-3 py-2 hover:bg-slate-100">
          Dashboard
        </Link>
      </nav>
    </aside>
  );
}
