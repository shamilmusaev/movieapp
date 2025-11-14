'use client';

/**
 * Feed page - Main vertical video feed
 * Uses streaming for instant content loading
 */

import { FeedContainer } from '@/components/feed/FeedContainer';
import { useStreamingFeedData } from '@/hooks/useStreamingFeedData';
import type { MovieWithTrailer } from '@/types/feed.types';

export default function FeedPage() {
  const { movies, loading, error, hasMore, loadMore, retry, streamingStatus } = useStreamingFeedData();

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

  // Streaming status indicator
  const StreamingIndicator = () => {
    if (!streamingStatus) return null;
    
    const getStatusText = () => {
      switch (streamingStatus) {
        case 'connecting': return 'Connecting...';
        case 'connected': return 'Fetching...';
        case 'fetching_trending': return 'Getting trending movies...';
        case 'processing_priority': return 'Loading priority movies...';
        case 'showing_priority': return 'Priority movies ready!';
        case (streamingStatus && streamingStatus.startsWith('batch_')): return `Loading batch ${streamingStatus.split('_')[1]}...`;
        case 'complete': return 'Streaming complete!';
        case 'timeout': return 'Connection timeout';
        case 'error': return 'Streaming error';
        case 'canceled': return 'Connection canceled';
        default: return streamingStatus;
      }
    };

    return (
      <div className="fixed top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg z-50 backdrop-blur-sm">
        <div className="text-xs uppercase tracking-wide opacity-75 mb-1">Stream Status</div>
        <div className="text-sm font-medium">{getStatusText()}</div>
      </div>
    );
  };

  // Main feed view
  return (
    <main className="w-full h-screen overflow-hidden">
      <StreamingIndicator />
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
