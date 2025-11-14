# Video Playback Specification Deltas

## MODIFIED Requirements

### Requirement: YouTube Embed Player
The system SHALL embed YouTube trailers using the react-player library which provides a consistent API across video platforms, handles mobile autoplay policies correctly, and supports lazy loading through light mode.

#### Scenario: React-player handles YouTube embeds
- **GIVEN** a movie has a YouTube trailer URL
- **WHEN** VideoPlayer component renders
- **THEN** react-player library loads YouTube iframe with correct configuration (autoplay, muted, playsinline)

#### Scenario: Light mode shows thumbnail before load
- **GIVEN** VideoPlayer is configured with light mode enabled
- **WHEN** video card is rendered
- **THEN** react-player shows video thumbnail and play button, only loading full player when user interacts

#### Scenario: Support direct video file URLs
- **GIVEN** a movie has a direct video file URL (TMDB-hosted or other)
- **WHEN** VideoPlayer renders with the URL
- **THEN** react-player uses HTML5 video element to play the file

#### Scenario: Automatic platform detection
- **GIVEN** any supported video URL (YouTube, Vimeo, direct file)
- **WHEN** VideoPlayer receives the URL
- **THEN** react-player automatically detects platform and uses appropriate player

#### Scenario: Mobile autoplay policy compliance
- **GIVEN** user is on iOS Safari or Android Chrome with strict autoplay policies
- **WHEN** video should autoplay
- **THEN** react-player handles muted autoplay correctly according to browser policies

### Requirement: Autoplay Behavior
The system SHALL automatically play videos when they become visible using react-player's controlled playing prop, eliminating race conditions and ensuring 100% autoplay reliability.

#### Scenario: Controlled autoplay through playing prop
- **GIVEN** a video card becomes the active/visible card
- **WHEN** isActive prop changes to true
- **THEN** VideoPlayer sets react-player's playing={true} which triggers autoplay

#### Scenario: Autoplay works for every video in feed
- **GIVEN** user scrolls through multiple videos
- **WHEN** each video becomes active
- **THEN** every video autoplays reliably without timing issues

#### Scenario: No retry logic needed
- **GIVEN** react-player handles YouTube iframe API lifecycle
- **WHEN** video should start playing
- **THEN** autoplay works on first attempt without manual retry mechanisms

#### Scenario: Video loops when finished
- **GIVEN** a trailer finishes playing
- **WHEN** video reaches the end
- **THEN** react-player loops={true} prop causes video to restart

### Requirement: Mute and Volume Control
The system SHALL use react-player's muted prop and volume control API to manage audio state, with localStorage persistence across videos.

#### Scenario: Videos start muted through react-player
- **GIVEN** any video starts playing
- **WHEN** playback begins
- **THEN** react-player muted={true} prop ensures audio is muted initially

#### Scenario: User unmutes via react-player callback
- **GIVEN** a muted video is playing
- **WHEN** user clicks unmute button
- **THEN** VideoPlayer updates muted state which updates react-player's muted prop

#### Scenario: Mute preference read once from localStorage
- **GIVEN** VideoPlayer component initializes
- **WHEN** determining initial mute state
- **THEN** localStorage is read once and cached, not on every render

### Requirement: Video Loading States
The system SHALL use react-player's built-in loading state callbacks (onReady, onError, onBuffer) to provide visual feedback without custom loading logic.

#### Scenario: React-player provides loading events
- **GIVEN** a video is being loaded
- **WHEN** player is initializing
- **THEN** react-player fires onBuffer callback which triggers loading UI

#### Scenario: Ready callback hides loading state
- **GIVEN** video player is ready
- **WHEN** react-player fires onReady callback
- **THEN** loading spinner is hidden and video is ready to play

#### Scenario: Error callback shows retry UI
- **GIVEN** video fails to load
- **WHEN** react-player fires onError callback
- **THEN** error UI is displayed with movie poster fallback

## REMOVED Requirements

### Requirement: YouTube Embed Player - Hide YouTube branding
**Reason:** react-player handles YouTube player configuration internally. The library provides a consistent interface regardless of underlying player, eliminating need for manual CSS overlay blocks to hide YouTube UI elements.

**Migration:** Remove all CSS overlay divs from old YouTubePlayer component. react-player's controls={false} prop is sufficient.

### Requirement: Preloading Next Video
**Reason:** With react-player's light mode, videos don't load until needed, making explicit preloading unnecessary. Light mode shows thumbnail instantly and loads player on demand, which is more efficient than preloading.

**Migration:** Remove manual iframe preload logic. Light mode handles this better by loading players only when user scrolls to them.

### Requirement: Video Player Controls - Custom implementation
**Reason:** react-player provides standard controls through controls prop. For MVP, standard controls are sufficient and reduce custom code complexity.

**Migration:** Remove custom play/pause/seek control implementations. Use react-player's built-in controls when needed, or controls={false} for minimal UI.

### Requirement: Fullscreen Support - Custom API
**Reason:** react-player handles fullscreen through standard browser fullscreen API. Custom implementation not needed.

**Migration:** Remove custom fullscreen logic. Users can use browser native fullscreen or react-player's fullscreen button if controls={true}.

### Requirement: Video Performance Optimization - Manual iframe unmounting
**Reason:** react-player's light mode handles this automatically. Videos not in viewport show only thumbnail, player unmounts automatically.

**Migration:** Remove manual iframe mount/unmount logic. Light mode provides same optimization automatically.

## ADDED Requirements

### Requirement: React-Player Library Integration
The system SHALL use react-player library (version ^2.14.1) as the standard video player component, providing unified interface for YouTube, Vimeo, and direct video files.

#### Scenario: Install react-player dependency
- **GIVEN** project package.json
- **WHEN** setting up video playback
- **THEN** react-player is listed in dependencies with version ^2.14.1

#### Scenario: Lazy load react-player to reduce bundle
- **GIVEN** VideoPlayer component imports
- **WHEN** importing react-player
- **THEN** use `import ReactPlayer from 'react-player/lazy'` to enable code splitting

#### Scenario: Configure react-player for YouTube
- **GIVEN** YouTube video URL
- **WHEN** rendering ReactPlayer
- **THEN** config prop sets YouTube-specific options (playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0 })

#### Scenario: Enable playsinline for iOS
- **GIVEN** mobile iOS device
- **WHEN** video plays
- **THEN** playsinline prop prevents fullscreen and plays inline in feed

### Requirement: Light Mode for Performance
The system SHALL use react-player's light mode to show video thumbnail before loading full player, reducing initial page load and memory usage.

#### Scenario: Light mode enabled by default
- **GIVEN** VideoPlayer component
- **WHEN** rendering
- **THEN** light={true} prop is set to enable thumbnail preview

#### Scenario: Player loads on first interaction
- **GIVEN** video showing light mode thumbnail
- **WHEN** user clicks thumbnail or video becomes active
- **THEN** full player loads and starts playback

#### Scenario: Thumbnail fetched automatically
- **GIVEN** YouTube video URL
- **WHEN** light mode is enabled
- **THEN** react-player automatically fetches and displays YouTube thumbnail

### Requirement: Multi-Platform Video Support
The system SHALL support multiple video platforms through react-player's unified interface, enabling easy addition of Vimeo, Dailymotion, and other sources beyond YouTube.

#### Scenario: YouTube videos work through react-player
- **GIVEN** YouTube trailer URL
- **WHEN** VideoPlayer renders
- **THEN** react-player detects YouTube and uses YouTube iframe player

#### Scenario: Direct video files work through react-player
- **GIVEN** direct .mp4 or .webm URL
- **WHEN** VideoPlayer renders
- **THEN** react-player uses HTML5 video element

#### Scenario: Future platform addition is trivial
- **GIVEN** requirement to add Vimeo support
- **WHEN** developer adds Vimeo URL to feed
- **THEN** react-player automatically handles it without code changes
