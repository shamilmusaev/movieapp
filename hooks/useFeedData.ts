'use client';

/**
 * Hook for fetching and managing feed data with pagination
 * Optimized to use server-side aggregation API for better performance
 */

import { useState, useEffect, useCallback } from 'react';
import { getMovieGenres } from '@/lib/api/tmdb/genres';
import type { MovieWithTrailer, FeedState, Genre } from '@/types/feed.types';
import type { FeedApiResponse } from '@/types/api.types';

interface UseFeedDataReturn extends FeedState {
  loadMore: () => Promise<void>;
  retry: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing feed data with trending movies
 * Optimized to use server-side aggregation for faster initial loading
 * Handles pagination and deduplication, with async genre loading
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

  // Load genres asynchronously without blocking the feed
  useEffect(() => {
    let cancelled = false;

    async function loadGenres() {
      console.log('🎭 Loading genres asynchronously...');
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
        // Don't set error state - feed continues without genres
        if (!cancelled) {
          setGenreMap(new Map());
          console.log('⚠️ Continuing without genres due to error');
        }
      }
    }

    loadGenres();

    return () => {
      cancelled = true;
    };
  }, []);



  /**
   * Load initial feed data with progressive loading
   */
  const loadInitial = useCallback(async () => {
    console.log('🔄 loadInitial called - starting immediately (no genre blocking)');
    console.log('📡 Starting to load feed...');
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🎬 Fetching movies...');
      
      // Fetch with progressive loading (priority batch first)
      const response = await fetch('/api/feed/trending?page=1');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: FeedApiResponse = await response.json();
      console.log('✅ Feed loaded:', data.movies.length);

      // Filter out already viewed movies
      const newMovies = data.movies.filter(
        (movie: MovieWithTrailer) => !state.viewedMovieIds.has(movie.id)
      );
      console.log('🔢 New movies after filter:', newMovies.length);

      setState(prev => ({
        ...prev,
        movies: newMovies,
        loading: false,
        page: 1,
        hasMore: data.hasMore,
        viewedMovieIds: new Set(newMovies.map(m => m.id)),
      }));
    } catch (error) {
      console.error('❌ Error loading feed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load feed',
      }));
    }
  }, [state.viewedMovieIds]);

  /**
   * Load more movies (pagination)
   */
  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const nextPage = state.page + 1;
      
      // Direct API call for pagination (progressive loading on server)
      const response = await fetch(`/api/feed/trending?page=${nextPage}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: FeedApiResponse = await response.json();
      console.log('✅ Additional page loaded:', data.movies.length);

      // Filter out already viewed movies
      const newMovies = data.movies.filter(
        (movie: MovieWithTrailer) => !state.viewedMovieIds.has(movie.id)
      );
      console.log('🔢 New movies after filter:', newMovies.length);

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
          hasMore: data.hasMore,
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
  }, [state.loading, state.hasMore, state.page, state.viewedMovieIds]);

  /**
   * Retry after error
   */
  const retry = useCallback(async () => {
    // Reset state and retry loading
    setState(prev => ({ ...prev, error: null, loading: true }));
    
    // Try to reload data immediately
    try {
      await loadInitial();
    } catch (error) {
      console.error('❌ Retry failed:', error);
    }
  }, [loadInitial]);

  /**
   * Refetch current page
   */
  const refetch = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  // Load initial data immediately on mount (no genre blocking)
  useEffect(() => {
    console.log('🎯 useEffect check - starting initial load immediately');
    if (state.movies.length === 0) {
      console.log('✨ Starting feed load immediately (no genre wait)');
      loadInitial();
    }
  }, [state.movies.length, loadInitial]);

  return {
    ...state,
    loadMore,
    retry,
    refetch,
  };
}
