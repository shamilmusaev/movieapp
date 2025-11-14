/**
 * TMDB API configuration and constants
 */

import { TmdbConfig } from '@/types/api.types';

// TMDB API base configuration
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Default configuration
export const DEFAULT_LANGUAGE = 'en-US';
export const DEFAULT_REGION = 'US';

// API endpoints
export const TMDB_ENDPOINTS = {
  // Movies
  TRENDING: '/trending/{media_type}/{time_window}',
  POPULAR: '/movie/popular',
  TOP_RATED: '/movie/top_rated',
  UPCOMING: '/movie/upcoming',
  MOVIE_DETAILS: '/movie/{movie_id}',
  MOVIE_VIDEOS: '/movie/{movie_id}/videos',
  MOVIE_WATCH_PROVIDERS: '/movie/{movie_id}/watch/providers',
  MOVIE_SIMILAR: '/movie/{movie_id}/similar',

  // Genres
  GENRE_MOVIES: '/genre/movie/list',
  GENRE_TV: '/genre/tv/list',

  // Configuration
  CONFIGURATION: '/configuration',
} as const;

// Image sizes
export const TMDB_IMAGE_SIZES = {
  poster: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  backdrop: ['w300', 'w780', 'w1280', 'original'],
  logo: ['w45', 'w92', 'w154', 'w185', 'w300', 'w500', 'original'],
  profile: ['w45', 'w185', 'h632', 'original'],
  still: ['w92', 'w185', 'w300', 'original'],
};

// Default image sizes for different use cases
export const DEFAULT_IMAGE_SIZES = {
  poster_thumbnail: 'w185',
  poster_large: 'w500',
  backdrop_thumbnail: 'w300',
  backdrop_large: 'w1280',
  logo_small: 'w92',
  logo_large: 'w300',
} as const;

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  REQUESTS_PER_10_SECONDS: 40,
  MIN_DELAY_BETWEEN_REQUESTS: 250, // milliseconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // milliseconds
} as const;

// Cache configuration for Next.js
export const CACHE_CONFIG = {
  MOVIE_LISTS: { revalidate: 3600 }, // 1 hour
  MOVIE_DETAILS: { revalidate: 7200 }, // 2 hours
  GENRES: { revalidate: 86400 }, // 24 hours
  CONFIGURATION: { revalidate: 604800 }, // 1 week
} as const;

// Create TMDB configuration object
export function createTmdbConfig(apiKey: string): TmdbConfig {
  return {
    baseUrl: TMDB_BASE_URL,
    apiKey,
    defaultLanguage: DEFAULT_LANGUAGE,
    defaultRegion: DEFAULT_REGION,
    imageBaseUrl: TMDB_IMAGE_BASE_URL,
    imageSizes: TMDB_IMAGE_SIZES,
  };
}

// Get environment variables with validation
export function getTmdbEnvConfig(): {
  apiKey: string;
  baseUrl?: string;
} {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

  if (!apiKey) {
    throw new Error(
      'NEXT_PUBLIC_TMDB_API_KEY environment variable is required. ' +
      'Please set it in your .env.local file.'
    );
  }

  return {
    apiKey,
    baseUrl: baseUrl || TMDB_BASE_URL,
  };
}

// Validate API key format (TMDB API keys are typically 32 characters)
export function isValidApiKey(apiKey: string): boolean {
  return typeof apiKey === 'string' && apiKey.length === 32 && /^[a-f0-9]+$/i.test(apiKey);
}

// Build image URL helper
export function buildImageUrl(
  imagePath: string | null,
  size: string = 'w500'
): string | null {
  if (!imagePath) return null;

  return `${TMDB_IMAGE_BASE_URL}/${size}${imagePath}`;
}