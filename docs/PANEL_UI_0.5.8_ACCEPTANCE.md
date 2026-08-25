# Stark SolarPower Panel UI 0.5.8 — pan and gesture guard

## Pan persistence

- At 125–200%, one finger moves the canvas horizontally and vertically.
- Releasing the finger preserves the current scroll coordinates.
- Unrelated Home Assistant state updates do not rebuild the existing v0.5.7 canvas or move it to the top-left origin.
- Scrollbar/stage changes are not treated as responsive viewport resizes.
- A real orientation/window resize may recalculate the responsive base geometry.

## Entity activation guard

- Starting a two-finger gesture immediately guards native more-info.
- Crossing the one-finger pan threshold dispatches `pointercancel` to the touched entity.
- Clicks generated after pinch/drag are suppressed for 700 ms.
- A stationary intentional hold outside a gesture still opens native Home Assistant more-info.

## Regression

- Exactly one transform canvas remains mounted.
- Focal pinch, 75–200%, reset, snap and per-UPS persistence remain unchanged.
- System menu, Header, UPS selector, Bottom Tab Bar and battery path remain native/correct.
