/**
 * Application constants and configuration values
 */

// TMDB Image Base URLs
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Default poster placeholder
export const POSTER_PLACEHOLDER = '/images/poster-placeholder.svg';
export const BACKDROP_PLACEHOLDER = '/images/backdrop-placeholder.svg';

// App metadata
export const APP_NAME = 'CineSwipe';
export const APP_DESCRIPTION = 'Discover and swipe through the latest movies and trailers';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cineswipe.app';

// Social media and external links
export const TMDB_WEBSITE = 'https://www.themoviedb.org';
export const YOUTUBE_URL = 'https://www.youtube.com';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGES = 500; // TMDB API limit

// Image quality presets
export const IMAGE_QUALITY = {
  THUMBNAIL: 'w92',
  SMALL: 'w154',
  MEDIUM: 'w185',
  LARGE: 'w342',
  X_LARGE: 'w500',
  XX_LARGE: 'w780',
  ORIGINAL: 'original',
} as const;

// Video quality for YouTube thumbnails
export const YOUTUBE_THUMBNAIL_QUALITY = {
  DEFAULT: 'default',
  MEDIUM: 'mqdefault',
  HIGH: 'hqdefault',
  MAXRES: 'maxresdefault',
} as const;

// Genre IDs for common categories
export const POPULAR_GENRE_IDS = {
  ACTION: 28,
  ADVENTURE: 12,
  ANIMATION: 16,
  COMEDY: 35,
  CRIME: 80,
  DOCUMENTARY: 99,
  DRAMA: 18,
  FAMILY: 10751,
  FANTASY: 14,
  HISTORY: 36,
  HORROR: 27,
  MUSIC: 10402,
  MYSTERY: 9648,
  ROMANCE: 10749,
  SCIENCE_FICTION: 878,
  TV_MOVIE: 10770,
  THRILLER: 53,
  WAR: 10752,
  WESTERN: 37,
} as const;

// Movie status values
export const MOVIE_STATUS = {
  RUMORED: 'Rumored',
  PLANNED: 'Planned',
  IN_PRODUCTION: 'In Production',
  POST_PRODUCTION: 'Post Production',
  RELEASED: 'Released',
  CANCELED: 'Canceled',
} as const;

// Video types
export const VIDEO_TYPES = {
  TRAILER: 'Trailer',
  TEASER: 'Teaser',
  CLIP: 'Clip',
  FEATURETTE: 'Featurette',
  BEHIND_THE_SCENES: 'Behind the Scenes',
  BLOOPERS: 'Bloopers',
  OTHER: 'Other',
} as const;

// Sort options for movie lists
export const SORT_OPTIONS = {
  POPULARITY_ASC: 'popularity.asc',
  POPULARITY_DESC: 'popularity.desc',
  RELEASE_DATE_ASC: 'release_date.asc',
  RELEASE_DATE_DESC: 'release_date.desc',
  REVENUE_ASC: 'revenue.asc',
  REVENUE_DESC: 'revenue.desc',
  PRIMARY_RELEASE_DATE_ASC: 'primary_release_date.asc',
  PRIMARY_RELEASE_DATE_DESC: 'primary_release_date.desc',
  ORIGINAL_TITLE_ASC: 'original_title.asc',
  ORIGINAL_TITLE_DESC: 'original_title.desc',
  VOTE_AVERAGE_ASC: 'vote_average.asc',
  VOTE_AVERAGE_DESC: 'vote_average.desc',
  VOTE_COUNT_ASC: 'vote_count.asc',
  VOTE_COUNT_DESC: 'vote_count.desc',
} as const;

// Time windows for trending
export const TIME_WINDOWS = {
  DAY: 'day',
  WEEK: 'week',
} as const;

// Media types for trending
export const MEDIA_TYPES = {
  ALL: 'all',
  MOVIE: 'movie',
  TV: 'tv',
  PERSON: 'person',
} as const;

// Common country codes for watch providers
export const COMMON_COUNTRY_CODES = {
  US: 'US',
  GB: 'GB',
  CA: 'CA',
  AU: 'AU',
  DE: 'DE',
  FR: 'FR',
  IT: 'IT',
  ES: 'ES',
  JP: 'JP',
  KR: 'KR',
  BR: 'BR',
  MX: 'MX',
  IN: 'IN',
  NL: 'NL',
  SE: 'SE',
  NO: 'NO',
  DK: 'DK',
  FI: 'FI',
  BE: 'BE',
} as const;

// Common language codes
export const COMMON_LANGUAGE_CODES = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'es-ES': 'Spanish (Spain)',
  'fr-FR': 'French (France)',
  'de-DE': 'German (Germany)',
  'it-IT': 'Italian (Italy)',
  'pt-BR': 'Portuguese (Brazil)',
  'ja-JP': 'Japanese (Japan)',
  'ko-KR': 'Korean (South Korea)',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
} as const;

// Cache durations in seconds
export const CACHE_DURATIONS = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  API_ERROR: 'Something went wrong. Please try again.',
  NOT_FOUND: 'The requested movie could not be found.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  AUTH_ERROR: 'There\'s a problem with the API configuration.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Loading states
export const LOADING_MESSAGES = {
  FETCHING_MOVIES: 'Fetching movies...',
  LOADING_DETAILS: 'Loading movie details...',
  SEARCHING: 'Searching...',
  LOADING_VIDEOS: 'Loading videos...',
} as const;