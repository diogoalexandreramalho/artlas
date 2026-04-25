import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/api';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/features/auth/AuthContext';
import type { WishlistItem } from '@/features/wishlist/types';

const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Discover', end: true },
  { to: '/map', label: 'Map' },
  { to: '/wishlist', label: 'Wishlist' },
];

export function TopNav() {
  const { user } = useAuth();

  // Wishlist count for the heart badge. Only fires when logged in.
  const wishlist = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: () => request<WishlistItem[]>('/wishlist'),
    enabled: !!user,
  });
  const savedCount = wishlist.data?.length ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-line-2 bg-bg px-10 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="brand inline-flex items-baseline gap-0">
            <span>Artlas</span>
            <span className="font-display italic text-accent">.</span>
          </Link>
          <nav className="flex items-center gap-7">
            {NAV_ITEMS.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  [
                    'pb-1 text-sm tracking-wide transition',
                    isActive
                      ? 'border-b-[1.5px] border-accent font-semibold text-ink'
                      : 'border-b-[1.5px] border-transparent font-medium text-ink-2 hover:text-ink',
                  ].join(' ')
                }
              >
                {it.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/wishlist"
            aria-label={`Wishlist (${savedCount} saved)`}
            className="btn btn-ghost btn-sm relative"
          >
            <Icon.heart filled={savedCount > 0} />
            {savedCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                {savedCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border border-line py-1 pl-3 pr-1 transition hover:border-ink-3"
            >
              <span className="text-[13px] text-ink-2">{user.email.split('@')[0]}</span>
              <span className="font-display flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                {user.email[0]?.toUpperCase()}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
