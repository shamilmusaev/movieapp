/**
 * Core movie-related TypeScript interfaces for TMDB API integration
 * Based on TMDB API v3 specification
 */

// Basic movie information (returned in list endpoints)
export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

// Detailed movie information (returned by movie details endpoint)
export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  belongs_to_collection: Collection | null;
  budget: number;
  genres: Genre[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number | null;
  spoken_languages: SpokenLanguage[];
  status: 'Rumored' | 'Planned' | 'In Production' | 'Post Production' | 'Released' | 'Canceled';
  tagline: string | null;
}

// Video information for movies
export interface Video {
  id: string;
  iso_639_1: string | null;
  iso_3166_1: string | null;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: 'YouTube' | 'Vimeo';
  size: number;
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes' | 'Bloopers' | 'Other';
}

// Videos response wrapper
export interface VideosResponse {
  id: number;
  results: Video[];
}

// Genre information
export interface Genre {
  id: number;
  name: string;
}

// Genres list response
export interface GenresResponse {
  genres: Genre[];
}

// Collection information
export interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

// Production company
export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

// Production country
export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

// Spoken language
export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

// Watch provider information
export interface WatchProvider {
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

// Watch providers by country
export interface WatchProvidersByCountry {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

// Watch providers response
export interface WatchProvidersResponse {
  results: Record<string, WatchProvidersByCountry>;
}

// External IDs
export interface ExternalIds {
  imdb_id: string | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
}

// Similar movies response (paginated)
export interface SimilarMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}