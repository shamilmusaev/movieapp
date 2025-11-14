'use client';

/**
 * Video overlay component showing movie metadata and controls
 * Design inspired by modern video streaming apps
 */

import { memo, useState } from 'react';
import type { MovieWithTrailer } from '@/types/feed.types';

interface VideoOverlayProps {
  movie: MovieWithTrailer;
  isMuted: boolean;
  onToggleMute: () => void;
  onMovieClick?: () => void;
}

/**
 * Video Overlay Component
 * Shows movie info at bottom with action buttons on the right side
 */
function VideoOverlayComponent({
  movie,
  isMuted,
  onToggleMute,
  onMovieClick,
}: VideoOverlayProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Get year from release date
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : '2024';

  // Get primary genre
  const primaryGenre = movie.genresDisplay?.[0] || 'Movie';

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Strong bottom gradient for text readability */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {/* Right side action buttons */}
      <div className="absolute right-4 bottom-[max(8rem,calc(8rem+env(safe-area-inset-bottom)))] flex flex-col gap-6 pointer-events-auto z-10">
        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="flex flex-col items-center gap-1 group"
          aria-label="Like"
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
            <svg
              className={`w-7 h-7 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <span className="text-white text-xs font-medium">Like</span>
        </button>

        {/* Save Button */}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className="flex flex-col items-center gap-1 group"
          aria-label="Save"
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
            <svg
              className={`w-7 h-7 transition-colors ${
                isSaved ? 'fill-white text-white' : 'text-white'
              }`}
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <span className="text-white text-xs font-medium">Save</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            // TODO: Implement share functionality
            console.log('Share:', movie.title);
          }}
          className="flex flex-col items-center gap-1 group"
          aria-label="Share"
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </button>

        {/* Sound Button */}
        <button
          onClick={onToggleMute}
          className="flex flex-col items-center gap-1 group"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
            {isMuted ? (
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-[max(2rem,calc(2rem+env(safe-area-inset-bottom)))] pointer-events-auto">
        <div className="max-w-xl">
          {/* Movie Title */}
          <h1
            className="text-white text-3xl font-bold mb-2 leading-tight drop-shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onMovieClick}
          >
            {movie.title}
          </h1>

          {/* Genre and Year */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-200 text-sm font-medium">
              {primaryGenre}
            </span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-200 text-sm">{year}</span>
          </div>

          {/* Genre Chips */}
          {movie.genresDisplay && movie.genresDisplay.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genresDisplay
                .filter(Boolean)
                .slice(0, 4)
                .map((genre, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    {genre}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const VideoOverlay = memo(VideoOverlayComponent);
