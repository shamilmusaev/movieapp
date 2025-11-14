/**
 * Data formatting utilities for movie information and display
 */

import { buildImageUrl } from '@/lib/api/tmdb/config';
import { Movie, Genre } from '@/types/movie.types';

/**
 * Format release date to human-readable format
 */
export function formatReleaseDate(releaseDate: string | null): string {
  if (!releaseDate) return 'Unknown';

  try {
    const date = new Date(releaseDate);
    const now = new Date();
    const currentYear = now.getFullYear();

    if (isNaN(date.getTime())) return 'Unknown';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    // If movie is from current year, don't show year
    if (date.getFullYear() === currentYear) {
      options.year = undefined;
    }

    return date.toLocaleDateString('en-US', options);
  } catch {
    return 'Unknown';
  }
}

/**
 * Format runtime in minutes to human-readable format
 */
export function formatRuntime(runtime: number | null): string {
  if (!runtime || runtime <= 0) return 'Unknown';

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Format vote average to display with proper decimal places
 */
export function formatRating(rating: number | null): string {
  if (rating === null || isNaN(rating)) return 'N/A';

  // Show 1 decimal place if rating is not a whole number
  if (rating % 1 !== 0) {
    return rating.toFixed(1);
  }

  return rating.toString();
}

/**
 * Format popularity number (typically very large) to readable format
 */
export function formatPopularity(popularity: number | null): string {
  if (popularity === null || isNaN(popularity)) return 'N/A';

  if (popularity >= 1000000) {
    return `${(popularity / 1000000).toFixed(1)}M`;
  }

  if (popularity >= 1000) {
    return `${(popularity / 1000).toFixed(1)}K`;
  }

  return popularity.toFixed(0);
}

/**
 * Format vote count to readable format
 */
export function formatVoteCount(voteCount: number | null): string {
  if (voteCount === null || isNaN(voteCount)) return 'N/A';

  if (voteCount >= 1000000) {
    return `${(voteCount / 1000000).toFixed(1)}M`;
  }

  if (voteCount >= 1000) {
    return `${(voteCount / 1000).toFixed(1)}K`;
  }

  return voteCount.toString();
}

/**
 * Format movie title for display (handle long titles)
 */
export function formatTitle(title: string, maxLength: number = 50): string {
  if (!title) return 'Untitled';

  if (title.length <= maxLength) return title;

  return title.substring(0, maxLength).trim() + '...';
}

/**
 * Format overview text (truncate long descriptions)
 */
export function formatOverview(overview: string | null, maxLength: number = 200): string {
  if (!overview) return 'No description available.';

  if (overview.length <= maxLength) return overview;

  return overview.substring(0, maxLength).trim() + '...';
}

/**
 * Get poster image URL with proper size
 */
export function getPosterUrl(
  posterPath: string | null,
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string | null {
  return buildImageUrl(posterPath, size);
}

/**
 * Get backdrop image URL with proper size
 */
export function getBackdropUrl(
  backdropPath: string | null,
  size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'
): string | null {
  return buildImageUrl(backdropPath, size);
}

/**
 * Get poster thumbnail URL
 */
export function getPosterThumbnail(posterPath: string | null): string | null {
  return getPosterUrl(posterPath, 'w185');
}

/**
 * Get poster large URL
 */
export function getPosterLarge(posterPath: string | null): string | null {
  return getPosterUrl(posterPath, 'w780');
}

/**
 * Get backdrop thumbnail URL
 */
export function getBackdropThumbnail(backdropPath: string | null): string | null {
  return getBackdropUrl(backdropPath, 'w780');
}

/**
 * Format genre names as a comma-separated string
 */
export function formatGenres(genres: Genre[] | null): string {
  if (!genres || genres.length === 0) return 'Unknown';

  return genres.map(genre => genre.name).join(', ');
}

/**
 * Format genre IDs to names (requires genres array lookup)
 */
export function formatGenreIds(
  genreIds: number[] | null,
  genres: Genre[] | null
): string {
  if (!genreIds || genreIds.length === 0 || !genres) return 'Unknown';

  const genreMap = new Map(genres.map(g => [g.id, g.name]));
  const names = genreIds
    .map(id => genreMap.get(id))
    .filter((name): name is string => name !== undefined);

  return names.length > 0 ? names.join(', ') : 'Unknown';
}

/**
 * Format currency amount (for budget/revenue)
 */
export function formatCurrency(amount: number | null): string {
  if (amount === null || isNaN(amount)) return 'N/A';

  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }

  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }

  return `$${amount.toLocaleString()}`;
}

/**
 * Format year from date string
 */
export function formatYear(dateString: string | null): string {
  if (!dateString) return 'Unknown';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    return date.getFullYear().toString();
  } catch {
    return 'Unknown';
  }
}

/**
 * Format video URL for YouTube
 */
export function getYoutubeUrl(videoKey: string): string {
  return `https://www.youtube.com/watch?v=${videoKey}`;
}

/**
 * Format video embed URL for YouTube
 */
export function getYoutubeEmbedUrl(videoKey: string): string {
  return `https://www.youtube.com/embed/${videoKey}`;
}

/**
 * Format video thumbnail URL for YouTube
 */
export function getYoutubeThumbnailUrl(videoKey: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoKey}/${qualityMap[quality]}.jpg`;
}