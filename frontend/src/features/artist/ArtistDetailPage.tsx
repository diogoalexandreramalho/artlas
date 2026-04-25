import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { ApiError, request } from '@/lib/api';
import { BackLink } from '@/components/BackLink';
import { SectionHeader } from '@/components/sections';
import { ArtworkCard } from '@/features/artwork/ArtworkCard';
import type { ArtistDetail } from '@/features/artist/types';

export function ArtistDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = useQuery<ArtistDetail, ApiError>({
    queryKey: ['artist', slug],
    queryFn: () => request<ArtistDetail>(`/artists/${encodeURIComponent(slug)}`, { auth: false }),
    enabled: slug.length > 0,
    retry: (n, err) => err.status !== 404 && n < 1,
  });

  if (isLoading) return <p className="py-10 text-ink-3">Loading…</p>;
  if (error?.status === 404) return <NotFound slug={slug} />;
  if (error || !data) return <p className="py-10 text-ink-3">Failed to load. Please retry.</p>;

  const works = data.artworks;
  const cities = Array.from(
    new Set(works.map((w) => w.museum?.city).filter((c): c is string => Boolean(c))),
  );
  const lifeSpan = data.death_year != null ? data.death_year - (data.birth_year ?? 0) : null;
  const [firstName, ...rest] = data.name.split(' ');
  const lastNames = rest.join(' ');

  return (
    <div className="pt-5">
      <BackLink />

      <section className="pt-8">
        <div
          className="grid items-end gap-10 border-b border-line pb-8"
          style={{ gridTemplateColumns: '1fr auto' }}
        >
          <div>
            <div className="eyebrow mb-4">
              {[data.nationality, data.movement].filter(Boolean).join(' · ') || '—'}
            </div>
            <h1 className="display m-0" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
              {firstName && (
                <>
                  <span style={{ fontStyle: 'italic' }}>{firstName}</span>
                  {lastNames && ' '}
                </>
              )}
              {lastNames && <span>{lastNames}</span>}
            </h1>
          </div>
          {(data.birth_year || data.death_year) && (
            <div className="text-right">
              <div
                className="font-display text-accent"
                style={{ fontSize: 80, lineHeight: 1 }}
              >
                {data.birth_year ?? '?'}
                <span className="text-ink-3" style={{ fontSize: 30, margin: '0 8px' }}>
                  –
                </span>
                {data.death_year ?? 'present'}
              </div>
              {lifeSpan !== null && lifeSpan > 0 && (
                <div className="eyebrow mt-2">{lifeSpan} years</div>
              )}
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div
          className="mt-8 grid rounded-md border border-line"
          style={{
            gridTemplateColumns: `repeat(${Math.min(4, cities.length + 2)}, 1fr)`,
          }}
        >
          <Stat label="Works in Artlas" value={String(works.length)} />
          <Stat label="Cities" value={String(cities.length)} />
          {cities.slice(0, 2).map((c) => (
            <Stat key={c} label="City" value={c} accent />
          ))}
        </div>
      </section>

      <section className="pb-15 pt-8">
        <SectionHeader
          eyebrow="Works"
          title={`${works.length} ${works.length === 1 ? 'piece' : 'pieces'} on view`}
        />
        {works.length === 0 ? (
          <p className="mt-7 text-ink-3">No artworks indexed yet.</p>
        ) : (
          <ul className="mt-7 grid grid-cols-4 gap-6">
            {works.map((w) => (
              <ArtworkCard key={w.id} artwork={w} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-r border-line px-6 py-5 last:border-r-0">
      <div className="eyebrow mb-2 text-[10px]">{label}</div>
      <div
        className={['font-display text-3xl leading-none', accent && 'text-accent-deep italic']
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </div>
    </div>
  );
}

function NotFound({ slug }: { slug: string }) {
  return (
    <div className="space-y-2 py-10">
      <h1 className="display text-2xl">Artist not found</h1>
      <p className="text-ink-2">No artist matches "{slug}".</p>
      <Link to="/" className="link-quiet text-sm">
        ← Back to home
      </Link>
    </div>
  );
}
