/** Full-bleed editorial footer.
 *
 * The link copy is pulled straight from the Claude Design handoff and is
 * intentionally aspirational — none of these routes exist yet. We render them
 * as plain text in this PR so the footer reads cohesively; future PRs can
 * promote individual items to real Links as routes land. */

const COLUMNS: { title: string; items: string[] }[] = [
  {
    title: 'Discover',
    items: ['Featured tours', 'Movements', 'New acquisitions', 'Hidden masterpieces'],
  },
  {
    title: 'Product',
    items: ['Wishlist', 'Trip planning', 'Mobile app', 'For institutions'],
  },
  {
    title: 'About',
    items: ['Sources & data', 'Wikidata', 'Contact', 'Press'],
  },
];

export function Footer() {
  return (
    <footer
      className="grid gap-10 px-10 pb-10 pt-15 text-white"
      style={{
        backgroundColor: '#0d3ae4',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        paddingTop: 60,
        marginTop: 80,
        fontSize: 13,
      }}
    >
      <div>
        <div className="brand text-[32px] text-white">
          Artlas<span className="opacity-60">.</span>
        </div>
        <p
          className="font-display mt-3.5 max-w-[360px] leading-snug"
          style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)' }}
        >
          Find where great art physically lives — and make a trip out of it.
        </p>
      </div>
      {COLUMNS.map((col) => (
        <FooterCol key={col.title} title={col.title} items={col.items} />
      ))}
      <div
        className="col-span-full flex items-center justify-between pt-6"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.18)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <span>© 2026 Artlas. Image data via Wikimedia Commons & participating museums.</span>
        <span>Made for travelers.</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div
        className="eyebrow mb-3.5"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        {title}
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((i) => (
          <li key={i}>
            <span className="cursor-default text-white">{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
