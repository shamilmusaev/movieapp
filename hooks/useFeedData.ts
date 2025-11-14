'use client';

/**
 * SWR-based data fetching hook for vertical video feed
 * Replaces Server-Sent Events with simple REST API + automatic caching
 */

import useSWRInfinite from 'swr/infinite';
import type { MovieWithTrailer, FeedContentType } from '@/types/feed.types';

interface FeedResponse {
  movies: MovieWithTrailer[];
  hasMore: boolean;
  page: number;
}

interface UseFeedDataOptions {
  /**
   * Content type (movie, tv, anime)
   */
  contentType: FeedContentType;

  /**
   * Initial page size
   */
  pageSize?: number;
}

interface UseFeedDataReturn {
  /**
   * All loaded movies (flattened from all pages)
   */
  movies: MovieWithTrailer[];

  /**
   * Whether initial data is loading
   */
  loading: boolean;

  /**
   * Whether data is being revalidated
   */
  isValidating: boolean;

  /**
   * Whether more pages exist
   */
  hasMore: boolean;

  /**
   * Current error if any
   */
  error: Error | undefined;

  /**
   * Load next page
   */
  loadMore: () => Promise<void>;

  /**
   * Manually refresh all data
   */
  refetch: () => Promise<void>;

  /**
   * Retry after error
   */
  retry: () => Promise<void>;

  /**
   * Current page number (1-indexed)
   */
  page: number;
}

/**
 * Fetcher function for SWR
 */
async function fetcher(url: string): Promise<FeedResponse> {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('Failed to fetch feed data');
    throw error;
  }

  return res.json();
}

/**
 * Get SWR key for a specific page
 */
function getKey(contentType: FeedContentType) {
  return (pageIndex: number, previousPageData: FeedResponse | null) => {
    // Reached the end
    if (previousPageData && !previousPageData.hasMore) {
      return null;
    }

    // First page
    const page = pageIndex + 1;
    return `/api/feed/trending?page=${page}&media_type=${contentType}`;
  };
}

/**
 * Hook for fetching feed data with infinite scroll
 */
export function useFeedData({
  contentType,
  pageSize = 20,
}: UseFeedDataOptions): UseFeedDataReturn {
  const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite<FeedResponse>(
    getKey(contentType),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 60 seconds
      revalidateFirstPage: false,
      parallel: false, // Load pages sequentially
    }
  );

  // Flatten all pages into single array
  const movies = data ? data.flatMap(page => page.movies) : [];

  // Check if more pages exist
  const hasMore = data ? data[data.length - 1]?.hasMore ?? false : false;

  // Load next page
  const loadMore = async () => {
    if (!isLoading && !isValidating && hasMore) {
      await setSize(size + 1);
    }
  };

  // Refresh all data
  const refetch = async () => {
    await mutate();
  };

  // Retry (same as refetch for SWR)
  const retry = async () => {
    await mutate();
  };

  return {
    movies,
    loading: isLoading && !data,
    isValidating,
    hasMore,
    error,
    loadMore,
    refetch,
    retry,
    page: size,
  };
}
