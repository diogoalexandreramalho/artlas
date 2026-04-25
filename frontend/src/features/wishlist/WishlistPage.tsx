import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError, request } from '@/lib/api';
import { Icon } from '@/components/Icon';
import { ArtworkCard } from '@/features/artwork/ArtworkCard';
import type { Artwork } from '@/features/search/types';
import type { WishlistItem } from '@/features/wishlist/types';

type CityGroup = {
  city: string;
  country: string | null;
  works: Artwork[];
  museumIds: Set<number>;
};

export function WishlistPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: () => request<WishlistItem[]>('/wishlist'),
  });

  const works = useMemo(() => data?.map((it) => it.artwork) ?? [], [data]);

  const groups = useMemo<CityGroup[]>(() => {
    const map = new Map<string, CityGroup>();
    for (const w of works) {
      if (!w.museum?.city) continue;
      const key = `${w.museum.city}|${w.museum.country ?? ''}`;
      const existing = map.get(key);
      if (existing) {
        existing.works.push(w);
        existing.museumIds.add(w.museum.id);
      } else {
        map.set(key, {
          city: w.museum.city,
          country: w.museum.country,
          works: [w],
          museumIds: new Set([w.museum.id]),
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.works.length - a.works.length);
  }, [works]);

  const remove = useMutation<void, ApiError, number, { previous?: WishlistItem[] }>({
    mutationFn: (artworkId) =>
      request<void>(`/wishlist/${artworkId}`, { method: 'DELETE' }),
    onMutate: async (artworkId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previous = queryClient.getQueryData<WishlistItem[]>(['wishlist']);
      queryClient.setQueryData<WishlistItem[]>(['wishlist'], (curr) =>
        (curr ?? []).filter((it) => it.artwork.id !== artworkId),
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['wishlist'], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  if (isLoading) return <p className="py-10 text-ink-3">Loading wishlist…</p>;

  if (works.length === 0) {
    return (
      <div className="mx-auto max-w-[720px] py-20 text-center">
        <h1 className="display m-0" style={{ fontSize: 64 }}>
          Your wishlist
        </h1>
        <p
          className="font-display mt-4 text-ink-2"
          style={{ fontSize: 22, fontStyle: 'italic' }}
        >
          Save artworks to plan a trip around the works themselves.
        </p>
        <Link to="/" className="btn btn-primary mt-8 inline-flex">
          Find something to save <Icon.arrow />
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-15 pt-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="eyebrow mb-3">
            {works.length} {works.length === 1 ? 'work' : 'works'} · {groups.length}{' '}
            {groups.length === 1 ? 'city' : 'cities'}
          </div>
          <h1 className="display m-0" style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}>
            Your <span style={{ fontStyle: 'italic' }}>itinerary</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Link to="/map" className="btn btn-primary">
            <Icon.map /> Plan on map
          </Link>
        </div>
      </div>

      {/* City groups */}
      <div className="mt-10 flex flex-col gap-16">
        {groups.map((g, i) => (
          <section key={`${g.city}-${g.country ?? ''}`}>
            <div className="mb-6 flex items-baseline justify-between">
              <div className="flex items-baseline gap-4">
                <span
                  className="font-display text-accent"
                  style={{ fontSize: 40, fontStyle: 'italic' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2 className="display m-0" style={{ fontSize: 44, fontStyle: 'italic' }}>
                    {g.city}
                  </h2>
                  <div className="eyebrow mt-1.5">
                    {g.country && `${g.country} · `}
                    {g.works.length} {g.works.length === 1 ? 'work' : 'works'} across{' '}
                    {g.museumIds.size} {g.museumIds.size === 1 ? 'museum' : 'museums'}
                  </div>
                </div>
              </div>
              <Link
                to={`/map?city=${encodeURIComponent(g.city)}`}
                className="btn btn-ghost btn-sm"
              >
                <Icon.pin /> Show on map
              </Link>
            </div>
            <ul
              className="grid gap-6"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
            >
              {g.works.map((w) => (
                <ArtworkCard
                  key={w.id}
                  artwork={w}
                  onSave={(id) => remove.mutate(id)}
                  saved
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
