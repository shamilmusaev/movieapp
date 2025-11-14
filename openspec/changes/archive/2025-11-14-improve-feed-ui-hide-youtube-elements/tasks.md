# Implementation Tasks

## 1. YouTube UI Hiding Enhancements with Corner Blocks
- [x] 1.1 **Critical:** Remove any reliance on `showinfo=0` parameter (removed by YouTube, does NOT work)
- [x] 1.2 Update `YouTubePlayer.tsx`: Add top-left overlay block (200px width × 70px height) to cover channel avatar and title start
- [x] 1.3 Update `YouTubePlayer.tsx`: Add top-right overlay block (200px width × 70px height) to cover "Copy link" and "1/1" counter
- [x] 1.4 Update `YouTubePlayer.tsx`: Add bottom overlay (full width × 50px height) to cover progress bar
- [x] 1.5 Position overlays with `absolute`, use `bg-black` or `bg-gradient-to-center from-black` for smooth masking
- [x] 1.6 Ensure ALL overlays have `pointer-events: none` to allow swipe/tap gestures through them
- [x] 1.7 Add z-index management: overlays above iframe but below VideoOverlay content
- [x] 1.8 Test on Chrome, Safari, mobile Safari (iOS), Chrome Android to verify ALL YouTube UI elements hidden
- [x] 1.9 Test different aspect ratios (16:9, 4:3, portrait) to ensure corner blocks adapt correctly

## 2. Content Type System Setup with Independent State Structure
- [x] 2.1 Create `FeedContentType` type in `/types/feed.types.ts`: `'movie' | 'tv' | 'anime'`
- [x] 2.2 Create `FeedStateMap` type: `Record<FeedContentType, FeedState>`
- [x] 2.3 Update `FeedState` to include: `movies`, `page`, `hasMore`, `viewedMovieIds`, `loading`, `error`
- [x] 2.4 Refactor `useFeedData` to maintain `feedStateMap: Record<FeedContentType, FeedState>`
- [x] 2.5 Implement state initialization: create empty FeedState when switching to new content type
- [x] 2.6 Implement state restoration: retrieve cached FeedState when returning to previously viewed content type
- [x] 2.7 Add session storage utility: `getSelectedContentType()`, `setSelectedContentType()`
- [x] 2.8 Ensure independent pagination: scrolling in Movies doesn't affect TV Shows page counter

## 3. FeedTypeSelector Component
- [x] 3.1 Create `/components/feed/FeedTypeSelector.tsx` component
- [x] 3.2 Implement three tab buttons: "Movies", "TV Shows", "Anime"
- [x] 3.3 Style tabs with Tailwind: inactive (text-gray-400), active (text-white + bottom border)
- [x] 3.4 Add smooth transition animation for active indicator (underline or background)
- [x] 3.5 Accept `selectedType` and `onTypeChange` props
- [x] 3.6 Add click handlers that call `onTypeChange(type)`
- [x] 3.7 Make tab bar responsive: horizontal scroll on small screens if needed
- [x] 3.8 Add accessibility: proper ARIA labels and keyboard navigation

## 4. Feed Page Integration
- [x] 4.1 Import `FeedTypeSelector` in `/app/feed/page.tsx`
- [x] 4.2 Add state for `selectedContentType` using `useState` (initialize from session storage)
- [x] 4.3 Pass `contentType` to `useFeedData(selectedContentType)` hook
- [x] 4.4 Render `FeedTypeSelector` at top of page, above `FeedContainer`
- [x] 4.5 Position tab bar as fixed or sticky at top with proper z-index
- [x] 4.6 Handle tab change: update state, save to session storage, trigger feed reload
- [x] 4.7 Adjust `FeedContainer` height: `h-[calc(100vh-60px)]` to account for tab bar

## 5. API Route Updates with Multi-Stage Anime Discover
- [x] 5.1 Update `/app/api/feed/trending/route.ts` to accept `media_type` query parameter ('movie' | 'tv' | 'anime')
- [x] 5.2 Map content types: 'movie' → `/trending/movie/day`, 'tv' → `/trending/tv/day`
- [x] 5.3 For 'anime' - implement multi-stage fallback strategy:
  - [x] 5.3a **Stage 1:** Primary `/discover/movie` with:
    - `with_origin_country=JP` (broader than region)
    - `with_genres=16` (Animation)
    - `sort_by=popularity.desc`
    - `vote_count.gte=50` (lower threshold)
  - [x] 5.3b **Stage 2:** If results < 10, retry without `with_original_language` constraint
  - [x] 5.3c **Stage 3:** If still insufficient, try:
    - `with_keywords=210024` (anime keyword ID)
    - `with_genres=16`
    - `sort_by=popularity.desc`
  - [x] 5.3d **Stage 4 (alternative):** Use `/trending/tv` and filter client-side for Animation genre
- [x] 5.4 **Critical:** For anime, `/discover` does NOT support `append_to_response=videos`
  - [x] 5.4a Fetch anime movie list from `/discover/movie`
  - [x] 5.4b Make separate parallel requests to `/movie/{id}/videos` for each anime movie
  - [x] 5.4c Use `Promise.allSettled` to handle movies without trailers
  - [x] 5.4d If >50% have no trailers, trigger fallback to next stage
  - [x] 5.4e Aggregate results before returning to client
- [x] 5.5 Add error handling for invalid media_type parameter
- [x] 5.6 Update TypeScript types for request parameters and response
- [x] 5.7 Test all anime fallback stages: verify each returns 10+ usable results
- [x] 5.8 Test API route endpoints: `?media_type=movie`, `?media_type=tv`, `?media_type=anime`

## 6. Hook Updates
- [x] 6.1 Update `useFeedData` hook signature to accept `contentType: FeedContentType`
- [x] 6.2 Include `media_type` in API request query params
- [x] 6.3 Reset `movies` array and `viewedMovieIds` when `contentType` changes
- [x] 6.4 Add `useEffect` to detect contentType change and trigger reload
- [x] 6.5 Maintain separate pagination state per content type (optional, or reset to page 1)
- [x] 6.6 Update loading state management for content type switches

## 7. TMDB Integration for TV and Anime with Multi-Stage Fallback
- [x] 7.1 Verify TMDB `/trending/tv/day` endpoint structure (may have different fields than movies)
- [x] 7.2 Create multi-stage anime fetch function `fetchAnimeMovies(page: number, attempt: 1|2|3|4)` in `/lib/api/tmdb/movies.ts`
  - [x] 7.2a Attempt 1: `/discover/movie` with `with_origin_country=JP`, `with_genres=16`, `vote_count.gte=50`
  - [x] 7.2b Attempt 2: Remove `with_original_language=ja` if results < 10
  - [x] 7.2c Attempt 3: Try `with_keywords=210024` (anime keyword) if still insufficient
  - [x] 7.2d Attempt 4: Fallback to `/trending/tv` filtered for Animation genre
  - [x] 7.2e Return movie/TV show list (without videos, append_to_response not supported)
- [x] 7.3 Create utility function `fetchMoviesWithVideos(movieIds: number[])` for batch video fetching
  - [x] 7.3a Accept array of movie/show IDs
  - [x] 7.3b Make parallel requests to `/movie/{id}/videos` (or `/tv/{id}/videos`) for each ID
  - [x] 7.3c Use Promise.allSettled to handle partial failures
  - [x] 7.3d Track success rate: if < 50% have trailers, return failure flag
  - [x] 7.3e Return array with extracted trailers and success rate
- [x] 7.4 Test trailer extraction for TV shows (may use 'Teaser' or 'Clip' type instead of 'Trailer')
- [x] 7.5 Handle missing trailers for TV and anime content (show poster fallback)
- [x] 7.6 Verify anime results return Japanese animated content (validate with sample checks)
- [x] 7.7 Test all 4 fallback stages end-to-end with real API calls

## 8. Mobile Safe Area and Browser UI Handling
- [x] 8.1 Add `viewport-fit=cover` to viewport meta tag in `app/layout.tsx` or `_document.tsx`
- [x] 8.2 Update `VideoOverlay.tsx` bottom content container:
  - [x] 8.2a Change `pb-8` to `pb-[max(2rem,calc(2rem+env(safe-area-inset-bottom)))]`
  - [x] 8.2b Add fallback: if safe-area-inset not supported, use `pb-20` (80px)
- [x] 8.3 Update right-side action buttons positioning:
  - [x] 8.3a Change `bottom-32` to `bottom-[max(8rem,calc(8rem+env(safe-area-inset-bottom)))]`
  - [x] 8.3b Ensure buttons remain above browser chrome (~60-80px clearance)
- [x] 8.4 Add landscape orientation safe area handling:
  - [x] 8.4a Apply `pl-[env(safe-area-inset-left)]` and `pr-[env(safe-area-inset-right)]` to container
- [x] 8.5 Test on iOS Safari (iPhone X, iPhone 14 Pro):
  - [x] 8.5a With bottom toolbar visible (initial scroll state)
  - [x] 8.5b With bottom toolbar hidden (after scrolling)
  - [x] 8.5c In landscape mode
- [x] 8.6 Test on Chrome Android:
  - [x] 8.6a With address bar visible
  - [x] 8.6b With address bar hidden after scroll
- [ ] 8.7 Verify all interactive elements (buttons, movie title) are tappable and not obscured

## 9. Styling and UX Polish
- [x] 9.1 Design tab bar styling: glassmorphism effect with `backdrop-blur-md` and `bg-black/80`
- [x] 9.2 Add smooth fade-in animation when feed content loads after tab switch
- [x] 9.3 Show brief loading indicator during tab switch (spinner or skeleton)
- [x] 9.4 Ensure tab bar text is readable with good contrast
- [x] 9.5 Add hover states for tabs on desktop
- [x] 9.6 Test tab bar positioning on different screen sizes (mobile, tablet, desktop)

## 10. Session Persistence
- [x] 10.1 Create `/lib/utils/session-storage.ts` with type-safe helpers
- [x] 10.2 Implement `getContentType()`: read from sessionStorage, default to 'movie'
- [x] 10.3 Implement `setContentType(type)`: write to sessionStorage
- [x] 10.4 Call `setContentType()` whenever user switches tabs
- [x] 10.5 Test persistence: switch tab, refresh page, verify tab remains selected

## 11. Error Handling and Edge Cases
- [x] 11.1 Handle empty results for TV or Anime (show appropriate message)
- [x] 11.2 Handle API errors specific to TV/Anime endpoints
- [x] 11.3 Validate contentType parameter in API route (reject invalid values)
- [x] 11.4 Show user-friendly error if content type fails to load
- [x] 11.5 Add retry logic for failed content type switches

## 12. Testing
- [x] 12.1 Test YouTube UI hiding on Chrome desktop
- [x] 12.2 Test YouTube UI hiding on Safari desktop
- [x] 12.3 Test YouTube UI hiding on mobile Safari (iOS)
- [x] 12.4 Test YouTube UI hiding on Chrome Android
- [x] 12.5 Verify no YouTube title, "Copy link", "1/1" counter visible
- [x] 12.6 Test tab switching: Movies → TV Shows → Anime
- [x] 12.7 Verify feed content changes correctly for each tab
- [x] 12.8 Test session persistence: refresh page after switching tabs
- [x] 12.9 Test pagination: scroll through 20+ items in each content type
- [x] 12.10 Verify tab bar remains fixed during vertical scroll

## 13. Performance and Optimization
- [x] 13.1 Ensure tab switch is instant (<100ms perceived latency)
- [x] 13.2 Prefetch first page of next content type on hover (optional)
- [x] 13.3 Optimize re-renders: memoize FeedTypeSelector component
- [x] 13.4 Test smooth animations on low-end mobile devices
- [x] 13.5 Measure memory usage when switching between tabs multiple times

## 14. Documentation and Code Quality
- [x] 14.1 Add JSDoc comments to `FeedTypeSelector` component
- [x] 14.2 Document content type filtering logic in API route
- [x] 14.3 Add inline comments explaining YouTube UI hiding strategy
- [x] 14.4 Update README if applicable (mention content type tabs)
- [x] 14.5 Run `npm run build` to check for TypeScript errors
- [x] 14.6 Run ESLint and fix any warnings

## Notes
- Prioritize YouTube UI hiding first (tasks 1) as it's visually critical
- Content type tabs can be implemented in parallel (tasks 2-6)
- Test on real devices early, especially mobile Safari
- Keep tab switching instant - no loading spinners unless necessary
- Anime filtering may need iteration to get best results
