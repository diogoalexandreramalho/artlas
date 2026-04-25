import { useState } from 'react';
import type { CSSProperties } from 'react';

type Props = {
  src: string | null | undefined;
  alt: string;
  /** Title shown on the typeset placeholder when the image fails or is missing. */
  title?: string;
  /** Optional secondary line on the placeholder (e.g. artist name). */
  subtitle?: string;
  className?: string;
  style?: CSSProperties;
  /** `<img loading="…">` — defaults to lazy, override for above-the-fold heroes. */
  loading?: 'lazy' | 'eager';
};

/** Image with a graceful typeset fallback when `src` is missing or 404s.
 *
 * The fallback is a soft cream tile with the title set in italic Cal Sans —
 * preserves layout + still tells the user what artwork they were going to see.
 * Mirrors the prototype's pattern. */
export function SmartImg({
  src,
  alt,
  title,
  subtitle,
  className,
  style,
  loading = 'lazy',
}: Props) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div
        className={[
          'flex h-full w-full flex-col items-center justify-center gap-1.5 p-4 text-center',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          background: 'linear-gradient(135deg, var(--bg-2-fallback, #ebe4d4), var(--surface-fallback, #fbf8f1))',
          ...style,
        }}
        aria-label={alt}
        role="img"
      >
        {title && (
          <div className="font-display text-base leading-tight text-ink-2">
            {title}
          </div>
        )}
        {subtitle && (
          <div className="text-[10px] uppercase tracking-[0.08em] text-ink-3">
            {subtitle}
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className={className}
      style={style}
    />
  );
}
