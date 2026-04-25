import type { Artwork } from '@/features/search/types';

export type WishlistItem = {
  id: number;
  artwork: Artwork;
  notes: string | null;
};
