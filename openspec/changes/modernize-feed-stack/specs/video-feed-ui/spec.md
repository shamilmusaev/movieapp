# Video Feed UI Specification Deltas

## MODIFIED Requirements

### Requirement: Feed Navigation Controls
The system SHALL provide touch gesture and button-based navigation with optimized performance using React 19 useTransition and proper memoization to prevent unnecessary re-renders.

#### Scenario: Memoized navigation handlers prevent re-renders
- **GIVEN** FeedContainer with navigation buttons
- **WHEN** feed data updates (new page loaded)
- **THEN** navigation button callbacks are stable (useCallback) and don't cause child re-renders

#### Scenario: Scroll position updates use RAF
- **GIVEN** user scrolls feed rapidly
- **WHEN** scroll events fire
- **THEN** position updates use requestAnimationFrame to prevent layout thrashing

#### Scenario: VideoCard renders only when props change
- **GIVEN** feed receives new data unrelated to specific card
- **WHEN** React reconciles
- **THEN** VideoCard wrapped in React.memo doesn't re-render unless movie, isActive, or isMuted changed

### Requirement: Infinite Scroll Pagination
The system SHALL use SWR's useSWRInfinite hook for pagination, providing automatic caching, deduplication, and optimistic UI updates.

#### Scenario: SWR manages pagination state
- **GIVEN** user approaches end of current page
- **WHEN** pagination triggers
- **THEN** useSWRInfinite automatically fetches next page and merges with existing data

#### Scenario: Cached pages return instantly
- **GIVEN** user switches to TV tab then back to Movies
- **WHEN** Movies data is requested
- **THEN** SWR cache returns data instantly without API call

#### Scenario: Automatic request deduplication
- **GIVEN** multiple components request same feed page
- **WHEN** requests are made simultaneously
- **THEN** SWR deduplicates and makes single API call

#### Scenario: Optimistic UI for smoother UX
- **GIVEN** next page is being fetched
- **WHEN** user continues scrolling
- **THEN** existing content remains visible (stale-while-revalidate pattern)

### Requirement: Feed Loading States
The system SHALL use SWR's built-in loading states (isLoading, isValidating, error) instead of custom loading state management, with React 19 useTransition for smooth content type switches.

#### Scenario: SWR provides loading state
- **GIVEN** feed data is being fetched
- **WHEN** checking loading state
- **THEN** useSWRInfinite returns isLoading: true

#### Scenario: Validating state shows background refresh
- **GIVEN** cached data is being revalidated
- **WHEN** checking validation state
- **THEN** SWR returns isValidating: true while showing cached content

#### Scenario: useTransition prevents UI freeze on tab switch
- **GIVEN** user clicks different content type tab
- **WHEN** state update occurs
- **THEN** useTransition keeps UI responsive, shows isPending state during transition

#### Scenario: Error state from SWR
- **GIVEN** API request fails
- **WHEN** SWR detects error
- **THEN** error object is available from useSWRInfinite return value

## REMOVED Requirements

### Requirement: Feed Loading States - Custom SSE handling
**Reason:** SWR provides built-in loading, error, and validation states. No need for custom EventSource loading state management (streamingStatus, etc.).

**Migration:** Remove custom loading state logic. Use SWR's isLoading, isValidating, and error states directly.

## ADDED Requirements

### Requirement: React 19 Performance Optimizations
The system SHALL use React 19 features (useTransition, automatic batching) and proper memoization (useMemo, useCallback, React.memo) to achieve 60 FPS scrolling and <100ms UI responsiveness.

#### Scenario: useTransition for non-blocking state updates
- **GIVEN** user switches content type tabs
- **WHEN** content type state changes
- **THEN** update wrapped in startTransition keeps UI responsive

#### Scenario: VideoCard memoization with custom comparator
- **GIVEN** VideoCard component
- **WHEN** wrapped in React.memo
- **THEN** custom comparator checks movie.id, isActive, isMuted to prevent unnecessary renders

#### Scenario: Stable callback references
- **GIVEN** FeedContainer event handlers (onVisibilityChange, scrollToIndex)
- **WHEN** component renders
- **THEN** handlers wrapped in useCallback with proper dependencies to maintain reference stability

#### Scenario: Computed values memoized
- **GIVEN** derived state like activeIndex, hasMore
- **WHEN** dependencies haven't changed
- **THEN** values wrapped in useMemo to prevent recalculation

#### Scenario: Intersection observer callback stability
- **GIVEN** useVideoIntersection hook
- **WHEN** observer initializes
- **THEN** visibility callback is stable (useCallback or useRef) to prevent observer recreation

### Requirement: Component Memoization Strategy
The system SHALL memoize VideoCard components using React.memo with custom comparison function to prevent re-renders when movie data hasn't changed.

#### Scenario: VideoCard memo with custom comparator
- **GIVEN** VideoCard receives props: movie, isActive, isMuted, onVisibilityChange
- **WHEN** parent re-renders with new unrelated state
- **THEN** React.memo comparator checks if movie.id, isActive, isMuted changed; skips render if unchanged

#### Scenario: Memo comparator implementation
- **GIVEN** React.memo second argument (comparison function)
- **WHEN** comparing prev and next props
- **THEN** return true if props haven't meaningfully changed (strict equality for primitives, ID check for objects)

#### Scenario: onVisibilityChange callback stability
- **GIVEN** parent passes onVisibilityChange callback to VideoCard
- **WHEN** callback is created with useCallback
- **THEN** VideoCard memo doesn't break due to unstable callback reference

### Requirement: Eliminate Console Logging
The system SHALL remove all console.log statements from production code to improve runtime performance and reduce noise.

#### Scenario: No console.log in feed components
- **GIVEN** production build
- **WHEN** searching codebase for console.log
- **THEN** zero console.log statements found in feed-related files

#### Scenario: Debug logging only in development
- **GIVEN** need for debugging during development
- **WHEN** adding logging
- **THEN** use conditional logging (if (process.env.NODE_ENV === 'development'))

#### Scenario: Performance overhead eliminated
- **GIVEN** console.log removed from hot paths (intersection observer, scroll events)
- **WHEN** measuring performance
- **THEN** measurable performance improvement in frame rate

### Requirement: Intersection Observer Optimization
The system SHALL create Intersection Observer once per VideoCard with stable callback reference, not recreating on every render.

#### Scenario: Observer created once per VideoCard
- **GIVEN** VideoCard mounts
- **WHEN** useVideoIntersection hook initializes
- **THEN** Intersection Observer created once and reused

#### Scenario: Callback reference stabilized
- **GIVEN** visibility change callback passed to hook
- **WHEN** parent re-renders
- **THEN** callback wrapped in useRef or useCallback to prevent observer recreation

#### Scenario: Proper cleanup on unmount
- **GIVEN** VideoCard unmounts
- **WHEN** cleanup runs
- **THEN** Intersection Observer disconnects and frees resources

#### Scenario: No observer churn
- **GIVEN** feed scrolling rapidly
- **WHEN** VideoCards render and re-render
- **THEN** observers persist without disconnect/reconnect cycles

### Requirement: Smooth Content Type Switching
The system SHALL use React 19 useTransition to keep UI responsive when switching between Movies, TV Shows, and Anime tabs.

#### Scenario: Non-blocking tab switch
- **GIVEN** user clicks TV Shows tab while on Movies
- **WHEN** content type changes
- **THEN** UI remains interactive (no freeze) while new data loads

#### Scenario: isPending state shows transition
- **GIVEN** content type changing
- **WHEN** in transition period
- **THEN** isPending state is true, allowing loading indicator display

#### Scenario: Cached data shows instantly
- **GIVEN** user switches back to previously viewed tab
- **WHEN** SWR cache has data
- **THEN** transition completes instantly without API call

#### Scenario: Old content visible during load
- **GIVEN** switching to new tab without cached data
- **WHEN** waiting for API response
- **THEN** previous content remains visible (prevents white screen flash)
