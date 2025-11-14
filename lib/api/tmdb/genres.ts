/**
 * TMDB Genres API functions with in-memory caching
 */

import { tmdbGet } from './client';
import { GenresParams, GenresResponse } from '@/types/api.types';
import { Genre } from '@/types/movie.types';
import { CACHE_CONFIG } from './config';

// In-memory cache for genres
let genresCache: Genre[] | null = null;
let genresCacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get movie genres list
 * @param params - Optional parameters including language
 * @returns List of movie genres
 */
export async function getMovieGenres(
  params: GenresParams = {}
): Promise<Genre[]> {
  const { language = 'en-US' } = params;

  // Check cache first
  const now = Date.now();
  if (
    genresCache &&
    (now - genresCacheTimestamp) < CACHE_DURATION
  ) {
    return genresCache;
  }

  const response = await tmdbGet<GenresResponse>(
    '/genre/movie/list',
    { language },
    CACHE_CONFIG.GENRES
  );

  // Update cache
  genresCache = response.genres;
  genresCacheTimestamp = now;

  return response.genres;
}

/**
 * Get TV show genres list
 * @param params - Optional parameters including language
 * @returns List of TV show genres
 */
export async function getTvGenres(
  params: GenresParams = {}
): Promise<Genre[]> {
  const { language = 'en-US' } = params;

  const response = await tmdbGet<GenresResponse>(
    '/genre/tv/list',
    { language },
    CACHE_CONFIG.GENRES
  );

  return response.genres;
}

/**
 * Get genre name by ID (using cached movie genres)
 * @param genreId - The TMDB genre ID
 * @param language - Optional language parameter
 * @returns Genre name or null if not found
 */
export async function getGenreNameById(
  genreId: number,
  language = 'en-US'
): Promise<string | null> {
  try {
    const genres = await getMovieGenres({ language });
    const genre = genres.find(g => g.id === genreId);
    return genre?.name || null;
  } catch {
    return null;
  }
}

/**
 * Get multiple genre names by IDs
 * @param genreIds - Array of TMDB genre IDs
 * @param language - Optional language parameter
 * @returns Array of genre names (null for unknown IDs)
 */
export async function getGenreNamesByIds(
  genreIds: number[],
  language = 'en-US'
): Promise<(string | null)[]> {
  try {
    const genres = await getMovieGenres({ language });
    const genreMap = new Map(genres.map(g => [g.id, g.name]));

    return genreIds.map(id => genreMap.get(id) || null);
  } catch {
    return genreIds.map(() => null);
  }
}

/**
 * Clear the genres cache (useful for testing or language changes)
 */
export function clearGenresCache(): void {
  genresCache = null;
  genresCacheTimestamp = 0;
}

/**
 * Check if genres cache is populated
 * @returns True if genres are cached
 */
export function hasGenresCache(): boolean {
  const now = Date.now();
  return (
    genresCache !== null &&
    (now - genresCacheTimestamp) < CACHE_DURATION
  );
}

/**
 * Get cached genres without making API call (returns null if not cached)
 * @returns Cached genres or null
 */
export function getCachedGenres(): Genre[] | null {
  const now = Date.now();
  if (
    genresCache &&
    (now - genresCacheTimestamp) < CACHE_DURATION
  ) {
    return genresCache;
  }
  return null;
}