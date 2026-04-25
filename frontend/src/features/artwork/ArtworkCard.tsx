import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Artwork } from '@/features/search/types';

const CARD_CLASS =
  'block rounded border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-400 hover:shadow';

/** Compact card linking to /artworks/<slug>. Used on SearchPage + ArtistDetailPage. */
export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <li>
      <Link to={`/artworks/${artwork.slug}`} className={CARD_CLASS}>
        <div className="flex gap-3">
          <Thumbnail src={artwork.image_url} alt={artwork.title} />
          <div className="min-w-0">
            <h3 className="truncate font-medium">{artwork.title}</h3>
            <p className="truncate text-sm text-stone-600">
              {artwork.artist.name}
              {artwork.year && ` · ${artwork.year}`}
            </p>
            {artwork.museum && (
              <p className="mt-1 truncate text-xs text-stone-500">
                {artwork.museum.name}
                {artwork.museum.city && `, ${artwork.museum.city}`}
              </p>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
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
