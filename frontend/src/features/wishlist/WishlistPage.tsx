import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError, request } from '@/lib/api';
import type { WishlistItem } from '@/features/wishlist/types';

export function WishlistPage() {
  const { data, isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: () => request<WishlistItem[]>('/wishlist'),
  });

  if (isLoading) return <p className="text-stone-500">Loading wishlist…</p>;

  if (!data || data.length === 0) {
    return (
      <div className="space-y-2 text-stone-600">
        <p>Your wishlist is empty.</p>
        <p className="text-sm text-stone-500">
          Find artworks via{' '}
          <Link to="/" className="underline-offset-2 hover:underline">
            search
          </Link>{' '}
          or the{' '}
          <Link to="/map" className="underline-offset-2 hover:underline">
            map
          </Link>
          , then "Save to wishlist" to plan a trip.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">
        {data.length} artwork{data.length === 1 ? '' : 's'} saved
      </p>
      <ul className="space-y-3">
        {data.map((item) => (
          <WishlistRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function WishlistRow({ item }: { item: WishlistItem }) {
  const queryClient = useQueryClient();

  const remove = useMutation<void, ApiError, void, { previous?: WishlistItem[] }>({
    mutationFn: () =>
      request<void>(`/wishlist/${item.artwork.id}`, { method: 'DELETE' }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previous = queryClient.getQueryData<WishlistItem[]>(['wishlist']);
      queryClient.setQueryData<WishlistItem[]>(['wishlist'], (curr) =>
        (curr ?? []).filter((it) => it.id !== item.id),
      );
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
    <li className="relative">
      <Link
        to={`/artworks/${item.artwork.slug}`}
        className="block rounded border border-stone-200 bg-white p-4 pr-12 shadow-sm transition hover:border-stone-400 hover:shadow"
      >
        <div className="flex gap-3">
          <Thumb src={item.artwork.image_url} alt={item.artwork.title} />
          <div className="min-w-0">
            <h3 className="truncate font-medium">{item.artwork.title}</h3>
            <p className="truncate text-sm text-stone-600">
              {item.artwork.artist.name}
              {item.artwork.year && ` · ${item.artwork.year}`}
            </p>
            {item.artwork.museum && (
              <p className="mt-1 truncate text-xs text-stone-500">
                {item.artwork.museum.name}
                {item.artwork.museum.city && `, ${item.artwork.museum.city}`}
              </p>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => remove.mutate()}
        disabled={remove.isPending}
        aria-label={`Remove ${item.artwork.title} from wishlist`}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50"
      >
        ×
      </button>
    </li>
  );
}

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return <div className="h-16 w-16 flex-none rounded bg-stone-100" aria-hidden="true" />;
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
      className="h-16 w-16 flex-none rounded object-cover"
    />
  );
}
