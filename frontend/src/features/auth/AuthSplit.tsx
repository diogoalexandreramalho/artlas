import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/api';
import { SmartImg } from '@/components/SmartImg';
import type { Artwork } from '@/features/search/types';

/** Slug of the artwork shown on the auth right pane (full-bleed, with caption).
 *  The prototype used The Scream; we use Starry Night since Munch isn't seeded
 *  and Van Gogh's blue palette pairs with the accent. */
const FEATURED_SLUG = 'the-starry-night';

/** Two-column auth screen layout: form on the left, full-bleed featured artwork
 *  on the right with a caption overlay.
 *
 *  Used by both Login and Register so the form copy + behaviour are the only
 *  per-screen variables. */
export function AuthSplit({ children }: { children: ReactNode }) {
  const featured = useQuery<Artwork>({
    queryKey: ['artwork', FEATURED_SLUG],
    queryFn: () => request<Artwork>(`/artworks/${FEATURED_SLUG}`, { auth: false }),
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 73px)',
      }}
    >
      {/* Form column — centered 520px content with editorial padding. */}
      <div
        style={{
          padding: '60px 60px 40px',
          maxWidth: 520,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {children}
      </div>

      {/* Featured artwork column. */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#ebe4d4',
        }}
      >
        {featured.data && (
          <>
            <SmartImg
              src={featured.data.image_url}
              alt={featured.data.title}
              title={featured.data.title}
              subtitle={featured.data.artist.name}
              loading="eager"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.45))',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 40,
                right: 40,
                color: '#fff',
              }}
            >
              <div
                className="font-display"
                style={{ fontSize: 32, lineHeight: 1.15, fontStyle: 'italic' }}
              >
                {featured.data.title}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  opacity: 0.85,
                }}
              >
                {featured.data.artist.name}
                {featured.data.museum &&
                  ` · ${featured.data.museum.name}, ${featured.data.museum.city}`}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Eyebrow-labeled form field. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="eyebrow mb-1.5 text-[10px]">{label}</div>
      {children}
    </label>
  );
}
