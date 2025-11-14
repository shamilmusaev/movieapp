# Change: Add Vertical Video Feed

## Why

CineSwipe's core feature is a TikTok-like vertical feed where users discover movies through trailers. Currently, we have the architecture foundation but no user-facing feed interface. This change implements the main vertical video feed with TMDB API integration, creating the primary user experience for movie discovery.

This combines Proposals 2 (Basic Vertical Feed UI) and 3 (Integrate TMDB API Into Feed) from the original PRD because they are tightly coupled - a feed UI without real data or data integration without a UI to display it wouldn't provide value independently.

## What Changes

### Feed UI Components
- Mobile-first vertical scrolling layout with full-screen video cards
- Embedded YouTube iframe player for trailers
- Overlay UI with movie title, genres, and action buttons
- Navigation controls (swipe gestures + arrow buttons)
- Loading states and error boundaries

### TMDB Data Integration
- Fetch trending/popular movies from TMDB API
- Extract and filter official trailers from movie video data
- Map genre IDs to genre names for display
- Handle movies without trailers gracefully (show poster fallback)

### Video Playback
- One active video player at a time (performance requirement)
- Autoplay visible video
- Muted by default with unmute toggle
- Pause when scrolling away
- Preload next video for smooth transitions

### Feed Navigation
- Infinite scroll pagination through TMDB results
- Track current video index
- Prevent showing the same movie twice in a session
- Smooth scroll/swipe transitions between videos

## Impact

- **Affected specs:**
  - `video-feed-ui` (new) - Vertical feed layout, video cards, overlay UI, navigation
  - `feed-data-integration` (new) - TMDB API data fetching, filtering, transformation for feed
  - `video-playback` (new) - YouTube embed, autoplay, mute controls, single player management

- **Affected code:**
  - `app/page.tsx` - Replace with feed page
  - `app/feed/page.tsx` (new) - Main feed route
  - `components/feed/` (new) - FeedContainer, VideoCard, VideoOverlay, FeedControls components
  - `components/video/` (new) - YouTubePlayer component
  - `hooks/useFeed.ts` (new) - Feed data fetching and pagination logic
  - `hooks/useVideoPlayer.ts` (new) - Video playback state management
  - `lib/api/tmdb/` - Use existing TMDB client functions
  - `lib/utils/feed.ts` (new) - Feed-specific data transformation utilities

- **Dependencies:**
  - Requires completed `setup-initial-architecture` (TMDB client, types, project structure)
  - Does NOT include favorites, likes, or sharing (future changes)
  - Does NOT include personalization/recommendation algorithm (future changes)
  - Does NOT include onboarding or genre selection (future changes)

## Notes

This change focuses on the MVP feed experience:
- Simple trending/popular movie source (no personalization yet)
- Basic video playback (no advanced features like quality selection)
- Essential UI only (no favorites, likes, share buttons yet)
- Mobile-first but desktop functional

The goal is to validate the core concept with real users before adding complexity.
