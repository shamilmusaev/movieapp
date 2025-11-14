# Design: Vertical Video Feed

## Context

CineSwipe's core value proposition is TikTok-style movie discovery through trailers. This change implements the main feed experience - the first feature users will interact with. The feed must be:
- **Fast**: Smooth 60 FPS scrolling, instant video starts
- **Reliable**: Handle API failures, missing trailers, network issues gracefully
- **Simple**: MVP focuses on basic trending feed without personalization
- **Mobile-first**: Optimized for touch and portrait orientation

This design combines UI (Proposal 2) and data integration (Proposal 3) because they're interdependent - the UI structure depends on data shape, and data fetching depends on UI requirements (infinite scroll, preloading).

## Goals

1. **Deliver core discovery experience**: Users can swipe through movie trailers effortlessly
2. **Performance first**: Maintain 60 FPS with video playback and smooth scrolling
3. **Graceful degradation**: Handle missing trailers, API failures, slow networks
4. **Foundation for personalization**: Data layer designed to support future recommendation algorithms
5. **Mobile-optimized**: Touch gestures, portrait layout, bandwidth awareness

## Non-Goals

1. Favorites, likes, or sharing (next proposal)
2. Personalized recommendations or user profiles (future)
3. Custom video clips or AI-generated content (future)
4. Offline mode or PWA features (future)
5. Advanced video features (quality selection, subtitles, speed control)

## Decisions

### Decision 1: CSS Scroll Snap vs Custom Scroll Logic

**Choice**: Use CSS `scroll-snap-type: y mandatory` with scroll event listeners rather than custom swipe animation library

**Rationale**:
- Native browser scroll snapping is highly performant (GPU accelerated)
- Works seamlessly with touch, mouse wheel, and keyboard navigation
- Simpler to implement and maintain than custom scroll libraries
- Provides smooth physics-based scrolling out of the box
- Good accessibility (keyboard navigation, screen readers)

**Alternatives Considered**:
- **Swiper.js / react-swipeable**: More control but heavier bundle, unnecessary complexity
- **Framer Motion**: Overkill for scroll behavior, better for complex animations
- **Custom useSwipe hook with transform**: More control but have to reimplement physics, harder to get right

**Implementation**:
```css
.feed-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

.video-card {
  scroll-snap-align: start;
  height: 100vh;
}
```

### Decision 2: Intersection Observer for Video Management

**Choice**: Use Intersection Observer API to detect visible video and control playback rather than scroll event calculations

**Rationale**:
- Intersection Observer is more performant than scroll events (runs off main thread)
- Built-in visibility detection (>50% threshold) is exactly what we need
- Automatic cleanup when components unmount
- Better battery life on mobile (fewer JS calculations)

**Pattern**:
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          // Play this video, pause others
          setActiveVideoId(videoId)
        }
      })
    },
    { threshold: 0.5 }
  )

  if (videoRef.current) observer.observe(videoRef.current)
  return () => observer.disconnect()
}, [videoId])
```

### Decision 3: YouTube Iframe over HTML5 Video

**Choice**: Use YouTube iframe embed for trailer playback instead of downloading and serving videos directly

**Rationale**:
- **Legal/Copyright**: YouTube handles licensing, CDN, copyright protection
- **No storage costs**: Don't need to host videos or transcode
- **Adaptive streaming**: YouTube automatically adjusts quality to network speed
- **Reliability**: YouTube's CDN has 99.9%+ uptime globally
- **Feature-rich**: YouTube provides controls, fullscreen, quality selection built-in

**Trade-offs**:
- **Requires internet**: Can't work offline (acceptable for MVP)
- **Blocked videos**: Some trailers may be region-restricted (poster fallback handles this)
- **YouTube branding**: Minimal with `modestbranding=1` parameter
- **No custom UI over video**: YouTube controls are what we get (acceptable for MVP)

**Mitigation for blocked videos**: Poster fallback + "Watch on YouTube" link

### Decision 4: Trending as Default Feed Source

**Choice**: Use TMDB `/trending/movie/day` as the single feed source for MVP, no mixing of trending/popular/top-rated

**Rationale**:
- **Simplicity**: One source = simpler data fetching logic
- **Fresh content**: Daily trending updates frequently
- **Proven**: TikTok and Instagram Reels use "trending" as default feed
- **Defers complexity**: Can add multiple feed types later (explore tab, genre feeds)

**Future improvement**: Personalized mix of trending + popular + similar-to-liked movies

### Decision 5: Client-Side Data Fetching vs Server Components

**Choice**: Use client-side data fetching with React hooks (useFeedData) rather than Next.js Server Components for feed data

**Rationale**:
- **Real-time interactions**: Feed needs client-side state (current video, pagination, deduplication)
- **Infinite scroll**: Requires client-side state management for appending pages
- **Video playback control**: Must be client-side (play/pause, mute)
- **User interactions**: Swipes, taps, scroll position all client-side

**Where Server Components make sense**: Static pages like movie details, collections list (future)

**Pattern**:
- Page component is Client Component (`'use client'`)
- useFeedData hook uses SWR or React Query for caching and revalidation
- TMDB API client functions are reusable in both client and server contexts

### Decision 6: In-Memory Deduplication vs Database

**Choice**: Track viewed movie IDs in React state + sessionStorage, not persistent database

**Rationale**:
- **MVP simplicity**: No backend needed, no database setup
- **Fresh each session**: Users get "new" feed each day they open app
- **Performance**: In-memory set lookup is O(1), instant
- **Privacy**: No tracking across sessions unless user wants it

**Future improvement**: When adding user accounts, viewed history can sync to DB

**Implementation**:
```typescript
const [viewedIds, setViewedIds] = useState<Set<number>>(() => {
  const stored = sessionStorage.getItem('viewedMovieIds')
  return stored ? new Set(JSON.parse(stored)) : new Set()
})

// Filter out viewed movies when fetching new pages
const newMovies = fetchedMovies.filter(m => !viewedIds.has(m.id))
```

### Decision 7: Batch Trailer Fetching with Concurrency Limit

**Choice**: Fetch trailers for all movies in a page (20 movies) with max 5 concurrent requests

**Rationale**:
- **TMDB rate limit**: 40 requests per 10 seconds = must throttle
- **Faster than sequential**: 5 concurrent is ~4x faster than 1-at-a-time
- **Respects limits**: 5 concurrent leaves headroom for other requests (genre list, pagination)
- **User perception**: Initial 20 movies with trailers load in ~4-8 seconds (acceptable)

**Pattern**:
```typescript
async function batchFetchTrailers(movieIds: number[]) {
  const chunks = chunkArray(movieIds, 5) // Groups of 5
  const results = []

  for (const chunk of chunks) {
    const promises = chunk.map(id => getMovieVideos(id))
    const chunkResults = await Promise.allSettled(promises)
    results.push(...chunkResults)
  }

  return results
}
```

### Decision 8: Preload Next Video Strategy

**Choice**: Preload next video iframe after current video plays for 3 seconds, not immediately

**Rationale**:
- **Bandwidth optimization**: Don't waste bandwidth if user skips quickly
- **User intent signal**: 3 seconds = user is engaged, likely to continue
- **Balance**: Enough time to buffer next video before user reaches it
- **Mobile-friendly**: Respects limited data plans

**Alternative considered**: Preload immediately on mount → wastes bandwidth on skip

**Cancellation**: If user navigates backward or jumps, cancel preload

### Decision 9: CSS Grid/Flexbox over Absolute Positioning

**Choice**: Use CSS Flexbox for feed container and video cards rather than absolute positioning

**Rationale**:
- **Simpler**: Flexbox handles layout automatically
- **Scroll behavior**: Native scroll works better with document flow
- **Accessibility**: Screen readers understand document flow
- **Responsive**: Flexbox adapts to different screen sizes naturally

**Layout structure**:
```tsx
<div className="flex flex-col h-screen overflow-y-scroll snap-y snap-mandatory">
  {movies.map(movie => (
    <div key={movie.id} className="snap-start h-screen flex-shrink-0">
      <VideoCard movie={movie} />
    </div>
  ))}
</div>
```

### Decision 10: Genre Display Limit (3 max)

**Choice**: Show maximum 3 genres per movie, prioritizing first 3 from TMDB

**Rationale**:
- **Space constraint**: Mobile overlay can't fit many chips without clutter
- **Cognitive load**: 3 genres are enough to understand movie type
- **TMDB ordering**: TMDB returns genres in relevance order (most relevant first)

**Future improvement**: Horizontal scrollable genre list if user wants to see all

## Risks / Trade-offs

### Risk: YouTube Embed Performance on Low-End Devices
**Concern**: YouTube iframe is heavy (1-2MB), may cause jank on old phones
**Mitigation**:
- Unmount off-screen iframes (only keep ±1 video around current)
- Use `loading="lazy"` on iframes
- Preload strategically (only when user engaged)
- Future: Detect device capabilities and adjust preload strategy

### Risk: TMDB Rate Limits (40 req/10s)
**Concern**: Batch fetching trailers could hit rate limit
**Mitigation**:
- Limit to 5 concurrent requests (leaves headroom)
- Implement exponential backoff on 429 errors
- Cache genre list (only fetch once)
- Future: Add request queue with rate limiting

### Risk: Missing Trailers Degrade Experience
**Concern**: Many movies may not have trailers, showing posters instead
**Mitigation**:
- Fetch popular movies which usually have trailers
- Show poster with movie info (still valuable content)
- Filter out movies without trailers in future if ratio is too high
- Add "Watch Trailer on YouTube" link as alternative

### Risk: iOS Autoplay Restrictions
**Concern**: iOS Safari blocks autoplay, videos won't start automatically
**Mitigation**:
- Detect autoplay failure, show play button overlay
- Once user taps play once, subsequent videos can autoplay muted
- Research: Many TikTok-style apps have same constraint, users understand

### Risk: Scroll Performance with Many Videos
**Concern**: Loading 100+ videos might cause memory issues
**Mitigation**:
- Virtual scrolling: Unmount videos >2 positions away (keep 5 in DOM max)
- Intersection Observer cleanup on unmount
- Monitor performance metrics (React DevTools, Chrome DevTools)
- Future: Implement true virtualization if needed

## Migration Plan

**No migration** - this is a new feature with no existing users.

**Rollback strategy**: If critical bugs, can hide feed page and show "Coming soon" message

## Implementation Approach

### Phase 1: Data Layer (Day 1, ~4 hours)
1. Create types (FeedMovie, FeedState)
2. Build feed utilities (transformMovie, extractTrailer)
3. Implement useFeedData hook with pagination
4. Test with console logs and mock UI

### Phase 2: Video Player (Day 1-2, ~3 hours)
1. Create YouTubePlayer component with iframe
2. Build useVideoPlayer hook (mute, play/pause)
3. Add loading and error states
4. Test with single video card

### Phase 3: Feed UI (Day 2, ~4 hours)
1. Create VideoCard with overlay
2. Build FeedContainer with scroll snap
3. Implement FeedControls (navigation)
4. Wire up to useFeedData

### Phase 4: Single Player Logic (Day 2-3, ~3 hours)
1. Implement Intersection Observer hook
2. Add autoplay when visible, pause when not
3. Unmount off-screen videos
4. Add preload next video

### Phase 5: Polish & Testing (Day 3, ~4 hours)
1. Infinite scroll pagination
2. Genre display
3. Error handling and retry
4. Mobile testing and performance tuning
5. Build and deploy

**Total estimate**: 3 days (~18-20 hours) for experienced Next.js/React developer

## Open Questions

**Q: Should we cache TMDB responses in localStorage?**
A: Not for MVP. Trending movies change daily, caching could show stale data. Future: Add 1-hour cache if API quota is an issue.

**Q: What if a movie has multiple trailers?**
A: Implement priority: 1) "Official Trailer" by name, 2) first official trailer, 3) first YouTube trailer. Specified in feed.ts utility.

**Q: Should previous/next buttons be visible or appear on tap?**
A: Always visible for MVP (accessibility, discoverability). Future: Auto-hide after 3s of no interaction.

**Q: Handle landscape mode on mobile?**
A: Video maintains 16:9 aspect ratio, letterbox if needed. Primary experience is portrait.

## Future Considerations

These are explicitly **not** in scope but documented for reference:

1. **Personalized feed**: Mix trending + popular + similar-to-favorites based on user behavior
2. **Multiple feed tabs**: Trending, Popular, Top Rated, Genres
3. **Advanced video features**: Quality selection, playback speed, subtitles
4. **Offline mode**: Download trailers for offline viewing (PWA)
5. **Analytics**: Track video watch time, skip rate, completion rate
6. **A/B testing**: Test different trailer selection logic, UI variations
7. **Virtual scrolling**: True virtualization for infinite feed performance
8. **Server-side pagination**: API routes as proxy to TMDB for caching and rate limit management
