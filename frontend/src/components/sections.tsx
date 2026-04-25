import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Icon } from '@/components/Icon';

/** Tiny uppercase preamble label, used above section titles. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={['eyebrow', className].filter(Boolean).join(' ')}>{children}</span>;
}

/** Editorial section heading: eyebrow + display title + optional CTA, with a thin rule below. */
export function SectionHeader({
  eyebrow,
  title,
  link,
  to,
}: {
  eyebrow?: string;
  title: string;
  /** CTA label (e.g. "View all"). */
  link?: string;
  /** CTA target route. */
  to?: string;
}) {
  return (
    <div className="flex items-end justify-between border-b border-line pb-4">
      <div>
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h2 className="display m-0 text-[40px]">{title}</h2>
      </div>
      {link && to && (
        <Link
          to={to}
          className="inline-flex items-center gap-1.5 pb-1 text-sm text-ink-2 hover:text-ink"
        >
          {link}
          <Icon.arrow />
        </Link>
      )}
    </div>
  );
}

/** Lightweight section wrapper used inside search results / detail pages. */
export function Bucket({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-5 flex items-baseline gap-3">
        <h2 className="font-display m-0 text-2xl text-ink">{title}</h2>
        {count !== undefined && <Eyebrow>{count}</Eyebrow>}
      </div>
      {children}
    </section>
  );
}
