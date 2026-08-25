# Stark SolarPower Panel UI 0.5.9 — rebuild-safe canvas position

## Telemetry rebuild persistence

- Enlarge the selected UPS work canvas to 150–200% and pan away from the top-left origin.
- Wait for a selected UPS value/state update that rebuilds the work DOM.
- The replacement canvas restores the same logical point at the center of the viewport.
- A transition to unavailable telemetry does not return the canvas to the top-left origin.
- Scale remains stored per UPS and client.

## Gesture regression

- One finger pans horizontally and vertically at enlarged scale.
- Releasing the finger preserves the current position.
- Pinch and pan do not open native more-info/history graphs.
- An intentional stationary hold still opens native Home Assistant more-info.
- Two-finger double tap and the 97–103% snap still reset to 100%.

## Native shell regression

- Header, Home Assistant system menu, UPS selector and Bottom Tab Bar remain outside the transform canvas.
- Exactly one transform canvas is mounted.
