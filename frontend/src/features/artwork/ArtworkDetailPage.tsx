import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { ApiError, request } from '@/lib/api';
import { BackLink } from '@/components/BackLink';
import { Icon } from '@/components/Icon';
import { SectionHeader } from '@/components/sections';
import { SmartImg } from '@/components/SmartImg';
import { ArtworkCard } from '@/features/artwork/ArtworkCard';
import type { Artwork } from '@/features/search/types';
import type { ArtistDetail } from '@/features/artist/types';
import { WishlistButton } from '@/features/wishlist/WishlistButton';

export function ArtworkDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();

  const artwork = useQuery<Artwork, ApiError>({
    queryKey: ['artwork', slug],
    queryFn: () => request<Artwork>(`/artworks/${encodeURIComponent(slug)}`, { auth: false }),
    enabled: slug.length > 0,
    retry: (n, err) => err.status !== 404 && n < 1,
  });

  // "More by this artist" — fetch the artist detail and exclude the current piece.
  const artist = useQuery<ArtistDetail, ApiError>({
    queryKey: ['artist', artwork.data?.artist.slug],
    queryFn: () =>
      request<ArtistDetail>(`/artists/${encodeURIComponent(artwork.data!.artist.slug)}`, {
        auth: false,
      }),
    enabled: Boolean(artwork.data),
    retry: false,
  });

  if (artwork.isLoading) return <p className="py-10 text-ink-3">Loading…</p>;
  if (artwork.error?.status === 404) return <NotFound slug={slug} />;
  if (artwork.error || !artwork.data) {
    return <p className="py-10 text-ink-3">Failed to load. Please retry.</p>;
  }

  const w = artwork.data;
  const more = (artist.data?.artworks ?? []).filter((a) => a.id !== w.id).slice(0, 4);

  return (
    <div className="pt-5">
      <BackLink />

      <section className="grid gap-16 pb-15 pt-8" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        {/* Framed artwork */}
        <div>
          <div className="artwork-frame relative" style={{ padding: '20px 20px 80px' }}>
            <div className="img-wrap" style={{ aspectRatio: 'auto', minHeight: 480 }}>
              <SmartImg
                src={w.image_url}
                alt={w.title}
                title={w.title}
                subtitle={w.artist.name}
                loading="eager"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.08em] text-ink-3">
                Plate · {w.wikidata_id}
              </div>
              <div className="font-mono text-[11px] text-ink-3">{capitalize(w.kind)}</div>
            </div>
          </div>
        </div>

        {/* Info column */}
        <div>
          {w.artist.movement && (
            <div className="eyebrow mb-3.5">{w.artist.movement}</div>
          )}
          <h1 className="display m-0" style={{ fontSize: 60 }}>
            {w.title}
          </h1>
          <div className="mt-3.5 text-lg text-ink-2">
            <Link
              to={`/artists/${w.artist.slug}`}
              className="border-b border-line text-ink transition hover:border-ink-3"
              style={{ textDecoration: 'none' }}
            >
              {w.artist.name}
            </Link>
            {w.year && <span className="text-ink-3"> · {w.year}</span>}
          </div>

          <div className="mt-9 flex gap-3">
            <WishlistButton artwork={w} />
            {w.museum && (
              <button
                type="button"
                onClick={() => navigate('/map')}
                className="btn btn-ghost"
              >
                <Icon.map /> See on map
              </button>
            )}
          </div>

          {/* "Where it lives" feature card */}
          {w.museum && (
            <div className="card relative mt-9 overflow-hidden p-6">
              <div className="eyebrow mb-2.5">Where it lives</div>
              <Link
                to={`/museums/${w.museum.wikidata_id}`}
                className="font-display m-0 cursor-pointer text-[28px]"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {w.museum.name}
              </Link>
              <div className="mt-1 text-sm text-ink-2">
                {w.museum.city}
                {w.museum.country && `, ${w.museum.country}`}
              </div>
              {w.museum.latitude != null && w.museum.longitude != null && (
                <div className="mt-3.5 font-mono text-xs text-ink-3">
                  {w.museum.latitude.toFixed(4)}° {w.museum.latitude >= 0 ? 'N' : 'S'} ·{' '}
                  {Math.abs(w.museum.longitude).toFixed(4)}°{' '}
                  {w.museum.longitude >= 0 ? 'E' : 'W'}
                </div>
              )}
              <Link
                to={`/museums/${w.museum.wikidata_id}`}
                className="btn btn-ghost btn-sm mt-4 inline-flex"
              >
                See the museum <Icon.arrow />
              </Link>

              {/* Decorative pin */}
              <div className="absolute right-6 top-5 text-accent">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  aria-hidden="true"
                >
                  <path d="M18 32s10-8.6 10-16a10 10 0 0 0-20 0c0 7.4 10 16 10 16Z" />
                  <circle cx="18" cy="16" r="3.4" />
                </svg>
              </div>
            </div>
          )}

          {/* Speclist (museum-wall-label) */}
          <dl className="speclist mt-7">
            <dt>Kind</dt>
            <dd>{capitalize(w.kind)}</dd>
            {w.year !== null && (
              <>
                <dt>Year</dt>
                <dd>{w.year}</dd>
              </>
            )}
            {w.artist.movement && (
              <>
                <dt>Movement</dt>
                <dd>{w.artist.movement}</dd>
              </>
            )}
            <dt>Source</dt>
            <dd>
              <a
                className="link-quiet inline-flex items-center gap-1.5"
                href={`https://www.wikidata.org/wiki/${w.wikidata_id}`}
                target="_blank"
                rel="noreferrer"
              >
                Wikidata <Icon.external />
              </a>
            </dd>
          </dl>
        </div>
      </section>

      {/* More by this artist */}
      {more.length > 0 && (
        <section className="pb-15">
          <SectionHeader
            eyebrow={`More by ${w.artist.name}`}
            title="In other rooms, in other cities"
            link="See all"
            to={`/artists/${w.artist.slug}`}
          />
          <ul className="mt-7 grid grid-cols-4 gap-6">
            {more.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function NotFound({ slug }: { slug: string }) {
  return (
    <div className="space-y-2 py-10">
      <h1 className="display text-2xl">Artwork not found</h1>
      <p className="text-ink-2">No artwork matches "{slug}".</p>
      <Link to="/" className="link-quiet text-sm">
        ← Back to home
      </Link>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
