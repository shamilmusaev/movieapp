/**
 * TMDB API response types and request parameters
 */

import { Movie, MovieDetails, VideosResponse, GenresResponse, WatchProvidersResponse, SimilarMoviesResponse } from './movie.types';

// Generic paginated response wrapper
export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Movies list responses
export type TrendingMoviesResponse = PaginatedResponse<Movie>;
export type PopularMoviesResponse = PaginatedResponse<Movie>;
export type TopRatedMoviesResponse = PaginatedResponse<Movie>;
export type UpcomingMoviesResponse = PaginatedResponse<Movie>;

// Specific API response types
export type MovieDetailsResponse = MovieDetails;
export type MovieVideosResponse = VideosResponse;
export type MovieWatchProvidersResponse = WatchProvidersResponse;
export type MovieSimilarResponse = SimilarMoviesResponse;
export type { GenresResponse } from './movie.types';

// API request parameters
export interface MovieListParams {
  language?: string;
  page?: number;
  region?: string;
}

export interface MovieDetailsParams {
  language?: string;
  append_to_response?: string;
}

export interface MovieVideosParams {
  language?: string;
}

export interface MovieWatchProvidersParams {
  language?: string;
}

export interface GenresParams {
  language?: string;
}

// Trending movies specific parameters
export interface TrendingMoviesParams {
  media_type?: 'all' | 'movie' | 'tv' | 'person';
  time_window?: 'day' | 'week';
  language?: string;
  page?: number;
}

// API endpoint configuration
export interface ApiEndpoint {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresAuth: boolean;
}

// API error response structure
export interface ApiErrorResponse {
  status_code: number;
  status_message: string;
  success: boolean;
}

// Successful API response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Cache configuration for API requests
export interface CacheConfig {
  revalidate?: number;
  tags?: string[];
}

// TMDB API configuration
export interface TmdbConfig {
  baseUrl: string;
  apiKey: string;
  defaultLanguage: string;
  defaultRegion: string;
  imageBaseUrl: string;
  imageSizes: {
    poster: string[];
    backdrop: string[];
    logo: string[];
    profile: string[];
    still: string[];
  };
}