/**
 * TMDB API - Public exports and convenience functions
 */

// Movie API functions
export {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getMovieById,
  getMovieVideos,
  getSimilarMovies,
  searchMovies,
} from './movies';

// Genre API functions
export {
  getMovieGenres,
  getTvGenres,
  getGenreNameById,
  getGenreNamesByIds,
  clearGenresCache,
  hasGenresCache,
  getCachedGenres,
} from './genres';

// Watch providers API functions
export {
  getMovieWatchProviders,
  getTvWatchProviders,
  getMovieWatchProvidersByRegion,
  getTvWatchProvidersByRegion,
} from './watchProviders';

// Client functions
export {
  tmdbFetch,
  tmdbGet,
  tmdbFetchWithRetry,
  checkApiHealth,
} from './client';

// Configuration
export {
  TMDB_BASE_URL,
  TMDB_IMAGE_BASE_URL,
  DEFAULT_LANGUAGE,
  DEFAULT_REGION,
  TMDB_ENDPOINTS,
  TMDB_IMAGE_SIZES,
  DEFAULT_IMAGE_SIZES,
  RATE_LIMIT_CONFIG,
  CACHE_CONFIG,
  createTmdbConfig,
  getTmdbEnvConfig,
  isValidApiKey,
  buildImageUrl,
} from './config';

// Re-export commonly used types for convenience
export type {
  Movie,
  MovieDetails,
  Video,
  Genre,
  WatchProvider,
  SimilarMoviesResponse,
} from '@/types/movie.types';

export type {
  TrendingMoviesResponse,
  PopularMoviesResponse,
  TopRatedMoviesResponse,
  UpcomingMoviesResponse,
  MovieListParams,
  MovieDetailsParams,
  MovieVideosParams,
  MovieWatchProvidersParams,
  TrendingMoviesParams,
  GenresParams,
  TmdbConfig,
} from '@/types/api.types';

export type {
  ApiError,
  ApiAuthenticationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  ServiceUnavailableError,
  BadRequestError,
  UnknownApiError,
} from '@/types/error.types';