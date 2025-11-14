'use client';

/**
 * Feed Type Selector Component
 * Tab navigation for switching between Movies, TV Shows, and Anime content
 */

import { memo, useState, useEffect, useRef } from 'react';
import { Film, Tv, Sparkles } from 'lucide-react';
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
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { type: 'movie', label: 'Movies', ariaLabel: 'Browse movies', icon: Film },
  { type: 'tv', label: 'TV Shows', ariaLabel: 'Browse TV shows', icon: Tv },
  { type: 'anime', label: 'Anime', ariaLabel: 'Browse anime', icon: Sparkles },
];

/**
 * Feed Type Selector Component
 * Displays horizontal tab bar with content type options
 */
function FeedTypeSelectorComponent({
  selectedType,
  onTypeChange,
}: FeedTypeSelectorProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(() => 
    CONTENT_TYPES.findIndex(({ type }) => type === selectedType)
  );
  const navRef = useRef<HTMLElement>(null);

  // Update focused index when selected type changes
  useEffect(() => {
    setFocusedIndex(CONTENT_TYPES.findIndex(({ type }) => type === selectedType));
  }, [selectedType]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    let newIndex = focusedIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = focusedIndex > 0 ? focusedIndex - 1 : CONTENT_TYPES.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = focusedIndex < CONTENT_TYPES.length - 1 ? focusedIndex + 1 : 0;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onTypeChange(CONTENT_TYPES[focusedIndex].type);
        return;
      default:
        return; // Exit for other keys
    }

    setFocusedIndex(newIndex);
  };

  // Focus the button when focused index changes
  useEffect(() => {
    if (navRef.current) {
      const buttons = navRef.current.querySelectorAll('button[role="tab"]') as NodeListOf<HTMLButtonElement>;
      if (buttons[focusedIndex]) {
        buttons[focusedIndex].focus();
      }
    }
  }, [focusedIndex]);

  return (
    <div className="sticky top-0 z-50 w-full bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-center px-4 py-2 md:py-3">
        <nav
          ref={navRef}
          className="flex items-center gap-1 bg-white/5 rounded-lg p-1"
          role="tablist"
          aria-label="Content type"
          onKeyDown={handleKeyDown}
        >
          {CONTENT_TYPES.map(({ type, label, ariaLabel, icon: Icon }) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={selectedType === type}
              aria-controls={`${type}-panel`}
              aria-label={ariaLabel}
              onClick={() => onTypeChange(type)}
              className={`
                relative flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5
                text-xs md:text-sm font-medium rounded-md transition-all duration-200
                ${selectedType === type
                  ? 'text-white bg-white/20 shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{label}</span>

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
