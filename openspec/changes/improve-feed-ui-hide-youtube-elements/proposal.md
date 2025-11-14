# Change: Improve Feed UI - Hide YouTube Elements and Add Content Type Tabs

## Why

The current feed shows YouTube interface elements (video title banner, channel icon, "Copy link" button, and "1/1" counter) which breaks the immersive TikTok-like experience. Users should feel like they're using CineSwipe, not watching embedded YouTube videos.

Additionally, users want to browse different types of content (Movies, TV Shows, Anime) but currently have no way to filter by content type.

## What Changes

### Hide YouTube Embedded UI Elements
- Remove visible YouTube title bar at top (shows "Zootopia 2 | International Trailer")
- Hide channel icon/avatar in top-left corner
- Hide "Copy link" button in top-right corner
- Hide "1/1" video counter in top-right corner
- Ensure YouTube controls remain hidden even when video loads

### Add Content Type Navigation Tabs
- Create horizontal tab bar at top of feed with three options: **Movies**, **TV Shows**, **Anime**
- Highlight active tab with visual indicator (underline or background)
- Switch feed content based on selected tab
- Persist selected tab in session storage
- Default to "Movies" tab on first visit

### Technical Implementation

**YouTube UI Hiding:**
- CSS overlay with 4 corner blocks (absolute positioned divs)
- No iframe parameters can hide YouTube's title/branding (all deprecated)
- Physical blocking is the ONLY working approach

**Feed State Management:**
- Structure: `Record<FeedContentType, FeedState>` where each FeedState contains:
  - `movies: MovieWithTrailer[]` - loaded content for this type
  - `page: number` - current pagination page
  - `hasMore: boolean` - pagination flag
  - `viewedMovieIds: Set<number>` - deduplication per type
  - `loading: boolean`, `error: string | null`
- On tab switch: restore cached state if exists, else initialize new FeedState
- Independent pagination: scrolling Movies doesn't affect TV Shows page counter

**Component Changes:**
- Create `FeedTypeSelector` component for tab navigation
- Update `useFeedData` hook to maintain `feedStateMap: Record<FeedContentType, FeedState>`
- Update API route `/api/feed/trending` to accept `media_type` query parameter

**Anime Content Strategy:**
- Primary: `/discover/movie` with `with_origin_country=JP`, `with_genres=16` (Animation)
- Fallback 1: Remove `with_original_language` constraint if results < 10
- Fallback 2: Use `/trending/tv` filtered by Animation genre for anime series
- Trailer fetching: `/discover` does NOT support `append_to_response`, requires separate parallel `/movie/{id}/videos` calls

## Impact

- **Affected specs:**
  - `video-playback` - MODIFIED: Enhanced YouTube UI hiding strategy
  - `video-feed-ui` - ADDED: Content type navigation, MODIFIED: Feed container layout

- **Affected code:**
  - `components/video/YouTubePlayer.tsx` - Add stronger YouTube UI hiding overlays
  - `components/feed/FeedTypeSelector.tsx` (new) - Tab navigation component
  - `app/feed/page.tsx` - Integrate FeedTypeSelector, pass content type to useFeedData
  - `hooks/useFeedData.ts` - Accept and use `contentType` parameter
  - `app/api/feed/trending/route.ts` - Handle `media_type` query parameter
  - `types/feed.types.ts` - Add `FeedContentType` enum

- **Dependencies:**
  - Requires completed `optimize-feed-data-loading` change (API route exists)
  - No breaking changes to existing feed functionality
  - Backward compatible (defaults to movies if type not specified)

## Notes

**YouTube UI Hiding Implementation Details:**
- **No iframe parameters work:** All YouTube parameters (showinfo, modestbranding, etc.) that hide branding are deprecated and removed
- **Only solution:** Physical CSS overlays
- 4 corner blocks with `absolute` positioning:
  - Top-left block: 200px × 70px (covers channel avatar, title start)
  - Top-right block: 200px × 70px (covers "Copy link", "1/1" counter)
  - Bottom overlay: full width × 50px (covers progress bar, remaining controls)
- All overlays: `pointer-events: none` for gesture passthrough
- Styling: `bg-black` or `bg-gradient-to-center from-black` for smooth edges
- Test across: Chrome desktop, Safari desktop, iOS Safari, Chrome Android
- Handle aspect ratio variations (16:9, portrait) - overlays may need responsive sizing

**Anime Filtering Strategy (Multi-Stage):**
1. **Primary attempt:** `/discover/movie` with:
   - `with_origin_country=JP` (Japan as origin country - broader than region)
   - `with_genres=16` (Animation genre)
   - `sort_by=popularity.desc`
   - `vote_count.gte=50` (lower threshold than originally planned)
   - `page={page}`

2. **If primary returns < 10 results:** Remove `with_original_language=ja` constraint (some anime have English metadata)

3. **If still insufficient:** Fallback to `/discover/movie` with:
   - `with_keywords=210024` (anime keyword ID in TMDB)
   - `with_genres=16`
   - `sort_by=popularity.desc`

4. **Alternative source:** `/trending/tv` filtered client-side for Animation genre (anime series vs movies)

5. **Trailer fetching:** `/discover` endpoint does NOT support `append_to_response=videos`
   - Must make separate parallel requests to `/movie/{id}/videos` for each anime result
   - Use `Promise.allSettled` to handle movies without trailers gracefully
   - If > 50% have no trailers, fall back to TV Shows or expand filters

**Content Type Endpoints:**
- **Movies:** `/trending/movie/day` (existing, working well)
- **TV Shows:** `/trending/tv/day` (straightforward)
- **Anime:** Multi-stage `/discover/movie` + fallbacks (complex due to limited trailer availability)

**Future Enhancements (not in this change):**
- Persistent tab preference across sessions (localStorage - currently sessionStorage only)
- Smooth transition animation when switching tabs
- Prefetch next tab content on hover
- Mix content types in single feed
