import type { Artwork, Museum } from '@/features/search/types';

/** Response from `GET /museums/{wikidata_id}` (PR #11). */
export type MuseumDetail = Museum & {
  artworks: Artwork[];
};
