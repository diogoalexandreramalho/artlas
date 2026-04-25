import type { Artist, Artwork } from '@/features/search/types';

/** Response from `GET /artists/{slug}`. */
export type ArtistDetail = Artist & {
  artworks: Artwork[];
};
