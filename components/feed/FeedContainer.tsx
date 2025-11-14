'use client';

/**
 * Feed Container - main wrapper for vertical video feed
 */

import { useState, useCallback, useEffect, memo } from 'react';
import { VideoCard } from './VideoCard';
import { FeedControls } from './FeedControls';
import { useActiveVideoIndex } from '@/hooks/useActiveVideoIndex';
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
  const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);

  const handleActiveChange = useCallback(
    (index: number) => {
      setActiveVideoId(movies[index]?.id ?? null);
    },
    [movies]
  );

  const handleNearEnd = useCallback(() => {
    if (hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  const {
    activeIndex,
    containerRef,
    registerCard,
    unregisterCard,
    goNext,
    goPrevious,
  } = useActiveVideoIndex({
    itemCount: movies.length,
    onActiveChange: handleActiveChange,
    onNearEnd: handleNearEnd,
  });

  useEffect(() => {
    if (movies.length > 0 && activeVideoId === null) {
      setActiveVideoId(movies[0].id);
    }
  }, [movies, activeVideoId]);

  const combinedContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      setScrollNode(node);
      containerRef(node);
    },
    [containerRef]
  );

  useEffect(() => {
    if (!scrollNode) return;

    let lastWheelTime = 0;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 60) return;

      const now = Date.now();
      if (now - lastWheelTime < 220) {
        event.preventDefault();
        return;
      }

      lastWheelTime = now;
      event.preventDefault();
      if (event.deltaY > 0) {
        goNext();
      } else {
        goPrevious();
      }
    };

    scrollNode.addEventListener('wheel', handleWheel, { passive: false });
    return () => scrollNode.removeEventListener('wheel', handleWheel);
  }, [scrollNode, goNext, goPrevious]);

  useEffect(() => {
    if (!scrollNode) return;

    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchStartY = event.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchStartTime === 0 || event.changedTouches.length === 0) return;

      const deltaY = event.changedTouches[0].clientY - touchStartY;
      const duration = Date.now() - touchStartTime;

      if (Math.abs(deltaY) > 60 && duration < 400) {
        event.preventDefault();
        if (deltaY < 0) {
          goNext();
        } else {
          goPrevious();
        }
      }

      touchStartTime = 0;
      touchStartY = 0;
    };

    scrollNode.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollNode.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      scrollNode.removeEventListener('touchstart', handleTouchStart);
      scrollNode.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollNode, goNext, goPrevious]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrevious();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrevious]);

  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < movies.length - 1;

  return (
    <div className="relative w-full h-[calc(100vh-60px)] overflow-hidden bg-black">
      {/* Vertical scroll container with snap points */}
      <div
        ref={combinedContainerRef}
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
        {movies.map((movie, index) => {
          const isActive = movie.id === activeVideoId;
          const shouldRenderPlayer = Math.abs(index - activeIndex) <= 1;

          return (
            <VideoCard
              key={movie.id}
              movie={movie}
              isActive={isActive}
              index={index}
              shouldRenderPlayer={shouldRenderPlayer}
              registerCard={registerCard}
              unregisterCard={unregisterCard}
              onMovieClick={onMovieClick}
            />
          );
        })}

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
        onPrevious={goPrevious}
        onNext={goNext}
        currentIndex={activeIndex}
        totalCount={movies.length}
        isBuffering={loading && hasMore}
      />
    </div>
  );
}

export const FeedContainer = memo(FeedContainerComponent);
