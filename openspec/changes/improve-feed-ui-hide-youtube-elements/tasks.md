# Implementation Tasks

## 1. YouTube UI Hiding Enhancements with Corner Blocks
- [ ] 1.1 **Critical:** Remove any reliance on `showinfo=0` parameter (removed by YouTube, does NOT work)
- [ ] 1.2 Update `YouTubePlayer.tsx`: Add top-left overlay block (200px width × 70px height) to cover channel avatar and title start
- [ ] 1.3 Update `YouTubePlayer.tsx`: Add top-right overlay block (200px width × 70px height) to cover "Copy link" and "1/1" counter
- [ ] 1.4 Update `YouTubePlayer.tsx`: Add bottom overlay (full width × 50px height) to cover progress bar
- [ ] 1.5 Position overlays with `absolute`, use `bg-black` or `bg-gradient-to-center from-black` for smooth masking
- [ ] 1.6 Ensure ALL overlays have `pointer-events: none` to allow swipe/tap gestures through them
- [ ] 1.7 Add z-index management: overlays above iframe but below VideoOverlay content
- [ ] 1.8 Test on Chrome, Safari, mobile Safari (iOS), Chrome Android to verify ALL YouTube UI elements hidden
- [ ] 1.9 Test different aspect ratios (16:9, 4:3, portrait) to ensure corner blocks adapt correctly

## 2. Content Type System Setup with Independent State Structure
- [ ] 2.1 Create `FeedContentType` type in `/types/feed.types.ts`: `'movie' | 'tv' | 'anime'`
- [ ] 2.2 Create `FeedStateMap` type: `Record<FeedContentType, FeedState>`
- [ ] 2.3 Update `FeedState` to include: `movies`, `page`, `hasMore`, `viewedMovieIds`, `loading`, `error`
- [ ] 2.4 Refactor `useFeedData` to maintain `feedStateMap: Record<FeedContentType, FeedState>`
- [ ] 2.5 Implement state initialization: create empty FeedState when switching to new content type
- [ ] 2.6 Implement state restoration: retrieve cached FeedState when returning to previously viewed content type
- [ ] 2.7 Add session storage utility: `getSelectedContentType()`, `setSelectedContentType()`
- [ ] 2.8 Ensure independent pagination: scrolling in Movies doesn't affect TV Shows page counter

## 3. FeedTypeSelector Component
- [ ] 3.1 Create `/components/feed/FeedTypeSelector.tsx` component
- [ ] 3.2 Implement three tab buttons: "Movies", "TV Shows", "Anime"
- [ ] 3.3 Style tabs with Tailwind: inactive (text-gray-400), active (text-white + bottom border)
- [ ] 3.4 Add smooth transition animation for active indicator (underline or background)
- [ ] 3.5 Accept `selectedType` and `onTypeChange` props
- [ ] 3.6 Add click handlers that call `onTypeChange(type)`
- [ ] 3.7 Make tab bar responsive: horizontal scroll on small screens if needed
- [ ] 3.8 Add accessibility: proper ARIA labels and keyboard navigation

## 4. Feed Page Integration
- [ ] 4.1 Import `FeedTypeSelector` in `/app/feed/page.tsx`
- [ ] 4.2 Add state for `selectedContentType` using `useState` (initialize from session storage)
- [ ] 4.3 Pass `contentType` to `useFeedData(selectedContentType)` hook
- [ ] 4.4 Render `FeedTypeSelector` at top of page, above `FeedContainer`
- [ ] 4.5 Position tab bar as fixed or sticky at top with proper z-index
- [ ] 4.6 Handle tab change: update state, save to session storage, trigger feed reload
- [ ] 4.7 Adjust `FeedContainer` height: `h-[calc(100vh-60px)]` to account for tab bar

## 5. API Route Updates with Multi-Stage Anime Discover
- [ ] 5.1 Update `/app/api/feed/trending/route.ts` to accept `media_type` query parameter ('movie' | 'tv' | 'anime')
- [ ] 5.2 Map content types: 'movie' → `/trending/movie/day`, 'tv' → `/trending/tv/day`
- [ ] 5.3 For 'anime' - implement multi-stage fallback strategy:
  - [ ] 5.3a **Stage 1:** Primary `/discover/movie` with:
    - `with_origin_country=JP` (broader than region)
    - `with_genres=16` (Animation)
    - `sort_by=popularity.desc`
    - `vote_count.gte=50` (lower threshold)
  - [ ] 5.3b **Stage 2:** If results < 10, retry without `with_original_language` constraint
  - [ ] 5.3c **Stage 3:** If still insufficient, try:
    - `with_keywords=210024` (anime keyword ID)
    - `with_genres=16`
    - `sort_by=popularity.desc`
  - [ ] 5.3d **Stage 4 (alternative):** Use `/trending/tv` and filter client-side for Animation genre
- [ ] 5.4 **Critical:** For anime, `/discover` does NOT support `append_to_response=videos`
  - [ ] 5.4a Fetch anime movie list from `/discover/movie`
  - [ ] 5.4b Make separate parallel requests to `/movie/{id}/videos` for each anime movie
  - [ ] 5.4c Use `Promise.allSettled` to handle movies without trailers
  - [ ] 5.4d If >50% have no trailers, trigger fallback to next stage
  - [ ] 5.4e Aggregate results before returning to client
- [ ] 5.5 Add error handling for invalid media_type parameter
- [ ] 5.6 Update TypeScript types for request parameters and response
- [ ] 5.7 Test all anime fallback stages: verify each returns 10+ usable results
- [ ] 5.8 Test API route endpoints: `?media_type=movie`, `?media_type=tv`, `?media_type=anime`

## 6. Hook Updates
- [ ] 6.1 Update `useFeedData` hook signature to accept `contentType: FeedContentType`
- [ ] 6.2 Include `media_type` in API request query params
- [ ] 6.3 Reset `movies` array and `viewedMovieIds` when `contentType` changes
- [ ] 6.4 Add `useEffect` to detect contentType change and trigger reload
- [ ] 6.5 Maintain separate pagination state per content type (optional, or reset to page 1)
- [ ] 6.6 Update loading state management for content type switches

## 7. TMDB Integration for TV and Anime with Multi-Stage Fallback
- [ ] 7.1 Verify TMDB `/trending/tv/day` endpoint structure (may have different fields than movies)
- [ ] 7.2 Create multi-stage anime fetch function `fetchAnimeMovies(page: number, attempt: 1|2|3|4)` in `/lib/api/tmdb/movies.ts`
  - [ ] 7.2a Attempt 1: `/discover/movie` with `with_origin_country=JP`, `with_genres=16`, `vote_count.gte=50`
  - [ ] 7.2b Attempt 2: Remove `with_original_language=ja` if results < 10
  - [ ] 7.2c Attempt 3: Try `with_keywords=210024` (anime keyword) if still insufficient
  - [ ] 7.2d Attempt 4: Fallback to `/trending/tv` filtered for Animation genre
  - [ ] 7.2e Return movie/TV show list (without videos, append_to_response not supported)
- [ ] 7.3 Create utility function `fetchMoviesWithVideos(movieIds: number[])` for batch video fetching
  - [ ] 7.3a Accept array of movie/show IDs
  - [ ] 7.3b Make parallel requests to `/movie/{id}/videos` (or `/tv/{id}/videos`) for each ID
  - [ ] 7.3c Use Promise.allSettled to handle partial failures
  - [ ] 7.3d Track success rate: if < 50% have trailers, return failure flag
  - [ ] 7.3e Return array with extracted trailers and success rate
- [ ] 7.4 Test trailer extraction for TV shows (may use 'Teaser' or 'Clip' type instead of 'Trailer')
- [ ] 7.5 Handle missing trailers for TV and anime content (show poster fallback)
- [ ] 7.6 Verify anime results return Japanese animated content (validate with sample checks)
- [ ] 7.7 Test all 4 fallback stages end-to-end with real API calls

## 8. Mobile Safe Area and Browser UI Handling
- [ ] 8.1 Add `viewport-fit=cover` to viewport meta tag in `app/layout.tsx` or `_document.tsx`
- [ ] 8.2 Update `VideoOverlay.tsx` bottom content container:
  - [ ] 8.2a Change `pb-8` to `pb-[max(2rem,calc(2rem+env(safe-area-inset-bottom)))]`
  - [ ] 8.2b Add fallback: if safe-area-inset not supported, use `pb-20` (80px)
- [ ] 8.3 Update right-side action buttons positioning:
  - [ ] 8.3a Change `bottom-32` to `bottom-[max(8rem,calc(8rem+env(safe-area-inset-bottom)))]`
  - [ ] 8.3b Ensure buttons remain above browser chrome (~60-80px clearance)
- [ ] 8.4 Add landscape orientation safe area handling:
  - [ ] 8.4a Apply `pl-[env(safe-area-inset-left)]` and `pr-[env(safe-area-inset-right)]` to container
- [ ] 8.5 Test on iOS Safari (iPhone X, iPhone 14 Pro):
  - [ ] 8.5a With bottom toolbar visible (initial scroll state)
  - [ ] 8.5b With bottom toolbar hidden (after scrolling)
  - [ ] 8.5c In landscape mode
- [ ] 8.6 Test on Chrome Android:
  - [ ] 8.6a With address bar visible
  - [ ] 8.6b With address bar hidden after scroll
- [ ] 8.7 Verify all interactive elements (buttons, movie title) are tappable and not obscured

## 9. Styling and UX Polish
- [ ] 9.1 Design tab bar styling: glassmorphism effect with `backdrop-blur-md` and `bg-black/80`
- [ ] 9.2 Add smooth fade-in animation when feed content loads after tab switch
- [ ] 9.3 Show brief loading indicator during tab switch (spinner or skeleton)
- [ ] 9.4 Ensure tab bar text is readable with good contrast
- [ ] 9.5 Add hover states for tabs on desktop
- [ ] 9.6 Test tab bar positioning on different screen sizes (mobile, tablet, desktop)

## 10. Session Persistence
- [ ] 9.1 Create `/lib/utils/session-storage.ts` with type-safe helpers
- [ ] 9.2 Implement `getContentType()`: read from sessionStorage, default to 'movie'
- [ ] 9.3 Implement `setContentType(type)`: write to sessionStorage
- [ ] 9.4 Call `setContentType()` whenever user switches tabs
- [ ] 9.5 Test persistence: switch tab, refresh page, verify tab remains selected

## 11. Error Handling and Edge Cases
- [ ] 10.1 Handle empty results for TV or Anime (show appropriate message)
- [ ] 10.2 Handle API errors specific to TV/Anime endpoints
- [ ] 10.3 Validate contentType parameter in API route (reject invalid values)
- [ ] 10.4 Show user-friendly error if content type fails to load
- [ ] 10.5 Add retry logic for failed content type switches

## 12. Testing
- [ ] 11.1 Test YouTube UI hiding on Chrome desktop
- [ ] 11.2 Test YouTube UI hiding on Safari desktop
- [ ] 11.3 Test YouTube UI hiding on mobile Safari (iOS)
- [ ] 11.4 Test YouTube UI hiding on Chrome Android
- [ ] 11.5 Verify no YouTube title, "Copy link", "1/1" counter visible
- [ ] 11.6 Test tab switching: Movies → TV Shows → Anime
- [ ] 11.7 Verify feed content changes correctly for each tab
- [ ] 11.8 Test session persistence: refresh page after switching tabs
- [ ] 11.9 Test pagination: scroll through 20+ items in each content type
- [ ] 11.10 Verify tab bar remains fixed during vertical scroll

## 13. Performance and Optimization
- [ ] 12.1 Ensure tab switch is instant (<100ms perceived latency)
- [ ] 12.2 Prefetch first page of next content type on hover (optional)
- [ ] 12.3 Optimize re-renders: memoize FeedTypeSelector component
- [ ] 12.4 Test smooth animations on low-end mobile devices
- [ ] 12.5 Measure memory usage when switching between tabs multiple times

## 14. Documentation and Code Quality
- [ ] 13.1 Add JSDoc comments to `FeedTypeSelector` component
- [ ] 13.2 Document content type filtering logic in API route
- [ ] 13.3 Add inline comments explaining YouTube UI hiding strategy
- [ ] 13.4 Update README if applicable (mention content type tabs)
- [ ] 13.5 Run `npm run build` to check for TypeScript errors
- [ ] 13.6 Run ESLint and fix any warnings

## Notes
- Prioritize YouTube UI hiding first (tasks 1) as it's visually critical
- Content type tabs can be implemented in parallel (tasks 2-6)
- Test on real devices early, especially mobile Safari
- Keep tab switching instant - no loading spinners unless necessary
- Anime filtering may need iteration to get best results
