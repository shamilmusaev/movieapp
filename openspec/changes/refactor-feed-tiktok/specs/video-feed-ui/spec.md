# Video Feed UI Specification - Delta

## MODIFIED Requirements

### Requirement: Feed Navigation Controls
The system SHALL provide both touch gesture and button-based navigation for moving between videos in the feed.

#### Scenario: Scroll snapping uses controller state
- **GIVEN** the user swipes or wheels through the feed
- **WHEN** at least 60% of the next card enters the viewport
- **THEN** the `useActiveVideoIndex` controller snaps to that index within 120ms and buttons reflect the updated position

#### Scenario: Wheel/touch flick jumps exactly one card
- **GIVEN** the user performs a fast flick gesture
- **WHEN** gesture velocity exceeds the configured threshold
- **THEN** the feed scrolls exactly one card in the gesture direction, preventing partial stops between cards

## ADDED Requirements

### Requirement: Active Feed Controller Hook
The system SHALL expose a reusable hook that centralizes active-card detection, gesture handling, and programmatic navigation for TikTok-style feeds.

#### Scenario: Hook registers/unregisters cards
- **GIVEN** a video card mounts or unmounts
- **WHEN** it calls `register(index, node)` or `unregister(index)`
- **THEN** the controller begins/stops tracking its visibility without leaking observers

#### Scenario: Next/Prev helpers respect bounds
- **GIVEN** the hook provides `next()` and `prev()`
- **WHEN** the active card is the last (or first) item
- **THEN** invoking the helper is a no-op and control buttons show the disabled state

#### Scenario: Controller emits load-more signal
- **GIVEN** the active index is within 3 items of the loaded list end
- **WHEN** `onEndReached` callback is provided
- **THEN** the hook fires it once per page to prompt pagination

#### Scenario: Consumer receives stable active index
- **GIVEN** cards rapidly enter/exit the viewport during fast scrolls
- **WHEN** the hook updates internal observer data
- **THEN** active index changes are debounced (≤120ms) to avoid flicker and guarantee one active card at a time
