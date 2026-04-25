import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';

import { request } from '@/lib/api';
import { SectionHeader } from '@/components/sections';
import { SmartImg } from '@/components/SmartImg';
import { ArtworkCard } from '@/features/artwork/ArtworkCard';
import { SearchBar } from '@/features/search/SearchBar';
import type { Artwork, Museum, Page } from '@/features/search/types';

/** Slug of the artwork shown in the hero (right column, framed, rotated -1.5°). */
const FEATURED_SLUG = 'mona-lisa';

/** Curator's picks — 4 hand-curated slugs from the seed data. */
const PICK_SLUGS = ['the-starry-night', 'guernica', 'the-birth-of-venus', 'the-night-watch'];

/** Cities that get a tile in "Plan by city". Image filename is a Wikimedia
 *  Commons file (resolved via Special:FilePath, same trick as PR #5). */
const CITY_TILES: { city: string; filename: string }[] = [
  { city: 'Paris', filename: 'Tour Eiffel Wikimedia Commons.jpg' },
  { city: 'Amsterdam', filename: 'Amsterdam Centrum Damrak.jpg' },
  { city: 'Madrid', filename: 'Madrid - Plaza Mayor de Madrid.jpg' },
  {
    city: 'Florence',
    filename: 'Cathedral Santa Maria del Fiore - Florence - Tuscany - Italy - 01 (15006028603).jpg',
  },
  { city: 'New York', filename: 'Lower Manhattan from Jersey City November 2014 panorama 3.jpg' },
];

const cityImg = (filename: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=800`;

export function HomeScreen() {
  const featured = useQuery<Artwork>({
    queryKey: ['artwork', FEATURED_SLUG],
    queryFn: () => request<Artwork>(`/artworks/${FEATURED_SLUG}`, { auth: false }),
  });

  const picks = useQueries({
    queries: PICK_SLUGS.map((slug) => ({
      queryKey: ['artwork', slug],
      queryFn: () => request<Artwork>(`/artworks/${slug}`, { auth: false }),
    })),
  });

  const museums = useQuery<Page<Museum>>({
    queryKey: ['museums', 'all'],
    queryFn: () => request<Page<Museum>>('/museums?limit=100', { auth: false }),
  });

  const cityCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of museums.data?.items ?? []) {
      if (m.city) counts.set(m.city, (counts.get(m.city) ?? 0) + 1);
    }
    return counts;
  }, [museums.data]);

  const pickItems = picks
    .map((p) => p.data)
    .filter((a): a is Artwork => Boolean(a));

  return (
    <div>
      {/* Hero */}
      <section className="pb-20 pt-10">
        <div className="grid items-center gap-15" style={{ gridTemplateColumns: '1.05fr 1fr' }}>
          <div>
            <h1 className="display m-0" style={{ fontSize: 'clamp(36px, 4.2vw, 60px)', lineHeight: 1.05 }}>
              Find the <span className="text-accent-deep">art</span> you love,
              <br />
              see where it <span className="text-accent">lives</span>.
            </h1>
            <p
              className="font-display mt-7 max-w-[480px] text-ink-2"
              style={{ fontSize: 18, lineHeight: 1.55 }}
            >
              Artlas tells you which museum holds which painting. Find a work you love, save it, and let it shape your next trip.
            </p>
            <div className="mt-9 max-w-[540px]">
              <SearchBar />
            </div>
          </div>

          {/* Featured artwork — rotated mat-board frame */}
          <div className="relative">
            {featured.data && (
              <>
                <Link
                  to={`/artworks/${featured.data.slug}`}
                  className="artwork-frame ml-auto block w-[360px] hover:shadow-lift"
                  style={{ transform: 'rotate(-1.5deg)' }}
                >
                  <div className="img-wrap">
                    <SmartImg
                      src={featured.data.image_url}
                      alt={featured.data.title}
                      title={featured.data.title}
                      subtitle={featured.data.artist.name}
                      loading="eager"
                    />
                  </div>
                  <div className="label">
                    <span className="font-display text-[18px] text-ink">{featured.data.title}</span>
                    <span className="text-[11px] tracking-[0.04em] text-ink-3">
                      {featured.data.artist.name}
                      {featured.data.museum && ` · ${featured.data.museum.name}, ${featured.data.museum.city}`}
                    </span>
                  </div>
                </Link>
                {featured.data.museum?.latitude != null && featured.data.museum?.longitude != null && (
                  <div className="font-display absolute -bottom-2.5 right-5 text-[13px] text-ink-3">
                    {featured.data.museum.latitude.toFixed(4)}° N, {featured.data.museum.longitude.toFixed(4)}° E
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Curator's picks */}
      <section className="pb-20">
        <SectionHeader eyebrow="Curator's picks" title="Worth crossing a city for" />
        <ul className="mt-7 grid grid-cols-4 gap-7">
          {pickItems.map((w) => (
            <ArtworkCard key={w.id} artwork={w} />
          ))}
        </ul>
      </section>

      {/* Plan by city */}
      <section className="pb-20">
        <SectionHeader eyebrow="Plan by city" title="Where the works are" link="Open the map" to="/map" />
        <div className="mt-7 grid grid-cols-5 gap-4">
          {CITY_TILES.map((tile) => (
            <Link
              key={tile.city}
              to="/map"
              className="relative block overflow-hidden rounded-md transition hover:shadow-lift"
              style={{ aspectRatio: '3 / 4' }}
            >
              <SmartImg
                src={cityImg(tile.filename)}
                alt={tile.city}
                title={tile.city}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(0.3) contrast(0.95)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 50%)',
                }}
              />
              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <div className="font-display text-[24px]">{tile.city}</div>
                <div className="text-[11px] uppercase tracking-[0.06em] opacity-85">
                  {cityCounts.get(tile.city) ?? 0}{' '}
                  {(cityCounts.get(tile.city) ?? 0) === 1 ? 'museum' : 'museums'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
