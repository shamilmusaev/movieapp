'use client';

/**
 * Feed page - Main vertical video feed
 * Uses SWR for data fetching with React 19 transitions for smooth UX
 */

import { useState, useEffect, useTransition, useCallback } from 'react';
import { FeedContainer } from '@/components/feed/FeedContainer';
import { FeedTypeSelector } from '@/components/feed/FeedTypeSelector';
import { useFeedData } from '@/hooks/useFeedData';
import { getContentType, setContentType } from '@/lib/utils/session-storage';
import type { MovieWithTrailer, FeedContentType } from '@/types/feed.types';

export default function FeedPage() {
  // Content type state with session persistence
  const [selectedContentType, setSelectedContentType] = useState<FeedContentType>('movie');

  // React 19 useTransition for smooth tab switching
  const [isPending, startTransition] = useTransition();

  // SWR-based data fetching
  const { movies, loading, error, hasMore, loadMore, retry, isValidating } = useFeedData({
    contentType: selectedContentType,
  });

  // Initialize content type from session storage
  useEffect(() => {
    const savedType = getContentType();
    if (savedType !== selectedContentType) {
      setSelectedContentType(savedType);
    }
  }, []);

  // Handle content type change with transition
  const handleContentTypeChange = (type: FeedContentType) => {
    startTransition(() => {
      setSelectedContentType(type);
      setContentType(type); // Save to session storage
    });
  };

  /**
   * Handle movie card click
   * Wrapped in useCallback for stable reference to prevent FeedContainer re-renders
   */
  const handleMovieClick = useCallback((movie: MovieWithTrailer) => {
    // TODO: Navigate to movie details page in future
  }, []);

  // Error state
  if (error && movies.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-white text-2xl font-bold mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">{error.message || 'Failed to load feed'}</p>
          <button
            onClick={retry}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state (initial load)
  if (loading && movies.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your feed...</p>
        </div>
      </div>
    );
  }

  // Empty state (unlikely but possible)
  if (!loading && movies.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center p-6">
          <p className="text-white text-xl mb-4">No movies found</p>
          <button
            onClick={retry}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Main feed view
  return (
    <main className="w-full h-screen overflow-hidden">
      {/* Loading indicator during transition */}
      {(isPending || isValidating) && movies.length > 0 && (
        <div className="fixed top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg z-50 backdrop-blur-sm">
          <div className="text-sm font-medium">Updating...</div>
        </div>
      )}

      {/* Content type selector */}
      <FeedTypeSelector
        selectedType={selectedContentType}
        onTypeChange={handleContentTypeChange}
      />

      <FeedContainer
        movies={movies}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onMovieClick={handleMovieClick}
      />
    </main>
  );
}
