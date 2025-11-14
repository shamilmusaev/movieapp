# Video Feed UI Specification - Delta

## ADDED Requirements

### Requirement: Content Type Navigation Tabs
The system SHALL provide horizontal tab navigation at the top of the feed allowing users to switch between Movies, TV Shows, and Anime content types.

#### Scenario: Display content type tabs
- **GIVEN** feed page loads
- **WHEN** user views the top of the screen
- **THEN** horizontal tab bar displays with three options: "Movies", "TV Shows", "Anime"

#### Scenario: Highlight active tab
- **GIVEN** user is viewing a specific content type
- **WHEN** looking at tab bar
- **THEN** active tab is visually highlighted with underline or background color

#### Scenario: Switch to Movies content
- **GIVEN** user is viewing TV Shows or Anime
- **WHEN** user taps "Movies" tab
- **THEN** feed refreshes and displays trending movie trailers

#### Scenario: Switch to TV Shows content
- **GIVEN** user is viewing Movies or Anime
- **WHEN** user taps "TV Shows" tab
- **THEN** feed refreshes and displays trending TV show trailers/teasers

#### Scenario: Switch to Anime content
- **GIVEN** user is viewing Movies or TV Shows
- **WHEN** user taps "Anime" tab
- **THEN** feed refreshes and displays anime trailers (filtered by animation genre and Japan region)

#### Scenario: Default to Movies on first visit
- **GIVEN** user visits feed for the first time
- **WHEN** page loads
- **THEN** "Movies" tab is active by default

#### Scenario: Persist tab selection in session
- **GIVEN** user switches to TV Shows or Anime
- **WHEN** user scrolls through feed and refreshes page
- **THEN** previously selected tab remains active during the same session

#### Scenario: Independent pagination per content type
- **GIVEN** user has scrolled through 20 movies
- **WHEN** user switches to TV Shows tab
- **THEN** pagination resets and shows first page of TV shows

## MODIFIED Requirements

### Requirement: Feed Container Layout
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
