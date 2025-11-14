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
  isBuffering?: boolean;
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
  isBuffering = false,
}: FeedControlsProps) {
  const disablePrev = !canGoPrevious;
  const disableNext = !canGoNext || isBuffering;

  return (
    <>
      {/* Previous button */}
      <button
        onClick={onPrevious}
        disabled={disablePrev}
        className={`absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10 ${
          disablePrev
            ? 'bg-black/30 text-white/40 cursor-not-allowed'
            : 'bg-black/50 text-white hover:bg-black/70'
        }`}
        aria-label="Previous video"
        aria-disabled={disablePrev}
      >
        <svg
          className="w-6 h-6"
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

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={disableNext}
        className={`absolute bottom-24 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10 ${
          disableNext
            ? 'bg-black/30 text-white/40 cursor-not-allowed'
            : 'bg-black/50 text-white hover:bg-black/70'
        }`}
        aria-label={isBuffering ? 'Loading more videos' : 'Next video'}
        aria-disabled={disableNext}
      >
        <svg
          className="w-6 h-6"
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

      {/* Position indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full z-10"
        aria-live="polite"
      >
        <p className="text-white text-sm font-medium">
          {currentIndex + 1} / {Math.max(totalCount, 1)}
        </p>
        {isBuffering && (
          <p className="text-[11px] text-white/70 mt-0.5 text-center tracking-wide uppercase">
            Fetching more...
          </p>
        )}
      </div>
    </>
  );
}

export const FeedControls = memo(FeedControlsComponent);
