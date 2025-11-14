/**
 * Common utility types used throughout the application
 */

// Result type for operations that can succeed or fail
export interface ApiResult<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

// Helper to create successful result
export function createSuccessResult<T>(data: T): ApiResult<T> {
  return { success: true, data };
}

// Helper to create error result
export function createErrorResult<E>(error: E): ApiResult<never, E> {
  return { success: false, error };
}

// Loading state for async operations
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Async data wrapper with loading state
export interface AsyncData<T> {
  state: LoadingState;
  data: T | null;
  error: Error | null;
}

// Create initial async data
export function createInitialAsyncData<T>(): AsyncData<T> {
  return {
    state: 'idle',
    data: null,
    error: null,
  };
}

// Create loading async data
export function createLoadingAsyncData<T>(previousData?: T | null): AsyncData<T> {
  return {
    state: 'loading',
    data: previousData || null,
    error: null,
  };
}

// Create success async data
export function createSuccessAsyncData<T>(data: T): AsyncData<T> {
  return {
    state: 'success',
    data,
    error: null,
  };
}

// Create error async data
export function createErrorAsyncData<T>(error: Error, previousData?: T | null): AsyncData<T> {
  return {
    state: 'error',
    data: previousData || null,
    error,
  };
}

// Optional utility type
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Required utility type
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Deep partial utility type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Image configuration types
export interface ImageConfig {
  baseUrl: string;
  secureBaseUrl: string;
  backdropSizes: string[];
  logoSizes: string[];
  posterSizes: string[];
  profileSizes: string[];
  stillSizes: string[];
}

// Language configuration
export interface Language {
  iso_639_1: string;
  english_name: string;
  name: string;
}

// Country configuration
export interface Country {
  iso_3166_1: string;
  english_name: string;
  name: string;
}

// Time window for trending content
export type TimeWindow = 'day' | 'week';

// Media type for trending content
export type MediaType = 'all' | 'movie' | 'tv' | 'person';

// Sort options for movie lists
export type SortOption = 'popularity.asc' | 'popularity.desc' |
                       'release_date.asc' | 'release_date.desc' |
                       'revenue.asc' | 'revenue.desc' |
                       'primary_release_date.asc' | 'primary_release_date.desc' |
                       'original_title.asc' | 'original_title.desc' |
                       'vote_average.asc' | 'vote_average.desc' |
                       'vote_count.asc' | 'vote_count.desc';

// Watch region
export type WatchRegion = string; // ISO 3166-1 country code

// Image size configurations
export interface ImageSizeConfig {
  poster: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
  backdrop: 'w300' | 'w780' | 'w1280' | 'original';
  logo: 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w500' | 'original';
  profile: 'w45' | 'w185' | 'h632' | 'original';
  still: 'w92' | 'w185' | 'w300' | 'original';
}