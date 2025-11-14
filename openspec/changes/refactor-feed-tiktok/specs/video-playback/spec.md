# Video Playback Specification - Delta

## MODIFIED Requirements

### Requirement: Single Active Player
The system SHALL ensure only one video player is actively playing at any time to optimize performance and user experience.

#### Scenario: Controller-driven autoplay
- **GIVEN** the feed controller marks card *N* as active
- **WHEN** it emits the active index change
- **THEN** the previously active iframe receives a pause command within 150ms and the new iframe autoplays without user interaction

#### Scenario: Autoplay works for every card
- **GIVEN** any card becomes active via swipe, wheel, or button navigation
- **WHEN** it crosses the visibility threshold
- **THEN** autoplay triggers regardless of initial load order; autoplay is no longer limited to the first card in the feed

### Requirement: Video Performance Optimization
The system SHALL optimize video playback to maintain 60 FPS scrolling and minimize memory usage.

#### Scenario: Mount only active and next iframe
- **GIVEN** the feed contains many movies
- **WHEN** rendering cards beyond the active index + 1
- **THEN** those cards render poster placeholders instead of YouTube iframes, freeing memory while keeping scroll smooth

#### Scenario: Preload immediate next video
- **GIVEN** a card is active
- **WHEN** the hook designates card *N+1* as "preload"
- **THEN** its iframe mounts muted in the background so the next swipe plays instantly

#### Scenario: Resume iframe when card remounts
- **GIVEN** a user scrolls back to an earlier card that was previously unmounted
- **WHEN** it becomes active again
- **THEN** the iframe is recreated and autoplayed without exposing the YouTube chrome or requiring manual play
