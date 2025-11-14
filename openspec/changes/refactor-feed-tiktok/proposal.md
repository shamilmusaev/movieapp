# Change: Refactor Feed Autoplay Engine

## Why
- Only the first video in the vertical feed autoplays because `useVideoPlayer` ties playback to `autoplay && isActive`, leaving every other card paused even when visible.
- Every movie card mounts a YouTube iframe permanently, so scrolling a dozen entries spawns a dozen heavy players. This blows past mobile memory targets and causes frozen frames/audio overlap complaints from QA.
- Scroll snapping is purely CSS-based. There is no state machine that reacts to wheel/touch velocity, so users can land between cards and the feed frequently stalls before the next clip starts.
- Product asks for an experience “like TikTok”: one active video, instant autoplay, eager preload of the next clip, buttons that stay responsive even while SSE batches stream in.
- Context: TikTok-style feeds lean on virtualization. Context7’s `react-window` docs (https://context7.com/context7/react-window_vercel_app/llms.txt) stress only rendering items near the viewport. We need comparable behavior even if we stay framework-light.

## What Changes

### Active Video State Machine
- Build `useActiveVideoIndex` hook that tracks card visibility with IntersectionObserver, debounces chatter, and exposes imperative `gotoNext/Prev` helpers for buttons, wheel, and key bindings.
- Feed container becomes a controlled component: it scrolls via `scrollToIndex` derived from the hook instead of ad-hoc DOM calls.

### Virtualized Player Lifecycle
- Introduce `useMutePreference` (localStorage-backed) shared across cards so overlay buttons always reflect the saved mute choice.
- Update `VideoCard` to mount an iframe only when it is the active card or the immediate next card (for preload). Others render a cached image placeholder to keep scrolling cheap.
- Extend `YouTubePlayer` so `isActive` directly toggles play/ pause, ensuring autoplay works for every card. Retry logic remains but is now gated behind the controller state to prevent dueling commands.

### TikTok-Like Navigation UX
- Hook wheel/touch gestures to snap to the next card when users flick quickly, matching TikTok’s “one clip per gesture” behavior.
- Improve bottom controls feedback: disable “next” when we are streaming the last batch, show a buffer indicator while SSE fetches, and expose hook state for future analytics events.

## Impact
- **Specs affected:**
  - `video-feed-ui` — add requirement for controlled scroll snapping + gesture-based navigation driven by a hook, ensuring only one card is considered “active”.
  - `video-playback` — tighten performance requirement so only active/next cards host iframes, matching the virtualization guidance above.
- **Code touched:** `components/feed/FeedContainer.tsx`, `VideoCard.tsx`, `FeedControls.tsx`, `components/video/YouTubePlayer.tsx`, new hooks (`useActiveVideoIndex`, `useMutePreference`), supporting utils/tests.
- **Dependencies:** still zero new runtime deps (virtualization implemented manually but modeled after Context7’s react-window docs so we can switch later if needed).

## Notes
- Maintain existing SSE API contract; improvements are purely client-side.
- Ensure the new hooks expose TypeScript-friendly generics for reuse in collections/favorites feeds.
- We must keep `npm run build` green post-implementation and update `tasks.md` checkboxes per OpenSpec workflow.
