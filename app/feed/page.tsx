'use client';

/**
 * Feed page - Main vertical video feed
 */

import { FeedContainer } from '@/components/feed/FeedContainer';
import { useFeedData } from '@/hooks/useFeedData';
import type { MovieWithTrailer } from '@/types/feed.types';

export default function FeedPage() {
  const { movies, loading, error, hasMore, loadMore, retry } = useFeedData();

  /**
   * Handle movie card click
   */
  const handleMovieClick = (movie: MovieWithTrailer) => {
    // TODO: Navigate to movie details page in future
    console.log('Movie clicked:', movie.title);
  };

  // Error state
  if (error && movies.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-white text-2xl font-bold mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
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
