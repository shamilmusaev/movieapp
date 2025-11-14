# Implementation Tasks

## 1. YouTube UI Hiding Enhancements
- [ ] 1.1 Update `YouTubePlayer.tsx`: Increase top overlay height to 70px (covers title bar fully)
- [ ] 1.2 Update `YouTubePlayer.tsx`: Increase bottom overlay height to 50px (covers controls bar)
- [ ] 1.3 Add absolute positioned overlay divs with `bg-black` or `bg-gradient-to-b from-black` for smooth masking
- [ ] 1.4 Ensure overlays have `pointer-events: none` to allow swipe/tap gestures
- [ ] 1.5 Test on Chrome, Safari, and mobile browsers to verify YouTube UI is fully hidden
- [ ] 1.6 Add z-index management to ensure overlays are above iframe but below VideoOverlay content

## 2. Content Type System Setup
- [ ] 2.1 Create `FeedContentType` enum in `/types/feed.types.ts` with values: 'movie', 'tv', 'anime'
- [ ] 2.2 Add `contentType` field to `FeedState` type
- [ ] 2.3 Add `contentType` parameter to `useFeedData` hook
- [ ] 2.4 Update `useFeedData` to reset pagination when `contentType` changes
- [ ] 2.5 Add session storage utility to persist selected tab: `getSelectedContentType()`, `setSelectedContentType()`

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

## 5. API Route Updates
- [ ] 5.1 Update `/app/api/feed/trending/route.ts` to accept `media_type` query parameter
- [ ] 5.2 Map content types: 'movie' → `/trending/movie/day`, 'tv' → `/trending/tv/day`
- [ ] 5.3 For 'anime': Use `/discover/movie` with genre filter (Animation=16) and region=JP
- [ ] 5.4 Add error handling for invalid media_type parameter
- [ ] 5.5 Update TypeScript types for request parameters
- [ ] 5.6 Test API route with all three content types: `/api/feed/trending?media_type=movie|tv|anime`

## 6. Hook Updates
- [ ] 6.1 Update `useFeedData` hook signature to accept `contentType: FeedContentType`
- [ ] 6.2 Include `media_type` in API request query params
- [ ] 6.3 Reset `movies` array and `viewedMovieIds` when `contentType` changes
- [ ] 6.4 Add `useEffect` to detect contentType change and trigger reload
- [ ] 6.5 Maintain separate pagination state per content type (optional, or reset to page 1)
- [ ] 6.6 Update loading state management for content type switches

## 7. TMDB Integration for TV and Anime
- [ ] 7.1 Verify TMDB `/trending/tv/day` endpoint returns trailers in video data
- [ ] 7.2 Create utility function `getAnimeMovies()` in `/lib/api/tmdb/movies.ts`
- [ ] 7.3 Implement anime filtering: Animation genre + Japan region + high vote count
- [ ] 7.4 Test trailer extraction for TV shows (teasers, trailers, clips)
- [ ] 7.5 Handle missing trailers for TV content (may be less common than movies)

## 8. Styling and UX Polish
- [ ] 8.1 Design tab bar styling: glassmorphism effect with `backdrop-blur-md` and `bg-black/80`
- [ ] 8.2 Add smooth fade-in animation when feed content loads after tab switch
- [ ] 8.3 Show brief loading indicator during tab switch (spinner or skeleton)
- [ ] 8.4 Ensure tab bar text is readable with good contrast
- [ ] 8.5 Add hover states for tabs on desktop
- [ ] 8.6 Test tab bar positioning on different screen sizes (mobile, tablet, desktop)

## 9. Session Persistence
- [ ] 9.1 Create `/lib/utils/session-storage.ts` with type-safe helpers
- [ ] 9.2 Implement `getContentType()`: read from sessionStorage, default to 'movie'
- [ ] 9.3 Implement `setContentType(type)`: write to sessionStorage
- [ ] 9.4 Call `setContentType()` whenever user switches tabs
- [ ] 9.5 Test persistence: switch tab, refresh page, verify tab remains selected

## 10. Error Handling and Edge Cases
- [ ] 10.1 Handle empty results for TV or Anime (show appropriate message)
- [ ] 10.2 Handle API errors specific to TV/Anime endpoints
- [ ] 10.3 Validate contentType parameter in API route (reject invalid values)
- [ ] 10.4 Show user-friendly error if content type fails to load
- [ ] 10.5 Add retry logic for failed content type switches

## 11. Testing
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

## 12. Performance and Optimization
- [ ] 12.1 Ensure tab switch is instant (<100ms perceived latency)
- [ ] 12.2 Prefetch first page of next content type on hover (optional)
- [ ] 12.3 Optimize re-renders: memoize FeedTypeSelector component
- [ ] 12.4 Test smooth animations on low-end mobile devices
- [ ] 12.5 Measure memory usage when switching between tabs multiple times

## 13. Documentation and Code Quality
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
