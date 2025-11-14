/**
 * Streaming API Route Handler for instant feed loading
 * Uses Server-Sent Events to send movies as they become ready
 */

import { NextRequest } from 'next/server';
import { getTrendingMovies, getMovieById, getTrendingTVShows, getAnimeMovies, getTVShowById } from '@/lib/api/tmdb/movies';
import { transformMovieForFeedServer } from '@/lib/utils/feed-server';
import type { FeedMovie, FeedContentType } from '@/types/feed.types';

// Enable ISR caching for 30 minutes
export const revalidate = 1800;

/**
 * GET handler for streaming trending feed data
 * Returns movies as Server-Sent Events for instant display
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

    console.log(`🎬 Starting streaming feed for ${mediaType} page ${page}...`);

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. Send initial response headers
          controller.enqueue(encoder.encode('event: start\n'));
          controller.enqueue(encoder.encode('data: {"status":"fetching_trending"}\n\n'));

          // 2. Fetch content based on media type
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
            
            trendingResponse = animeResponse;
          }

          controller.enqueue(encoder.encode('data: {"status":"trending_fetched","total":' + trendingResponse.results.length + '}\n\n'));

          if (trendingResponse.results.length === 0) {
            controller.enqueue(encoder.encode('event: complete\n'));
            controller.enqueue(encoder.encode('data: {"status":"complete","movies":[],"page":' + page + ',"totalPages":' + trendingResponse.total_pages + ',"hasMore":false}\n\n'));
            controller.close();
            return;
          }

          // 3. Limit to 20 movies per page
          const moviesToProcess = trendingResponse.results.slice(0, 20);
          const allMovies: FeedMovie[] = [];
          
          // 4. Process priority movies (first 8) immediately
          const priorityMovies = moviesToProcess.slice(0, 8);
          const remainingMovies = moviesToProcess.slice(8);
          
          controller.enqueue(encoder.encode('data: {"status":"processing_priority","count":' + priorityMovies.length + '}\n\n'));

          // Process priority movies/TV shows in parallel
          const priorityPromises = priorityMovies.map(async (movie: any, index: number) => {
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
              
              // Send each movie as it's ready
              controller.enqueue(encoder.encode('event: movie\n'));
              controller.enqueue(encoder.encode('data: ' + JSON.stringify({
                movie: feedMovie,
                index: index,
                total: moviesToProcess.length,
                type: 'priority'
              }) + '\n\n'));
              
              return feedMovie;
            } catch (error) {
              console.warn(`❌ Failed to process ${mediaType} ${movie.id}:`, error);
              return null;
            }
          });

          const priorityResults = await Promise.allSettled(priorityPromises);
          const processedPriorityMovies = priorityResults
            .filter((result): result is PromiseFulfilledResult<any> => 
              result.status === 'fulfilled' && result.value !== null
            )
            .map(result => result.value);

          allMovies.push(...processedPriorityMovies);
          controller.enqueue(encoder.encode('data: {"status":"priority_complete","count":' + processedPriorityMovies.length + '}\n\n'));

          // 5. Process remaining movies in smaller batches
          if (remainingMovies.length > 0) {
            const batchSize = 4;
            controller.enqueue(encoder.encode('data: {"status":"processing_background","count":' + remainingMovies.length + '}\n\n'));

            for (let i = 0; i < remainingMovies.length; i += batchSize) {
              const batch = remainingMovies.slice(i, i + batchSize);
              const batchStartIndex = priorityMovies.length + i;
              
              const batchPromises = batch.map(async (movie: any, batchIndex: number) => {
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
                  
                  // Send each movie as it's ready
                  controller.enqueue(encoder.encode('event: movie\n'));
                  controller.enqueue(encoder.encode('data: ' + JSON.stringify({
                    movie: feedMovie,
                    index: batchStartIndex + batchIndex,
                    total: moviesToProcess.length,
                    type: 'background',
                    batch: Math.floor((priorityMovies.length + i) / batchSize)
                  }) + '\n\n'));
                  
                  return feedMovie;
                } catch (error) {
                  console.warn(`❌ Failed to process ${mediaType} ${movie.id}:`, error);
                  return null;
                }
              });

              const batchResults = await Promise.allSettled(batchPromises);
              const successfulBatch = batchResults
                .filter((result): result is PromiseFulfilledResult<any> => 
                  result.status === 'fulfilled' && result.value !== null
                )
                .map(result => result.value);

              allMovies.push(...successfulBatch);
              
              controller.enqueue(encoder.encode('data: {"status":"batch_complete","batch":' + Math.floor((priorityMovies.length + i) / batchSize) + ',"count":' + successfulBatch.length + '}\n\n'));
            }
          }

          // 6. Send final completion event
          const hasMore = page < trendingResponse.total_pages && allMovies.length > 0;
          
          controller.enqueue(encoder.encode('event: complete\n'));
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({
            status: 'complete',
            movies: allMovies,
            page,
            totalPages: trendingResponse.total_pages,
            hasMore
          }) + '\n\n'));
          
          controller.close();
          console.log(`✅ Streaming complete: ${allMovies.length} movies sent`);

        } catch (error) {
          console.error('❌ Streaming error:', error);
          controller.enqueue(encoder.encode('event: error\n'));
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({
            status: 'error',
            error: error instanceof Error ? error.message : 'Internal server error'
          }) + '\n\n'));
          controller.close();
        }
      }
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Error in feed API route:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
