export type MapArtwork = {
  id: number;
  slug: string;
  title: string;
  year: number | null;
  image_url: string | null;
  artist_name: string;
  artist_slug: string;
};

export type MapMuseumResult = {
  id: number;
  wikidata_id: string;
  name: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  artworks: MapArtwork[];
};

export type MapResponse = {
  museums: MapMuseumResult[];
};

export type MapFilters = {
  cities: string[];
  countries: string[];
  movements: string[];
};
