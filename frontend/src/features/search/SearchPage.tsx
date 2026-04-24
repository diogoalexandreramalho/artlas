import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { request } from '@/lib/api';
import type { SearchResults } from '@/features/search/types';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data, isFetching } = useQuery({
    queryKey: ['search', submitted],
    queryFn: () =>
      request<SearchResults>(`/search?q=${encodeURIComponent(submitted)}`, { auth: false }),
    enabled: submitted.length > 0,
  });

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists, artworks, cities…"
          className="flex-1 rounded border border-stone-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-stone-900 px-4 py-2 text-white hover:bg-stone-700"
        >
          Search
        </button>
      </form>

      {isFetching && <p className="text-stone-500">Searching…</p>}

      {data && (
        <div>
          <p className="mb-3 text-sm text-stone-600">{data.total} results for "{data.query}"</p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.results.map((a) => (
              <li
                key={a.id}
                className="rounded border border-stone-200 bg-white p-4 shadow-sm"
              >
                <h3 className="font-medium">{a.title}</h3>
                <p className="text-sm text-stone-600">
                  {a.artist.name}
                  {a.year && ` · ${a.year}`}
                </p>
                {a.museum && (
                  <p className="mt-1 text-xs text-stone-500">
                    {a.museum.name}, {a.museum.city}
                  </p>
                )}
              </li>
            ))}
          </ul>
          {data.total === 0 && (
            <p className="text-stone-500">
              No results yet — data pipeline has not been populated. This is expected in the
              initial scaffold.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
