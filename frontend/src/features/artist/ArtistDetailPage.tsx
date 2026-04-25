import { useParams } from 'react-router-dom';

export function ArtistDetailPage() {
  const { slug } = useParams();
  // TODO: fetch artist by slug once backend /artists/{slug} is wired (Phase 5).
  return (
    <div>
      <h1 className="text-2xl font-semibold">Artist: {slug}</h1>
      <p className="mt-2 text-stone-600">Detail view placeholder.</p>
    </div>
  );
}
