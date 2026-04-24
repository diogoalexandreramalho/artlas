import { useParams } from 'react-router-dom';

export function ArtworkDetailPage() {
  const { slug } = useParams();
  // TODO: fetch artwork by slug once backend /artworks/{slug} is wired.
  return (
    <div>
      <h1 className="text-2xl font-semibold">Artwork: {slug}</h1>
      <p className="mt-2 text-stone-600">Detail view placeholder.</p>
    </div>
  );
}
