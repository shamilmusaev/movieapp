# Implementation Tasks

## 1. Server-Side Route Handler Setup
- [ ] 1.1 Create `/app/api/feed/trending/route.ts` file
- [ ] 1.2 Implement GET handler with page parameter parsing from URL search params
- [ ] 1.3 Configure ISR with `export const revalidate = 3600`
- [ ] 1.4 Add TypeScript types for request query params and response format
- [ ] 1.5 Implement basic error handling and try-catch blocks

## 2. Server-Side Data Aggregation Logic
- [ ] 2.1 Import existing TMDB functions (`getTrendingMovies`, `getMovieById`)
- [ ] 2.2 Fetch trending movies list (single request to TMDB)
- [ ] 2.3 Slice first 10 movies for processing (or configurable limit)
- [ ] 2.4 Create parallel fetch logic with `Promise.allSettled` for movie details
- [ ] 2.5 Use `append_to_response=videos` parameter in `getMovieById` calls
- [ ] 2.6 Handle settled promises (fulfilled vs rejected) gracefully
- [ ] 2.7 Filter out failed movie fetches and log warnings

## 3. Server-Side Data Transformation
- [ ] 3.1 Create server-side utility function `transformMovieForFeedServer` in `/lib/utils/feed-server.ts`
- [ ] 3.2 Extract best trailer from videos array using existing `extractBestTrailer` logic
- [ ] 3.3 Compute full image URLs for poster and backdrop
- [ ] 3.4 Format release year, rating, and other display fields
- [ ] 3.5 Return FeedMovie objects with all required fields
- [ ] 3.6 Add JSDoc comments to transformation functions

## 4. API Response Format and Types
- [ ] 4.1 Create `FeedApiResponse` type in `/types/api.types.ts`
- [ ] 4.2 Include fields: `movies: FeedMovie[]`, `page: number`, `totalPages: number`, `hasMore: boolean`
- [ ] 4.3 Update Route Handler to return NextResponse with typed JSON
- [ ] 4.4 Add status codes for success (200), cache hit (200), errors (500, 404)

## 5. Client-Side Hook Refactoring
- [ ] 5.1 **BREAKING:** Update `useFeedData` to call `/api/feed/trending` instead of direct TMDB
- [ ] 5.2 Replace `fetchMovies` function logic with `fetch('/api/feed/trending?page=X')`
- [ ] 5.3 Remove client-side `transformMovieForFeed` calls (data is pre-transformed)
- [ ] 5.4 Simplify state management (no need for batching, rate limiting logic)
- [ ] 5.5 Keep deduplication logic (viewedMovieIds set) unchanged

## 6. Remove Genre Loading Blocker
- [ ] 6.1 Remove `if (genreMap.size === 0) return;` check from `loadInitial` function
- [ ] 6.2 Update `transformMovieForFeed` (if still used) to handle missing genre map
- [ ] 6.3 Show genre IDs as fallback in VideoOverlay component when names unavailable
- [ ] 6.4 Implement async genre name hydration in useEffect
- [ ] 6.5 Test that feed loads immediately even if genres fail to load

## 7. Progressive Rendering Implementation
- [ ] 7.1 Update `useFeedData` to support incremental state updates
- [ ] 7.2 Add `addMovies` function that appends to existing movies array
- [ ] 7.3 Implement progressive data arrival pattern (if using streaming, or batch rendering)
- [ ] 7.4 Add loading skeleton for positions where data is still pending
- [ ] 7.5 Test that first 3 cards render before all 10 are ready (if progressive)

## 8. Prefetching Next Page
- [ ] 8.1 Add logic in FeedContainer to detect when user is 5 videos from end
- [ ] 8.2 Trigger `loadMore` prefetch call before user reaches last video
- [ ] 8.3 Use React `useEffect` with dependency on current video index
- [ ] 8.4 Ensure prefetch doesn't trigger multiple times (loading flag)
- [ ] 8.5 Test smooth pagination with no loading delay when scrolling fast

## 9. Error Handling and Edge Cases
- [ ] 9.1 Handle Route Handler TMDB API failures (return 500 with error message)
- [ ] 9.2 Handle empty trending results (return empty movies array)
- [ ] 9.3 Handle partial failures (some movies fail, others succeed)
- [ ] 9.4 Add user-friendly error messages in FeedContainer for API errors
- [ ] 9.5 Implement retry logic in client hook for failed feed requests
- [ ] 9.6 Add fallback to old direct TMDB logic if Route Handler unavailable (optional feature flag)

## 10. Caching and Performance Validation
- [ ] 10.1 Verify ISR cache works: check Next.js cache headers in browser dev tools
- [ ] 10.2 Test cache revalidation: wait 1 hour and verify fresh data fetched
- [ ] 10.3 Monitor server logs to confirm TMDB calls are minimized (cache hits)
- [ ] 10.4 Measure initial load time with Chrome DevTools Performance tab
- [ ] 10.5 Validate target: <1s initial load, <500ms time to first content
- [ ] 10.6 Test on mobile 4G throttled connection

## 11. Cleanup and Code Quality
- [ ] 11.1 Remove unused client-side transformation logic from `/lib/utils/feed.ts` (if fully replaced)
- [ ] 11.2 Update JSDoc comments in `useFeedData` hook
- [ ] 11.3 Add inline comments for complex Route Handler logic
- [ ] 11.4 Ensure all new functions have proper TypeScript types
- [ ] 11.5 Run `npm run build` to check for TypeScript errors
- [ ] 11.6 Run ESLint and fix any warnings

## 12. Testing
- [ ] 12.1 Test Route Handler endpoint directly: `curl http://localhost:3000/api/feed/trending?page=1`
- [ ] 12.2 Verify response format matches FeedApiResponse type
- [ ] 12.3 Test pagination: request pages 1, 2, 3 and verify unique movies
- [ ] 12.4 Test error handling: simulate TMDB API failure (invalid API key)
- [ ] 12.5 Test genre hydration: verify feed loads before genres finish loading
- [ ] 12.6 Test progressive rendering: verify cards appear incrementally
- [ ] 12.7 Test prefetching: scroll fast and verify smooth pagination
- [ ] 12.8 Test on mobile devices: iOS Safari and Chrome Android

## 13. Performance Benchmarking
- [ ] 13.1 Measure "before" metrics: record current load times with console timestamps
- [ ] 13.2 Implement changes and measure "after" metrics
- [ ] 13.3 Compare: initial load time, time to first content, pagination time
- [ ] 13.4 Validate targets achieved: <1s initial, <500ms first content, <800ms pagination
- [ ] 13.5 Run Lighthouse performance audit and compare scores
- [ ] 13.6 Document performance improvements in commit message

## 14. Documentation
- [ ] 14.1 Update README with new Route Handler architecture (if applicable)
- [ ] 14.2 Add comments explaining ISR caching behavior
- [ ] 14.3 Document performance optimization decisions in code comments
- [ ] 14.4 Update any existing API documentation for feed endpoints

## Notes
- Prioritize getting Route Handler working first (tasks 1-4)
- Client refactoring (tasks 5-7) can happen in parallel after Route Handler is stable
- Focus on measurable performance improvements (task 13)
- Keep old logic temporarily for rollback option (feature flag)
- Test thoroughly on real devices, not just desktop browser
