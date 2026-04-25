import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/api';
import { Bucket } from '@/components/sections';
import { Icon } from '@/components/Icon';
import { ArtworkCard } from '@/features/artwork/ArtworkCard';
import { SearchBar } from '@/features/search/SearchBar';
import type { SearchResults } from '@/features/search/types';

const PER_TYPE = 20;

/** Dedicated `/search?q=...` page. The SearchBar at top mirrors the home hero
 *  and updates the URL on submit. */
export function SearchResultsPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';

  const search = useQuery<SearchResults>({
    queryKey: ['search', 'page', q, PER_TYPE],
    queryFn: () =>
      request<SearchResults>(
        `/search?q=${encodeURIComponent(q)}&limit_per_type=${PER_TYPE}`,
        { auth: false },
      ),
    enabled: q.length > 0,
  });

  const data = search.data;
  const total = data ? data.artworks.length + data.artists.length + data.museums.length : 0;

  return (
    <div className="pb-15 pt-8">
      <div className="max-w-[820px]">
        <SearchBar autoFocus initialQuery={q} />
      </div>

      <div className="mt-6 flex items-baseline gap-3 border-b border-line pb-3">
        <h1 className="display m-0 text-[36px]">
          {q.length === 0
            ? 'Type to search'
            : search.isLoading
              ? 'Searching…'
              : total > 0
                ? `${total} result${total === 1 ? '' : 's'}`
                : 'No matches'}
          {q && q.length > 0 && (
            <span className="text-ink-3"> for "{q}"</span>
          )}
        </h1>
      </div>

      {q && data && total === 0 && (
        <div className="py-15 text-center text-ink-2">
          <p className="font-display text-[22px]">We couldn't find that one.</p>
          <p className="mt-2 text-sm text-ink-3">Try an artist's last name, a movement, or a city.</p>
        </div>
      )}

      {data && data.artworks.length > 0 && (
        <Bucket title="Artworks" count={data.artworks.length}>
          <ul
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
          >
            {data.artworks.map((w) => (
              <ArtworkCard key={w.id} artwork={w} />
            ))}
          </ul>
        </Bucket>
      )}

      {data && data.artists.length > 0 && (
        <Bucket title="Artists" count={data.artists.length}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.artists.map((a) => (
              <Link
                key={a.id}
                to={`/artists/${a.slug}`}
                className="card flex gap-4 p-5 transition hover:shadow-lift"
              >
                <div className="font-display flex h-14 w-14 flex-none items-center justify-center rounded-full bg-accent-soft text-2xl text-accent-deep">
                  {(a.name.split(' ').slice(-1)[0]?.[0] ?? '?').toUpperCase()}
                </div>
                <div>
                  <div className="font-display text-xl">{a.name}</div>
                  <div className="mt-0.5 text-xs text-ink-3">
                    {a.birth_year ?? '?'}–{a.death_year ?? 'present'}
                    {a.nationality && ` · ${a.nationality}`}
                  </div>
                  {a.movement && (
                    <div className="mt-2 text-xs text-ink-2">{a.movement}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Bucket>
      )}

      {data && data.museums.length > 0 && (
        <Bucket title="Museums" count={data.museums.length}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.museums.map((m) => (
              <Link
                key={m.id}
                to={`/museums/${m.wikidata_id}`}
                className="card flex items-center gap-4 p-5 transition hover:shadow-lift"
              >
                <div className="flex h-14 w-14 flex-none items-center justify-center rounded-md bg-bg-2 text-ink-2">
                  <Icon.pin />
                </div>
                <div className="flex-1">
                  <div className="font-display text-xl">{m.name}</div>
                  <div className="mt-0.5 text-xs text-ink-3">
                    {m.city}, {m.country}
                  </div>
                </div>
                <Icon.arrow />
              </Link>
            ))}
          </div>
        </Bucket>
      )}
    </div>
  );
}
