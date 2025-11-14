# video-playback Specification

## Purpose
TBD - created by archiving change add-vertical-video-feed. Update Purpose after archive.
## Requirements
### Requirement: YouTube Embed Player
The system SHALL embed YouTube trailers using iframe with CSS overlay blocks to hide YouTube branding and UI elements (all iframe parameters for hiding branding are deprecated by YouTube; only physical overlays work), providing an immersive native app experience.

#### Scenario: Hide YouTube title and branding
- **GIVEN** YouTube iframe is embedded in feed
- **WHEN** video loads and plays
- **THEN** YouTube title bar, channel icon, "Copy link" button, and video counter are not visible to user

#### Scenario: Cover YouTube UI with corner block overlays
- **GIVEN** YouTube iframe shows UI elements in all four corners
- **WHEN** rendering iframe
- **THEN** system adds 4 CSS overlay blocks: top-left (200px × 70px), top-right (200px × 70px), bottom-left (full width × 50px), bottom-right (covered by bottom)

#### Scenario: Maintain touch interactivity through overlays
- **GIVEN** CSS overlays are positioned over iframe
- **WHEN** user swipes or taps on video
- **THEN** touch events pass through overlays (pointer-events: none) for gesture control

#### Scenario: YouTube controls remain hidden
- **GIVEN** video is playing
- **WHEN** user taps or interacts with video area
- **THEN** YouTube native controls (play/pause overlay, progress bar) do not appear

#### Scenario: Fullscreen button is disabled
- **GIVEN** YouTube player is embedded
- **WHEN** video loads
- **THEN** fullscreen button is not visible or functional (fs=0 parameter)

### Requirement: Single Active Player
The system SHALL ensure only one video player is actively playing at any time to optimize performance and user experience.

#### Scenario: New video becomes visible
- **GIVEN** a user scrolls to a new video
- **WHEN** the new video card enters viewport
- **THEN** the previous video is paused and the new video autoplays

#### Scenario: Intersection Observer detects visibility
- **GIVEN** videos in the feed are monitored
- **WHEN** a video card reaches >50% viewport visibility
- **THEN** it is marked as the active video and playback starts

#### Scenario: User scrolls away from active video
- **GIVEN** a video is currently playing
- **WHEN** user scrolls and video visibility drops below 50%
- **THEN** the video is paused automatically

### Requirement: Autoplay Behavior
The system SHALL automatically play videos when they become visible and pause them when scrolled away, creating seamless feed experience.

#### Scenario: Video autoplays when visible
- **GIVEN** a video card becomes the active/visible card
- **WHEN** it reaches playing state
- **THEN** the YouTube player starts playback automatically (muted by default)

#### Scenario: Video loops when finished
- **GIVEN** a trailer finishes playing
- **WHEN** video reaches the end
- **THEN** it loops back to the beginning (YouTube `loop=1` parameter)

#### Scenario: Prevent autoplay before user interaction on iOS
- **GIVEN** a user on iOS Safari where autoplay is restricted
- **WHEN** video should autoplay
- **THEN** a play button overlay is shown requiring user tap to start playback

### Requirement: Mute and Volume Control
The system SHALL mute videos by default and provide a toggle to unmute, respecting mobile best practices.

#### Scenario: Videos start muted by default
- **GIVEN** any video starts playing
- **WHEN** playback begins
- **THEN** audio is muted (YouTube `mute=1` parameter)

#### Scenario: User unmutes video
- **GIVEN** a muted video is playing
- **WHEN** user taps the unmute button
- **THEN** audio is enabled for the current video and mute state is saved to localStorage

#### Scenario: Persist mute preference
- **GIVEN** user has unmuted a video
- **WHEN** they scroll to the next video
- **THEN** the next video starts with audio enabled (user's preference remembered)

#### Scenario: Mute button visual state
- **GIVEN** a video is playing
- **WHEN** displaying the mute toggle button
- **THEN** icon shows current state (muted: mute icon with slash, unmuted: speaker icon)

### Requirement: Video Loading States
The system SHALL provide visual feedback during video loading and handle loading errors gracefully.

#### Scenario: Show loading spinner during video load
- **GIVEN** a YouTube iframe is being loaded
- **WHEN** video player is initializing
- **THEN** a loading spinner is displayed over the video area

#### Scenario: Video failed to load
- **GIVEN** YouTube iframe fails to load (network error, blocked video, etc.)
- **WHEN** error is detected
- **THEN** an error message is displayed with movie poster as fallback background

#### Scenario: Retry failed video load
- **GIVEN** a video failed to load
- **WHEN** user taps "Retry" button
- **THEN** the system attempts to reload the YouTube iframe

### Requirement: Preloading Next Video
The system SHALL preload the next video in the feed before user reaches it to ensure smooth transitions.

#### Scenario: Preload next video in advance
- **GIVEN** user is viewing the current video
- **WHEN** video has been playing for 3 seconds or user interacts
- **THEN** the next video's iframe is initialized in the background (hidden) to start buffering

#### Scenario: Cancel preload on navigation change
- **GIVEN** next video is being preloaded
- **WHEN** user navigates backward or jumps to different video
- **THEN** the preload is cancelled to save bandwidth

### Requirement: Video Player Controls
The system SHALL provide minimal essential controls overlaid on the video for play/pause and seeking.

#### Scenario: Tap to pause/play
- **GIVEN** a video is playing
- **WHEN** user taps the center of the video
- **THEN** playback is paused; tapping again resumes playback

#### Scenario: Show progress indicator
- **GIVEN** a video is playing
- **WHEN** displayed
- **THEN** a thin progress bar at the bottom shows playback progress (YouTube controls visible)

#### Scenario: Hide controls during playback
- **GIVEN** video is playing with controls visible
- **WHEN** no user interaction for 3 seconds
- **THEN** overlay controls fade out except for progress bar

### Requirement: Fullscreen Support
The system SHALL allow users to view videos in fullscreen mode on mobile devices.

#### Scenario: Enter fullscreen on button click
- **GIVEN** a video is playing
- **WHEN** user taps fullscreen button
- **THEN** video enters native fullscreen mode using YouTube's fullscreen API

#### Scenario: Exit fullscreen returns to feed
- **GIVEN** video is in fullscreen mode
- **WHEN** user exits fullscreen (back button or gesture)
- **THEN** video returns to normal feed display in the same position

### Requirement: Video Performance Optimization
The system SHALL optimize video playback to maintain 60 FPS scrolling and minimize memory usage.

#### Scenario: Unmount off-screen video players
- **GIVEN** a video is more than 2 positions away from current video
- **WHEN** memory optimization runs
- **THEN** the video's iframe is unmounted to free resources

#### Scenario: Lazy load video iframes
- **GIVEN** feed is rendering multiple video cards
- **WHEN** initializing the feed
- **THEN** only the visible video and next video have iframes loaded; others use placeholders

#### Scenario: Reduce video quality on slow connections
- **GIVEN** network speed is detected as slow
- **WHEN** loading YouTube videos
- **THEN** lower quality (480p) is preferred using YouTube API parameters

