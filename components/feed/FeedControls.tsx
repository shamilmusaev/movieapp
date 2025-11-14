'use client';

/**
 * Feed navigation controls component
 */

import { memo } from 'react';

interface FeedControlsProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalCount: number;
}

/**
 * Feed Controls Component
 * Shows previous/next buttons and current position indicator
 */
function FeedControlsComponent({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  currentIndex,
  totalCount,
}: FeedControlsProps) {
  return (
    <>
      {/* Previous button */}
      {canGoPrevious && (
        <button
          onClick={onPrevious}
          className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
          aria-label="Previous video"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}

      {/* Next button */}
      {canGoNext && (
        <button
          onClick={onNext}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
          aria-label="Next video"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {/* Position indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full z-10">
        <p className="text-white text-sm font-medium">
          {currentIndex + 1} / {totalCount}
        </p>
      </div>
    </>
  );
}

export const FeedControls = memo(FeedControlsComponent);
