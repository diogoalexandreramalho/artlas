export type Artist = {
  id: number;
  wikidata_id: string;
  name: string;
  slug: string;
  birth_year: number | null;
  death_year: number | null;
  nationality: string | null;
  movement: string | null;
};

export type Museum = {
  id: number;
  wikidata_id: string;
  name: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
};

export type Artwork = {
  id: number;
  wikidata_id: string;
  title: string;
  slug: string;
  year: number | null;
  kind: 'painting' | 'sculpture' | 'other';
  image_url: string | null;
  artist: Artist;
  museum: Museum | null;
};

export type SearchResults = {
  query: string;
  total: number;
  results: Artwork[];
};
