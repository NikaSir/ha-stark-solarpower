# NikaS Specialized Panel UI Standard v1.5

**Status:** REQUIRED  
**Canonical source:** `NikaSir/ha-contract-generated-ui`  
**Reference geometry:** Stark SolarPower / UPS panel
**Supersedes:** all earlier NikaS specialized-panel shell and zoom rules where they differ from this document

## Ownership and one-shell rule

The repository owns its integration UI, telemetry, commands, cards and diagnostics. The shared NikaS standard owns shell geometry, gesture behavior, navigation, visual identity and delivery invariants.

- Header, peer-device selector and Bottom Tab Bar are outside the working viewport and never scale or move with it.
- There is exactly one zoom viewport and one working surface per panel instance. Nested wrappers, duplicated handlers and repeated shell injection are prohibited.
- Shell reconciliation after Home Assistant state updates is idempotent.
- A shell-only migration must not redesign domain content.

## Header and safe area

- Effective top safe area is consumed exactly once. Header content stays below Dynamic Island/notch.
- Header minimum height is `62px`; narrow-phone minimum height is `60px`.
- Header grid is `52px 1fr 52px`; narrow-phone grid is `48px 1fr 48px`.
- The title is geometrically centered independently of rail content.
- Main title: `21px`, weight `800`. Optional subtitle/version: `12px`, weight approximately `560`, `var(--secondary-text-color)`.
- The permanent left action is only the Home Assistant system menu. It uses `<ha-icon icon="mdi:menu">` and dispatches `hass-toggle-menu` with `bubbles: true` and `composed: true`.
- Back arrows, integration drawers and device commands in the left rail are prohibited. Parent navigation belongs inside the work area.
- At most one global command occupies the right rail. When refresh is present, it uses `<ha-icon icon="mdi:refresh">`.
- Left and right controls use matching `44px × 44px` plaques: `16px` radius, `var(--card-background-color)` background, `1px` divider-colour border and the restrained UPS shell shadow.
- Rail icons are `25px`. Menu uses `var(--primary-text-color)`; refresh uses `var(--primary-color)`. Refresh must not appear as an unframed glyph.
- Empty right rail space remains `52px`/`48px` so title centering does not change.

## Peer-device selector

When multiple peer physical devices exist, the selector is persistent immediately below Header, outside the zoom viewport.

- peer order is stable and selection never reorders it;
- selected peer survives Bottom Tab changes;
- selected scale persists independently per panel/client and per peer where applicable;
- subordinate zones/channels are not automatically peers.

## Bottom Tab Bar

- Use one fixed, full-width, edge-attached bar outside the zoom viewport; it is not a floating card.
- The bar uses `var(--card-background-color)`, a thin top divider and the restrained UPS top shadow.
- Bottom padding includes `env(safe-area-inset-bottom, 0px)` exactly once.
- All tabs have equal width and a minimum `52px` control height.
- Icons must be MDI icons rendered by `<ha-icon>` at `28px`; text symbols and emoji are prohibited.
- Labels are one readable line, approximately `12px`, weight `700`; shorten a label instead of wrapping it.
- Active tab: icon/text in `var(--primary-color)` and a rounded `13–14px` plaque using approximately 11% primary colour. No extra active-item shadow.
- Inactive tabs use `var(--secondary-text-color)`.
- Content bottom clearance must keep the final item fully visible above the bar.
- Changing tab resets the working area to the page start. Persisted scale may remain, but offsets are reset/clamped for the new content.

## Zoom and scrolling

Only the working area scales. Recommended range is `75–200%`, default `100%`.

Required at every scale:

- pinch uses two fingers and keeps the content point below their midpoint stable;
- permanent `− / % / +` controls are prohibited;
- pinch ending in `97–103%` snaps to exactly `100%`;
- a two-finger double tap resets scale and position to `100%`/origin and briefly announces `Масштаб 100%`;
- scale persists locally for the panel/client and peer device where applicable;
- after viewport resize, tab change or DOM replacement, offsets are remeasured and clamped to current content bounds;
- interactions must suppress accidental post-gesture clicks while deliberate stationary hold continues to open native more-info.

### Exactly 100%

- Use ordinary native vertical scrolling of the working area.
- Horizontal scrolling is forbidden; transform position is strictly `x = 0`, `y = 0`.
- One-finger custom panning is disabled.
- The surface cannot move sideways, be pulled below its top edge or shifted above it by a transform.
- Card taps, stationary hold/more-info and native vertical scroll work without artificial delay.

### Above 100%

- One-finger panning is enabled only when scale is greater than `100%`.
- Each axis is enabled independently only if scaled content overflows that viewport axis.
- If an axis fits, its offset is fixed to origin; otherwise offset is clamped to the actual content edges.
- Empty field beyond the content can never be exposed.

### Below 100%

- The reduced surface remains non-pannable and anchored at the page origin; native vertical scroll is used only if content still exceeds the viewport.
- No horizontal scroll or blank-field dragging is permitted.

## State, assets and visual identity

- `unknown`, `unavailable`, stale or untrusted sources never appear healthy.
- Frontend uses validated backend semantic states and does not invent measurements.
- Critical panel artwork ships locally; no CDN or Base64 substitute for normal assets.
- Live labels, paths and statuses remain separate from background/device art.
- Every repository and integration must have an intentional icon treatment. The repository README displays the approved icon; light/dark variants are supplied when contrast requires them.
- The mandatory HACS minimum is a packaged `custom_components/<domain>/brand/icon.png`. An arbitrary image elsewhere in the repository is not a substitute.
- Do not invent or redraw a brand asset without an approved source. Missing variants or upstream publication steps are recorded as compliance gaps.

## Frontend delivery and acceptance

- One stable production entry module; historical sources are not an open-ended runtime import chain.
- Production URL is cache-busted by UI/build version and declared assets exist in the shipped package.
- Registration and machine-readable metadata agree on route, version, component, menu event and zoom policy.
- JavaScript syntax, tests, HACS/Hassfest and repository checks pass where applicable.

Phone acceptance on Home Assistant Companion App verifies: safe area once; system menu; Header and plaque geometry; fixed selector and tab bar; `28px` tab icons; long-tab vertical scroll at 100%; no horizontal or transform movement at 100%; axis-specific pan only above 100%; bound clamping after release/resize/tab change; focal pinch without snap-back; card tap versus intentional hold; two-finger reset/toast; no duplicate viewport after telemetry rerenders; and final content visible above Home Indicator.

> The canonical policy remains in `ha-contract-generated-ui`; a newer canonical version overrides this synchronized snapshot.
