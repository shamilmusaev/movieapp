# Video Playback Specification - Delta

## MODIFIED Requirements

### Requirement: YouTube Iframe Embedding
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
