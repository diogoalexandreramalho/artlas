import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { ApiError, request } from '@/lib/api';
import type { Artwork } from '@/features/search/types';

export function ArtworkDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = useQuery<Artwork, ApiError>({
    queryKey: ['artwork', slug],
    queryFn: () => request<Artwork>(`/artworks/${encodeURIComponent(slug)}`, { auth: false }),
    enabled: slug.length > 0,
    retry: (count, err) => err.status !== 404 && count < 1,
  });

  if (isLoading) return <p className="text-stone-500">Loading…</p>;
  if (error?.status === 404) return <NotFound kind="Artwork" slug={slug} />;
  if (error || !data) return <p className="text-stone-500">Failed to load. Please retry.</p>;

  return (
    <article className="grid gap-6 lg:grid-cols-2">
      <Hero src={data.image_url} alt={data.title} />
      <div className="space-y-4">
        <header>
          <h1 className="text-3xl font-semibold leading-tight">{data.title}</h1>
          <p className="mt-1 text-stone-600">
            <Link
              to={`/artists/${data.artist.slug}`}
              className="font-medium underline-offset-2 hover:underline"
            >
              {data.artist.name}
            </Link>
            {data.year && <> &middot; {data.year}</>}
          </p>
        </header>

        <dl className="space-y-2 text-sm">
          <Field label="Kind">{capitalize(data.kind)}</Field>
          {data.museum && (
            <Field label="Held at">
              <Link
                to={`/museums/${data.museum.wikidata_id}`}
                className="underline-offset-2 hover:underline"
              >
                {data.museum.name}
              </Link>
              {data.museum.city && <span className="text-stone-500">, {data.museum.city}</span>}
              {data.museum.country && (
                <span className="text-stone-500">, {data.museum.country}</span>
              )}
            </Field>
          )}
          <Field label="Wikidata">
            <a
              href={`https://www.wikidata.org/wiki/${data.wikidata_id}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-stone-500 underline-offset-2 hover:underline"
            >
              {data.wikidata_id}
            </a>
          </Field>
        </dl>
      </div>
    </article>
  );
}

function Hero({ src, alt }: { src: string | null; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="flex aspect-square items-center justify-center rounded border border-dashed border-stone-300 bg-stone-50 text-sm text-stone-400">
        No image available
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className="w-full rounded border border-stone-200 bg-stone-50 object-contain"
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 flex-none text-stone-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function NotFound({ kind, slug }: { kind: string; slug: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">{kind} not found</h1>
      <p className="text-stone-600">
        No {kind.toLowerCase()} matches "{slug}".
      </p>
      <Link to="/" className="text-sm underline-offset-2 hover:underline">
        ← Back to search
      </Link>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
