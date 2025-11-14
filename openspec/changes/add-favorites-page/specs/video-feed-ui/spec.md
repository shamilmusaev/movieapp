# Video Feed UI Specification - Delta

## MODIFIED Requirements

### Requirement: Video Card Component
The system SHALL display each movie as a video card containing an embedded trailer player, movie metadata overlay, and interactive controls with persistent Like/Save state.

#### Scenario: Save button connects to favorites
- **GIVEN** user taps Save button in VideoOverlay
- **WHEN** save action occurs
- **THEN** movie is saved to localStorage via `useFavorites` hook and button shows filled state

#### Scenario: Save button shows saved state
- **GIVEN** movie is already in favorites
- **WHEN** VideoOverlay renders
- **THEN** Save button displays filled bookmark icon indicating saved state

#### Scenario: Unsave from feed
- **GIVEN** movie is in favorites and user taps filled Save button
- **WHEN** unsave action occurs
- **THEN** movie is removed from favorites and button shows unfilled state

#### Scenario: Like button connects to likes
- **GIVEN** user taps Like button in VideoOverlay
- **WHEN** like action occurs
- **THEN** movie ID is stored in `cineswipe_likes` localStorage and button shows filled heart

#### Scenario: Like button shows liked state
- **GIVEN** movie is already liked
- **WHEN** VideoOverlay renders
- **THEN** Like button displays filled red heart icon

#### Scenario: Unlike from feed
- **GIVEN** movie is liked and user taps filled Like button
- **WHEN** unlike action occurs
- **THEN** movie is removed from likes and button shows unfilled state

## ADDED Requirements

### Requirement: Bottom Tab Bar Integration
The system SHALL integrate bottom navigation bar in Feed page layout for global navigation access.

#### Scenario: Bottom tab bar visible on Feed page
- **GIVEN** user is viewing Feed page
- **WHEN** page renders
- **THEN** bottom tab bar is displayed at bottom with Feed tab highlighted

#### Scenario: Tab bar auto-hides on scroll down
- **GIVEN** user scrolls down in feed
- **WHEN** scroll direction is downward and user scrolled > 50px
- **THEN** bottom tab bar animates down and hides below viewport

#### Scenario: Tab bar reappears on scroll up
- **GIVEN** bottom tab bar is hidden and user scrolls up
- **WHEN** scroll direction is upward
- **THEN** bottom tab bar animates up and becomes visible

#### Scenario: Tab bar respects safe area
- **GIVEN** Feed page renders on iOS device
- **WHEN** bottom tab bar is displayed
- **THEN** tab bar padding includes `env(safe-area-inset-bottom)` to clear home indicator

#### Scenario: Navigate to Favorites from Feed
- **GIVEN** user taps Favorites tab in bottom bar
- **WHEN** navigation occurs
- **THEN** app navigates to `/favorites` route

### Requirement: Header Favorites Button
The system SHALL provide Favorites icon button in Feed page header for quick access.

#### Scenario: Display Favorites button in header
- **GIVEN** user is viewing Feed page
- **WHEN** looking at top-right corner of screen
- **THEN** Favorites icon button is visible next to content type tabs

#### Scenario: Navigate to Favorites from header
- **GIVEN** user taps Favorites header button
- **WHEN** navigation occurs
- **THEN** app navigates to `/favorites` route

#### Scenario: Header button shows badge count
- **GIVEN** user has saved 5 favorites
- **WHEN** Feed page renders
- **THEN** Favorites header button displays badge with "5" count

#### Scenario: Badge count updates in real-time
- **GIVEN** user saves movie from feed
- **WHEN** save action completes
- **THEN** Favorites header button badge increments count immediately
