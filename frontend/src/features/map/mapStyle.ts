import type { StyleSpecification } from 'maplibre-gl';

/** Editorial country-fill MapLibre style.
 *
 * No raster tiles — just the natural-earth countries GeoJSON painted in our
 * design palette. Cream "water" + warm sand "land" + the design's hairline
 * borders. ~30 lines instead of OSM's whole tile pipeline. */
export const COUNTRY_FILL_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    countries: {
      type: 'geojson',
      data: 'https://cdn.jsdelivr.net/gh/martynafford/natural-earth-geojson@master/110m/cultural/ne_110m_admin_0_countries.json',
    },
  },
  layers: [
    {
      id: 'water',
      type: 'background',
      paint: { 'background-color': '#fbf8f1' /* surface */ },
    },
    {
      id: 'countries-fill',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': '#f3eee3' /* bg */,
        'fill-outline-color': 'rgba(26, 23, 20, 0.14)' /* line */,
      },
    },
    {
      id: 'countries-line',
      type: 'line',
      source: 'countries',
      paint: {
        'line-color': 'rgba(26, 23, 20, 0.14)' /* line */,
        'line-width': 0.6,
      },
    },
  ],
};
