import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';

import { ApiError, request } from '@/lib/api';
import { Icon } from '@/components/Icon';
import { SmartImg } from '@/components/SmartImg';
import { useAuth } from '@/features/auth/AuthContext';
import { COUNTRY_FILL_STYLE } from '@/features/map/mapStyle';
import type {
  MapArtwork,
  MapFilters,
  MapMuseumResult,
  MapResponse,
} from '@/features/map/types';
import type { WishlistItem } from '@/features/wishlist/types';

const INITIAL_VIEW = { longitude: 10, latitude: 45, zoom: 3.2 };
const FILTER_KEYS = ['q', 'city', 'country', 'movement'] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

export function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mapRef = useRef<MapRef>(null);
  const [bbox, setBbox] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filters = useMemo(
    () =>
      Object.fromEntries(
        FILTER_KEYS.map((k) => [k, searchParams.get(k) ?? '']),
      ) as Record<FilterKey, string>,
    [searchParams],
  );

  const setFilter = useCallback(
    (key: FilterKey, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const filterOptions = useQuery({
    queryKey: ['map', 'filters'],
    queryFn: () => request<MapFilters>('/map/filters', { auth: false }),
  });

  // Bbox is computed from the map's current viewport on load + after every pan/zoom.
  const updateBbox = useCallback(() => {
    const m = mapRef.current?.getMap();
    if (!m) return;
    const b = m.getBounds();
    setBbox(`${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`);
  }, []);

  const mapData = useQuery({
    queryKey: ['map', 'artworks', bbox, filters],
    queryFn: () => {
      const params = new URLSearchParams({ bbox: bbox! });
      for (const k of FILTER_KEYS) if (filters[k]) params.set(k, filters[k]);
      return request<MapResponse>(`/map/artworks?${params}`, { auth: false });
    },
    enabled: !!bbox,
    placeholderData: (prev) => prev,
  });

  const museums = mapData.data?.museums ?? [];
  const totalMuseums = useQuery({
    queryKey: ['map', 'totalCount'],
    queryFn: () =>
      request<MapResponse>(`/map/artworks?bbox=-180,-90,180,90`, { auth: false }).then(
        (r) => r.museums.length,
      ),
  });
  const total = totalMuseums.data ?? 0;

  const selected = museums.find((m) => m.id === selectedId) ?? null;

  // flyTo when a marker is selected.
  useEffect(() => {
    if (!selected) return;
    const m = mapRef.current?.getMap();
    if (!m || selected.latitude == null || selected.longitude == null) return;
    m.flyTo({ center: [selected.longitude, selected.latitude], zoom: 11, duration: 900 });
  }, [selected]);

  return (
    <div className="relative" style={{ height: 'calc(100vh - 73px)' }}>
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapStyle={COUNTRY_FILL_STYLE}
        attributionControl={false}
        style={{ position: 'absolute', inset: 0 }}
        onLoad={updateBbox}
        onMoveEnd={updateBbox}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {museums.map((m) =>
          m.latitude == null || m.longitude == null ? null : (
            <Marker
              key={m.id}
              longitude={m.longitude}
              latitude={m.latitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedId(m.id);
              }}
            >
              <PillMarker count={m.artworks.length} city={m.city ?? ''} />
            </Marker>
          ),
        )}
      </Map>

      <FilterRail
        filters={filters}
        options={filterOptions.data}
        shown={museums.length}
        onChange={setFilter}
        onReset={resetFilters}
      />

      {selected && (
        <SelectedMuseumPanel museum={selected} onClose={() => setSelectedId(null)} />
      )}

      <CounterPill shown={museums.length} total={total} />
    </div>
  );
}

// ── Pill marker ────────────────────────────────────────────

function PillMarker({ count, city }: { count: number; city: string }) {
  return (
    <div
      className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3 text-xs text-ink shadow-card transition hover:scale-105 hover:shadow-lift"
      title={`${count} ${count === 1 ? 'work' : 'works'} in ${city}`}
    >
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
        {count}
      </span>
      <span className="whitespace-nowrap font-medium">{city}</span>
    </div>
  );
}

// ── Filter rail ────────────────────────────────────────────

function FilterRail({
  filters,
  options,
  shown,
  onChange,
  onReset,
}: {
  filters: Record<FilterKey, string>;
  options: MapFilters | undefined;
  shown: number;
  onChange: (k: FilterKey, v: string) => void;
  onReset: () => void;
}) {
  const handle = (k: FilterKey) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange(k, e.target.value);

  return (
    <div className="card absolute left-5 top-5 z-10 w-80 p-4 shadow-lift">
      <div className="eyebrow mb-3">Find a museum</div>
      <input
        className="input mb-3"
        placeholder="Search artwork, artist, or museum…"
        value={filters.q}
        onChange={handle('q')}
      />
      <div className="grid grid-cols-2 gap-2.5">
        <FilterSelect
          label="City"
          value={filters.city}
          onChange={handle('city')}
          options={options?.cities ?? []}
        />
        <FilterSelect
          label="Country"
          value={filters.country}
          onChange={handle('country')}
          options={options?.countries ?? []}
        />
      </div>
      <FilterSelect
        label="Movement"
        value={filters.movement}
        onChange={handle('movement')}
        options={options?.movements ?? []}
      />
      <div className="mt-3.5 flex items-center justify-between border-t border-line-2 pt-3.5 text-xs text-ink-3">
        <span>
          {shown} {shown === 1 ? 'museum' : 'museums'} shown
        </span>
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer border-0 bg-transparent p-0 text-xs text-accent-deep hover:underline"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div className="mt-2">
      <label
        className="mb-1 block text-[10px] uppercase tracking-[0.08em] text-ink-3"
        htmlFor={`filter-${label}`}
      >
        {label}
      </label>
      <select
        id={`filter-${label}`}
        value={value}
        onChange={onChange}
        className="input"
        style={{ height: 32, fontSize: 12, padding: '0 8px' }}
      >
        <option value="">All {label.toLowerCase()}s</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Selected museum panel ───────────────────────────────────

function SelectedMuseumPanel({
  museum,
  onClose,
}: {
  museum: MapMuseumResult;
  onClose: () => void;
}) {
  return (
    <div
      className="card absolute bottom-5 right-5 top-5 z-10 flex w-96 flex-col overflow-hidden p-0 shadow-lift"
    >
      <div className="border-b border-line-2 p-6">
        <div className="flex items-start justify-between">
          <div className="eyebrow">{museum.country ?? '—'}</div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent p-0 text-ink-3 hover:text-ink"
            aria-label="Close panel"
          >
            <Icon.close />
          </button>
        </div>
        <h2 className="display m-0 mt-2 text-[28px]" style={{ fontStyle: 'italic' }}>
          {museum.name}
        </h2>
        {museum.city && <div className="mt-1 text-[13px] text-ink-2">{museum.city}</div>}
        <Link
          to={`/museums/${museum.wikidata_id}`}
          className="btn btn-ghost btn-sm mt-3.5 inline-flex"
        >
          See full museum page <Icon.arrow />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="eyebrow mb-3 px-2">
          {museum.artworks.length} {museum.artworks.length === 1 ? 'work' : 'works'} here
        </div>
        {museum.artworks.map((a) => (
          <ArtworkRow key={a.id} artwork={a} />
        ))}
      </div>
    </div>
  );
}

function ArtworkRow({ artwork }: { artwork: MapArtwork }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const wishlist = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: () => request<WishlistItem[]>('/wishlist'),
    enabled: !!user,
  });
  const isSaved = wishlist.data?.some((it) => it.artwork.id === artwork.id) ?? false;

  // Optimistic mirror of WishlistButton — the heart toggles inline without
  // navigating off the map. Logged-out users get a no-op (heart is hidden).
  const toggle = useMutation<void, ApiError, void, { previous?: WishlistItem[] }>({
    mutationFn: () =>
      isSaved
        ? request<void>(`/wishlist/${artwork.id}`, { method: 'DELETE' })
        : request<void>('/wishlist', {
            method: 'POST',
            body: { artwork_id: artwork.id },
          }).then(() => undefined),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previous = queryClient.getQueryData<WishlistItem[]>(['wishlist']);
      queryClient.setQueryData<WishlistItem[]>(['wishlist'], (curr) => {
        const list = curr ?? [];
        if (isSaved) return list.filter((it) => it.artwork.id !== artwork.id);
        // Optimistic insert: full Artwork shape isn't on hand here (MapArtwork
        // is slimmer), so fake just enough to render — refetch reconciles.
        return [
          {
            id: -1,
            artwork: {
              id: artwork.id,
              wikidata_id: '',
              title: artwork.title,
              slug: artwork.slug,
              year: artwork.year,
              kind: 'painting',
              image_url: artwork.image_url,
              artist: {
                id: 0,
                wikidata_id: '',
                name: artwork.artist_name,
                slug: artwork.artist_slug,
                birth_year: null,
                death_year: null,
                nationality: null,
                movement: null,
              },
              museum: null,
            },
            notes: null,
          },
          ...list,
        ];
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['wishlist'], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  return (
    <Link
      to={`/artworks/${artwork.slug}`}
      className="flex items-center gap-3 rounded-md p-2 transition hover:bg-bg-2"
    >
      <div className="img-wrap h-15 w-12 flex-none rounded-sm">
        <SmartImg src={artwork.image_url} alt={artwork.title} title={artwork.title} />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="font-display truncate text-[15px]"
          style={{ fontStyle: 'italic' }}
        >
          {artwork.title}
        </div>
        <div className="truncate text-[11px] text-ink-3">
          {artwork.artist_name}
          {artwork.year && ` · ${artwork.year}`}
        </div>
      </div>
      {user && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle.mutate();
          }}
          disabled={toggle.isPending}
          className={['heart-btn', isSaved && 'active'].filter(Boolean).join(' ')}
          style={{ width: 30, height: 30 }}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={isSaved}
        >
          <Icon.heart filled={isSaved} />
        </button>
      )}
    </Link>
  );
}

// ── Counter pill ─────────────────────────────────────────

function CounterPill({ shown, total }: { shown: number; total: number }) {
  return (
    <div className="absolute bottom-4 left-5 z-10 rounded-full bg-surface px-2.5 py-1 font-mono text-[11px] text-ink-3 shadow-card">
      {shown} of {total} institutions
    </div>
  );
}
