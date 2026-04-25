import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/api';
import { Icon } from '@/components/Icon';
import { useDebounced } from '@/features/search/useDebounced';
import type { SearchResults } from '@/features/search/types';

const DEBOUNCE_MS = 200;
const PER_TYPE = 4;

type Props = {
  /** Compact (header) sizing vs full (hero) sizing. Defaults to full. */
  compact?: boolean;
  /** Auto-focus the input on mount (used on the dedicated search results page). */
  autoFocus?: boolean;
  /** Initial query value (also used on the search results page). */
  initialQuery?: string;
};

/** Pill-shaped search input with a live-results dropdown.
 *
 * Submitting (Enter or "See N results →") navigates to `/search?q=...`.
 * Clicking a result row navigates straight to the relevant detail page. */
export function SearchBar({ compact = false, autoFocus = false, initialQuery = '' }: Props) {
  const [q, setQ] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const debounced = useDebounced(q.trim(), DEBOUNCE_MS);

  const search = useQuery({
    queryKey: ['search', 'live', debounced, PER_TYPE],
    queryFn: () =>
      request<SearchResults>(
        `/search?q=${encodeURIComponent(debounced)}&limit_per_type=${PER_TYPE}`,
        { auth: false },
      ),
    enabled: debounced.length > 0,
  });

  // Sync external initial query changes (e.g. when navigating to /search?q=...).
  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  // Outside-click closes the dropdown.
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const closeAndNav = (path: string) => {
    setOpen(false);
    setQ('');
    navigate(path);
  };

  const data = search.data;
  const total = data ? data.artists.length + data.artworks.length + data.museums.length : 0;

  const sizeClasses = compact
    ? 'h-[38px] pl-[38px] pr-4 text-[13px]'
    : 'h-[56px] pl-[52px] pr-6 text-[16px]';
  const iconLeft = compact ? 'left-[14px]' : 'left-[22px]';

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={submit} className="relative">
        <span
          className={[
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-3',
            iconLeft,
          ].join(' ')}
        >
          <Icon.search />
        </span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={
            compact ? 'Search artworks, artists, museums…' : 'Search a painting, an artist, or a museum'
          }
          className={['input rounded-full', sizeClasses].join(' ')}
          aria-label="Search"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
            aria-label="Clear search"
          >
            <Icon.close />
          </button>
        )}
      </form>

      {open && debounced && data && (
        <div
          className="card absolute left-0 right-0 z-50 max-h-[480px] overflow-auto p-2 shadow-lift"
          style={{ top: 'calc(100% + 8px)' }}
        >
          {total === 0 && (
            <div className="px-5 py-5 text-[13px] text-ink-3">No matches for "{debounced}".</div>
          )}

          {data.artworks.length > 0 && (
            <Group title="Artworks" count={data.artworks.length}>
              {data.artworks.map((w) => (
                <Row
                  key={w.id}
                  onClick={() => closeAndNav(`/artworks/${w.slug}`)}
                  thumb={
                    <div className="img-wrap h-11 w-9 flex-none rounded-sm">
                      <img
                        src={w.image_url ?? ''}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                        }}
                      />
                    </div>
                  }
                  primary={
                    <span className="font-display text-sm text-ink">{w.title}</span>
                  }
                  secondary={`${w.artist.name} · ${w.year ?? '—'}`}
                  trailing={w.museum?.city ?? undefined}
                />
              ))}
            </Group>
          )}

          {data.artists.length > 0 && (
            <Group title="Artists" count={data.artists.length}>
              {data.artists.map((a) => (
                <Row
                  key={a.id}
                  onClick={() => closeAndNav(`/artists/${a.slug}`)}
                  thumb={
                    <div className="font-display flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-soft text-base text-accent-deep">
                      {(a.name.split(' ').slice(-1)[0]?.[0] ?? '?').toUpperCase()}
                    </div>
                  }
                  primary={<span className="text-sm text-ink">{a.name}</span>}
                  secondary={`${a.birth_year ?? '?'}–${a.death_year ?? 'present'}${
                    a.movement ? ` · ${a.movement}` : ''
                  }`}
                />
              ))}
            </Group>
          )}

          {data.museums.length > 0 && (
            <Group title="Museums" count={data.museums.length}>
              {data.museums.map((m) => (
                <Row
                  key={m.id}
                  onClick={() => closeAndNav(`/museums/${m.wikidata_id}`)}
                  thumb={
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-bg-2 text-ink-2">
                      <Icon.pin />
                    </div>
                  }
                  primary={<span className="text-sm text-ink">{m.name}</span>}
                  secondary={[m.city, m.country].filter(Boolean).join(', ')}
                />
              ))}
            </Group>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between border-t border-line-2 px-3 py-2.5">
              <span className="eyebrow text-[10px]">↩ All results</span>
              <button
                type="button"
                onClick={() => submit()}
                className="text-xs font-medium text-accent-deep hover:underline"
              >
                See {total} result{total === 1 ? '' : 's'} →
              </button>
            </div>
          )}
        </div>
      )}

      {open && debounced && search.isFetching && !data && (
        <div
          className="card absolute left-0 right-0 z-50 px-5 py-5 text-[13px] text-ink-3 shadow-lift"
          style={{ top: 'calc(100% + 8px)' }}
        >
          Searching…
        </div>
      )}

      {/* Help discovery: jump to the dedicated results page even without typing. */}
      {!compact && total > 0 && open && (
        <Link to="/search" hidden aria-hidden>
          {/* keyboard-only fallback */}
        </Link>
      )}
    </div>
  );
}

function Group({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="px-1 pb-1 pt-1.5">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="eyebrow text-[10px]">{title}</span>
        <span className="text-[11px] text-ink-3">{count}</span>
      </div>
      {children}
    </div>
  );
}

function Row({
  onClick,
  thumb,
  primary,
  secondary,
  trailing,
}: {
  onClick: () => void;
  thumb: React.ReactNode;
  primary: React.ReactNode;
  secondary: string;
  trailing?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md border-0 bg-transparent px-2.5 py-2 text-left hover:bg-bg-2"
    >
      {thumb}
      <div className="min-w-0 flex-1">
        <div className="truncate">{primary}</div>
        <div className="truncate text-xs text-ink-3">{secondary}</div>
      </div>
      {trailing && (
        <div className="text-[11px] uppercase tracking-[0.06em] text-ink-3">{trailing}</div>
      )}
    </button>
  );
}
