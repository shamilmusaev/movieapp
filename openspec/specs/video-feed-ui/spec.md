# video-feed-ui Specification

## Purpose
TBD - created by archiving change add-vertical-video-feed. Update Purpose after archive.
## Requirements
### Requirement: Vertical Feed Layout
The system SHALL provide a full-screen vertical scrolling container that displays video cards with content type navigation at the top.

#### Scenario: Tab bar positioned at top of feed
- **GIVEN** feed page is displayed
- **WHEN** user views screen
- **THEN** content type tabs are fixed at the top, above video cards

#### Scenario: Video cards fill screen below tabs
- **GIVEN** tabs are displayed at top
- **WHEN** rendering video cards
- **THEN** each card fills remaining screen height (100vh minus tab bar height)

#### Scenario: Tab bar remains visible during scroll
- **GIVEN** user is scrolling through feed
- **WHEN** swiping between videos
- **THEN** tab bar remains fixed at top (does not scroll away)

#### Scenario: Smooth transition when switching tabs
- **GIVEN** user taps a different content type tab
- **WHEN** feed content changes
- **THEN** old content fades out and new content fades in smoothly

### Requirement: Video Card Component
The system SHALL display each movie as a video card containing an embedded trailer player, movie metadata overlay, and interactive controls.

#### Scenario: Video card with trailer displays movie info
- **GIVEN** a movie has an available trailer
- **WHEN** the video card is rendered
- **THEN** it shows the YouTube player, movie title, genre tags, and control buttons overlaid on the video

#### Scenario: Video card without trailer shows poster
- **GIVEN** a movie has no available trailer
- **WHEN** the video card is rendered
- **THEN** it displays the movie poster as fallback with a "No trailer available" message

#### Scenario: Video card metadata is readable over video
- **GIVEN** a video is playing with overlay UI
- **WHEN** the user views the card
- **THEN** text and buttons have sufficient contrast (dark gradient background or shadow) for readability

### Requirement: Feed Navigation Controls
The system SHALL provide both touch gesture and button-based navigation for moving between videos in the feed.

#### Scenario: User swipes up to next video
- **GIVEN** a user is viewing a video
- **WHEN** they perform a vertical swipe up gesture
- **THEN** the feed scrolls to the next video

#### Scenario: User uses next button
- **GIVEN** a user is viewing a video
- **WHEN** they click/tap the next button
- **THEN** the feed navigates to the next video with the same transition

#### Scenario: User swipes down to previous video
- **GIVEN** a user has viewed at least one previous video
- **WHEN** they swipe down or click the previous button
- **THEN** the feed scrolls back to the previous video

#### Scenario: First video prevents previous navigation
- **GIVEN** a user is on the first video in the feed
- **WHEN** they attempt to navigate to previous
- **THEN** no action occurs (or bounce animation indicates start of feed)

### Requirement: Infinite Scroll Pagination
The system SHALL automatically load more movies from TMDB as the user approaches the end of the current batch, providing seamless infinite scrolling.

#### Scenario: Load more movies when approaching end
- **GIVEN** a user has scrolled to within 3 videos of the last loaded video
- **WHEN** pagination is triggered
- **THEN** the next page of movies is fetched from TMDB and appended to the feed

#### Scenario: Loading state during pagination
- **GIVEN** more movies are being fetched
- **WHEN** the user reaches the last currently loaded video
- **THEN** a loading indicator is shown at the bottom of the feed

#### Scenario: No more results available
- **GIVEN** TMDB returns no more movies (end of trending list)
- **WHEN** user reaches the end
- **THEN** an "End of feed" message is displayed

### Requirement: Feed Loading States
The system SHALL display appropriate loading UI during initial feed load and show error states when data fetching fails.

#### Scenario: Initial feed load
- **GIVEN** a user navigates to the feed page
- **WHEN** the initial movie data is being fetched
- **THEN** a skeleton loader or spinner is displayed

#### Scenario: API error during feed load
- **GIVEN** TMDB API returns an error
- **WHEN** feed data cannot be loaded
- **THEN** an error message is displayed with a "Retry" button

#### Scenario: Network error with retry
- **GIVEN** a network error occurred
- **WHEN** user clicks "Retry"
- **THEN** the feed attempts to reload data from TMDB

### Requirement: Genre Display
The system SHALL display genre tags for each movie in the video overlay, mapping TMDB genre IDs to readable names.

#### Scenario: Display movie genres as chips
- **GIVEN** a movie has genre IDs [28, 12, 878]
- **WHEN** the video card is rendered
- **THEN** genre chips showing "Action", "Adventure", "Science Fiction" are displayed below the title

#### Scenario: Limit number of displayed genres
- **GIVEN** a movie has more than 3 genres
- **WHEN** genres are displayed
- **THEN** only the first 3 genres are shown to avoid clutter

### Requirement: Responsive Design
The system SHALL adapt the feed layout to different screen sizes while maintaining the mobile-first vertical experience as primary.

#### Scenario: Mobile portrait (primary use case)
- **GIVEN** viewport width < 768px in portrait
- **WHEN** feed renders
- **THEN** video card takes full screen width and height (100vw x 100vh)

#### Scenario: Tablet landscape
- **GIVEN** viewport width 768px-1024px
- **WHEN** feed renders
- **THEN** video is centered with max-width 640px and appropriate padding

#### Scenario: Desktop large screen
- **GIVEN** viewport width > 1024px
- **WHEN** feed renders
- **THEN** video is centered with max-width 480px (mobile aspect ratio) and rest of screen has background

### Requirement: Mobile Safe Area and Browser UI Handling
The system SHALL ensure all interactive UI elements (action buttons, movie info) are positioned above mobile browser controls and iOS safe areas, preventing overlap and ensuring accessibility.

#### Scenario: Use CSS safe-area-inset for iOS devices
- **GIVEN** app runs on iOS device with home indicator
- **WHEN** rendering bottom UI elements
- **THEN** system applies `padding-bottom: max(2rem, calc(2rem + env(safe-area-inset-bottom)))` to clear 34px iOS home bar

#### Scenario: Clear Safari bottom toolbar on iOS
- **GIVEN** user scrolls feed in iOS Safari with visible bottom toolbar (~60px)
- **WHEN** action buttons (Like, Save, Share) are displayed
- **THEN** buttons are positioned with sufficient padding to remain fully visible above toolbar

#### Scenario: Clear Chrome Android address bar
- **GIVEN** user views feed in Chrome Android with visible address bar
- **WHEN** movie title and info are displayed at bottom
- **THEN** content is positioned with 80px bottom padding to clear browser chrome

#### Scenario: Adapt to landscape orientation safe areas
- **GIVEN** device rotates to landscape mode
- **WHEN** safe-area-inset values change (sides instead of bottom)
- **THEN** UI layout adapts using `env(safe-area-inset-left)` and `env(safe-area-inset-right)`

#### Scenario: Fallback for browsers without safe-area support
- **GIVEN** browser does not support env(safe-area-inset-*)
- **WHEN** applying bottom padding
- **THEN** system uses fixed 80px padding as fallback

#### Scenario: Enable safe-area-inset with viewport meta tag
- **GIVEN** app HTML document
- **WHEN** page loads
- **THEN** viewport meta tag includes `viewport-fit=cover` to enable safe-area-inset API

