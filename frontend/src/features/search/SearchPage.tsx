import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from '@/lib/api';
import { ArtworkCard } from '@/features/artwork/ArtworkCard';
import type { Artist, Artwork, Museum, Page, SearchResults } from '@/features/search/types';
import { useDebounced } from '@/features/search/useDebounced';

const DEBOUNCE_MS = 250;
const DEFAULT_LIMIT = 12;

export function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query.trim(), DEBOUNCE_MS);
  const isSearching = debouncedQuery.length > 0;

  const search = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () =>
      request<SearchResults>(`/search?q=${encodeURIComponent(debouncedQuery)}`, { auth: false }),
    enabled: isSearching,
  });

  const browse = useQuery({
    queryKey: ['artworks', 'browse', DEFAULT_LIMIT],
    queryFn: () =>
      request<Page<Artwork>>(`/artworks?limit=${DEFAULT_LIMIT}`, { auth: false }),
    enabled: !isSearching,
  });

  return (
    <div className="space-y-6">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search artists, artworks, museums…"
        className="w-full rounded border border-stone-300 px-3 py-2"
        aria-label="Search"
      />

      {isSearching ? (
        <SearchView results={search.data} isFetching={search.isFetching} query={debouncedQuery} />
      ) : (
        <BrowseView artworks={browse.data?.items ?? []} isFetching={browse.isFetching} />
      )}
    </div>
  );
}

function SearchView({
  results,
  isFetching,
  query,
}: {
  results: SearchResults | undefined;
  isFetching: boolean;
  query: string;
}) {
  if (isFetching && !results) {
    return <p className="text-stone-500">Searching…</p>;
  }
  if (!results) return null;

  const empty =
    results.artists.length === 0 &&
    results.artworks.length === 0 &&
    results.museums.length === 0;

  if (empty) {
    return <p className="text-stone-500">No results for "{query}".</p>;
  }

  return (
    <div className="space-y-8">
      {results.artists.length > 0 && (
        <Section title="Artists">
          <Grid>
            {results.artists.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </Grid>
        </Section>
      )}
      {results.artworks.length > 0 && (
        <Section title="Artworks">
          <Grid>
            {results.artworks.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </Grid>
        </Section>
      )}
      {results.museums.length > 0 && (
        <Section title="Museums">
          <Grid>
            {results.museums.map((m) => (
              <MuseumCard key={m.id} museum={m} />
            ))}
          </Grid>
        </Section>
      )}
    </div>
  );
}

function BrowseView({ artworks, isFetching }: { artworks: Artwork[]; isFetching: boolean }) {
  if (isFetching && artworks.length === 0) {
    return <p className="text-stone-500">Loading…</p>;
  }
  return (
    <Section title="Browse the classics">
      <Grid>
        {artworks.map((a) => (
          <ArtworkCard key={a.id} artwork={a} />
        ))}
      </Grid>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
  );
}

const cardClass =
  'block rounded border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-400 hover:shadow';

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <li>
      <Link to={`/artists/${artist.slug}`} className={cardClass}>
        <h3 className="font-medium">{artist.name}</h3>
        <p className="text-sm text-stone-600">
          {[artist.nationality, artist.movement].filter(Boolean).join(' · ') || '—'}
        </p>
        {(artist.birth_year || artist.death_year) && (
          <p className="mt-1 text-xs text-stone-500">
            {artist.birth_year ?? '?'}–{artist.death_year ?? 'present'}
          </p>
        )}
      </Link>
    </li>
  );
}

function MuseumCard({ museum }: { museum: Museum }) {
  return (
    <li>
      <Link to={`/museums/${museum.wikidata_id}`} className={cardClass}>
        <h3 className="font-medium">{museum.name}</h3>
        <p className="text-sm text-stone-600">
          {[museum.city, museum.country].filter(Boolean).join(', ') || '—'}
        </p>
      </Link>
    </li>
  );
}
