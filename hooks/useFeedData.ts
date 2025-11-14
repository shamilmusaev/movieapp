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
    loading: true,
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
      try {
        const genres = await getMovieGenres();
        if (!cancelled) {
          const map = new Map<number, string>();
          genres.forEach((genre: Genre) => {
            map.set(genre.id, genre.name);
          });
          setGenreMap(map);
        }
      } catch (error) {
        console.error('Failed to load genres:', error);
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
      try {
        // Fetch trending movies
        const response = await getTrendingMovies({
          time_window: 'day',
          page,
        });

        // Filter out already viewed movies
        const newMovies = response.results.filter(
          (movie: Movie) => !state.viewedMovieIds.has(movie.id)
        );

        if (newMovies.length === 0) {
          return [];
        }

        // Limit to 5 movies for initial load to improve performance
        const moviesToProcess = page === 1 ? newMovies.slice(0, 5) : newMovies;

        // Fetch trailers in batches of 3 (respect rate limits)
        const movieChunks = chunkArray(moviesToProcess, 3);
        const moviesWithTrailers: MovieWithTrailer[] = [];

        for (const chunk of movieChunks) {
          const promises = chunk.map(movie =>
            transformMovieForFeed(movie, genreMap)
          );

          const results = await Promise.allSettled(promises);

          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              moviesWithTrailers.push(result.value);
            } else {
              console.warn(
                `Failed to transform movie ${chunk[index].id}:`,
                result.reason
              );
            }
          });
        }

        return moviesWithTrailers;
      } catch (error) {
        console.error('Failed to fetch movies:', error);
        throw error;
      }
    },
    [genreMap, state.viewedMovieIds]
  );

  /**
   * Load initial feed data
   */
  const loadInitial = useCallback(async () => {
    if (genreMap.size === 0) return; // Wait for genres to load

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const movies = await fetchMovies(1);

      setState(prev => ({
        ...prev,
        movies,
        loading: false,
        page: 1,
        hasMore: movies.length > 0,
        viewedMovieIds: new Set(movies.map(m => m.id)),
      }));
    } catch (error) {
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
    if (genreMap.size > 0 && state.movies.length === 0 && !state.loading) {
      loadInitial();
    }
  }, [genreMap.size, state.movies.length, state.loading, loadInitial]);

  return {
    ...state,
    loadMore,
    retry,
    refetch,
  };
}
