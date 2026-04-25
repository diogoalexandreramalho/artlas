import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { ApiError, request } from '@/lib/api';
import { ArtworkCard } from '@/features/artwork/ArtworkCard';
import type { ArtistDetail } from '@/features/artist/types';

export function ArtistDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = useQuery<ArtistDetail, ApiError>({
    queryKey: ['artist', slug],
    queryFn: () =>
      request<ArtistDetail>(`/artists/${encodeURIComponent(slug)}`, { auth: false }),
    enabled: slug.length > 0,
    retry: (count, err) => err.status !== 404 && count < 1,
  });

  if (isLoading) return <p className="text-stone-500">Loading…</p>;
  if (error?.status === 404) return <NotFound slug={slug} />;
  if (error || !data) return <p className="text-stone-500">Failed to load. Please retry.</p>;

  const lifeSpan =
    data.birth_year || data.death_year
      ? `${data.birth_year ?? '?'}–${data.death_year ?? 'present'}`
      : null;
  const meta = [data.nationality, data.movement, lifeSpan].filter(Boolean).join(' · ');

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold leading-tight">{data.name}</h1>
        {meta && <p className="text-stone-600">{meta}</p>}
        <a
          href={`https://www.wikidata.org/wiki/${data.wikidata_id}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-stone-400 underline-offset-2 hover:underline"
        >
          {data.wikidata_id}
        </a>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Artworks
        </h2>
        {data.artworks.length === 0 ? (
          <p className="text-stone-500">No artworks indexed yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.artworks.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function NotFound({ slug }: { slug: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Artist not found</h1>
      <p className="text-stone-600">No artist matches "{slug}".</p>
      <Link to="/" className="text-sm underline-offset-2 hover:underline">
        ← Back to search
      </Link>
    </div>
  );
}
