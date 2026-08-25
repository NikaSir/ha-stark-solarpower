# Stark SolarPower Panel UI 0.6.0 — transform-owned pan

## iPhone gesture acceptance

- At 100%, move the work canvas vertically to inspect content below the fold and release the finger; the position remains stable.
- Enlarge the work canvas to 150–200% with two fingers.
- Move the enlarged canvas horizontally and vertically with one finger.
- Release every finger: the canvas remains at the clamped translated position without returning to the top-left origin.
- Repeat the gesture after a selected UPS telemetry update and after an unavailable/available transition.
- No browser overflow bounce is used to represent canvas position.

## Interaction safety

- Pinch and pan do not open Home Assistant more-info/history graphs.
- An intentional stationary hold still opens native more-info.
- A two-finger double tap resets scale and translation to 100% and origin.
- A completed 97–103% pinch snaps to exactly 100%.

## Native shell regression

- Header, Home Assistant system menu, UPS selector and Bottom Tab Bar remain outside the transform canvas.
- Exactly one transform-owned work canvas is mounted.
