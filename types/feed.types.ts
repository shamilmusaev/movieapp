/**
 * Types for vertical video feed feature
 */

import { Movie, Video, Genre } from './movie.types';

// Re-export for backwards compatibility
export type Trailer = Video;
export type { Genre };

export interface MovieWithTrailer extends Movie {
  trailer: Video | null;
  trailerId?: string; // YouTube video key for convenience
  genres: Genre[];
  genresDisplay?: string[]; // Pre-mapped genre names for display
  
  // Additional pre-computed properties for optimization
  releaseYear?: string; // Extracted from release_date
  posterUrl?: string | null; // Pre-computed full URL
  backdropUrl?: string | null; // Pre-computed full URL
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBVideosResponse {
  id: number;
  results: Trailer[];
}

export interface FeedItem {
  id: number;
  movie: MovieWithTrailer;
  isVisible: boolean;
  isActive: boolean;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoaded: boolean;
  hasError: boolean;
}

export type FeedContentType = 'movie' | 'tv' | 'anime';

export interface FeedState {
  movies: MovieWithTrailer[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  viewedMovieIds: Set<number>;
}

export type FeedStateMap = Record<FeedContentType, FeedState>;

export type VideoSize = 'small' | 'medium' | 'large';

export interface YouTubePlayerOptions {
  autoplay: boolean;
  controls: boolean;
  modestbranding: boolean;
  rel: boolean;
  showinfo: boolean;
  iv_load_policy: number;
  fs: boolean;
}

// Legacy exports for compatibility
export interface FeedMovie extends MovieWithTrailer {}
export interface PaginationParams {
  page: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
}
