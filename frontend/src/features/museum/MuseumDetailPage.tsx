import { useParams } from 'react-router-dom';

export function MuseumDetailPage() {
  const { slug } = useParams();
  // TODO: fetch museum by slug once backend /museums/{slug} is wired (post-MVP).
  return (
    <div>
      <h1 className="text-2xl font-semibold">Museum: {slug}</h1>
      <p className="mt-2 text-stone-600">Detail view placeholder.</p>
    </div>
  );
}
