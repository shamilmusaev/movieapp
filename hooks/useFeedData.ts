'use client';

/**
 * Hook for fetching and managing feed data with pagination
 */

import { useState, useEffect, useCallback } from 'react';
import { getTrendingMovies } from '@/lib/api/tmdb/movies';
import { getMovieGenres } from '@/lib/api/tmdb/genres';
import { transformMovieForFeed, chunkArray } from '@/lib/utils/feed';
import type { MovieWithTrailer, FeedState, Genre } from '@/types/feed.types';
import type { Movie } from '@/types/movie.types';

interface UseFeedDataReturn extends FeedState {
  loadMore: () => Promise<void>;
  retry: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing feed data with trending movies
 * Handles pagination, deduplication, and trailer fetching
 */
export function useFeedData(): UseFeedDataReturn {
  const [state, setState] = useState<FeedState>({
    movies: [],
    loading: true, // Loading from the start (genres + movies)
    error: null,
    hasMore: true,
    page: 1,
    viewedMovieIds: new Set<number>(),
  });

  const [genreMap, setGenreMap] = useState<Map<number, string>>(new Map());

  // Load genres on mount
  useEffect(() => {
    let cancelled = false;

    async function loadGenres() {
      console.log('🎭 Loading genres...');
      try {
        const genres = await getMovieGenres();
        console.log('✅ Genres loaded:', genres.length);
        if (!cancelled) {
          const map = new Map<number, string>();
          genres.forEach((genre: Genre) => {
            map.set(genre.id, genre.name);
          });
          setGenreMap(map);
          console.log('✅ Genre map created with', map.size, 'entries');
        }
      } catch (error) {
        console.error('❌ Failed to load genres:', error);
      }
    }

    loadGenres();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Fetch movies for a specific page
   */
  const fetchMovies = useCallback(
    async (page: number): Promise<MovieWithTrailer[]> => {
      console.log('📄 fetchMovies called for page:', page);
      try {
        // Fetch trending movies
        console.log('🔎 Calling getTrendingMovies...');
        const response = await getTrendingMovies({
          time_window: 'day',
          page,
        });
        console.log('✅ Got trending movies:', response.results.length);

        // Filter out already viewed movies
        const newMovies = response.results.filter(
          (movie: Movie) => !state.viewedMovieIds.has(movie.id)
        );
        console.log('🔢 New movies after filter:', newMovies.length);

        if (newMovies.length === 0) {
          console.log('⚠️ No new movies to process');
          return [];
        }

        // Limit to 10 movies for initial load (balance between content and speed)
        const moviesToProcess = page === 1 ? newMovies.slice(0, 10) : newMovies;
        console.log('📦 Movies to process:', moviesToProcess.length);

        // Fetch trailers in batches of 5 (respect rate limits)
        const movieChunks = chunkArray(moviesToProcess, 5);
        const moviesWithTrailers: MovieWithTrailer[] = [];

        console.log('🎬 Processing', movieChunks.length, 'batches...');
        for (let i = 0; i < movieChunks.length; i++) {
          const chunk = movieChunks[i];
          console.log(`📦 Processing batch ${i + 1}/${movieChunks.length}...`);

          const promises = chunk.map(movie =>
            transformMovieForFeed(movie, genreMap)
          );

          const results = await Promise.allSettled(promises);

          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              moviesWithTrailers.push(result.value);
              console.log(`✅ Movie ${chunk[index].title} transformed`);
            } else {
              console.warn(
                `❌ Failed to transform movie ${chunk[index].id}:`,
                result.reason
              );
            }
          });
        }

        console.log('🎉 Final movies with trailers:', moviesWithTrailers.length);
        return moviesWithTrailers;
      } catch (error) {
        console.error('❌ Failed to fetch movies:', error);
        throw error;
      }
    },
    [genreMap, state.viewedMovieIds]
  );

  /**
   * Load initial feed data
   */
  const loadInitial = useCallback(async () => {
    console.log('🔄 loadInitial called, genreMap.size:', genreMap.size);
    if (genreMap.size === 0) {
      console.log('⏸️ Waiting for genres to load...');
      return; // Wait for genres to load
    }

    console.log('📡 Starting to load feed...');
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🎬 Fetching movies...');
      const movies = await fetchMovies(1);
      console.log('✅ Movies loaded:', movies.length);

      setState(prev => ({
        ...prev,
        movies,
        loading: false,
        page: 1,
        hasMore: movies.length > 0,
        viewedMovieIds: new Set(movies.map(m => m.id)),
      }));
    } catch (error) {
      console.error('❌ Error loading feed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load feed',
      }));
    }
  }, [fetchMovies, genreMap.size]);

  /**
   * Load more movies (pagination)
   */
  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const nextPage = state.page + 1;
      const newMovies = await fetchMovies(nextPage);

      if (newMovies.length === 0) {
        setState(prev => ({
          ...prev,
          loading: false,
          hasMore: false,
        }));
        return;
      }

      setState(prev => {
        const updatedViewedIds = new Set(prev.viewedMovieIds);
        newMovies.forEach(m => updatedViewedIds.add(m.id));

        return {
          ...prev,
          movies: [...prev.movies, ...newMovies],
          loading: false,
          page: nextPage,
          viewedMovieIds: updatedViewedIds,
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load more',
      }));
    }
  }, [state.loading, state.hasMore, state.page, fetchMovies]);

  /**
   * Retry after error
   */
  const retry = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  /**
   * Refetch current page
   */
  const refetch = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  // Load initial data when genres are ready
  useEffect(() => {
    console.log('🎯 useEffect check - genreMap.size:', genreMap.size, 'movies.length:', state.movies.length);
    if (genreMap.size > 0 && state.movies.length === 0) {
      console.log('✨ Conditions met! Calling loadInitial...');
      loadInitial();
    }
  }, [genreMap.size, state.movies.length, loadInitial]);

  return {
    ...state,
    loadMore,
    retry,
    refetch,
  };
}
