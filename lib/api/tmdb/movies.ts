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
    language = 'en-US',
    page = 1
  } = params;

  return tmdbGet(
    `/trending/${media_type}/${time_window}`,
    { language, page: page.toString() },
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
  
  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.append('language', language);
  if (append_to_response) {
    searchParams.append('append_to_response', append_to_response);
  }
  
  const endpoint = `/movie/${movieId}?${searchParams.toString()}`;

  return tmdbFetchWithRetry(endpoint, {
    next: CACHE_CONFIG.MOVIE_DETAILS
  });
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

/**
 * Get trending TV shows
 * @param params - Optional parameters including time_window, language, and page
 * @returns Paginated list of trending TV shows
 */
export async function getTrendingTVShows(
  params: {
    time_window?: 'day' | 'week';
    language?: string;
    page?: number;
  } = {}
): Promise<TrendingMoviesResponse> {
  const {
    time_window = 'day',
    language = 'en-US',
    page = 1
  } = params;

  return tmdbGet(
    `/trending/tv/${time_window}`,
    { language, page: page.toString() },
    CACHE_CONFIG.MOVIE_LISTS
  );
}

/**
 * Get anime movies with multi-stage fallback strategy
 * @param params - Parameters for fetching anime
 * @returns Paginated list of anime movies
 */
export async function getAnimeMovies(
  params: {
    page?: number;
    language?: string;
    attempt?: number; // 1-4 for different fallback strategies
  } = {}
): Promise<TrendingMoviesResponse> {
  const {
    page = 1,
    language = 'en-US',
    attempt = 1
  } = params;

  // Stage 1: Primary attempt with Japanese origin and animation genre
  if (attempt === 1) {
    return tmdbGet(
      '/discover/movie',
      {
        language,
        page: page.toString(),
        with_origin_country: 'JP',
        with_genres: '16', // Animation genre ID
        sort_by: 'popularity.desc',
        'vote_count.gte': '50'
      },
      CACHE_CONFIG.MOVIE_LISTS
    );
  }

  // Stage 2: Remove original language constraint
  if (attempt === 2) {
    return tmdbGet(
      '/discover/movie',
      {
        language,
        page: page.toString(),
        with_genres: '16',
        sort_by: 'popularity.desc',
        'vote_count.gte': '50'
      },
      CACHE_CONFIG.MOVIE_LISTS
    );
  }

  // Stage 3: Use anime keyword
  if (attempt === 3) {
    return tmdbGet(
      '/discover/movie',
      {
        language,
        page: page.toString(),
        with_keywords: '210024', // Anime keyword ID
        with_genres: '16',
        sort_by: 'popularity.desc'
      },
      CACHE_CONFIG.MOVIE_LISTS
    );
  }

  // Stage 4: Fallback to trending TV with animation genre
  if (attempt === 4) {
    return tmdbGet(
      '/discover/tv',
      {
        language,
        page: page.toString(),
        with_genres: '16',
        sort_by: 'popularity.desc'
      },
      CACHE_CONFIG.MOVIE_LISTS
    );
  }

  // Default to stage 1
  return getAnimeMovies({ page, language, attempt: 1 });
}

/**
 * Get TV show details by ID
 * @param tvId - The TMDB TV show ID
 * @param params - Optional parameters including language and append_to_response
 * @returns Detailed TV show information
 */
export async function getTVShowById(
  tvId: number,
  params: MovieDetailsParams = {}
): Promise<MovieDetails> {
  const { language = 'en-US', append_to_response } = params;
  
  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.append('language', language);
  if (append_to_response) {
    searchParams.append('append_to_response', append_to_response);
  }
  
  const endpoint = `/tv/${tvId}?${searchParams.toString()}`;

  return tmdbFetchWithRetry(endpoint, {
    next: CACHE_CONFIG.MOVIE_DETAILS
  });
}

/**
 * Get videos for a specific TV show
 * @param tvId - The TMDB TV show ID
 * @param params - Optional parameters including language
 * @returns List of videos for the TV show
 */
export async function getTVShowVideos(
  tvId: number,
  params: MovieVideosParams = {}
): Promise<VideosResponse> {
  const { language = 'en-US' } = params;

  return tmdbGet(
    `/tv/${tvId}/videos`,
    { language },
    CACHE_CONFIG.MOVIE_DETAILS
  );
}