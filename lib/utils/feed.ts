/**
 * Feed-specific data transformation utilities
 */

import { FeedMovie } from '@/types/feed.types';
import { Movie, Genre, Video } from '@/types/movie.types';
import { getMovieVideos } from '@/lib/api/tmdb/movies';
import { buildImageUrl } from '@/lib/api/tmdb/config';

/**
 * Transform a TMDB Movie into a FeedMovie with trailer and genres
 * @param movie - Original TMDB Movie object
 * @param genreMap - Map of genre id to genre name
 * @returns feed movie with trailerId and genresDisplay
 */
export async function transformMovieForFeed(
  movie: Movie,
  genreMap: Map<number, string>
): Promise<FeedMovie> {
  // Initialize FeedMovie with required properties
  const feedMovie: FeedMovie = {
    ...movie,
    trailer: null,
    genres: movie.genre_ids.map(id => ({
      id,
      name: genreMap.get(id) || 'Unknown'
    })),
  };

  feedMovie.genresDisplay = movie.genre_ids.slice(0, 3).map(id => genreMap.get(id) || '');

  // Fetch videos and extract the best trailer
  try {
    const videosResponse = await getMovieVideos(movie.id);
    const trailerKey = extractBestTrailer(videosResponse.results);

    if (trailerKey) {
      // Find the full trailer object
      const trailerObj = videosResponse.results.find(v => v.key === trailerKey);
      if (trailerObj) {
        feedMovie.trailer = trailerObj;
        feedMovie.trailerId = trailerKey;
      }
    }
  } catch {
    feedMovie.trailerId = undefined;
  }

  return feedMovie;
}

/**
 * Extract the YouTube trailer ID from the list of videos by priority
 * @param videos - Array of video objects
 * @returns YouTube video key for trailer or undefined
 */
export function extractBestTrailer(videos: Video[]): string | undefined {
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
export function computeTMDBImageUrl(path: string | null, size: string = 'w500'): string | null {
  if (!path) return null;
  return buildImageUrl(path, size);
}

/**
 * Utility to chunk an array into smaller arrays
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}