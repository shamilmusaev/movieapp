/**
 * TMDB Movies API functions
 */

import {
  tmdbGet,
  tmdbFetchWithRetry
} from './client';
import {
  TrendingMoviesResponse,
  PopularMoviesResponse,
  TopRatedMoviesResponse,
  UpcomingMoviesResponse,
  MovieDetailsParams,
  MovieVideosParams,
  MovieWatchProvidersParams,
  MovieListParams,
  TrendingMoviesParams
} from '@/types/api.types';
import {
  MovieDetails,
  VideosResponse,
  WatchProvidersResponse,
  SimilarMoviesResponse
} from '@/types/movie.types';
import { CACHE_CONFIG } from './config';

/**
 * Get trending movies
 * @param params - Optional parameters including media_type, time_window, language, and page
 * @returns Paginated list of trending movies
 */
export async function getTrendingMovies(
  params: TrendingMoviesParams = {}
): Promise<TrendingMoviesResponse> {
  const {
    media_type = 'movie',
    time_window = 'week',
    language = 'en-US'
  } = params;

  return tmdbGet(
    `/trending/${media_type}/${time_window}`,
    { language },
    CACHE_CONFIG.MOVIE_LISTS
  );
}

/**
 * Get popular movies
 * @param params - Optional parameters including language, page, and region
 * @returns Paginated list of popular movies
 */
export async function getPopularMovies(
  params: MovieListParams = {}
): Promise<PopularMoviesResponse> {
  const { language = 'en-US', page = 1, region = 'US' } = params;

  return tmdbGet(
    '/movie/popular',
    { language, page: page.toString(), region },
    CACHE_CONFIG.MOVIE_LISTS
  );
}

/**
 * Get top rated movies
 * @param params - Optional parameters including language, page, and region
 * @returns Paginated list of top rated movies
 */
export async function getTopRatedMovies(
  params: MovieListParams = {}
): Promise<TopRatedMoviesResponse> {
  const { language = 'en-US', page = 1, region = 'US' } = params;

  return tmdbGet(
    '/movie/top_rated',
    { language, page: page.toString(), region },
    CACHE_CONFIG.MOVIE_LISTS
  );
}

/**
 * Get upcoming movies
 * @param params - Optional parameters including language, page, and region
 * @returns Paginated list of upcoming movies
 */
export async function getUpcomingMovies(
  params: MovieListParams = {}
): Promise<UpcomingMoviesResponse> {
  const { language = 'en-US', page = 1, region = 'US' } = params;

  return tmdbGet(
    '/movie/upcoming',
    { language, page: page.toString(), region },
    CACHE_CONFIG.MOVIE_LISTS
  );
}

/**
 * Get detailed information about a specific movie
 * @param movieId - The TMDB movie ID
 * @param params - Optional parameters including language and append_to_response
 * @returns Detailed movie information
 */
export async function getMovieById(
  movieId: number,
  params: MovieDetailsParams = {}
): Promise<MovieDetails> {
  const { language = 'en-US', append_to_response } = params;

  return tmdbFetchWithRetry(
    `/movie/${movieId}`,
    {
      method: 'GET',
      next: CACHE_CONFIG.MOVIE_DETAILS,
    }
  ).then(() =>
    tmdbGet(
      `/movie/${movieId}`,
      { language, ...(append_to_response && { append_to_response }) },
      CACHE_CONFIG.MOVIE_DETAILS
    )
  );
}

/**
 * Get videos (trailers, clips, etc.) for a specific movie
 * @param movieId - The TMDB movie ID
 * @param params - Optional parameters including language
 * @returns List of videos for the movie
 */
export async function getMovieVideos(
  movieId: number,
  params: MovieVideosParams = {}
): Promise<VideosResponse> {
  const { language = 'en-US' } = params;

  return tmdbGet(
    `/movie/${movieId}/videos`,
    { language },
    CACHE_CONFIG.MOVIE_DETAILS
  );
}

/**
 * Get watch providers for a specific movie
 * @param movieId - The TMDB movie ID
 * @param params - Optional parameters including language
 * @returns Watch provider information by country
 */
export async function getWatchProviders(
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
 * Get similar movies for a specific movie
 * @param movieId - The TMDB movie ID
 * @param params - Optional parameters including language and page
 * @returns Paginated list of similar movies
 */
export async function getSimilarMovies(
  movieId: number,
  params: MovieListParams = {}
): Promise<SimilarMoviesResponse> {
  const { language = 'en-US', page = 1 } = params;

  return tmdbGet(
    `/movie/${movieId}/similar`,
    { language, page: page.toString() },
    CACHE_CONFIG.MOVIE_LISTS
  );
}

/**
 * Search for movies by title
 * @param query - Search query string
 * @param params - Optional parameters including language, page, and include_adult
 * @returns Paginated search results
 */
export async function searchMovies(
  query: string,
  params: {
    language?: string;
    page?: number;
    include_adult?: boolean;
    region?: string;
    year?: number;
    primary_release_year?: number;
  } = {}
): Promise<TrendingMoviesResponse> {
  const {
    language = 'en-US',
    page = 1,
    include_adult = false,
    region = 'US',
    year,
    primary_release_year
  } = params;

  const searchParams: Record<string, string> = {
    query,
    language,
    page: page.toString(),
    include_adult: include_adult.toString(),
  };

  if (region) searchParams.region = region;
  if (year) searchParams.year = year.toString();
  if (primary_release_year) searchParams.primary_release_year = primary_release_year.toString();

  return tmdbGet(
    '/search/movie',
    searchParams,
    { revalidate: 1800 } // 30 minutes cache for search results
  );
}