/**
 * API Route Handler for aggregated trending feed data
 * Optimizes performance by fetching and transforming data server-side
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTrendingMovies, getMovieById } from '@/lib/api/tmdb/movies';
import { transformMovieForFeedServer } from '@/lib/utils/feed-server';
import type { FeedApiResponse } from '@/types/api.types';

// Enable ISR caching for 1 hour
export const revalidate = 3600;

/**
 * GET handler for trending feed data
 * Returns pre-processed movie data with trailers in a single request
 */
export async function GET(request: NextRequest) {
  try {
    // Parse page parameter from query string
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    // Validate page parameter
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page parameter' },
        { status: 400 }
      );
    }

    console.log(`🎬 Fetching trending movies for page ${page}...`);

    // 1. Fetch trending movies list
    const trendingResponse = await getTrendingMovies({
      time_window: 'day',
      page,
    });

    console.log(`✅ Got ${trendingResponse.results.length} trending movies`);

    if (trendingResponse.results.length === 0) {
      // Return empty response for pages with no results
      const response: FeedApiResponse = {
        movies: [],
        page,
        totalPages: trendingResponse.total_pages,
        hasMore: false,
      };
      return NextResponse.json(response);
    }

    // 2. Limit to 20 movies per page for better user experience
    const moviesToProcess = trendingResponse.results.slice(0, 20);
    console.log(`📦 Processing ${moviesToProcess.length} movies...`);

    // 3. Fetch movie details with videos in parallel
    const moviePromises = moviesToProcess.map(async (movie) => {
      try {
        // Fetch movie details with videos in single request
        const movieDetails = await getMovieById(movie.id, {
          append_to_response: 'videos',
        });

        // Transform to feed format on server
        const feedMovie = await transformMovieForFeedServer(movieDetails);
        return feedMovie;
      } catch (error) {
        console.warn(`❌ Failed to process movie ${movie.id}:`, error);
        return null;
      }
    });

    // 4. Wait for all movie processing to complete
    const movieResults = await Promise.allSettled(moviePromises);
    
    // 5. Extract successful results and filter out failures
    const movies = movieResults
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    console.log(`✅ Successfully processed ${movies.length} movies`);

    // 6. Build response with pagination info
    const response: FeedApiResponse = {
      movies,
      page,
      totalPages: trendingResponse.total_pages,
      hasMore: page < trendingResponse.total_pages && movies.length > 0,
    };

    console.log(`📤 Returning ${movies.length} movies, hasMore: ${response.hasMore}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error in feed API route:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        movies: [],
        page: 1,
        totalPages: 0,
        hasMore: false,
      } as FeedApiResponse & { error: string },
      { status: 500 }
    );
  }
}
