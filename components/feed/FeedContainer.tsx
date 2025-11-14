'use client';

/**
 * Feed Container - main wrapper for vertical video feed
 */

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { VideoCard } from './VideoCard';
import { FeedControls } from './FeedControls';
import type { MovieWithTrailer } from '@/types/feed.types';

interface FeedContainerProps {
  movies: MovieWithTrailer[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onMovieClick?: (movie: MovieWithTrailer) => void;
}

/**
 * Feed Container Component
 * Implements vertical scroll with snap points and active video management
 */
function FeedContainerComponent({
  movies,
  loading,
  hasMore,
  onLoadMore,
  onMovieClick,
}: FeedContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);

  // Set active video when movies load
  useEffect(() => {
    if (movies.length > 0 && activeVideoId === null) {
      setActiveVideoId(movies[0].id);
      console.log('🎬 Setting first video as active:', movies[0].title);
    }
  }, [movies, activeVideoId]);

  /**
   * Handle video visibility change
   */
  const handleVisibilityChange = useCallback(
    (index: number) => (visible: boolean) => {
      if (visible) {
        setCurrentIndex(index);
        setActiveVideoId(movies[index]?.id ?? null);

        // Trigger prefetch when 5 videos from end for smoother experience
        if (hasMore && !loading && index >= movies.length - 5) {
          console.log('🔄 Prefetching next page (5 videos from end)');
          onLoadMore();
        }
      }
    },
    [movies, hasMore, loading, onLoadMore]
  );

  /**
   * Scroll to specific index
   */
  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const targetCard = container.children[index] as HTMLElement;

    if (targetCard) {
      targetCard.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  /**
   * Navigate to previous video
   */
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  }, [currentIndex, scrollToIndex]);

  /**
   * Navigate to next video
   */
  const handleNext = useCallback(() => {
    if (currentIndex < movies.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  }, [currentIndex, movies.length, scrollToIndex]);

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < movies.length - 1;

  return (
    <div className="relative w-full h-[calc(100vh-60px)] overflow-hidden bg-black">
      {/* Vertical scroll container with snap points */}
      <div
        ref={containerRef}
        className="w-full h-[calc(100vh-60px)] overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
        }}
      >
        {/* Hide scrollbar for Webkit browsers */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Video cards */}
        {movies.map((movie, index) => (
          <VideoCard
            key={movie.id}
            movie={movie}
            isActive={movie.id === activeVideoId}
            autoplay={index === 0} // Только первое видео должно автовоспроизводиться
            onVisibilityChange={handleVisibilityChange(index)}
            onMovieClick={onMovieClick}
          />
        ))}

        {/* Loading indicator at bottom */}
        {loading && (
          <div className="w-full h-screen flex-shrink-0 snap-start flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Loading more movies...</p>
            </div>
          </div>
        )}

        {/* End of feed message */}
        {!hasMore && movies.length > 0 && !loading && (
          <div className="w-full h-screen flex-shrink-0 snap-start flex items-center justify-center bg-black">
            <div className="text-center">
              <p className="text-white text-xl mb-2">You've reached the end!</p>
              <p className="text-gray-400">No more movies to show</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation controls */}
      <FeedControls
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
        currentIndex={currentIndex}
        totalCount={movies.length}
      />
    </div>
  );
}

export const FeedContainer = memo(FeedContainerComponent);
