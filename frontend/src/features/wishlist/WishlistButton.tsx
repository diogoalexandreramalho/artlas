import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError, request } from '@/lib/api';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/features/auth/AuthContext';
import type { Artwork } from '@/features/search/types';
import type { WishlistItem } from '@/features/wishlist/types';

/** Toggle button for adding/removing the given artwork to the current user's
 *  wishlist. Styled with the `.btn` family from the design tokens (PR #12).
 *
 * - Unauthenticated → ghost-style "Log in to save" link with `?next=` return.
 * - Authenticated, not saved → primary (dark ink) "Save to wishlist".
 * - Authenticated, saved → ghost (transparent / border) "Saved to wishlist". */
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
      <Link to={`/login?next=${next}`} className="btn btn-ghost">
        <Icon.heart />
        Log in to save
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending || wishlist.isLoading}
      className={['btn', inWishlist ? 'btn-ghost' : 'btn-primary'].join(' ')}
      aria-pressed={inWishlist}
    >
      <Icon.heart filled={inWishlist} />
      {inWishlist ? 'Saved to wishlist' : 'Save to wishlist'}
    </button>
  );
}
