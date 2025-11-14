/**
 * Simple REST API Route Handler for feed data
 * Returns JSON response with movies (no streaming, uses SWR caching client-side)
 */

import { NextRequest } from 'next/server';
import { getTrendingMovies, getMovieById, getTrendingTVShows, getAnimeMovies, getTVShowById } from '@/lib/api/tmdb/movies';
import { transformMovieForFeedServer } from '@/lib/utils/feed-server';
import type { FeedMovie, FeedContentType } from '@/types/feed.types';

/**
 * Check trailer coverage for anime results
 * Returns object with coverage ratio and items with trailers
 */
async function checkAnimeTrailerCoverage(animeResults: any[]): Promise<{coverage: number, itemsWithTrailers: any[]}> {
  if (animeResults.length === 0) {
    return { coverage: 0, itemsWithTrailers: [] };
  }

  // Check trailers for each anime item in parallel
  const trailerChecks = animeResults.map(async (anime) => {
    try {
      const details = await (anime.first_air_date ? getTVShowById : getMovieById)(anime.id, {
        append_to_response: 'videos'
      });

      return {
        id: anime.id,
        hasTrailer: !!((details as any).videos?.results?.length > 0)
      };
    } catch {
      return { id: anime.id, hasTrailer: false };
    }
  });

  const results = await Promise.allSettled(trailerChecks);
  const validResults = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map(r => r.value);

  const itemsWithTrailers = validResults.filter(r => r.hasTrailer);
  const coverage = itemsWithTrailers.length / validResults.length;

  return { coverage, itemsWithTrailers };
}

// Enable ISR caching for 30 minutes
export const revalidate = 1800;

/**
 * GET handler for feed data
 * Returns simple JSON response (SWR handles caching client-side)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const mediaTypeParam = searchParams.get('media_type');

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const mediaType: FeedContentType = (mediaTypeParam as FeedContentType) || 'movie';

    // Validate parameters
    if (isNaN(page) || page < 1) {
      return Response.json(
        { error: 'Invalid page parameter' },
        { status: 400 }
      );
    }

    if (!['movie', 'tv', 'anime'].includes(mediaType)) {
      return Response.json(
        { error: 'Invalid media_type parameter. Must be movie, tv, or anime' },
        { status: 400 }
      );
    }

    // Fetch content based on media type
    let trendingResponse: any;

    if (mediaType === 'movie') {
      trendingResponse = await getTrendingMovies({
        time_window: 'day',
        page,
      });
    } else if (mediaType === 'tv') {
      trendingResponse = await getTrendingTVShows({
        time_window: 'day',
        page,
      });
    } else if (mediaType === 'anime') {
      // Try multi-stage fallback for anime
      let animeAttempt = 1;
      let animeResponse: any;

      while (animeAttempt <= 4) {
        animeResponse = await getAnimeMovies({
          page,
          attempt: animeAttempt as 1 | 2 | 3 | 4,
        });

        // If we got sufficient results, use them
        if (animeResponse.results.length >= 10) {
          break;
        }

        animeAttempt++;
      }

      // Check trailer availability for anime results
      if (animeResponse.results.length > 0) {
        const animeWithTrailers = await checkAnimeTrailerCoverage(animeResponse.results);
        if (animeWithTrailers.coverage < 0.5 && animeAttempt < 4) {
          // Less than 50% have trailers, try next attempt
          animeAttempt++;
          animeResponse = await getAnimeMovies({
            page,
            attempt: animeAttempt as 1 | 2 | 3 | 4,
          });
        } else {
          // Filter anime to only include items with trailers
          animeResponse.results = animeResponse.results.filter((anime: any) =>
            animeWithTrailers.itemsWithTrailers.some(item => item.id === anime.id)
          );
        }
      }

      trendingResponse = animeResponse;
    }

    if (trendingResponse.results.length === 0) {
      return Response.json({
        movies: [],
        hasMore: false,
        page,
      });
    }

    // Limit to 20 movies per page
    const moviesToProcess = trendingResponse.results.slice(0, 20);
    const allMovies: FeedMovie[] = [];

    // Process all movies in parallel
    const moviePromises = moviesToProcess.map(async (movie: any) => {
      try {
        let movieDetails;

        // Fetch details based on media type
        if (mediaType === 'tv' || (mediaType === 'anime' && movie.first_air_date)) {
          // TV show
          movieDetails = await getTVShowById(movie.id, {
            append_to_response: 'videos',
          });
        } else {
          // Movie (including anime movies)
          movieDetails = await getMovieById(movie.id, {
            append_to_response: 'videos',
          });
        }

        const feedMovie = await transformMovieForFeedServer(movieDetails);
        return feedMovie;
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.allSettled(moviePromises);
    const processedMovies = results
      .filter((result): result is PromiseFulfilledResult<any> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    allMovies.push(...processedMovies);

    // Calculate if more pages exist
    const hasMore = page < trendingResponse.total_pages && allMovies.length > 0;

    // Return simple JSON response
    return Response.json({
      movies: allMovies,
      hasMore,
      page,
    });

  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
