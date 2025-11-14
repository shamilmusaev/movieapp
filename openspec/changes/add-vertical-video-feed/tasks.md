# Implementation Tasks

## 1. Feed Data Layer
- [ ] 1.1 Create `/types/feed.types.ts` with FeedMovie, FeedState, and pagination types
- [ ] 1.2 Create `/lib/utils/feed.ts` with functions: transformMovieForFeed, extractBestTrailer, computeTMDBImageUrl
- [ ] 1.3 Create `/hooks/useFeedData.ts` hook for fetching trending movies with pagination
- [ ] 1.4 Implement deduplication logic in useFeedData (track viewed movie IDs in state)
- [ ] 1.5 Add error handling and retry logic for failed API requests
- [ ] 1.6 Implement batch trailer fetching with concurrency limit (5 concurrent requests)

## 2. Video Player Component
- [ ] 2.1 Create `/components/video/YouTubePlayer.tsx` component with iframe embed
- [ ] 2.2 Configure YouTube iframe parameters: autoplay, mute, controls, loop, modestbranding, rel=0
- [ ] 2.3 Implement responsive 16:9 aspect ratio container
- [ ] 2.4 Add loading state with spinner overlay
- [ ] 2.5 Add error state with retry button and poster fallback
- [ ] 2.6 Create `/hooks/useVideoPlayer.ts` for managing player state (playing, muted, loading, error)
- [ ] 2.7 Implement mute toggle with localStorage persistence
- [ ] 2.8 Add tap-to-pause/play functionality

## 3. Video Card Component
- [ ] 3.1 Create `/components/feed/VideoCard.tsx` component
- [ ] 3.2 Integrate YouTubePlayer component
- [ ] 3.3 Create poster-only fallback view for movies without trailers
- [ ] 3.4 Create `/components/feed/VideoOverlay.tsx` with gradient background
- [ ] 3.5 Display movie title, genre chips, and rating in overlay
- [ ] 3.6 Add mute/unmute button to overlay
- [ ] 3.7 Style genre chips with Tailwind CSS (rounded pills, subtle background)
- [ ] 3.8 Ensure text readability with sufficient contrast (dark gradient or text shadows)

## 4. Feed Container and Navigation
- [ ] 4.1 Create `/components/feed/FeedContainer.tsx` as main feed wrapper
- [ ] 4.2 Implement vertical scroll container with snap points (scroll-snap-type: y mandatory)
- [ ] 4.3 Create `/components/feed/FeedControls.tsx` with previous/next arrow buttons
- [ ] 4.4 Add swipe gesture detection using touch events or library (react-use-gesture recommended)
- [ ] 4.5 Implement smooth scroll transitions between videos
- [ ] 4.6 Add navigation state management (current index, can go previous/next)
- [ ] 4.7 Disable previous button on first video, show "End of feed" on last

## 5. Single Active Player Logic
- [ ] 5.1 Create `/hooks/useVideoIntersection.ts` using Intersection Observer API
- [ ] 5.2 Track which video is currently >50% visible in viewport
- [ ] 5.3 Implement autoplay logic: play visible video, pause others
- [ ] 5.4 Add cleanup to unmount off-screen video iframes (>2 positions away)
- [ ] 5.5 Implement preload next video when current video is active for 3+ seconds

## 6. Infinite Scroll Pagination
- [ ] 6.1 Detect when user is within 3 videos of the end
- [ ] 6.2 Trigger pagination: fetch next page from useFeedData hook
- [ ] 6.3 Show loading indicator at bottom of feed during pagination
- [ ] 6.4 Handle "no more results" state with end-of-feed message
- [ ] 6.5 Prevent duplicate pagination requests (loading flag)

## 7. Feed Page Implementation
- [ ] 7.1 Create `/app/feed/page.tsx` as main feed route
- [ ] 7.2 Integrate FeedContainer, VideoCard, and FeedControls
- [ ] 7.3 Use useFeedData hook to fetch initial trending movies
- [ ] 7.4 Implement loading skeleton for initial load (3-4 card skeletons)
- [ ] 7.5 Implement error boundary with ErrorBoundary component
- [ ] 7.6 Add "Retry" functionality on error state
- [ ] 7.7 Update `/app/page.tsx` to redirect to `/feed` or embed feed directly

## 8. Mobile-First Responsive Styling
- [ ] 8.1 Style feed for mobile portrait: 100vw x 100vh per video card
- [ ] 8.2 Add responsive breakpoints: center and max-width on tablet/desktop
- [ ] 8.3 Test swipe gestures on real mobile devices (iOS Safari, Chrome Android)
- [ ] 8.4 Ensure touch targets are >44px for buttons (accessibility)
- [ ] 8.5 Test landscape mode handling (video maintains aspect ratio)

## 9. Performance Optimizations
- [ ] 9.1 Implement lazy loading for VideoCard iframes (load on visibility)
- [ ] 9.2 Add React.memo to VideoCard to prevent unnecessary re-renders
- [ ] 9.3 Use useCallback for event handlers in FeedContainer
- [ ] 9.4 Optimize re-renders: separate video state from feed list state
- [ ] 9.5 Add performance monitoring: log video load times, scroll FPS (console for MVP)

## 10. Genre Integration
- [ ] 10.1 Fetch genre list on app initialization (useFeedData or separate hook)
- [ ] 10.2 Cache genre list in React context or global state
- [ ] 10.3 Map genre IDs to names in transformMovieForFeed utility
- [ ] 10.4 Limit displayed genres to 3 max per movie
- [ ] 10.5 Handle missing/unknown genre IDs gracefully (skip and log warning)

## 11. Testing and Validation
- [ ] 11.1 Test feed with real TMDB API (verify trending movies load)
- [ ] 11.2 Test trailer extraction (verify official trailers are selected)
- [ ] 11.3 Test movies without trailers (verify poster fallback works)
- [ ] 11.4 Test pagination (scroll through 40+ movies)
- [ ] 11.5 Test single active player (verify only one video plays at a time)
- [ ] 11.6 Test mute toggle and persistence across videos
- [ ] 11.7 Test on mobile devices (iOS Safari, Android Chrome)
- [ ] 11.8 Test error states (invalid API key, network failure, blocked videos)
- [ ] 11.9 Test performance: verify smooth 60 FPS scrolling
- [ ] 11.10 Run `npm run build` to check for TypeScript errors

## 12. Error Handling and Edge Cases
- [ ] 12.1 Handle TMDB API errors (rate limit, service unavailable)
- [ ] 12.2 Handle YouTube embed failures (blocked videos, region restrictions)
- [ ] 12.3 Handle empty trending results (unlikely but possible)
- [ ] 12.4 Add user-friendly error messages for all error states
- [ ] 12.5 Test iOS autoplay restrictions (show play button if needed)

## 13. Documentation and Code Quality
- [ ] 13.1 Add JSDoc comments to all hook functions
- [ ] 13.2 Add inline comments for complex logic (intersection observer, pagination trigger)
- [ ] 13.3 Ensure all components have proper TypeScript types
- [ ] 13.4 Review and refactor for code clarity
- [ ] 13.5 Update README with feed feature description if applicable

## Notes
- Focus on MVP experience: trending movies only, basic video playback
- Keep components small and focused (single responsibility)
- Test on real devices early and often
- Prioritize performance: 60 FPS scrolling is critical for UX
- Use React DevTools to monitor re-renders and optimize
