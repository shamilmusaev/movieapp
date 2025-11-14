/**
 * Server-side utilities for feed data transformation
 * Optimized for server-side data processing with no client dependencies
 */

import { FeedMovie } from '@/types/feed.types';
import { MovieDetails, Video, Genre } from '@/types/movie.types';
import { buildImageUrl } from '@/lib/api/tmdb/config';

// Type for MovieDetails with appended videos response
interface MovieDetailsWithVideos extends MovieDetails {
  videos?: {
    results: Video[];
  };
}

/**
 * Extract the YouTube trailer ID from the list of videos by priority
 * @param videos - Array of video objects
 * @returns YouTube video key for trailer or undefined
 */
function extractBestTrailer(videos: Video[]): string | undefined {
  // Priority 1: Official Trailer named "Official Trailer"
  const officialNamed = videos.find(
    v => v.site === 'YouTube' && v.type === 'Trailer' && v.official && v.name.toLowerCase().includes('official trailer')
  );

  if (officialNamed) return officialNamed.key;

  // Priority 2: Any official YouTube trailer
  const officialAny = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official);
  if (officialAny) return officialAny.key;

  // Priority 3: Any YouTube trailer
  const youtubeTrailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
  if (youtubeTrailer) return youtubeTrailer.key;

  // Priority 4: Any YouTube video
  const youtubeAny = videos.find(v => v.site === 'YouTube');
  return youtubeAny?.key;
}

/**
 * Compute full TMDB image URL from relative path and size
 * @param path - Relative image path
 * @param size - Size code (e.g., w500)
 * @returns Full URL or null
 */
function computeTMDBImageUrl(path: string | null, size: string = 'w500'): string | null {
  if (!path) return null;
  return buildImageUrl(path, size);
}

/**
 * Extract release year from release date
 * @param releaseDate - ISO date string (YYYY-MM-DD)
 * @returns Year as string or empty string
 */
function extractReleaseYear(releaseDate: string): string {
  if (!releaseDate) return '';
  return releaseDate.split('-')[0] || '';
}

/**
 * Transform a TMDB MovieDetails object into a FeedMovie with pre-processed data
 * Optimized for server-side processing with all necessary transformations
 * 
 * @param movieDetails - Complete movie details with videos (append_to_response)
 * @returns FeedMovie object ready for client consumption
 */
export async function transformMovieForFeedServer(
  movieDetails: MovieDetailsWithVideos
): Promise<FeedMovie> {
  // Extract trailer information from videos array (from append_to_response)
  const trailerKey = movieDetails.videos?.results ? extractBestTrailer(movieDetails.videos.results) : undefined;
  const trailer = trailerKey 
    ? movieDetails.videos?.results.find((v: Video) => v.key === trailerKey) || null
    : null;

  // Transform genres to the expected format
  const genres: Genre[] = movieDetails.genres || [];
  const genreIds = genres.map(g => g.id);

  // Build the FeedMovie object with all required properties
  const feedMovie: FeedMovie = {
    // Core movie properties from MovieDetails
    id: movieDetails.id,
    title: movieDetails.title,
    overview: movieDetails.overview,
    poster_path: movieDetails.poster_path,
    backdrop_path: movieDetails.backdrop_path,
    release_date: movieDetails.release_date,
    genre_ids: genreIds, // Already extracted from genres array
    
    // Extended properties for feed functionality
    trailer,
    trailerId: trailerKey,
    genres,
    genresDisplay: genres.slice(0, 3).map(g => g.name),
    
    // Additional properties from MovieDetails
    adult: movieDetails.adult || false,
    original_title: movieDetails.original_title,
    original_language: movieDetails.original_language,
    popularity: movieDetails.popularity || 0,
    video: movieDetails.video || false,
    vote_average: movieDetails.vote_average || 0,
    vote_count: movieDetails.vote_count || 0,
    
    // Pre-computed display fields for optimization
    releaseYear: extractReleaseYear(movieDetails.release_date),
    posterUrl: computeTMDBImageUrl(movieDetails.poster_path, 'w500'),
    backdropUrl: computeTMDBImageUrl(movieDetails.backdrop_path, 'w1280'),
  };

  return feedMovie;
}
