import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Map, { Marker } from 'react-map-gl/maplibre';

import { ApiError, request } from '@/lib/api';
import { BackLink } from '@/components/BackLink';
import { Icon } from '@/components/Icon';
import { SectionHeader } from '@/components/sections';
import { ArtworkCard } from '@/features/artwork/ArtworkCard';
import type { MuseumDetail } from '@/features/museum/types';

const MINI_MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
};

export function MuseumDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();

  // Route param is named `:slug` to match artist/artwork URL patterns, but
  // museums don't have a slug column today — the value here is a wikidata_id
  // (e.g. Q19675). PR #11's endpoint accepts that.
  const wikidataId = slug;

  const { data, isLoading, error } = useQuery<MuseumDetail, ApiError>({
    queryKey: ['museum', wikidataId],
    queryFn: () =>
      request<MuseumDetail>(`/museums/${encodeURIComponent(wikidataId)}`, { auth: false }),
    enabled: wikidataId.length > 0,
    retry: (n, err) => err.status !== 404 && n < 1,
  });

  if (isLoading) return <p className="py-10 text-ink-3">Loading…</p>;
  if (error?.status === 404) return <NotFound id={wikidataId} />;
  if (error || !data) return <p className="py-10 text-ink-3">Failed to load. Please retry.</p>;

  return (
    <div className="pt-5">
      <BackLink />

      <section className="pt-8">
        <div className="grid gap-10" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
          <div>
            <div className="eyebrow mb-3.5">Museum · {data.country ?? '—'}</div>
            <h1 className="display m-0" style={{ fontSize: 'clamp(48px, 6.4vw, 88px)' }}>
              <span style={{ fontStyle: 'italic' }}>{data.name}</span>
            </h1>
            <div className="font-display mt-3.5 text-xl text-ink-2">
              {data.city}
              {data.country && `, ${data.country}`}
            </div>
            {data.latitude != null && data.longitude != null && (
              <div className="mt-4 font-mono text-xs text-ink-3">
                {data.latitude.toFixed(4)}° {data.latitude >= 0 ? 'N' : 'S'} ·{' '}
                {Math.abs(data.longitude).toFixed(4)}° {data.longitude >= 0 ? 'E' : 'W'}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/map')}
                className="btn btn-primary"
              >
                <Icon.map /> Open in map
              </button>
              {data.website && (
                <a
                  href={data.website}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                >
                  <Icon.external /> Museum website
                </a>
              )}
            </div>
          </div>

          {/* Mini map (non-interactive) */}
          <div
            className="relative overflow-hidden rounded-md bg-bg-2 shadow-card"
            style={{ height: 320 }}
          >
            {data.latitude != null && data.longitude != null && (
              <Map
                initialViewState={{
                  longitude: data.longitude,
                  latitude: data.latitude,
                  zoom: 13,
                }}
                mapStyle={MINI_MAP_STYLE}
                interactive={false}
                attributionControl={false}
                style={{ width: '100%', height: '100%' }}
              >
                <Marker
                  longitude={data.longitude}
                  latitude={data.latitude}
                  anchor="center"
                >
                  <div
                    className="rounded-full border-[3px] border-bg bg-accent"
                    style={{
                      width: 18,
                      height: 18,
                      boxShadow: '0 0 0 2px var(--map-accent-ring, #0d3ae4)',
                    }}
                  />
                </Marker>
              </Map>
            )}
          </div>
        </div>
      </section>

      <section className="pb-15 pt-10">
        <SectionHeader
          eyebrow="In the collection"
          title={`${data.artworks.length} ${data.artworks.length === 1 ? 'work' : 'works'} to seek out`}
        />
        {data.artworks.length === 0 ? (
          <p className="mt-7 text-ink-3">No artworks catalogued here yet.</p>
        ) : (
          <ul className="mt-7 grid grid-cols-4 gap-6">
            {data.artworks.map((w) => (
              <ArtworkCard key={w.id} artwork={w} showMuseum={false} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function NotFound({ id }: { id: string }) {
  return (
    <div className="space-y-2 py-10">
      <h1 className="display text-2xl">Museum not found</h1>
      <p className="text-ink-2">No museum matches "{id}".</p>
      <Link to="/" className="link-quiet text-sm">
        ← Back to home
      </Link>
    </div>
  );
}
