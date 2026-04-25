import { useCallback, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Map, {
  Marker,
  NavigationControl,
  Popup,
} from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';

import { request } from '@/lib/api';
import type {
  MapFilters,
  MapMuseumResult,
  MapResponse,
} from '@/features/map/types';

const OSM_STYLE = {
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

const INITIAL_VIEW = { longitude: 10, latitude: 30, zoom: 2 };

type FilterKey = 'q' | 'city' | 'country' | 'movement';
const FILTER_KEYS: FilterKey[] = ['q', 'city', 'country', 'movement'];

export function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mapRef = useRef<MapRef>(null);
  const [bbox, setBbox] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Read filters from the URL (?q=…&city=…&country=…&movement=…).
  const filters = useMemo(
    () =>
      Object.fromEntries(FILTER_KEYS.map((k) => [k, searchParams.get(k) ?? ''])) as Record<
        FilterKey,
        string
      >,
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

  const filterOptions = useQuery({
    queryKey: ['map', 'filters'],
    queryFn: () => request<MapFilters>('/map/filters', { auth: false }),
  });

  // Compute bbox from the map's current viewport.
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
    placeholderData: (prev) => prev, // keep previous data while panning
  });

  const museums = mapData.data?.museums ?? [];
  const selectedMuseum = museums.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="space-y-3">
      <FilterBar
        filters={filters}
        options={filterOptions.data}
        onChange={setFilter}
      />

      <div className="relative h-[70vh] overflow-hidden rounded border border-stone-200">
        <Map
          ref={mapRef}
          initialViewState={INITIAL_VIEW}
          mapStyle={OSM_STYLE}
          style={{ width: '100%', height: '100%' }}
          onLoad={updateBbox}
          onMoveEnd={updateBbox}
        >
          <NavigationControl position="top-right" />

          {museums.map((m) =>
            m.latitude == null || m.longitude == null ? null : (
              <Marker
                key={m.id}
                longitude={m.longitude}
                latitude={m.latitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedId(m.id);
                }}
              >
                <MarkerPin count={m.artworks.length} />
              </Marker>
            ),
          )}

          {selectedMuseum &&
            selectedMuseum.latitude != null &&
            selectedMuseum.longitude != null && (
              <Popup
                longitude={selectedMuseum.longitude}
                latitude={selectedMuseum.latitude}
                anchor="bottom"
                offset={28}
                onClose={() => setSelectedId(null)}
                closeOnClick={false}
                maxWidth="320px"
              >
                <MuseumPopupBody museum={selectedMuseum} />
              </Popup>
            )}
        </Map>

        <StatusOverlay
          loading={mapData.isLoading || mapData.isFetching}
          empty={!mapData.isLoading && museums.length === 0}
        />
      </div>
    </div>
  );
}

function FilterBar({
  filters,
  options,
  onChange,
}: {
  filters: Record<FilterKey, string>;
  options: MapFilters | undefined;
  onChange: (key: FilterKey, value: string) => void;
}) {
  const onInput = (k: FilterKey) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange(k, e.target.value);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        value={filters.q}
        onChange={onInput('q')}
        placeholder="Search artists or artworks…"
        className="min-w-0 flex-1 rounded border border-stone-300 px-3 py-2"
        aria-label="Search"
      />
      <Select
        value={filters.city}
        onChange={onInput('city')}
        options={options?.cities ?? []}
        label="city"
      />
      <Select
        value={filters.country}
        onChange={onInput('country')}
        options={options?.countries ?? []}
        label="country"
      />
      <Select
        value={filters.movement}
        onChange={onInput('movement')}
        options={options?.movements ?? []}
        label="movement"
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      aria-label={label}
      className="rounded border border-stone-300 bg-white px-2 py-2 text-sm"
    >
      <option value="">All {label}s</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function MarkerPin({ count }: { count: number }) {
  return (
    <div
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-stone-900 text-xs font-semibold text-white shadow-md transition hover:bg-stone-700"
      title={`${count} artwork${count === 1 ? '' : 's'}`}
    >
      {count}
    </div>
  );
}

function MuseumPopupBody({ museum }: { museum: MapMuseumResult }) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-base font-semibold leading-tight">{museum.name}</h3>
        <p className="text-xs text-stone-500">
          {[museum.city, museum.country].filter(Boolean).join(', ')}
        </p>
      </div>
      <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {museum.artworks.map((a) => (
          <li key={a.id}>
            <Link
              to={`/artworks/${a.slug}`}
              className="flex gap-2 rounded p-1 hover:bg-stone-100"
            >
              <Thumb src={a.image_url} alt={a.title} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-tight">{a.title}</p>
                <p className="truncate text-xs text-stone-600">
                  {a.artist_name}
                  {a.year && ` · ${a.year}`}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return <div className="h-12 w-12 flex-none rounded bg-stone-100" aria-hidden="true" />;
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
      className="h-12 w-12 flex-none rounded object-cover"
    />
  );
}

function StatusOverlay({ loading, empty }: { loading: boolean; empty: boolean }) {
  if (!loading && !empty) return null;
  return (
    <div className="pointer-events-none absolute left-3 top-3 rounded bg-white/90 px-3 py-1 text-xs text-stone-700 shadow">
      {loading ? 'Loading…' : 'No museums match these filters in this view.'}
    </div>
  );
}
