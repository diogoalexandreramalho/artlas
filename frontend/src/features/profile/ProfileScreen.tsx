import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/api';
import { SectionHeader } from '@/components/sections';
import { ArtworkCard } from '@/features/artwork/ArtworkCard';
import { useAuth } from '@/features/auth/AuthContext';
import type { WishlistItem } from '@/features/wishlist/types';

/** Profile / "you" screen — avatar + stats + recently saved. RequireAuth-wrapped. */
export function ProfileScreen() {
  const { user, logout } = useAuth();
  const wishlist = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: () => request<WishlistItem[]>('/wishlist'),
    enabled: !!user,
  });

  const works = wishlist.data?.map((it) => it.artwork) ?? [];
  const stats = useMemo(() => {
    const cities = new Set(works.map((w) => w.museum?.city).filter(Boolean));
    const movements = new Set(
      works.map((w) => w.artist.movement).filter(Boolean),
    );
    return {
      saved: works.length,
      cities: cities.size,
      movements: movements.size,
      // "Trips planned" is aspirational — for now == cities. Real trip
      // planning lives post-MVP.
      trips: cities.size,
    };
  }, [works]);

  const recent = works.slice(0, 4);

  if (!user) return null;

  const handle = user.email.split('@')[0];
  const initial = handle[0]?.toUpperCase() ?? '?';

  return (
    <div className="pt-5">
      <section className="border-b border-line pb-8">
        <div className="flex items-center gap-6">
          <div
            className="font-display flex h-24 w-24 flex-none items-center justify-center rounded-full bg-accent text-white"
            style={{ fontSize: 44, fontStyle: 'italic' }}
          >
            {initial}
          </div>
          <div className="flex-1">
            <h1 className="display m-0" style={{ fontSize: 56 }}>
              {handle}
            </h1>
            <div className="mt-1 text-sm text-ink-3">{user.email}</div>
          </div>
          <button type="button" onClick={logout} className="btn btn-ghost">
            Sign out
          </button>
        </div>
      </section>

      <section className="pt-8">
        <div className="grid grid-cols-4 rounded-md border border-line">
          <Stat label="Works saved" value={stats.saved} />
          <Stat label="Cities" value={stats.cities} />
          <Stat label="Movements" value={stats.movements} />
          <Stat label="Trips planned" value={stats.trips} />
        </div>
      </section>

      <section className="pb-15 pt-10">
        <SectionHeader
          eyebrow="Your wishlist"
          title="Recently saved"
          link="See all"
          to="/wishlist"
        />
        {recent.length === 0 ? (
          <div className="py-10 text-center text-ink-3" style={{ fontStyle: 'italic' }}>
            <p className="font-display text-lg">Nothing saved yet.</p>
            <p className="mt-1 text-sm">
              Find something on the{' '}
              <Link to="/" className="link-quiet">
                home page
              </Link>{' '}
              or the{' '}
              <Link to="/map" className="link-quiet">
                map
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="mt-7 grid grid-cols-4 gap-6">
            {recent.map((w) => (
              <ArtworkCard key={w.id} artwork={w} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-line px-6 py-5 last:border-r-0">
      <div className="eyebrow mb-2 text-[10px]">{label}</div>
      <div className="font-display text-3xl leading-none">{value}</div>
    </div>
  );
}
