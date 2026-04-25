import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError, request } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import type { Artwork } from '@/features/search/types';
import type { WishlistItem } from '@/features/wishlist/types';

const BTN_BASE =
  'inline-flex items-center gap-2 rounded border px-3 py-2 text-sm font-medium transition disabled:opacity-50';
const BTN_ADD = `${BTN_BASE} border-stone-900 bg-stone-900 text-white hover:bg-stone-700`;
const BTN_REMOVE = `${BTN_BASE} border-stone-300 bg-white text-stone-900 hover:border-stone-400`;
const BTN_LINK = `${BTN_BASE} border-stone-300 bg-white text-stone-700 hover:border-stone-400`;

/** Toggle button for adding/removing the given artwork to the current user's wishlist.
 *
 * Unauthenticated users see a link to /login that returns them to the current
 * page after success. Authenticated users see an optimistic toggle. */
export function WishlistButton({ artwork }: { artwork: Artwork }) {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  // We only fetch /wishlist if logged in. Unauth doesn't need it.
  const wishlist = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: () => request<WishlistItem[]>('/wishlist'),
    enabled: !!user,
  });

  const inWishlist = wishlist.data?.some((it) => it.artwork.id === artwork.id) ?? false;

  const toggle = useMutation<void, ApiError, void, { previous?: WishlistItem[] }>({
    mutationFn: () =>
      inWishlist
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
        if (inWishlist) return list.filter((it) => it.artwork.id !== artwork.id);
        // Optimistic insert with a temporary id; refetch will replace it with the real one.
        return [{ id: -1, artwork, notes: null }, ...list];
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

  if (authLoading) return null;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return (
      <Link to={`/login?next=${next}`} className={BTN_LINK}>
        <Heart filled={false} />
        Log in to save
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending || wishlist.isLoading}
      className={inWishlist ? BTN_REMOVE : BTN_ADD}
      aria-pressed={inWishlist}
    >
      <Heart filled={inWishlist} />
      {inWishlist ? 'Saved' : 'Save to wishlist'}
    </button>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
