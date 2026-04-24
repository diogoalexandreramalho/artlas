import { Link, NavLink } from 'react-router-dom';
import { AppRoutes } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';

export function App() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-stone-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Artlas
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to="/" end className={linkClass}>
              Search
            </NavLink>
            <NavLink to="/map" className={linkClass}>
              Map
            </NavLink>
            <NavLink to="/wishlist" className={linkClass}>
              Wishlist
            </NavLink>
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="rounded border border-stone-300 px-3 py-1 text-stone-700 hover:bg-stone-100"
              >
                Log out ({user.email})
              </button>
            ) : (
              <NavLink
                to="/login"
                className="rounded bg-stone-900 px-3 py-1 text-white hover:bg-stone-700"
              >
                Log in
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        <AppRoutes />
      </main>
    </div>
  );
}

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'text-stone-900 underline' : 'text-stone-600 hover:text-stone-900';
}
