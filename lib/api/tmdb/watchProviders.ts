/**
 * TMDB Watch Providers API functions
 */

import { tmdbGet } from './client';
import { MovieWatchProvidersParams } from '@/types/api.types';
import { WatchProvidersResponse } from '@/types/movie.types';
import { CACHE_CONFIG } from './config';

/**
 * Get watch providers for a specific movie
 * @param movieId - The TMDB movie ID
 * @param params - Optional parameters including language
 * @returns Watch provider information by country
 */
export async function getMovieWatchProviders(
  movieId: number,
  params: MovieWatchProvidersParams = {}
): Promise<WatchProvidersResponse> {
  const { language = 'en-US' } = params;

  return tmdbGet(
    `/movie/${movieId}/watch/providers`,
    { language },
    CACHE_CONFIG.MOVIE_DETAILS
  );
}

/**
 * Get watch providers for a specific TV show
 * @param tvId - The TMDB TV show ID
 * @param params - Optional parameters including language
 * @returns Watch provider information by country
 */
export async function getTvWatchProviders(
  tvId: number,
  params: MovieWatchProvidersParams = {}
): Promise<WatchProvidersResponse> {
  const { language = 'en-US' } = params;

  return tmdbGet(
    `/tv/${tvId}/watch/providers`,
    { language },
    CACHE_CONFIG.MOVIE_DETAILS
  );
}

/**
 * Get available watch providers for movies in a specific region
 * @param region - ISO 3166-1 country code
 * @param params - Optional parameters including language and watch_region
 * @returns List of available watch providers
 */
export async function getMovieWatchProvidersByRegion(
  region: string,
  params: {
    language?: string;
    watch_region?: string;
  } = {}
): Promise<{
  results: Array<{
    logo_path: string | null;
    provider_id: number;
    provider_name: string;
    display_priority: number;
  }>;
}> {
  const { language = 'en-US', watch_region = region } = params;

  return tmdbGet(
    '/watch/providers/movie',
    { language, watch_region },
    { revalidate: 86400 } // 24 hours cache
  );
}

/**
 * Get available watch providers for TV shows in a specific region
 * @param region - ISO 3166-1 country code
 * @param params - Optional parameters including language and watch_region
 * @returns List of available watch providers
 */
export async function getTvWatchProvidersByRegion(
  region: string,
  params: {
    language?: string;
    watch_region?: string;
  } = {}
): Promise<{
  results: Array<{
    logo_path: string | null;
    provider_id: number;
    provider_name: string;
    display_priority: number;
  }>;
}> {
  const { language = 'en-US', watch_region = region } = params;

  return tmdbGet(
    '/watch/providers/tv',
    { language, watch_region },
    { revalidate: 86400 } // 24 hours cache
  );
}