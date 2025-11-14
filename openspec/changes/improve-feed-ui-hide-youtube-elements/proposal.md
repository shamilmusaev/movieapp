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
- **YouTube UI hiding:** CSS overlay strategy with corner blocks (showinfo=0 parameter is removed by YouTube and no longer works)
- **Feed state structure:** `Record<FeedContentType, FeedState>` to maintain independent pagination per content type
- Create new `FeedTypeSelector` component for tab navigation
- Update API route to accept `media_type` parameter (movie, tv, anime)
- Anime filtering via `/discover/movie` with `with_genres=16`, `region=JP`, `with_original_language=ja`, and separate trailer fetching (append_to_response not supported on discover)

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

**YouTube UI Hiding Strategy:**
- **Critical:** `showinfo=0` parameter is REMOVED by YouTube and does NOT work
- Use `controls=0` to hide player controls, but this does NOT hide title/branding
- Implement CSS overlay with 4 corner blocks:
  - Top-left block: 200px × 70px (covers channel avatar, title start)
  - Top-right block: 200px × 70px (covers "Copy link", "1/1" counter)
  - Bottom-left block: full width × 50px (covers progress bar)
  - Bottom-right block: handled by bottom overlay
- All overlays use `pointer-events: none` to allow swipe gestures
- Use `bg-black` or `bg-gradient-to-center` for smooth masking
- Test on mobile Safari and Chrome Android for consistency (UI elements may shift)

**Content Types:**
- **Movies:** TMDB `/trending/movie/day` (existing)
- **TV Shows:** TMDB `/trending/tv/day`
- **Anime:** TMDB `/discover/movie` with parameters:
  - `with_genres=16` (Animation genre ID)
  - `region=JP` (Japan region)
  - `with_original_language=ja` (Japanese language)
  - `sort_by=popularity.desc` (sort by popularity)
  - `vote_count.gte=100` (minimum vote threshold for quality)
  - **Note:** `/discover` does NOT support `append_to_response=videos`, so trailer fetching requires separate `/movie/{id}/videos` calls per anime movie

**Feed State Structure:**
- Maintain `Record<FeedContentType, FeedState>` mapping each content type to its own state
- Each `FeedState` contains: `movies`, `page`, `hasMore`, `viewedMovieIds`, `loading`, `error`
- When switching tabs: restore previous state if exists, or initialize new state
- Cache loaded content to avoid re-fetching when returning to previously viewed tab
- Independent pagination per content type (scrolling in Movies doesn't affect TV Shows page)

**Future Enhancements (not in this change):**
- Persistent tab preference across sessions (localStorage - currently sessionStorage only)
- Smooth transition animation when switching tabs
- Prefetch next tab content on hover
- Mix content types in single feed
