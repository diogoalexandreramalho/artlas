import { Link } from 'react-router-dom';

import { Icon } from '@/components/Icon';
import { SmartImg } from '@/components/SmartImg';
import type { Artwork } from '@/features/search/types';

type Props = {
  artwork: Artwork;
  /** Hide the museum/city in the label (used on museum detail). */
  showMuseum?: boolean;
  /** Pass a callback to render the heart toggle. Omit for read-only contexts. */
  onSave?: (id: number) => void;
  saved?: boolean;
};

/** Museum-mat-board artwork card.
 *
 * Image with a 4:5 mat frame (`.artwork-frame`), italic Cal Sans title, and a
 * micro-eyebrow line for artist · year · city. Used by HomeScreen,
 * SearchResultsPage, ArtistDetailPage, MuseumDetailPage, WishlistPage. Width is
 * driven by the parent grid — the card fills its column. */
export function ArtworkCard({ artwork, showMuseum = true, onSave, saved = false }: Props) {
  return (
    <li className="list-none">
      <Link
        to={`/artworks/${artwork.slug}`}
        className="artwork-frame block transition hover:shadow-lift"
      >
        <div className="img-wrap">
          <SmartImg
            src={artwork.image_url}
            alt={artwork.title}
            title={artwork.title}
            subtitle={artwork.artist.name}
          />
          {onSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave(artwork.id);
              }}
              className={['heart-btn absolute right-2 top-2', saved && 'active']
                .filter(Boolean)
                .join(' ')}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-pressed={saved}
            >
              <Icon.heart filled={saved} />
            </button>
          )}
        </div>
        <div className="label">
          <span className="font-display text-base leading-tight text-ink">{artwork.title}</span>
          <span className="text-[11px] tracking-[0.04em] text-ink-3">
            {artwork.artist.name}
            {artwork.year && ` · ${artwork.year}`}
            {showMuseum && artwork.museum?.city && ` · ${artwork.museum.city}`}
          </span>
        </div>
      </Link>
    </li>
  );
}
