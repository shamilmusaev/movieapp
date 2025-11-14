# Video Playback Specification - Delta

## MODIFIED Requirements

### Requirement: YouTube Iframe Embedding
The system SHALL embed YouTube trailers using iframe with proper parameters to hide YouTube branding and UI elements, providing an immersive native app experience.

#### Scenario: Hide YouTube title and branding
- **GIVEN** YouTube iframe is embedded in feed
- **WHEN** video loads and plays
- **THEN** YouTube title bar, channel icon, "Copy link" button, and video counter are not visible to user

#### Scenario: Cover YouTube UI with CSS overlays
- **GIVEN** YouTube iframe may show UI elements
- **WHEN** rendering iframe
- **THEN** system adds CSS overlay divs covering top 60px (title area) and bottom 50px (controls area)

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
