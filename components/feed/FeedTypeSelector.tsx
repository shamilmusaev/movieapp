'use client';

/**
 * Feed Type Selector Component
 * Tab navigation for switching between Movies, TV Shows, and Anime content
 */

import { memo } from 'react';
import type { FeedContentType } from '@/types/feed.types';

interface FeedTypeSelectorProps {
  /**
   * Currently selected content type
   */
  selectedType: FeedContentType;

  /**
   * Callback when type changes
   */
  onTypeChange: (type: FeedContentType) => void;
}

/**
 * Content type configuration
 */
const CONTENT_TYPES: Array<{
  type: FeedContentType;
  label: string;
  ariaLabel: string;
}> = [
  { type: 'movie', label: 'Movies', ariaLabel: 'Browse movies' },
  { type: 'tv', label: 'TV Shows', ariaLabel: 'Browse TV shows' },
  { type: 'anime', label: 'Anime', ariaLabel: 'Browse anime' },
];

/**
 * Feed Type Selector Component
 * Displays horizontal tab bar with content type options
 */
function FeedTypeSelectorComponent({
  selectedType,
  onTypeChange,
}: FeedTypeSelectorProps) {
  return (
    <div className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-center px-4 py-3">
        <nav 
          className="flex items-center gap-1 bg-white/5 rounded-lg p-1"
          role="tablist"
          aria-label="Content type"
        >
          {CONTENT_TYPES.map(({ type, label, ariaLabel }) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={selectedType === type}
              aria-controls={`${type}-panel`}
              aria-label={ariaLabel}
              onClick={() => onTypeChange(type)}
              className={`
                relative px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                ${selectedType === type
                  ? 'text-white bg-white/20 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {label}
              
              {/* Active indicator */}
              {selectedType === type && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export const FeedTypeSelector = memo(FeedTypeSelectorComponent);
