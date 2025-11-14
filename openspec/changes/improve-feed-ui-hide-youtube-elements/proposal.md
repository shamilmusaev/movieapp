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
- Use YouTube iframe API parameter `showinfo=0` (deprecated but still works) and cover approach
- Add CSS overlay to cover YouTube UI chrome at top and bottom
- Create new `FeedTypeSelector` component for tab navigation
- Update API route to accept `media_type` parameter (movie, tv, anime)
- Map anime to TMDB `animation` genre + specific filters

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
- Use combination of iframe parameters and CSS overlays
- `controls=0` hides player controls but not title/branding
- CSS absolute positioned divs cover top 60px and bottom 40px
- `pointer-events: none` on overlays to allow swipe gestures
- Test on mobile Safari and Chrome Android for consistency

**Content Types:**
- **Movies:** TMDB `/trending/movie/day` (existing)
- **TV Shows:** TMDB `/trending/tv/day`
- **Anime:** TMDB `/discover/movie` with genre filter for Animation + specific keywords/regions (Japan, etc.)

**Future Enhancements (not in this change):**
- Persistent tab preference across sessions (localStorage)
- Smooth transition animation when switching tabs
- Separate pagination state per tab
- Mix content types in single feed
