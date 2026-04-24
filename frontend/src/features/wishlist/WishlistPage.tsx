import { useQuery } from '@tanstack/react-query';
import { request } from '@/lib/api';
import type { Artwork } from '@/features/search/types';

type WishlistItem = {
  id: number;
  artwork: Artwork;
  notes: string | null;
};

export function WishlistPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => request<WishlistItem[]>('/wishlist'),
  });

  if (isLoading) return <p className="text-stone-500">Loading wishlist…</p>;
  if (!data || data.length === 0) {
    return (
      <div className="text-stone-600">
        Your wishlist is empty. Add artworks from search to plan a trip.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((item) => (
        <li key={item.id} className="rounded border border-stone-200 bg-white p-4">
          <h3 className="font-medium">{item.artwork.title}</h3>
          <p className="text-sm text-stone-600">{item.artwork.artist.name}</p>
          {item.notes && <p className="mt-1 text-sm italic text-stone-500">{item.notes}</p>}
        </li>
      ))}
    </ul>
  );
}
