# Implementation Tasks: Refactor Feed Autoplay Engine

## Phase 1: Core Hooks

### Task 1.1: Create useActiveVideoIndex hook
**File:** `hooks/useActiveVideoIndex.ts`
**Description:** Shared controller that tracks the active card and exposes helpers.
- [x] Accept refs to scrolling container + item count
- [x] Use IntersectionObserver to detect >60% visibility and debounce updates to 120ms
- [x] Expose `{ activeIndex, register, unregister, scrollToIndex, next, prev }`
- [x] Support imperative registration from each card (pass HTMLElement + index)

### Task 1.2: Create useMutePreference hook
**File:** `hooks/useMutePreference.ts`
**Description:** LocalStorage-backed global mute flag for feed videos.
- [x] Read/write `cineswipe_mute_preference`
- [x] Return `{ isMuted, toggleMute, setMuted }`
- [x] Sync across tabs via `storage` event

## Phase 2: Feed Container Updates

### Task 2.1: Refactor FeedContainer to use hook
**File:** `components/feed/FeedContainer.tsx`
**Description:** Replace scattered state with hook-driven controller.
- [x] Attach `useActiveVideoIndex` to scroll container + cards
- [x] Trigger `onLoadMore` when active index is within 3 items of the end
- [x] Handle wheel/touch gestures to call `next/prev`
- [x] Keep keyboard navigation + FeedControls wired to controller

### Task 2.2: Update FeedControls
**File:** `components/feed/FeedControls.tsx`
**Description:** Reflect controller state + show buffer indicator.
- [x] Accept `isBuffering` flag and disable next when SSE still loading
- [x] Use aria-live updates for current index / total

## Phase 3: Video Card + Player

### Task 3.1: Virtualize VideoCard rendering
**File:** `components/feed/VideoCard.tsx`
**Description:** Only mount iframe for active + next card.
- [x] Register DOM node with `useActiveVideoIndex`
- [x] Use `useMutePreference` for overlay button state
- [x] Render preloaded poster placeholder for inactive cards
- [x] Autoplay active cards immediately, pause others on index change

### Task 3.2: Refine YouTubePlayer control logic
**File:** `components/video/YouTubePlayer.tsx`
**Description:** Align iframe commands with new controller.
- [x] Remove internal `useVideoPlayer` dependency for play/pause
- [x] Accept `{ shouldPlay, isMuted, onReady, onError }`
- [x] Send play/pause commands with retry when `shouldPlay` toggles
- [x] Keep overlay blocks + loading UI intact

### Task 3.3: Cleanup legacy hook usage
**Files:** `hooks/useVideoPlayer.ts`, callers
**Description:** Remove unused logic or adapt to new props.
- [x] Ensure overlay buttons/mute toggles compile
- [x] Update tests/types if necessary

## Phase 4: QA & Build

### Task 4.1: Manual regression + build
**Description:**
- [x] Scroll through feed on desktop + emulate mobile, ensure only one video plays
- [x] Verify mute preference persists
- [x] Run `npm run build` and fix any issues
