# Implementation Tasks: Modernize Feed Stack

## 1. Setup and Dependencies
- [ ] 1.1 Install react-player package (`npm install react-player`)
- [ ] 1.2 Install swr package (`npm install swr`)
- [ ] 1.3 Verify packages installed correctly (`npm list react-player swr`)

## 2. Create New VideoPlayer Component
- [ ] 2.1 Create `components/video/VideoPlayer.tsx` with react-player wrapper
- [ ] 2.2 Add light mode support (thumbnail before play)
- [ ] 2.3 Add support for YouTube URLs
- [ ] 2.4 Add support for direct video file URLs (for TMDB hosted videos)
- [ ] 2.5 Implement mute toggle with localStorage persistence
- [ ] 2.6 Add proper TypeScript types for all props
- [ ] 2.7 Add error handling and fallback UI
- [ ] 2.8 Test VideoPlayer in isolation with sample YouTube URL

## 3. Create SWR-based Data Fetching Hook
- [ ] 3.1 Create `hooks/useFeedData.ts` with SWR integration
- [ ] 3.2 Implement infinite scroll with `useSWRInfinite`
- [ ] 3.3 Add proper caching configuration (revalidateOnFocus: false, dedupingInterval: 60000)
- [ ] 3.4 Add TypeScript types for feed data
- [ ] 3.5 Implement error handling and retry logic
- [ ] 3.6 Add loading states (isLoading, isValidating)
- [ ] 3.7 Test hook with mock API responses

## 4. Simplify API Route
- [ ] 4.1 Open `app/api/feed/trending/route.ts`
- [ ] 4.2 Remove all EventSource/SSE code
- [ ] 4.3 Change to simple JSON response with `Response.json()`
- [ ] 4.4 Keep ISR caching (`export const revalidate = 1800`)
- [ ] 4.5 Return structure: `{ movies: MovieWithTrailer[], hasMore: boolean, page: number }`
- [ ] 4.6 Test endpoint with curl or Postman
- [ ] 4.7 Verify ISR caching works correctly

## 5. Optimize Intersection Observer Hook
- [ ] 5.1 Open `hooks/useVideoIntersection.ts`
- [ ] 5.2 Wrap onVisibilityChange callback parameter in useRef
- [ ] 5.3 Use useCallback for internal observer callback
- [ ] 5.4 Ensure observer is created once, not on every render
- [ ] 5.5 Add proper cleanup in useEffect return
- [ ] 5.6 Test that observer doesn't recreate on unrelated re-renders

## 6. Refactor Feed Page with SWR and useTransition
- [ ] 6.1 Open `app/feed/page.tsx`
- [ ] 6.2 Import and use `useTransition` from React
- [ ] 6.3 Replace `useStreamingFeedData` with new `useFeedData` hook
- [ ] 6.4 Wrap content type changes in `startTransition`
- [ ] 6.5 Remove duplicate state (keep single source of truth)
- [ ] 6.6 Add `isPending` state to show transition loading
- [ ] 6.7 Simplify state management (remove triple-state pattern)
- [ ] 6.8 Test tab switching is smooth and non-blocking

## 7. Optimize FeedContainer Component
- [ ] 7.1 Open `components/feed/FeedContainer.tsx`
- [ ] 7.2 Wrap all event handlers in `useCallback` with proper dependencies
- [ ] 7.3 Wrap computed values in `useMemo`
- [ ] 7.4 Ensure handleVisibilityChange is stable (useCallback)
- [ ] 7.5 Verify scrollToIndex doesn't cause layout thrashing
- [ ] 7.6 Remove all console.log statements
- [ ] 7.7 Test that container doesn't re-render unnecessarily

## 8. Optimize VideoCard Component
- [ ] 8.1 Open `components/feed/VideoCard.tsx`
- [ ] 8.2 Replace `YouTubePlayer` with new `VideoPlayer` component
- [ ] 8.3 Wrap component in `React.memo` with custom comparator
- [ ] 8.4 Custom comparator should check: movie.id, isActive, isMuted
- [ ] 8.5 Ensure onVisibilityChange callback is from useCallback in parent
- [ ] 8.6 Remove priority flag from all images except first
- [ ] 8.7 Remove all console.log statements
- [ ] 8.8 Test that card only re-renders when props actually change

## 9. Remove Old Code
- [ ] 9.1 Delete `hooks/useStreamingFeedData.ts` (replaced by useFeedData)
- [ ] 9.2 Delete `hooks/useVideoPlayer.ts` (react-player has built-in state)
- [ ] 9.3 Delete `components/video/YouTubePlayer.tsx` (replaced by VideoPlayer)
- [ ] 9.4 Update all imports across codebase
- [ ] 9.5 Search for and remove any remaining console.log statements (`rg "console\\.log" --type ts --type tsx`)
- [ ] 9.6 Remove commented-out code

## 10. Testing and Validation
- [ ] 10.1 Test autoplay on Movies tab (should work on all videos)
- [ ] 10.2 Test autoplay on TV Shows tab
- [ ] 10.3 Test autoplay on Anime tab
- [ ] 10.4 Test tab switching is smooth (<100ms freeze)
- [ ] 10.5 Test infinite scroll loads more movies correctly
- [ ] 10.6 Test mute toggle persists across videos
- [ ] 10.7 Test video light mode shows thumbnail before play
- [ ] 10.8 Test error handling (invalid video URL)
- [ ] 10.9 Test on Chrome Desktop
- [ ] 10.10 Test on iOS Safari (if possible)
- [ ] 10.11 Test on Android Chrome (if possible)
- [ ] 10.12 Verify no memory leaks (Chrome DevTools Memory profiler)
- [ ] 10.13 Verify 60 FPS scrolling (Chrome DevTools Performance)

## 11. Build and Type Checking
- [ ] 11.1 Run `npm run build`
- [ ] 11.2 Fix any TypeScript errors
- [ ] 11.3 Fix any build warnings
- [ ] 11.4 Verify bundle size increase is acceptable (<50KB)
- [ ] 11.5 Check that ISR routes are generated correctly

## 12. Documentation and Cleanup
- [ ] 12.1 Update component comments and JSDoc
- [ ] 12.2 Ensure all new code follows TypeScript strict mode
- [ ] 12.3 Verify code follows project conventions (PascalCase, camelCase, etc.)
- [ ] 12.4 Double-check no console.log statements remain

## 13. Git Workflow
- [ ] 13.1 Stage all changes (`git add .`)
- [ ] 13.2 Create commit with descriptive message following project conventions
- [ ] 13.3 Push to GitHub (`git push`)
- [ ] 13.4 Update this tasks.md to mark all tasks complete

## Notes
- Mark each task with `[x]` when completed
- Test continuously during implementation, don't wait until end
- If build fails at step 11, go back and fix issues before proceeding
- Priority: Get autoplay working 100% reliably before optimizing further
