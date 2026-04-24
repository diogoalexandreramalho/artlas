import Map, { NavigationControl } from 'react-map-gl/maplibre';

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

export function MapPage() {
  return (
    <div className="h-[70vh] overflow-hidden rounded border border-stone-200">
      <Map
        initialViewState={{ longitude: 2.35, latitude: 48.86, zoom: 4 }}
        mapStyle={OSM_STYLE}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
      </Map>
    </div>
  );
}
